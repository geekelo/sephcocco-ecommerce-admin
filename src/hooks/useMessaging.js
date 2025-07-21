// src/hooks/useMessaging.js
import { useState, useEffect, useRef } from 'react';
import { createConsumer } from '@rails/actioncable';

export const useMessaging = (authToken, outletType = '') => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const subscriptionRef = useRef(null);
  const consumerRef = useRef(null);
  const connectionAttemptedRef = useRef(false);

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
          console.log('📨 Received message:', data);
          setMessages(prev => [...prev, data]);
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
  const sendMessage = (content, messageType = 'text') => {
    if (subscriptionRef.current && isConnected) {
      subscriptionRef.current.perform('receive', {
        message: {
          content: content,
          outlet_type: outletType,
          message_type: messageType
        },
        outlet_type: outletType
      });
    } else {
      console.error('Cannot send message: not connected');
    }
  };

  return {
    messages,
    isConnected,
    isConnecting,
    connectionError,
    sendMessage
  };
};