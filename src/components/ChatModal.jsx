import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/ChatModal.css";
import Image from '../assets/profile.png'
const ChatModal = ({ isOpen, onClose, selectedMessage }) => {
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "customer",
      text: "Hi, I have a question about my recent order",
      timestamp: new Date(Date.now() - 120000),
      senderName: "John Doe"
    },
    {
      id: 2,
      sender: "admin",
      text: "Hello! I'd be happy to help you with your order. What seems to be the issue?",
      timestamp: new Date(Date.now() - 90000),
      senderName: "Support Team"
    },
    {
      id: 3,
      sender: "customer",
      text: "I ordered a product 3 days ago but haven't received any shipping confirmation yet. Order #12345",
      timestamp: new Date(Date.now() - 60000),
      senderName: "John Doe"
    },
    {
      id: 4,
      sender: "admin",
      text: "Let me check on that for you right away. I can see your order and will provide an update shortly.",
      timestamp: new Date(Date.now() - 30000),
      senderName: "Support Team"
    }
  ]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const message = {
      id: messages.length + 1,
      sender: "admin",
      text: newMessage,
      timestamp: new Date(),
      senderName: "Support Team"
    };

    setMessages([...messages, message]);
    setNewMessage("");
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
         
          <div className="chat-actions">
         
            <button className="view-product-btn" onClick={handleProductClick}>View Product</button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="chat-content">
          <div className="chat-messages">
            {messages.map((message) => (
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
                placeholder="Type your message..."
                className="message-input"
                rows="1"
              />
              <button 
                className="send-btn" 
                onClick={handleSendMessage}
                disabled={newMessage.trim() === ""}
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