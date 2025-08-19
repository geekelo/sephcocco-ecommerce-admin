import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, ArrowLeft, Eye, Wifi, WifiOff, AlertCircle, Check, Clock, Users } from 'lucide-react';

import "../styles/ChatModal.css";
import { useMessaging } from "../hooks/useMessaging";
import { getActiveOutlet } from "../utils/getActiveOutlets";
import ConversationList from "./ConversationList";

const ChatModal = ({ isOpen, onClose, selectedMessage, selectedUser }) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [sendingMessages, setSendingMessages] = useState(new Set());
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

  // Auto-select the user when modal opens with selectedUser prop
  useEffect(() => {
    if (isOpen && selectedUser && !currentSelectedUser) {
      selectUser(selectedUser);
    }
  }, [isOpen, selectedUser, currentSelectedUser, selectUser]);

  // Transform user messages to display format, handling both individual messages and JSONB chats
  const allMessages = currentUserMessages?.flatMap((message) => {
    console.log('📨 Processing message:', message);
    
    if (!message) return [];
    
    // Check if this is an individual message (from WebSocket) or has chats array (from API)
    if (message.content && !message.chats) {
      // Individual message from WebSocket
      console.log('💬 Individual message from WebSocket:', message);
      
      const isFromCustomer = message.user_role === 'user';
      const sender = isFromCustomer ? 'customer' : 'admin';
      
      return [{
        id: message.id,
        sender: sender,
        text: message.content,
        timestamp: new Date(message.timestamp || message.created_at || Date.now()),
        display_time: message.display_time, // Use the pre-formatted display time
        senderName: message.user_name || (sender === 'admin' ? 'Support Team' : 'Customer'),
        user_name: message.user_name,
        user_role: message.user_role,
        optimistic: message.optimistic,
        message_id: message.id
      }];
    } else {
      // Message with chats array (from API)
      const chats = message.chats || [];
      console.log('💬 Chats in message:', chats);
      
      return chats.map((chat, index) => {
        if (!chat) return null;
        
        // Determine sender based on chat structure
        const isFromCustomer = chat.user_role === 'user' || chat.sender === 'customer';
        const sender = isFromCustomer ? 'customer' : 'admin';
        
        return {
          id: chat.id || `${message.id}-${index}`,
          sender: sender,
          text: chat.content || chat.message || 'No content',
          timestamp: new Date(chat.created_at || chat.timestamp || Date.now()),
          display_time: chat.display_time, // Use the pre-formatted display time
          senderName: chat.user_name || (sender === 'admin' ? 'Support Team' : 'Customer'),
          user_name: chat.user_name,
          user_role: chat.user_role,
          optimistic: chat.optimistic,
          message_id: message.id
        };
      }).filter(Boolean); // Remove null values
    }
  }) || [];

  console.log('📨 All messages for display:', allMessages);

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

  // Enhanced message sending
  const handleSendMessage = async () => {
    console.log('🚀 handleSendMessage called');
    console.log('📝 New message:', newMessage);
    console.log('🔗 Is connected:', isConnected);
    console.log('⏳ Is sending:', isSending);
    console.log('👤 Current selected user:', currentSelectedUser);
    
    if (newMessage.trim() === "" || !isConnected || isSending || !currentSelectedUser) {
      console.log('❌ Cannot send message:');
      console.log('   - Message empty:', newMessage.trim() === "");
      console.log('   - Not connected:', !isConnected);
      console.log('   - Already sending:', isSending);
      console.log('   - No user selected:', !currentSelectedUser);
      return;
    }

    const messageContent = newMessage.trim();
    const tempMessageId = `temp-${Date.now()}`;
    
    console.log('📤 Sending message content:', messageContent);
    
    setIsSending(true);
    setShouldAutoScroll(true);
    setSendingMessages(prev => new Set([...prev, tempMessageId]));
    
    try {
    // Send message via ActionCable
      console.log('📤 Calling sendMessage function...');
      console.log('📤 sendMessage function:', sendMessage);
      console.log('📤 sendMessage type:', typeof sendMessage);
      
      sendMessage(messageContent, 'text');
      console.log('✅ sendMessage function called successfully');
      setNewMessage("");
      
      // Wait a brief moment for the message to be processed on the server
      setTimeout(async () => {
        try {
          // Refresh current chat to get the real message from server
          await refreshCurrentUserMessages();
          
          // Remove from sending messages after successful send and refresh
          setSendingMessages(prev => {
            const newSet = new Set(prev);
            newSet.delete(tempMessageId);
            return newSet;
          });
        } catch (refreshError) {
          console.error('Failed to refresh messages after send:', refreshError);
          // Still remove from sending messages even if refresh fails
          setSendingMessages(prev => {
            const newSet = new Set(prev);
            newSet.delete(tempMessageId);
            return newSet;
          });
        }
      }, 1000); // Wait 1 second before refreshing
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Remove from sending messages on error
      setSendingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempMessageId);
        return newSet;
      });
      // Optionally show error message to user
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
    <div className="chat-modal-overlay">
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
                          console.log('🔘 Event:', e);
                          console.log('🔘 Button state:', {
                            isConnected,
                            hasMessage: newMessage.trim() !== "",
                            isSending
                          });
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