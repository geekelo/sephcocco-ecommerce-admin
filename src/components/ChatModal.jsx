import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, ArrowLeft, Eye, Wifi, WifiOff, AlertCircle, Check, Clock, Users } from 'lucide-react';

import "../styles/ChatModal.css";
import { useMessaging } from "../hooks/useMessaging";
import { getActiveOutlet } from "../utils/getActiveOutlets";
import ConversationList from "./ConversationList";

const ChatModal = ({ isOpen, onClose, style, selectedMessage, selectedUser }) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [sendingMessages, setSendingMessages] = useState(new Set());
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const navigate = useNavigate();
  
  // Get auth token from localStorage
  const authToken = localStorage.getItem('token');
  const activeOutlet = getActiveOutlet();
  
  // Use the messaging hook with user thread support
  const { 
    userThreads,
    selectedUser: currentSelectedUser,
    currentUserMessages,
    isConnected, 
    isConnecting, 
    connectionError, 
    sendMessage,
    selectUser,
    refreshUserThreads,
    refreshCurrentUserMessages
  } = useMessaging(authToken, activeOutlet);

  console.log('timme', currentSelectedUser);

  // Race condition fix: Remove optimistic messages faster when real message arrives
  useEffect(() => {
    // When new real messages arrive, check if we should remove matching optimistic messages
    if (currentUserMessages && optimisticMessages.length > 0) {
      const currentUserId = "335b636e-9a9d-4cda-a509-49b1bd23550e"; // Your admin ID from logs
      
      // Find real messages that match optimistic messages
      const realMessagesFromAdmin = currentUserMessages.flatMap(msg => {
        if (msg.content && !msg.chats) {
          // Individual message
          if (msg.user_id === currentUserId) return [msg];
        } else if (msg.chats) {
          // Messages with chats array
          return msg.chats.filter(chat => chat && chat.user_id === currentUserId) || [];
        }
        return [];
      });
      
      // Remove optimistic messages that now have real counterparts
      const optimisticToRemove = optimisticMessages.filter(optMsg => {
        return realMessagesFromAdmin.some(realMsg => {
          const realContent = realMsg.content || realMsg.message;
          const realTime = new Date(realMsg.created_at || realMsg.timestamp);
          const optTime = new Date(optMsg.timestamp);
          const timeDiff = Math.abs(realTime - optTime);
          
          // Match by content and close timestamp (within 5 seconds)
          return realContent === optMsg.text && timeDiff < 5000;
        });
      });
      
      if (optimisticToRemove.length > 0) {
        console.log('🏃‍♂️ Race condition fix: Removing optimistic messages immediately:', optimisticToRemove.length);
        setOptimisticMessages(prev => 
          prev.filter(opt => !optimisticToRemove.some(remove => remove.id === opt.id))
        );
      }
    }
  }, [currentUserMessages, optimisticMessages]);

  // Helper function to determine sender with better logic
  const determineSender = (message) => {
    // If it's optimistic, it's always from admin (current user)
    if (message.optimistic) return 'admin';
    
    // Get current admin info to identify your own messages
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserEmail = currentUser.email;
    const currentUserId = currentUser.id || "335b636e-9a9d-4cda-a509-49b1bd23550e"; // Your admin ID from logs
    
    // MOST IMPORTANT: Check if this message is from the current admin user by ID
    if (message.user_id === currentUserId) {
      console.log('✅ Message identified as admin by user_id match:', message.user_id);
      return 'admin';
    }
    
    // Check if this message is from the current admin user by email
    if (message.user_email === currentUserEmail && currentUserEmail) {
      console.log('✅ Message identified as admin by email match:', message.user_email);
      return 'admin';
    }
    
    // Check user_role
    if (message.user_role === 'admin' || message.user_role === 'support') {
      console.log('✅ Message identified as admin by user_role:', message.user_role);
      return 'admin';
    }
    
    // Check sender field
    if (message.sender === 'admin' || message.sender === 'support') {
      console.log('✅ Message identified as admin by sender field:', message.sender);
      return 'admin';
    }
    
    // Check user_name patterns
    if (message.user_name === 'Support Team') {
      console.log('✅ Message identified as admin by user_name:', message.user_name);
      return 'admin';
    }
    
    // If we reach here, it's a customer message
    console.log('👤 Message identified as customer:', {
      user_id: message.user_id,
      user_role: message.user_role,
      user_name: message.user_name,
      currentUserId: currentUserId
    });
    return 'customer';
  };

  // Transform user messages to display format, handling both individual messages and JSONB chats
  const allMessages = useMemo(() => {
    // Process real messages from server
    const realMessages = currentUserMessages?.flatMap((message) => {
      if (!message) return [];
      
      // Check if this is an individual message (from WebSocket) or has chats array (from API)
      if (message.content && !message.chats) {
        const sender = determineSender(message);
        
        console.log('🔍 Individual Message Debug:', {
          message_id: message.id,
          user_role: message.user_role,
          user_id: message.user_id,
          sender: message.sender,
          determined_sender: sender,
          optimistic: message.optimistic,
          content_preview: message.content?.substring(0, 20),
          timestamp: message.timestamp || message.created_at
        });
        
        return [{
          id: message.id,
          sender: sender,
          text: message.content,
          timestamp: new Date(message.timestamp || message.created_at || Date.now()),
          display_time: message.display_time,
          senderName: message.user_name || (sender === 'admin' ? 'Support Team' : 'Customer'),
          user_name: message.user_name,
          user_role: message.user_role,
          user_id: message.user_id,
          optimistic: message.optimistic,
          message_id: message.id
        }];
      } else {
        // Message with chats array (from API)
        const chats = message.chats || [];
        
        return chats.map((chat, index) => {
          if (!chat) return null;
          
          const sender = determineSender(chat);
          
          console.log('🔍 Chat Debug:', {
            chat_id: chat.id,
            chat_user_role: chat.user_role,
            chat_user_id: chat.user_id,
            chat_sender: chat.sender,
            determined_sender: sender,
            content_preview: (chat.content || chat.message)?.substring(0, 20)
          });

          return {
            id: chat.id || `${message.id}-${index}`,
            sender: sender,
            text: chat.content || chat.message || 'No content',
            timestamp: new Date(chat.created_at || chat.timestamp || Date.now()),
            display_time: chat.display_time,
            senderName: chat.user_name || (sender === 'admin' ? 'Support Team' : 'Customer'),
            user_name: chat.user_name,
            user_role: chat.user_role,
            user_id: chat.user_id,
            optimistic: chat.optimistic,
            message_id: message.id
          };
        }).filter(Boolean);
      }
    }) || [];

    // Filter out real messages that match optimistic messages (prevent duplicates during transition)
    const optimisticTexts = new Set(optimisticMessages.map(opt => opt.text));
    const optimisticTimestamps = new Set(optimisticMessages.map(opt => opt.timestamp.getTime()));
    
    const filteredRealMessages = realMessages.filter(realMsg => {
      // If we have an optimistic message with same text sent within last 3 seconds, filter out real message temporarily
      if (optimisticTexts.has(realMsg.text)) {
        const realMsgTime = new Date(realMsg.timestamp).getTime();
        const hasRecentOptimistic = optimisticMessages.some(opt => {
          const optTime = new Date(opt.timestamp).getTime();
          const timeDiff = Math.abs(realMsgTime - optTime);
          return opt.text === realMsg.text && timeDiff < 3000; // 3 second window
        });
        
        if (hasRecentOptimistic) {
          console.log('🚫 Filtering out real message to prevent duplicate:', realMsg.text?.substring(0, 20));
          return false; // Filter out the real message while optimistic exists
        }
      }
      return true;
    });

    // Combine filtered real messages with optimistic messages
    const combinedMessages = [...filteredRealMessages, ...optimisticMessages];
    
    // Sort by timestamp
    const sortedMessages = combinedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    console.log('📨 All messages for display:', sortedMessages.length, 'messages');
    return sortedMessages;
    
  }, [currentUserMessages, optimisticMessages]);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const lastMessageCountRef = useRef(0);

  // Smart auto-scroll logic - only scroll when new messages arrive
  useEffect(() => {
    const currentMessageCount = allMessages?.length;
    const hasNewMessage = currentMessageCount > lastMessageCountRef?.current;
    
    if (hasNewMessage && shouldAutoScroll && messagesEndRef?.current) {
      messagesEndRef?.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    lastMessageCountRef.current = currentMessageCount;
  }, [allMessages?.length, shouldAutoScroll]);

  // Check if user is near bottom to determine auto-scroll behavior
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  // Function to get user display status
  const getUserMessageStatus = (message) => {
    if (message.optimistic && sendingMessages.has(message.id)) {
      return 'sending';
    } else if (message.optimistic) {
      return 'sent';
    } else if (message.error) {
      return 'error';
    }
    return 'sent';
  };

  // Fixed handleSendMessage with better deduplication
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !isConnected || isSending || !currentSelectedUser) {
      return;
    }

    const messageContent = newMessage.trim();
    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    // Get current admin info
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Create optimistic message that will be displayed immediately
    const optimisticMessage = {
      id: tempMessageId,
      sender: 'admin',
      text: messageContent,
      timestamp: now,
      display_time: now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      }),
      senderName: currentUser.name,
      user_name: currentUser.name,
      user_role: 'admin',
      user_email: currentUser.email, // Add current user email for identification
      user_id: currentUser.id, // Add current user ID for identification
      optimistic: true,
      message_id: tempMessageId,
      content: messageContent // Add content field to match server response
    };
    
    console.log('📤 Adding optimistic message:', optimisticMessage);
    
    setIsSending(true);
    setShouldAutoScroll(true);
    setSendingMessages(prev => new Set([...prev, tempMessageId]));
    
    // Add optimistic message to display immediately
    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    setNewMessage(""); // Clear input immediately
    
    try {
      // Send the actual message
      await sendMessage(messageContent, 'text');
      console.log('✅ Message sent successfully');
      
      // Wait longer for real message to arrive and be processed
      setTimeout(async () => {
        try {
          await refreshCurrentUserMessages();
          
          // Wait a bit more to ensure the real message is fully processed
          setTimeout(() => {
            // Remove optimistic message only after confirming real message exists
            setOptimisticMessages(prev => {
              const filtered = prev.filter(msg => msg.id !== tempMessageId);
              console.log('🗑️ Removing optimistic message:', tempMessageId);
              return filtered;
            });
            
            setSendingMessages(prev => {
              const newSet = new Set(prev);
              newSet.delete(tempMessageId);
              return newSet;
            });
          }, 300); // Additional delay to ensure smooth transition
          
        } catch (refreshError) {
          console.error('Failed to refresh messages after send:', refreshError);
          // Remove optimistic message even if refresh fails
          setOptimisticMessages(prev => 
            prev.filter(msg => msg.id !== tempMessageId)
          );
          setSendingMessages(prev => {
            const newSet = new Set(prev);
            newSet.delete(tempMessageId);
            return newSet;
          });
        }
      }, 1500); // Increased delay to 1.5 seconds
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      
      // Remove optimistic message on error and restore input
      setOptimisticMessages(prev => 
        prev.filter(msg => msg.id !== tempMessageId)
      );
      setSendingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempMessageId);
        return newSet;
      });
      setNewMessage(messageContent); // Restore message on error
      
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp, displayTime) => {
    // If we have a pre-formatted display_time, use it
    if (displayTime) {
      return displayTime;
    }
    
    // Fallback to formatting the timestamp
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  // Function to get user initials
  const getUserInitials = (name) => {
    if (!name) return 'CU'; // Customer default
    
    const words = name.trim().split(' ');
    const initials = words.map(word => word.charAt(0).toUpperCase());
    
    return initials.slice(0, 2).join('');
  };

  const handleProductClick = () => {
    navigate('/products');
  };

  // Render status icon for admin messages
  const renderMessageStatus = (message) => {
    if (message.sender === 'admin') {
      const status = getUserMessageStatus(message);
      switch (status) {
        case 'sending':
          return <Clock size={12} className="status-icon sending" />;
        case 'sent':
          return <Check size={12} className="status-icon sent" />;
        case 'error':
          return <AlertCircle size={12} className="status-icon error" />;
        default:
          return <Check size={12} className="status-icon sent" />;
      }
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" style={style}>
      <div className="chat-modal">
        {/* Header */}
        <div className="chat-modal-header">
          <button className="back-btn" onClick={onClose}>
            <ArrowLeft size={20} />
            Go Back
          </button>
          
          <div className="connection-status">
            {isConnecting ? (
              <div className="status-indicator connecting">
                <div className="spinner-small"></div>
                <span>Connecting...</span>
              </div>
            ) : isConnected ? (
              <div className="status-indicator connected">
                <Wifi size={16} />
                <span>Connected</span>
              </div>
            ) : (
              <div className="status-indicator disconnected">
                <WifiOff size={16} />
                <span>Disconnected</span>
              </div>
            )}
          </div>
         
          <div className="chat-actions">
            <button className="view-product-btn" onClick={handleProductClick}>
              <Eye size={16} />
              View Product
            </button>
          </div>
        </div>

        {/* Connection Error Display */}
        {connectionError && (
          <div className="connection-error-banner">
            <AlertCircle size={16} />
            <span>{connectionError}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="chat-main-content">
          {/* Conversation List */}
          <div className="conversation-list-container">
            <ConversationList
              userThreads={userThreads}
              selectedUser={currentSelectedUser}
              onSelectUser={selectUser}
              isLoading={isConnecting}
            />
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            {currentSelectedUser ? (
              <>
                {/* Chat Header */}
                <div className="chat-header">
                  <div className="chat-customer-info">
                    <div className="customer-avatar">
                      <span className="avatar-initials">
                        {getUserInitials(currentSelectedUser.user_name)}
                      </span>
                    </div>
                    <div className="customer-details">
                      <h3>{currentSelectedUser.user_name || 'Unknown Customer'}</h3>
                      <p className="product-info">
                        {currentSelectedUser.user_email || 'No email'}
                      </p>
                    </div>
                  </div>
                  <div className="chat-status">
                    <span className={`status-badge ${currentSelectedUser.status || 'active'}`}>
                      {currentSelectedUser.status || 'active'}
                    </span>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="chat-content">
                  <div 
                    className="chat-messages"
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                  >
                    {allMessages?.length === 0 ? (
                      <div className="no-messages-admin">
                        <MessageCircle size={48} className="empty-icon" />
                        <h3>No messages yet</h3>
                        <p>Start the conversation with the customer</p>
                      </div>
                    ) : (
                      allMessages?.map((message) => {
                        return (
                          <div 
                            key={message.id} 
                            className={`message ${message.sender} ${message.optimistic ? 'sending' : ''}`}
                          >
                            <div className="message-avatar">
                              {message.sender === "customer" ? (
                                <div className="customer-avatar">
                                  <span className="avatar-initials">
                                    {getUserInitials(message.user_name)}
                                  </span>
                                </div>
                              ) : (
                                <div className="admin-avatar">
                                  <MessageCircle size={16} />
                                </div>
                              )}
                            </div>
                            <div className="message-content">
                              {/* Add user name display */}
                              <div className="message-sender">
                                {message.user_name}
                              </div>
                              <div className="message-bubble">
                                <p>{message.text}</p>
                              </div>
                              <div className="message-time">
                                {formatTime(message.timestamp, message.display_time)}
                                {message.optimistic && <span className="sending-indicator">Sending...</span>}
                                {!message.optimistic && renderMessageStatus(message)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="chat-input-area">
                    <div className="chat-input-container">
                      <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                          isConnecting 
                            ? "Connecting..." 
                            : isConnected 
                              ? "Type your message..." 
                              : "Disconnected - Cannot send messages"
                        }
                        className="message-input"
                        rows="1"
                        disabled={!isConnected || isSending}
                        maxLength={1000}
                      />
                      
                      <button 
                        className={`send-btn ${(!isConnected || newMessage.trim() === "" || isSending) ? 'disabled' : ''}`}
                        onClick={(e) => {
                          console.log('🔘 Send button clicked!');
                          handleSendMessage();
                        }}
                        disabled={!isConnected || newMessage.trim() === "" || isSending}
                        title={!isConnected ? 'Not connected' : 'Send message'}
                        style={{
                          backgroundColor: (!isConnected || newMessage.trim() === "" || isSending) ? '#ccc' : '#007bff',
                          cursor: (!isConnected || newMessage.trim() === "" || isSending) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isSending ? (
                          <div className="spinner-small"></div>
                        ) : (
                          <Send size={20} />
                        )}
                      </button>
                    </div>
                    
                    {/* Character count for long messages */}
                    {newMessage.length > 800 && (
                      <div className="character-count">
                        {newMessage.length}/1000
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-conversation-selected">
                <Users size={48} className="empty-icon" />
                <h3>Select a user</h3>
                <p>Choose a user from the list to view their messages</p>
              </div>
            )}
          </div>
        </div>

        {/* Typing indicator */}
        {isSending && (
          <div className="typing-indicator-admin">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Sending message...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatModal;