import React from 'react';
import { MessageCircle, Clock, User } from 'lucide-react';
import '../styles/ConversationList.css';

const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  isLoading = false 
}) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'CU';
    
    const words = name.trim().split(' ');
    const initials = words.map(word => word.charAt(0).toUpperCase());
    
    return initials.slice(0, 2).join('');
  };

  const getPreviewText = (conversation) => {
    if (conversation.last_message) {
      return conversation.last_message.content || 'No content';
    }
    return conversation.preview || 'No messages yet';
  };

  if (isLoading) {
    return (
      <div className="conversation-list-loading">
        <div className="spinner"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="conversation-list-empty">
        <MessageCircle size={48} className="empty-icon" />
        <h3>No conversations yet</h3>
        <p>When customers send messages, they'll appear here</p>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h2>Conversations</h2>
        <span className="conversation-count">{conversations.length}</span>
      </div>
      
      <div className="conversation-items">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`conversation-item ${selectedConversation?.id === conversation.id ? 'selected' : ''}`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="conversation-avatar">
              <div className="customer-avatar">
                <span className="avatar-initials">
                  {getUserInitials(conversation.customer_name)}
                </span>
              </div>
            </div>
            
            <div className="conversation-content">
              <div className="conversation-header">
                <h4 className="customer-name">
                  {conversation.customer_name || 'Unknown Customer'}
                </h4>
                <span className="conversation-time">
                  {formatTime(conversation.updated_at || conversation.created_at)}
                </span>
              </div>
              
              <div className="conversation-preview">
                <p className="preview-text">
                  {getPreviewText(conversation)}
                </p>
                {conversation.unread_count > 0 && (
                  <span className="unread-badge">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
              
              <div className="conversation-meta">
                <span className="product-name">
                  {conversation.product_name || 'General Inquiry'}
                </span>
                <span className="status-badge">
                  {conversation.status || 'active'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList; 