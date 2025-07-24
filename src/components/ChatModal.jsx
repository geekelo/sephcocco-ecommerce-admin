import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, ArrowLeft, Eye, Wifi, WifiOff, AlertCircle } from 'lucide-react';

import "../styles/ChatModal.css";
import { useMessaging } from "../hooks/useMessaging";
import { getActiveOutlet } from "../utils/getActiveOutlets";

const ChatModal = ({ isOpen, onClose, selectedMessage }) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  
  // Get auth token from localStorage
  const authToken = localStorage.getItem('token');
  const activeOutlet = getActiveOutlet();
  
  // Use the messaging hook with refresh functionality
  const { 
    messages: realtimeMessages, 
    isConnected, 
    isConnecting, 
    connectionError, 
    sendMessage,
    refreshMessages 
  } = useMessaging(authToken, activeOutlet);

  // Extract chats from messages (same approach as Desktop/Mobile)
  const allChats = realtimeMessages.flatMap(msg => 
    msg.chats ? msg.chats.map(chat => ({...chat, conversation_id: msg.conversation_id || 'default'})) : []
  );

  // Transform chats to display format - FIXED: Keep the original user_role
  const allMessages = allChats.map((chat, index) => ({
    id: chat.id || index,
    sender: chat.user_role === 'user' ? 'customer' : 'admin',
    text: chat.content || 'No content',
    timestamp: new Date(chat.timestamp || Date.now()),
    senderName: chat.user_role === 'user' ? (chat.user_name || 'Customer') : 'Support Team',
    user_name: chat.user_name,
    user_role: chat.user_role, // FIXED: Keep original user_role for avatar logic
    optimistic: chat.optimistic
  }));

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  // Enhanced message sending with refresh
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !isConnected || isSending) return;

    setIsSending(true);
    
    try {
      // Send message via ActionCable
      await sendMessage(newMessage.trim(), 'text', 'default');
      setNewMessage("");
      
      // Wait and refresh messages to get server response
      setTimeout(async () => {
        try {
          if (refreshMessages) {
            await refreshMessages();
          }
        } catch (refreshError) {
          console.error('Failed to refresh messages after send:', refreshError);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to send message:', error);
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

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
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
          
          {/* Connection status indicator */}
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

        {/* Messages Container */}
        <div className="chat-content">
          <div className="chat-messages">
            {allMessages.length === 0 ? (
              <div className="no-messages-admin">
                <MessageCircle size={48} className="empty-icon" />
                <h3>No messages yet</h3>
                <p>Start the conversation with the customer</p>
              </div>
            ) : (
              allMessages.map((message) => {
                // Debug log to check message data
                console.log('Message data:', {
                  sender: message.sender,
                  user_role: message.user_role,
                  text: message.text
                });
                
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
                      <div className="message-bubble">
                        <p>{message.text}</p>
                      </div>
                      <div className="message-time">
                        {formatTime(message.timestamp)}
                        {message.optimistic && <span className="sending-indicator">Sending...</span>}
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
                onClick={handleSendMessage}
                disabled={!isConnected || newMessage.trim() === "" || isSending}
                title={!isConnected ? 'Not connected' : 'Send message'}
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