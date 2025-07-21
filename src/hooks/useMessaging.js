// src/hooks/useMessaging.js
import { useState, useEffect, useRef } from 'react';
import { createConsumer } from '@rails/actioncable';

export const useMessaging = (authToken, outletType = '') => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!authToken) {
      setConnectionError('No authentication token provided');
      return;
    }

    // Create Action Cable consumer
    const consumer = createConsumer('wss://sephcocco-lounge-api.onrender.com/cable');

    // Subscribe to messaging channel
    subscriptionRef.current = consumer.subscriptions.create(
      {
        channel: "MessagingChannel",
        token: authToken,
        outlet_type: outletType
      },
      {
        connected() {
          setIsConnected(true);
          setConnectionError(null);
          console.log('Connected to messaging channel');
        },

        disconnected() {
          setIsConnected(false);
          console.log('Disconnected from messaging channel');
        },

        rejected() {
          setIsConnected(false);
          setConnectionError('Failed to connect to messaging channel');
          console.log('Failed to connect to messaging channel');
        },

        received(data) {
          console.log('Received message:', data);
          setMessages(prev => [...prev, data]);
        }
      }
    );

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [authToken, outletType]);

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
    connectionError,
    sendMessage
  };
};