import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const API_BASE_URL = 'https://sephcocco-lounge-api.onrender.com/api/v1';

export const useMessaging = ({
  authToken,
  outletType,
  onNewMessage,
  onChatThreadUpdate,
  onConnectionChange
}) => {
  // Refs for stable references
  const authTokenRef = useRef(authToken);
  const outletTypeRef = useRef(outletType);
  const wsRef = useRef(null);
  const userChatThreadsRef = useRef(new Map());

  // Connection states
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Message and user states
  const [newMessages, setNewMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState(new Set());
  
  // Chat thread management - use ref to avoid dependency issues
  const [userChatThreads, setUserChatThreads] = useState(new Map());
  const [selectedUserThread, setSelectedUserThread] = useState(null);

  // Update refs when props change
  useEffect(() => {
    authTokenRef.current = authToken;
    outletTypeRef.current = outletType;
  }, [authToken, outletType]);

  // Update ref when state changes
  useEffect(() => {
    userChatThreadsRef.current = userChatThreads;
  }, [userChatThreads]);

  // Calculate total unread threads
  const totalUnreadThreads = useMemo(() => {
    let count = 0;
    userChatThreads.forEach(thread => {
      if (thread.unread_count > 0) count++;
    });
    return count;
  }, [userChatThreads]);

  // WebSocket connection management - only run once
  useEffect(() => {
    if (!authTokenRef.current || !outletTypeRef.current) {
      return;
    }

    const connectWebSocket = () => {
      setIsConnecting(true);
      setConnectionError(null);

      try {
        const wsUrl = `wss://sephcocco-lounge-api.onrender.com/cable?token=${authTokenRef.current}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('Admin WebSocket connected');
          setIsConnected(true);
          setIsConnecting(false);
          onConnectionChange?.(true);

          // Subscribe to admin channel
          const subscribeMessage = {
            command: 'subscribe',
            identifier: JSON.stringify({
              channel: 'MessagingChannel',
              outlet_type: outletTypeRef.current
            })
          };
          ws.send(JSON.stringify(subscribeMessage));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'ping') {
              ws.send(JSON.stringify({ type: 'pong' }));
              return;
            }

            if (data.message) {
              const message = data.message;
              
              // Add to new messages (check for duplicates)
              setNewMessages(prev => {
                const messageExists = prev.some(msg => msg.id === message.id);
                return messageExists ? prev : [...prev, message];
              });
              
              // Update active users
              setActiveUsers(prev => new Set([...prev, message.user_id]));
              
              // Update user chat threads (check for duplicates)
              setUserChatThreads(prev => {
                const newMap = new Map(prev);
                const userId = message.user_id;
                const existingThread = newMap.get(userId) || {
                  user_id: userId,
                  user_name: message.user_name || message.user?.name,
                  user_email: message.user_email || message.user?.email,
                  messages: [],
                  unread_count: 0,
                  last_activity: new Date().toISOString(),
                  status: 'open'
                };

                // Check if message already exists
                const messageExists = existingThread.messages.some(msg => msg.id === message.id);
                if (messageExists) {
                  return prev;
                }

                const updatedThread = {
                  ...existingThread,
                  messages: [...existingThread.messages, message],
                  last_activity: message.created_at,
                  unread_count: existingThread.unread_count + 1
                };

                newMap.set(userId, updatedThread);
                return newMap;
              });

              onNewMessage?.(message);
              onChatThreadUpdate?.(message.user_id);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          console.log('Admin WebSocket disconnected');
          setIsConnected(false);
          setIsConnecting(false);
          onConnectionChange?.(false);
          
          // Reconnect after 5 seconds
          setTimeout(() => {
            if (authTokenRef.current && outletTypeRef.current) {
              connectWebSocket();
            }
          }, 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionError('WebSocket connection failed');
          setIsConnecting(false);
          onConnectionChange?.(false);
        };

      } catch (error) {
        console.error('Error creating WebSocket:', error);
        setConnectionError(error.message);
        setIsConnecting(false);
        onConnectionChange?.(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Empty dependency array - refs handle updates

  // Load chat history for a specific user
  const loadUserChatThread = useCallback(async (userId) => {
    if (!authTokenRef.current || !outletTypeRef.current) {
      throw new Error('Missing auth token or outlet type');
    }

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setUserChatThreads(prev => {
        const newMap = new Map(prev);
        const userThread = {
          user_id: userId,
          user_name: data.user?.name || 'Unknown User',
          user_email: data.user?.email || '',
          messages: data.messages || [],
          unread_count: 0,
          last_activity: data.messages?.[0]?.created_at || new Date().toISOString(),
          status: 'open'
        };
        
        newMap.set(userId, userThread);
        return newMap;
      });

      return data;
    } catch (error) {
      console.error('Error loading user chat thread:', error);
      throw error;
    }
  }, []);

  // Select and load a user thread
  const selectUserThread = useCallback(async (userId) => {
    await loadUserChatThread(userId);
    setSelectedUserThread(userChatThreadsRef.current.get(userId) || null);
  }, [loadUserChatThread]);

  // Send message to a specific user
  const sendMessageToUser = useCallback(async (userId, content, messageType = 'text') => {
    if (!wsRef.current || !isConnected) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      command: 'message',
      identifier: JSON.stringify({
        channel: 'MessagingChannel',
        outlet_type: outletTypeRef.current
      }),
      data: JSON.stringify({
        message: {
          content,
          message_type: messageType
        },
        outlet_type: outletTypeRef.current,
        user_id: userId,
        action: 'receive'
      })
    };

    wsRef.current.send(JSON.stringify(message));
  }, [isConnected]);

  // Clear new messages array
  const clearNewMessages = useCallback(() => {
    setNewMessages([]);
  }, []);

  // Mark a message as read
  const markMessageAsRead = useCallback((userId) => {
    setUserChatThreads(prev => {
      const newMap = new Map(prev);
      const thread = newMap.get(userId);
      if (thread) {
        newMap.set(userId, {
          ...thread,
          unread_count: 0
        });
      }
      return newMap;
    });
  }, []);

  return {
    isConnected,
    isConnecting,
    connectionError,
    newMessages,
    activeUsers,
    userChatThreads,
    selectedUserThread,
    totalUnreadThreads,
    loadUserChatThread,
    selectUserThread,
    sendMessageToUser,
    clearNewMessages,
    markMessageAsRead
  };
}; 