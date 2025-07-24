import { createConsumer } from '@rails/actioncable';
import { useGetMessages } from './useGetMessages';
import { useState, useRef, useEffect, useCallback } from 'react';

export const useMessaging = (authToken, outletType = '', options = {}) => {
  const {
    autoLoadHistory = true,
    messageId = null,
    productId = null,
    initialStatus = 'open'
  } = options;

  // WebSocket state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const subscriptionRef = useRef(null);
  const consumerRef = useRef(null);
  const connectionAttemptedRef = useRef(false);

  // Get messages hook for REST API
  const {
    messages: apiMessages,
    loading: apiLoading,
    error: apiError,
    meta,
    getMessages,
    getMessageHistory,
    getProductMessages,
    getAllMessages,
    loadMoreMessages,
    setMessages: setApiMessages
  } = useGetMessages(authToken, outletType);

  // Combined messages state (API + WebSocket)
  const [realTimeMessages, setRealTimeMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);

  // Load initial message history
  useEffect(() => {
    if (autoLoadHistory && authToken && outletType) {
      if (messageId) {
        getMessageHistory(messageId);
      } else if (productId) {
        getProductMessages(productId);
      } else {
        getAllMessages(initialStatus);
      }
    }
  }, [authToken, outletType, messageId, productId, autoLoadHistory, initialStatus]);

  // Combine API messages with real-time messages
  useEffect(() => {
    const combined = [...apiMessages, ...realTimeMessages];
    setAllMessages(combined);
  }, [apiMessages, realTimeMessages]);

  // WebSocket connection
  useEffect(() => {
    if (!authToken) {
      setConnectionError('No authentication token provided');
      return;
    }

    // Prevent multiple connection attempts
    if (connectionAttemptedRef.current || isConnecting || isConnected) {
      return;
    }

    connectionAttemptedRef.current = true;
    setIsConnecting(true);
    setConnectionError(null);

    console.log('🔐 Attempting to connect to WebSocket...');
    console.log('📝 Token (first 20 chars):', authToken.substring(0, 20) + '...');
    console.log('🏪 Outlet type:', outletType);
    console.log('🔗 WebSocket URL:', `wss://sephcocco-lounge-api.onrender.com/cable?token=${authToken.substring(0, 20)}...`);

    // Create Action Cable consumer with token as query parameter
    consumerRef.current = createConsumer(`wss://sephcocco-lounge-api.onrender.com/cable?token=${encodeURIComponent(authToken)}`);

    console.log('✅ Consumer created, attempting to subscribe...');

    // Subscribe to messaging channel
    subscriptionRef.current = consumerRef.current.subscriptions.create(
      {
        channel: "MessagingChannel",
        outlet_type: outletType
      },
      {
        connected() {
          setIsConnected(true);
          setIsConnecting(false);
          setConnectionError(null);
          console.log('🎉 Successfully connected to messaging channel');
        },

        disconnected() {
          setIsConnected(false);
          setIsConnecting(false);
          connectionAttemptedRef.current = false;
          console.log('💔 Disconnected from messaging channel');
        },

        rejected() {
          setIsConnected(false);
          setIsConnecting(false);
          connectionAttemptedRef.current = false;
          setConnectionError('Failed to connect to messaging channel - authentication may have failed');
          console.log('❌ Failed to connect to messaging channel - subscription rejected');
        },

        received(data) {
          console.log('📨 Received real-time message:', data);
          setRealTimeMessages(prev => [...prev, data]);
        }
      }
    );

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up WebSocket subscription...');
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (consumerRef.current) {
        consumerRef.current.disconnect();
        consumerRef.current = null;
      }
      setIsConnected(false);
      setIsConnecting(false);
      connectionAttemptedRef.current = false;
    };
  }, []); // Empty dependency array to prevent re-connection attempts

  // Function to send messages
  const sendMessage = useCallback((content, messageType = 'text', productId = null) => {
    if (subscriptionRef.current && isConnected) {
      // Create optimistic message to show immediately
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content: content,
        sender: 'user', // Mark as user message
        user_id: 'current_user', // Indicate this is from current user
        message_type: messageType,
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        optimistic: true, // Flag for styling
        conversation_id: productId || 'default'
      };

      // Add optimistic message immediately
      setRealTimeMessages(prev => [...prev, optimisticMessage]);

      const messageData = {
        message: {
          content: content,
          outlet_type: outletType,
          message_type: messageType
        },
        outlet_type: outletType
      };

      // Add product_id if provided
      if (productId) {
        messageData.product_id = productId;
      }

      // Send message via WebSocket
      subscriptionRef.current.perform('receive', messageData);

      // Note: Keeping optimistic messages - they will stay unless manually cleared
      // The real message from server will be added alongside the optimistic one

    } else {
      console.error('Cannot send message: not connected');
    }
  }, [isConnected, outletType]);

  // Function to refresh messages
  const refreshMessages = useCallback(async () => {
    if (messageId) {
      return await getMessageHistory(messageId);
    } else if (productId) {
      return await getProductMessages(productId);
    } else {
      return await getAllMessages(initialStatus);
    }
  }, [messageId, productId, initialStatus, getMessageHistory, getProductMessages, getAllMessages]);

  // Function to clear real-time messages
  const clearRealTimeMessages = useCallback(() => {
    setRealTimeMessages([]);
  }, []);

  // Function to clear all messages
  const clearAllMessages = useCallback(() => {
    setRealTimeMessages([]);
    setApiMessages([]);
  }, [setApiMessages]);

  return {
    // Combined state
    messages: allMessages,
    loading: apiLoading,
    error: apiError || connectionError,
    
    // WebSocket state
    isConnected,
    isConnecting,
    connectionError,
    
    // API state
    apiMessages,
    apiLoading,
    apiError,
    meta,
    
    // Real-time state
    realTimeMessages,
    
    // Functions
    sendMessage,
    refreshMessages,
    loadMoreMessages,
    clearRealTimeMessages,
    clearAllMessages,
    
    // API functions
    getMessages,
    getMessageHistory,
    getProductMessages,
    getAllMessages,
    
    // Setters
    setMessages: setApiMessages,
    setError: setConnectionError
  };
};