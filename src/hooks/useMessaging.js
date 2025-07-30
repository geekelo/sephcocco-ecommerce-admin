import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createConsumer } from '@rails/actioncable';

const API_BASE_URL = 'https://sephcocco-lounge-api.onrender.com/api/v1';

export const useMessaging = (authToken, outletType = '') => {
  // Refs for stable references
  const authTokenRef = useRef(authToken);
  const outletTypeRef = useRef(outletType);
  const subscriptionRef = useRef(null);
  const consumerRef = useRef(null);
  const connectionAttemptedRef = useRef(false);

  // Connection states
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Message and conversation states
  const [conversations, setConversations] = useState([]); // List of all conversations
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentChatMessages, setCurrentChatMessages] = useState([]); // Messages for selected conversation

  // Update refs when props change
  useEffect(() => {
    authTokenRef.current = authToken;
    outletTypeRef.current = outletType;
  }, [authToken, outletType]);

  // Load all conversations
  const loadConversations = useCallback(async () => {
    if (!authTokenRef.current || !outletTypeRef.current) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/${outletTypeRef.current}/sephcocco_${outletTypeRef.current}_conversations`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authTokenRef.current}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  // Load chat messages for a specific conversation
  const loadChatMessages = useCallback(async (conversationId) => {
    if (!authTokenRef.current || !outletTypeRef.current || !conversationId) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/${outletTypeRef.current}/sephcocco_${outletTypeRef.current}_conversations/${conversationId}/messages`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authTokenRef.current}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCurrentChatMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  }, []);

  // Select a conversation and load its messages
  const selectConversation = useCallback(async (conversation) => {
    setSelectedConversation(conversation);
    await loadChatMessages(conversation.id);
  }, [loadChatMessages]);

  // WebSocket connection management - only run once
  useEffect(() => {
    if (!authTokenRef.current || !outletTypeRef.current) {
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
    console.log('📝 Token (first 20 chars):', authTokenRef.current.substring(0, 20) + '...');
    console.log('🏪 Outlet type:', outletTypeRef.current);

    // Create Action Cable consumer with token as query parameter
    consumerRef.current = createConsumer(`wss://sephcocco-lounge-api.onrender.com/cable?token=${encodeURIComponent(authTokenRef.current)}`);

    console.log('✅ Consumer created, attempting to subscribe...');

    // Subscribe to messaging channel
    subscriptionRef.current = consumerRef.current.subscriptions.create(
      {
        channel: "MessagingChannel",
        outlet_type: outletTypeRef.current
      },
      {
        connected() {
          setIsConnected(true);
          setIsConnecting(false);
          setConnectionError(null);
          console.log('🎉 Successfully connected to messaging channel');
          
          // Load conversations when connected
          loadConversations();
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
          console.log('📨 Received message:', data);
          
          // Handle new conversation
          if (data.type === 'new_conversation') {
            setConversations(prev => {
              const exists = prev.some(conv => conv.id === data.conversation.id);
              return exists ? prev : [...prev, data.conversation];
            });
          }
          
          // Handle new message in current conversation
          if (data.type === 'new_message' && selectedConversation && data.conversation_id === selectedConversation.id) {
            setCurrentChatMessages(prev => [...prev, data.message]);
          }
          
          // Update conversation list with latest message
          if (data.type === 'new_message') {
            setConversations(prev => 
              prev.map(conv => 
                conv.id === data.conversation_id 
                  ? { ...conv, last_message: data.message, updated_at: data.message.created_at }
                  : conv
              )
            );
          }
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
  }, [loadConversations, selectedConversation]); // Include selectedConversation to handle updates

  // Function to send messages
  const sendMessage = useCallback((content, messageType = 'text') => {
    if (!subscriptionRef.current || !isConnected || !selectedConversation) {
      console.error('Cannot send message: not connected or no conversation selected');
      throw new Error('WebSocket not connected or no conversation selected');
    }

    subscriptionRef.current.perform('receive', {
      message: {
        content: content,
        outlet_type: outletTypeRef.current,
        message_type: messageType,
        conversation_id: selectedConversation.id
      },
      outlet_type: outletTypeRef.current
    });
  }, [isConnected, selectedConversation]);

  // Function to refresh conversations
  const refreshConversations = useCallback(async () => {
    await loadConversations();
  }, [loadConversations]);

  // Function to refresh current chat
  const refreshCurrentChat = useCallback(async () => {
    if (selectedConversation) {
      await loadChatMessages(selectedConversation.id);
    }
  }, [loadChatMessages, selectedConversation]);

  return {
    // Connection states
    isConnected,
    isConnecting,
    connectionError,
    
    // Data
    conversations,
    selectedConversation,
    currentChatMessages,
    
    // Actions
    selectConversation,
    sendMessage,
    refreshConversations,
    refreshCurrentChat
  };
}; 