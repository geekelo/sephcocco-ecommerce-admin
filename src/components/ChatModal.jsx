import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import "../styles/ChatModal.css";
import Image from '../assets/profile.png'
import { useMessaging } from "../hooks/useMessaging";
import { getActiveOutlet } from "../utils/getActiveOutlets";

const ChatModal = ({ isOpen, onClose, selectedMessage }) => {
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();
  
  // Get auth token from your auth context/localStorage/props
  // You'll need to replace this with your actual auth token source
  const authToken = localStorage.getItem('token') 
  const activeOutlet = getActiveOutlet();
  // Use the messaging hook
  const { messages: realtimeMessages, isConnected, connectionError, sendMessage } = useMessaging(authToken, activeOutlet);


  // Combine static messages with real-time messages
  // You might want to modify this logic based on your data structure
  const allMessages = [
 
    ...realtimeMessages.map((msg, index) => ({
      id: staticMessages.length + index + 1,
      sender: msg.sender || "admin", // Adjust based on your message structure
      text: msg.content || msg.message || msg.text,
      timestamp: new Date(msg.created_at || msg.timestamp || Date.now()),
      senderName: msg.sender_name || "Support Team"
    }))
  ];

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    // Send message via ActionCable
    if (isConnected) {
      sendMessage(newMessage, 'text');
      setNewMessage("");
    } else {
      console.error('Cannot send message: not connected to ActionCable');
      // Optionally show an error message to the user
      alert('Connection lost. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleProductClick = () => {
    navigate('/products')
  }

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal">
        {/* Header */}
        <div className="chat-modal-header">
          <button className="back-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Go Back
          </button>
          
          {/* Connection status indicator */}
          <div className="connection-status">
            {isConnected ? (
              <span className="status-connected">🟢 Connected</span>
            ) : (
              <span className="status-disconnected">🔴 Disconnected</span>
            )}
          </div>
         
          <div className="chat-actions">
            <button className="view-product-btn" onClick={handleProductClick}>View Product</button>
          </div>
        </div>

        {/* Connection Error Display */}
        {connectionError && (
          <div className="connection-error">
            <p>⚠️ {connectionError}</p>
          </div>
        )}

        {/* Messages Container */}
        <div className="chat-content">
          <div className="chat-messages">
            {allMessages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-avatar">
                  {message.sender === "customer" ? (
                    <img src={Image} alt="Customer" />
                  ) : (
                    <div className="admin-avatar">S</div>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    <p>{message.text}</p>
                  </div>
                  <div className="message-time">{formatTime(message.timestamp)}</div>
                </div>
              </div>
            ))}
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
                placeholder={isConnected ? "Type your message..." : "Connecting..."}
                className="message-input"
                rows="1"
                disabled={!isConnected}
              />
              <button 
                className="send-btn" 
                onClick={handleSendMessage}
                disabled={newMessage.trim() === "" || !isConnected}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;