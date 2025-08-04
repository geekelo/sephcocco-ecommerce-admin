import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { createConsumer } from '@rails/actioncable';

const API_BASE_URL = 'https://sephcocco-lounge-api.onrender.com/api/v1';

export const useMessaging = (authToken, outletType = '') => {
  console.log('🚀 useMessaging hook called');
  console.log('🔑 Auth token:', !!authToken);
  console.log('🏪 Outlet type:', outletType);
  console.log('👤 User role from localStorage:', localStorage.getItem('userRole'));
  
  // Refs
  const authTokenRef = useRef(authToken);
  const outletTypeRef = useRef(outletType);
  const subscriptionRef = useRef(null);
  const consumerRef = useRef(null);
  const connectionAttemptedRef = useRef(false);
  const autoConnectAttemptedRef = useRef(false);

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userThreads, setUserThreads] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserMessages, setCurrentUserMessages] = useState([]);

  // Update refs when props change
  useEffect(() => {
    authTokenRef.current = authToken;
    outletTypeRef.current = outletType;
  }, [authToken, outletType]);

  // Load user chat thread via WebSocket ONLY
  const loadUserMessages = useCallback(async (userId) => {
    console.log('📤 Loading user messages via WebSocket for user:', userId);
    
    if (!subscriptionRef.current || !isConnected) {
      console.log('❌ Cannot load user messages: WebSocket not connected');
      console.log('❌ Waiting for WebSocket connection...');
      return;
    }

    try {
      // Request user messages via WebSocket ONLY
      console.log('📤 Requesting user messages via WebSocket...');
      subscriptionRef.current.perform('request_user_messages', {
        user_id: userId,
        outlet_type: outletTypeRef.current
      });
      
      console.log('📤 WebSocket request sent, waiting for response...');
      
    } catch (error) {
      console.error('Error loading user messages via WebSocket:', error);
      setCurrentUserMessages([]);
    }
  }, [isConnected]);
  
  // WebSocket-only message loading - no API fallback
  const loadUserMessagesFromWebSocket = useCallback(async (userId) => {
    console.log('📤 Loading user messages via WebSocket for user:', userId);
    
    if (!subscriptionRef.current || !isConnected) {
      console.log('❌ Cannot load user messages: WebSocket not connected');
      return;
    }

    try {
      subscriptionRef.current.perform('request_user_messages', {
        user_id: userId,
        outlet_type: outletTypeRef.current
      });
      console.log('📤 WebSocket request sent for user messages');
    } catch (error) {
      console.error('Error requesting user messages via WebSocket:', error);
    }
  }, [isConnected]);

  // Load all user threads via WebSocket
  const loadAllUserThreads = useCallback(async () => {
    if (!authTokenRef.current || !outletTypeRef.current) {
      console.log('❌ Cannot load user threads: missing authToken or outletType');
      return;
    }

    console.log('🔄 Loading user threads via WebSocket...');
    
    // Request user threads via WebSocket
    if (subscriptionRef.current && isConnected) {
      console.log('📤 Requesting user threads via WebSocket...');
      subscriptionRef.current.perform('receive', {
        action: 'request_initial_threads',
        outlet_type: outletTypeRef.current
      });
    } else {
      console.log('❌ Cannot request user threads: WebSocket not connected');
    }
  }, [isConnected]);

  // Select user thread
  const selectUser = useCallback(async (userThread) => {
    console.log('👤 Selecting user:', userThread);
    console.log('👤 User ID:', userThread.user_id);
    console.log('👤 User name:', userThread.user_name);
    console.log('👤 Is WebSocket connected:', isConnected);
    console.log('👤 Subscription ref exists:', !!subscriptionRef.current);
    
    setSelectedUser(userThread);
    
    const userId = userThread.user_id;
    if (userId) {
      console.log('👤 About to load messages for user:', userId);
      await loadUserMessages(userId);
    } else {
      console.log('❌ No user ID found in userThread');
    }
  }, [loadUserMessages, isConnected]);

  // Send message to user
  const sendMessage = useCallback((content, messageType = 'text') => {
    if (!subscriptionRef.current || !isConnected || !selectedUser) {
      console.error('Cannot send message: not connected or no user selected');
      throw new Error('WebSocket not connected or no user selected');
    }

    const userId = selectedUser.user_id;
    const userRole = localStorage.getItem('userRole') || 'user';

    const messageData = {
      action: 'receive', // ← This is crucial!
      message: {
        user_id: userId,
        content: content,
        outlet_type: outletTypeRef.current,
        message_type: messageType,
        user_role: userRole
      },
      user_id: userId,
      outlet_type: outletTypeRef.current,
      user_role: userRole
    };

    console.log('📤 Sending message via ActionCable:', messageData);
    subscriptionRef.current.perform('receive', messageData);
  }, [isConnected, selectedUser]);

  // WebSocket connection using ActionCable
  const connect = useCallback(() => {
    console.log('🔐 Connect function called');
    
    if (!authTokenRef.current || !outletTypeRef.current) {
      const error = 'No authentication token or outlet type provided';
      setConnectionError(error);
      return;
    }

    if (connectionAttemptedRef.current || isConnecting || isConnected) {
      console.log('🔐 Connection already attempted or in progress, skipping...');
      return;
    }

    connectionAttemptedRef.current = true;
    setIsConnecting(true);
    setConnectionError(null);

    console.log('🔐 Attempting to connect...');
    console.log('📝 Token (first 20 chars):', authTokenRef.current.substring(0, 20) + '...');
    console.log('🏪 Outlet type:', outletTypeRef.current);

    try {
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
            console.log('📡 Channel: MessagingChannel');
            console.log('🏪 Outlet type:', outletTypeRef.current);
            console.log('📡 Admin channel: messaging_admin_' + outletTypeRef.current);
            console.log('👤 Current user role from localStorage:', localStorage.getItem('userRole'));
            console.log('🔐 Auth token (first 20 chars):', authTokenRef.current.substring(0, 20) + '...');
            
            // Load initial user threads when connected
            if (subscriptionRef.current) {
              console.log('📤 Requesting user threads via WebSocket...');
              const requestData = {
                action: 'request_initial_threads',
                outlet_type: outletTypeRef.current
              };
              console.log('📤 Request data:', requestData);
              
              // Try sending directly to the channel
              subscriptionRef.current.send(requestData);
              
              // Also try using perform as fallback
              setTimeout(() => {
                console.log('🔄 Trying perform method as fallback...');
                subscriptionRef.current.perform('request_initial_threads', {
                  outlet_type: outletTypeRef.current
                });
              }, 1000);
              
              // Test if we can receive messages by sending a test message
              setTimeout(() => {
                console.log('🧪 Sending test message to verify WebSocket is working...');
                const testMessage = {
                  action: 'receive',
                  message: {
                    content: 'Test message from admin',
                    message_type: 'text',
                    user_id: userId,
                    user_role: 'admin'
                  },
                  outlet_type: outletTypeRef.current,
                  user_id: userId,
                  user_role: 'admin'
                };
                // Only send test message if we're in development
                if (process.env.NODE_ENV === 'development') {
                  subscriptionRef.current.perform('receive', testMessage);
                }
              }, 3000);
              
              // Send a simple ping to test connection
              setTimeout(() => {
                console.log('🏓 Sending ping to test WebSocket connection...');
                subscriptionRef.current.send({ type: 'ping', timestamp: Date.now() });
              }, 1000);
            }
          },

          disconnected() {
            setIsConnected(false);
            setIsConnecting(false);
            connectionAttemptedRef.current = false;
            console.log('💔 Disconnected from messaging channel');
            console.log('💔 Connection lost - real-time messaging will not work');
          },

          rejected() {
            setIsConnected(false);
            setIsConnecting(false);
            connectionAttemptedRef.current = false;
            setConnectionError('Failed to connect to messaging channel - authentication may have failed');
            console.log('❌ Failed to connect to messaging channel - subscription rejected');
          },

          received(data) {
            console.log('📨 Received WebSocket message:', data);
            console.log('📨 Message type:', data.type);
            console.log('📨 Full message data:', JSON.stringify(data, null, 2));
            console.log('📨 Data keys:', Object.keys(data));
            console.log('📨 Timestamp:', new Date().toISOString());
            console.log('👤 Current user role:', localStorage.getItem('userRole'));
            console.log('👤 Selected user:', selectedUser?.user_id);
            
            // Log every received message for debugging
            if (data.type === 'new_message') {
              console.log('🚨 NEW MESSAGE RECEIVED VIA WEBSOCKET!');
              console.log('🚨 Message content:', data.content);
              console.log('🚨 Message user_id:', data.user_id);
              console.log('🚨 Message user_role:', data.user_role);
              console.log('🚨 Message matches selected user:', selectedUser?.user_id === data.user_id);
            }
            
            // Log ALL received messages to see if anything is coming through
            console.log('🔍 ANY WebSocket message received:', data.type || 'unknown type');
            
            // Handle test response
            if (data.type === 'test_response') {
              console.log('🧪 Test response received:', data);
            }
            
            // Handle user threads response from WebSocket
            if (data.type === 'user_threads_response') {
              console.log('📋 User threads response received:', data);
              console.log('📋 Threads count:', data.threads?.length || 0);
              console.log('📋 Threads structure:', JSON.stringify(data.threads, null, 2));
              
              const threads = data.threads || [];
              setUserThreads(threads);
              setIsLoading(false);
              console.log('✅ User threads loaded from WebSocket:', threads.length);
            }
            
            // Handle user messages response from WebSocket
            if (data.type === 'user_messages_response') {
              console.log('📨 User messages response received:', data);
              console.log('📨 Messages count:', data.messages?.length || 0);
              console.log('📨 User ID:', data.user_id);
              console.log('📨 Messages array:', JSON.stringify(data.messages, null, 2));
              
              const messages = data.messages || [];
              console.log('📨 Setting current user messages to:', messages.length, 'messages');
              setCurrentUserMessages(messages);
              console.log('✅ User messages loaded from WebSocket:', messages.length);
            }
            
            // Handle new user thread
            if (data.type === 'new_user_thread') {
              console.log('🆕 New user thread received:', data.user_thread);
              setUserThreads(prev => {
                const exists = prev.some(thread => thread.user_id === data.user_thread.user_id);
                return exists ? prev : [...prev, data.user_thread];
              });
            }
            
            // Handle new message - REAL-TIME UPDATE
            if (data.type === 'new_message') {
              console.log('🚨 REAL-TIME: New message received via WebSocket!');
              console.log('💬 Message user_id:', data.user_id);
              console.log('💬 Message content:', data.content);
              console.log('💬 Message user role:', data.user_role);
              console.log('💬 Selected user user_id:', selectedUser?.user_id);
              console.log('💬 Message matches selected user:', selectedUser?.user_id === data.user_id);
              
              // Extract user info from nested user object or direct properties
              const messageUserId = data.user_id || data.user?.id;
              const messageUserRole = data.user_role || data.user?.role;
              
              // Create standardized message object with date and time
              const currentTimestamp = data.created_at || new Date().toISOString();
              const newMessage = {
                id: data.id || data.chat_id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                content: data.content,
                message_type: data.message_type || 'text',
                user_id: messageUserId,
                user_name: data.user?.name || 'Unknown User',
                user_email: data.user?.email || '',
                user_role: messageUserRole,
                timestamp: currentTimestamp,
                created_at: currentTimestamp,
                // Formatted time with date for display
                display_time: new Date(currentTimestamp).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }) // e.g., "Dec 25, 23:16"
              };
              
              // IMMEDIATELY add new messages to current user messages if it's for the selected user
              if (selectedUser && messageUserId === selectedUser.user_id) {
                console.log('🚨 REAL-TIME: Adding message to current user messages immediately!');
                setCurrentUserMessages(prev => [...prev, newMessage]);
              }
              
              // IMMEDIATELY update user threads with latest message
              const threadUpdateTimestamp = data.created_at || new Date().toISOString();
              setUserThreads(prev => 
                prev.map(thread => 
                  thread.user_id === messageUserId 
                    ? { 
                        ...thread, 
                        last_message: data.content || 'New message',
                        last_activity: threadUpdateTimestamp,
                        last_activity_display: new Date(threadUpdateTimestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        }), // e.g., "Dec 25, 23:16"
                        message_count: (thread.message_count || 0) + 1
                      }
                    : thread
                )
              );
              
              console.log('✅ REAL-TIME: Message processed and state updated immediately!');
            }
            
            // Handle message updates
            if (data.type === 'message_updated') {
              console.log('🔄 Message updated:', data);
              // Handle message updates if needed
            }
            
            // Handle message update confirmations
            if (data.type === 'message_update_confirmation') {
              console.log('✅ Message update confirmation:', data);
              // Handle confirmation if needed
            }
            
            // Log any other message types
            if (!['user_threads_response', 'new_user_thread', 'new_message', 'message_updated', 'message_update_confirmation'].includes(data.type)) {
              console.log('❓ Unknown message type received:', data.type);
            }
          }
        }
      );

    } catch (err) {
      const errorMsg = 'Failed to create WebSocket connection';
      console.error('❌ Failed to create WebSocket:', err);
      setIsConnected(false);
      setIsConnecting(false);
      connectionAttemptedRef.current = false;
      setConnectionError(errorMsg);
    }
  }, [selectedUser]); // Add selectedUser dependency so received handler can access it

  const disconnect = useCallback(() => {
    console.log('🧹 Cleaning up connection...');
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
    autoConnectAttemptedRef.current = false;
  }, []);

  // Auto-connect
  useEffect(() => {
    console.log('🔌 Auto-connect useEffect triggered');
    console.log('🔑 Auth token present:', !!authToken);
    console.log('🏪 Outlet type:', outletType);
    console.log('🔄 Auto connect attempted:', autoConnectAttemptedRef.current);
    console.log('🔗 Is connected:', isConnected);
    console.log('🔄 Is connecting:', isConnecting);
    
    if (authToken && outletType && !autoConnectAttemptedRef.current) {
      console.log('🚀 Auto-connecting to WebSocket...');
      autoConnectAttemptedRef.current = true;
      connect();
    } else {
      console.log('⏭️ Skipping auto-connect:');
      console.log('   - authToken:', !!authToken);
      console.log('   - outletType:', outletType);
      console.log('   - autoConnectAttempted:', autoConnectAttemptedRef.current);
      console.log('   - isConnected:', isConnected);
      console.log('   - isConnecting:', isConnecting);
    }

    // Test manual connection after 2 seconds
    setTimeout(() => {
      console.log('🧪 Testing manual connection...');
      if (!isConnected && !isConnecting) {
        console.log('🧪 Manually calling connect...');
        connect();
      }
    }, 2000);

    return () => {
      console.log('🧹 Cleaning up WebSocket connection...');
      disconnect();
      autoConnectAttemptedRef.current = false;
    };
  }, [authToken, outletType]); // Remove connect and disconnect from dependencies

  // Function to refresh user threads
  const refreshUserThreads = useCallback(async () => {
    await loadAllUserThreads();
  }, [loadAllUserThreads]);

  // Function to refresh current user messages
  const refreshCurrentUserMessages = useCallback(async () => {
    if (selectedUser && selectedUser.user_id) {
      await loadUserMessages(selectedUser.user_id);
    }
  }, [loadUserMessages, selectedUser]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    
    // Loading state
    isLoading,
    
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