import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { createConsumer } from '@rails/actioncable';

// Hook
export const useAdminWebhookRN = (authToken, options) => {
  const {
    outletType,
    autoConnect = true,
    onNewMessage,
    onUserConnected,
    onUserDisconnected,
    onError,
    onChatThreadUpdate
  } = options;

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
  const [newMessages, setNewMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState(new Set());
  const [userChatThreads, setUserChatThreads] = useState(new Map());
  const [selectedUserThread, setSelectedUserThread] = useState(null);

  const API_BASE_URL = 'https://sephcocco-lounge-api.onrender.com/api/v1';

  // Update refs when props change
  useEffect(() => {
    authTokenRef.current = authToken;
    outletTypeRef.current = outletType;
  }, [authToken, outletType]);

  // Memoized stats
  const totalNewMessages = useMemo(() => newMessages.length, [newMessages]);
  const totalActiveUsers = useMemo(() => activeUsers.size, [activeUsers]);
  const totalUnreadThreads = useMemo(() => {
    let count = 0;
    userChatThreads.forEach(thread => {
      if (thread.unread_count > 0) count++;
    });
    return count;
  }, [userChatThreads]);

  // Load user chat thread via WebSocket ONLY
  const loadUserChatThread = useCallback(async (userId) => {
    console.log('📤 Loading user chat thread via WebSocket for user:', userId);
    
    if (!subscriptionRef.current || !isConnected) {
      console.log('❌ Cannot load user chat thread: WebSocket not connected');
      return null;
    }

    try {
      // Request user messages via WebSocket
      subscriptionRef.current.perform('request_user_messages', {
        user_id: userId,
        outlet_type: outletTypeRef.current
      });
      
      console.log('📤 WebSocket request sent for user chat thread');
      
      // Return existing thread if available, otherwise null
      const existingThread = userChatThreads.get(String(userId));
      return existingThread || null;
    } catch (error) {
      console.error('Error requesting user chat thread via WebSocket:', error);
      return null;
    }
  }, [isConnected, userChatThreads]);

  // Load all user threads from API
  const loadAllUserThreads = useCallback(async () => {
    if (!authTokenRef.current || !outletTypeRef.current) {
      console.log('❌ Cannot load user threads: missing authToken or outletType');
      return;
    }

    console.log('🔄 Loading user threads via WebSocket...');
    
    // Request user threads via WebSocket instead of REST API
    if (subscriptionRef.current && isConnected) {
      console.log('📤 Requesting user threads via WebSocket...');
      console.log('📤 Outlet type:', outletTypeRef.current);
      console.log('📤 Subscription:', subscriptionRef.current);
      
      const requestData = {
        action: 'request_initial_threads',
        outlet_type: outletTypeRef.current
      };
      
      console.log('📤 Request data:', requestData);
      subscriptionRef.current.perform('receive', requestData);
    } else {
      console.log('❌ Cannot request user threads: WebSocket not connected');
      console.log('❌ Subscription:', subscriptionRef.current);
      console.log('❌ Is connected:', isConnected);
    }
  }, [isConnected]);

  // Select user thread
  const selectUserThread = useCallback(async (userId) => {
    try {
      const thread = await loadUserChatThread(userId);
      setSelectedUserThread(thread);
    } catch (error) {
      console.error('Error selecting user thread:', error);
    }
  }, [loadUserChatThread]);

  // Send message to user
  const sendMessageToUser = useCallback((userId, content, messageType = 'text') => {
    if (!subscriptionRef.current || !isConnected) {
      console.error('Cannot send message: not connected');
      return;
    }

    const messageData = {
      message: {
        user_id: userId,
        content: content,
        outlet_type: outletTypeRef.current,
        message_type: messageType
      },
      user_id: userId,
      outlet_type: outletTypeRef.current
    };

    console.log('📤 Sending message via ActionCable:', messageData);
    subscriptionRef.current.perform('receive', messageData);
  }, [isConnected]);

  // WebSocket connection using ActionCable
  const connect = useCallback(() => {
    console.log('🔐 Connect function called');
    console.log('🔐 Connection attempted ref:', connectionAttemptedRef.current);
    console.log('🔐 Is connecting:', isConnecting);
    console.log('🔐 Is connected:', isConnected);
    
    if (!authTokenRef.current || !outletTypeRef.current) {
      const error = 'No authentication token or outlet type provided';
      setConnectionError(error);
      onError?.(error);
      return;
    }

    if (connectionAttemptedRef.current || isConnecting || isConnected) {
      console.log('🔐 Connection already attempted or in progress, skipping...');
      return;
    }

    connectionAttemptedRef.current = true;
    setIsConnecting(true);
    setConnectionError(null);

    console.log('🔐 Admin Webhook: Attempting to connect...');
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
            console.log('🎉 Channel params:', { outlet_type: outletTypeRef.current });
            
            // Load initial user threads when connected with a small delay
            setTimeout(() => {
              console.log('⏰ Loading user threads after connection...');
              loadAllUserThreads();
            }, 1000);
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
            onError?.('Failed to connect to messaging channel');
          },

          received(data) {
            console.log('📨 Received WebSocket message:', data);
            console.log('📨 Message type:', data.type);
            
            // Handle new user thread
            if (data.type === 'new_user_thread') {
              console.log('🆕 New user thread received:', data.user_thread);
              setUserChatThreads(prev => {
                const newMap = new Map(prev);
                const thread = data.user_thread;
                newMap.set(String(thread.user_id), {
                  id: thread.user_id,
                  user_id: thread.user_id,
                  user_name: thread.user_name || 'Unknown User',
                  user_email: thread.user_email || '',
                  status: thread.status || 'open',
                  created_at: thread.last_activity || new Date().toISOString(),
                  updated_at: thread.last_activity || new Date().toISOString(),
                  last_message: thread.last_message || 'No messages yet',
                  message_count: thread.message_count || 1,
                  unread_count: thread.unread_count || 0,
                  messages: []
                });
                return newMap;
              });
              onChatThreadUpdate?.(data.user_thread);
            }
            
            // Handle user thread updates
            if (data.type === 'user_thread_updated') {
              console.log('🔄 User thread updated:', data);
              setUserChatThreads(prev => {
                const newMap = new Map(prev);
                const existingThread = newMap.get(String(data.user_id));
                if (existingThread) {
                  const updatedThread = {
                    ...existingThread,
                    last_message: data.last_message,
                    updated_at: data.last_activity,
                    message_count: data.message_count
                  };
                  newMap.set(String(data.user_id), updatedThread);
                  onChatThreadUpdate?.(updatedThread);
                }
                return newMap;
              });
            }
            
            // Handle new message - BROADCAST TO ALL CONNECTED USERS
            if (data.type === 'new_message' || data.type === 'broadcast_message') {
              console.log('🚨 REAL-TIME: New message received via WebSocket!');
              console.log('💬 Message type:', data.type);
              console.log('💬 Full message data:', JSON.stringify(data, null, 2));
              console.log('💬 Message user_id:', data.user_id);
              console.log('💬 Message content:', data.content);
              console.log('💬 Message user_role:', data.user_role);
              console.log('💬 Is broadcast message:', data.broadcast || false);
              
              // Create standardized message object with date and time
              const currentTimestamp = data.created_at || data.timestamp || new Date().toISOString();
              const standardizedMessage = {
                id: data.id || data.chat_id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                content: data.content,
                message_type: data.message_type || 'text',
                user_id: data.user_id,
                user_name: data.user?.name || 'Unknown User',
                user_email: data.user?.email || '',
                user_role: data.user_role,
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
              
              // Add to new messages
              setNewMessages(prev => [...prev, standardizedMessage]);
              
              // Add user to active users
              setActiveUsers(prev => new Set([...prev, String(data.user_id)]));
              
              // Update user chat thread
              setUserChatThreads(prev => {
                const newMap = new Map(prev);
                const existingThread = newMap.get(String(data.user_id));
                
                if (existingThread) {
                  // Update existing thread
                  const threadUpdateTimestamp = data.created_at || new Date().toISOString();
                  const updatedThread = {
                    ...existingThread,
                    last_message: data.content,
                    updated_at: threadUpdateTimestamp,
                    updated_at_display: new Date(threadUpdateTimestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    }), // e.g., "Dec 25, 23:16"
                    message_count: existingThread.message_count + 1,
                    messages: [...existingThread.messages, standardizedMessage]
                  };
                  newMap.set(String(data.user_id), updatedThread);
                  onChatThreadUpdate?.(updatedThread);
                } else {
                  // Create new thread
                  const threadCreateTimestamp = data.created_at || new Date().toISOString();
                  const newThread = {
                    id: data.user_id,
                    user_id: data.user_id,
                    user_name: data.user?.name || 'Unknown User',
                    user_email: data.user?.email || '',
                    status: 'open',
                    created_at: threadCreateTimestamp,
                    created_at_display: new Date(threadCreateTimestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    }), // e.g., "Dec 25, 23:16"
                    updated_at: threadCreateTimestamp,
                    updated_at_display: new Date(threadCreateTimestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    }), // e.g., "Dec 25, 23:16"
                    last_message: data.content,
                    message_count: 1,
                    unread_count: 1,
                    messages: [standardizedMessage]
                  };
                  newMap.set(String(data.user_id), newThread);
                  onChatThreadUpdate?.(newThread);
                }
                
                return newMap;
              });
              
              // Call callback with standardized message
              onNewMessage?.(standardizedMessage);
            }
            
            // Handle message updates
            if (data.type === 'message_updated') {
              console.log('🔄 Message updated:', data);
              
              // Update user chat thread with new message
              setUserChatThreads(prev => {
                const newMap = new Map(prev);
                const existingThread = newMap.get(String(data.user_id));
                
                if (existingThread) {
                  // Update existing thread
                  const updatedThread = {
                    ...existingThread,
                    last_message: data.content,
                    updated_at: data.created_at,
                    message_count: existingThread.message_count + 1,
                    messages: [...existingThread.messages, {
                      id: data.id,
                      content: data.content,
                      created_at: data.created_at,
                      message_type: data.message_type,
                      status: data.status
                    }]
                  };
                  newMap.set(String(data.user_id), updatedThread);
                  onChatThreadUpdate?.(updatedThread);
                }
                
                return newMap;
              });
              
              // Call callback for message updates
              onNewMessage?.(data);
            }
            
            // Handle user threads response from WebSocket
            if (data.type === 'user_threads_response') {
              console.log('📋 User threads response received:', data);
              console.log('📋 Threads count:', data.threads?.length || 0);
              
              const threadsMap = new Map();
              if (data.threads && Array.isArray(data.threads)) {
                data.threads.forEach(thread => {
                  threadsMap.set(String(thread.user_id), {
                    id: thread.user_id,
                    user_id: thread.user_id,
                    user_name: thread.user_name || 'Unknown User',
                    user_email: thread.user_email || '',
                    status: thread.status || 'open',
                    created_at: thread.created_at || new Date().toISOString(),
                    updated_at: thread.updated_at || new Date().toISOString(),
                    last_message: thread.last_message || 'No messages yet',
                    message_count: thread.message_count || 0,
                    unread_count: thread.unread_count || 0,
                    messages: thread.messages || []
                  });
                });
              }
              
              setUserChatThreads(threadsMap);
              console.log('✅ User threads loaded from WebSocket:', threadsMap.size);
              
              // Call callback for thread updates
              if (data.threads?.length > 0) {
                data.threads.forEach(thread => {
                  onChatThreadUpdate?.(thread);
                });
              }
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
      onError?.(errorMsg);
    }
  }, [onNewMessage, onError, onChatThreadUpdate, loadAllUserThreads]);

  const disconnect = useCallback(() => {
    console.log('🧹 Admin Webhook: Cleaning up connection...');
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

  const clearMessages = useCallback(() => {
    setNewMessages([]);
  }, []);

  const markMessageAsRead = useCallback((messageId) => {
    setNewMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  // Auto-connect
  useEffect(() => {
    if (autoConnect && authToken && outletType && !autoConnectAttemptedRef.current) {
      console.log('🚀 Auto-connecting to WebSocket...');
      autoConnectAttemptedRef.current = true;
      connect();
    }

    // Set up periodic connection check
    const connectionCheckInterval = setInterval(() => {
      if (isConnected && subscriptionRef.current) {
        // Send a ping to keep connection alive
        try {
          subscriptionRef.current.send({ type: 'ping', timestamp: Date.now() });
        } catch (error) {
          console.log('🔌 Connection check failed, attempting to reconnect...');
          disconnect();
          setTimeout(() => connect(), 1000);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => {
      console.log('🧹 Cleaning up WebSocket connection...');
      clearInterval(connectionCheckInterval);
      disconnect();
      autoConnectAttemptedRef.current = false;
    };
  }, [autoConnect, authToken, outletType, connect, disconnect, isConnected]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    
    // Message state
    newMessages,
    activeUsers,
    
    // Chat threads by user
    userChatThreads,
    selectedUserThread,
    
    // Stats
    totalNewMessages,
    totalActiveUsers,
    totalUnreadThreads,
    
    // Functions
    connect,
    disconnect,
    clearMessages,
    markMessageAsRead,
    selectUserThread,
    sendMessageToUser,
    loadUserChatThread,
    loadAllUserThreads
  };
}; 