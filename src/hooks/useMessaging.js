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

  // User threads and chat states
  const [userThreads, setUserThreads] = useState([]); // List of unique users with their threads
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserMessages, setCurrentUserMessages] = useState([]); // Messages for selected user

  // Update refs when props change
  useEffect(() => {
    authTokenRef.current = authToken;
    outletTypeRef.current = outletType;
  }, [authToken, outletType]);

  // Load all user threads (unique users) - Define this first
  const loadUserThreads = useCallback(async () => {
    if (!authTokenRef.current || !outletTypeRef.current) {
      console.log('❌ Cannot load user threads: missing authToken or outletType');
      return;
    }

    console.log('🔄 Loading user threads...');
    console.log('🏪 Outlet type:', outletTypeRef.current);
    console.log('🔗 API URL:', `${API_BASE_URL}/${outletTypeRef.current}/sephcocco_${outletTypeRef.current}_messages/user_threads`);

    try {
      // Test the API endpoint first
      const testUrl = `${API_BASE_URL}/${outletTypeRef.current}/sephcocco_${outletTypeRef.current}_messages/user_threads`;
      console.log('🧪 Testing API endpoint:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authTokenRef.current}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Received data:', data);
      console.log('📦 Data type:', typeof data);
      console.log('📦 Data keys:', Object.keys(data));
      console.log('📦 user_threads:', data.user_threads);
      console.log('📦 user_threads type:', typeof data.user_threads);
      console.log('📦 user_threads length:', data.user_threads?.length);
      
      setUserThreads(data.user_threads || []);
      console.log('✅ User threads loaded:', data.user_threads?.length || 0);
    } catch (error) {
      console.error('❌ Error loading user threads:', error);
      setUserThreads([]); // Set empty array on error
    }
  }, []);

  // Load user threads immediately when authToken and outletType are available
  useEffect(() => {
    if (authToken && outletType) {
      console.log('🚀 Initializing user threads load...');
      console.log('🔑 Auth token present:', !!authToken);
      console.log('🏪 Outlet type:', outletType);
      loadUserThreads();
    } else {
      console.log('❌ Missing required data:');
      console.log('   - authToken:', !!authToken);
      console.log('   - outletType:', outletType);
    }
  }, [authToken, outletType]);

  // Load messages for a specific user
  const loadUserMessages = useCallback(async (userId) => {
    if (!authTokenRef.current || !outletTypeRef.current || !userId) {
      console.log('❌ Cannot load user messages: missing data');
      console.log('   - authToken:', !!authTokenRef.current);
      console.log('   - outletType:', outletTypeRef.current);
      console.log('   - userId:', userId);
      return;
    }

    console.log('🔄 Loading messages for user:', userId);
    console.log('🔗 API URL:', `${API_BASE_URL}/${outletTypeRef.current}/sephcocco_${outletTypeRef.current}_messages?user_id=${userId}`);

    try {
      const response = await fetch(
        `${API_BASE_URL}/${outletTypeRef.current}/sephcocco_${outletTypeRef.current}_messages?user_id=${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authTokenRef.current}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 User messages response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ User messages response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 User messages data:', data);
      console.log('📦 Messages count:', data.messages?.length || 0);
      setCurrentUserMessages(data.messages || []);
    } catch (error) {
      console.error('❌ Error loading user messages:', error);
      setCurrentUserMessages([]); // Set empty array on error
    }
  }, []);

  // Select a user and load their messages
  const selectUser = useCallback(async (userThread) => {
    console.log('👤 Selecting user:', userThread);
    console.log('👤 User ID field:', userThread.user_id);
    console.log('👤 User name:', userThread.user_name);
    
    setSelectedUser(userThread);
    
    // Use the user_id field from the userThread object
    const userId = userThread.user_id;
    console.log('👤 Using user ID:', userId);
    
    if (!userId) {
      console.error('❌ No user_id found in userThread:', userThread);
      return;
    }
    
    await loadUserMessages(userId);
  }, [loadUserMessages]);

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
          
          // Load user threads when connected
          loadUserThreads();
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
          
          // Handle new user thread
          if (data.type === 'new_user_thread') {
            setUserThreads(prev => {
              const exists = prev.some(thread => thread.user_id === data.user_thread.user_id);
              return exists ? prev : [...prev, data.user_thread];
            });
          }
          
          // Handle new message for current user
          if (data.type === 'new_message' && selectedUser && data.user_id === selectedUser.user_id) {
            setCurrentUserMessages(prev => [...prev, data.message]);
          }
          
          // Update user threads with latest message
          if (data.type === 'new_message') {
            setUserThreads(prev => 
              prev.map(thread => 
                thread.user_id === data.user_id 
                  ? { 
                      ...thread, 
                      last_message: data.message.content,
                      last_activity: data.message.created_at,
                      message_count: thread.message_count + 1
                    }
                  : thread
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
  }, [loadUserThreads, selectedUser]); // Include selectedUser to handle updates

  // Function to send messages
  const sendMessage = useCallback((content, messageType = 'text') => {
    console.log('📤 Attempting to send message...');
    console.log('📤 Content:', content);
    console.log('📤 Message type:', messageType);
    console.log('📤 Selected user:', selectedUser);
    console.log('📤 Is connected:', isConnected);
    console.log('📤 Has subscription:', !!subscriptionRef.current);
    
    if (!subscriptionRef.current || !isConnected || !selectedUser) {
      console.error('❌ Cannot send message: not connected or no user selected');
      throw new Error('WebSocket not connected or no user selected');
    }

    // Try different possible user ID fields
    const userId = selectedUser.user_id;
    console.log('📤 Using user ID for send:', userId);
    
    if (!userId) {
      console.error('❌ No user_id found in selectedUser:', selectedUser);
      throw new Error('No user_id found in selectedUser');
    }

    const messageData = {
      message: {
        user_id: userId,        // ✅ user_id inside message object
        content: content,       // ✅ content inside message object
        outlet_type: outletTypeRef.current,
        message_type: messageType
      },
      user_id: userId, 
      outlet_type: outletTypeRef.current
    };

    console.log('📤 Sending message data:', messageData);
    console.log('📤 Message structure:', JSON.stringify(messageData, null, 2));
    
    subscriptionRef.current.perform('receive', messageData);
    console.log('✅ Message sent via WebSocket');
  }, [isConnected, selectedUser]);

  // Function to refresh user threads
  const refreshUserThreads = useCallback(async () => {
    await loadUserThreads();
  }, [loadUserThreads]);

  // Function to refresh current user messages
  const refreshCurrentUserMessages = useCallback(async () => {
    if (selectedUser && selectedUser.user_id) {
      await loadUserMessages(selectedUser.user_id);
    }
  }, [loadUserMessages, selectedUser]);

  return {
    // Connection states
    isConnected,
    isConnecting,
    connectionError,
    
    // Data
    userThreads,
    selectedUser,
    currentUserMessages,
    
    // Actions
    selectUser,
    sendMessage,
    refreshUserThreads,
    refreshCurrentUserMessages
  };
}; 