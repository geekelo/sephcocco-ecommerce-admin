import React from 'react';
import { MessageCircle, Clock, User } from 'lucide-react';
import '../styles/ConversationList.css';

const ConversationList = ({ 
  userThreads, 
  selectedUser, 
  onSelectUser,
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

  const getPreviewText = (userThread) => {
    if (!userThread) return 'No messages yet';
    
    if (userThread.last_message_content) {
      return userThread.last_message_content;
    }
    return 'No messages yet';
  };

  const getCustomerName = (userThread) => {
    if (!userThread) return 'Unknown Customer';
    
    return userThread.user_name || userThread.sephcocco_user?.name || 'Unknown Customer';
  };

  const getCustomerEmail = (userThread) => {
    if (!userThread) return '';
    
    return userThread.user_email || userThread.sephcocco_user?.email || '';
  };

  if (isLoading) {
    return (
      <div className="conversation-list-loading">
        <div className="spinner"></div>
        <p>Loading user threads...</p>
      </div>
    );
  }

  if (userThreads.length === 0) {
    return (
      <div className="conversation-list-empty">
        <MessageCircle size={48} className="empty-icon" />
        <h3>No user threads yet</h3>
        <p>When customers send messages, they'll appear here</p>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h2>User Threads</h2>
        <span className="conversation-count">{userThreads.length}</span>
      </div>
      
      <div className="conversation-items">
        {userThreads?.map((userThread, index) => {
          if (!userThread) return null;
          
          return (
            <div
              key={userThread.sephcocco_user_id || `conversation-${index}-${Date.now()}`}
              className={`conversation-item ${selectedUser?.sephcocco_user_id === userThread.sephcocco_user_id ? 'selected' : ''}`}
              onClick={() => onSelectUser(userThread)}
            >
              <div className="conversation-avatar">
                <div className="customer-avatar">
                  <span className="avatar-initials">
                    {getUserInitials(getCustomerName(userThread))}
                  </span>
                </div>
              </div>
              
              <div className="conversation-content">
                <div className="conversation-header">
                  <h4 className="customer-name">
                    {getCustomerName(userThread)}
                  </h4>
                  <span className="conversation-time">
                    {formatTime(userThread.updated_at || userThread.created_at)}
                  </span>
                </div>
                
                <div className="conversation-preview">
                  <p className="preview-text">
                    {getPreviewText(userThread)}
                  </p>
                  {userThread.message_count > 0 && (
                    <span className="unread-badge">
                      {userThread.message_count}
                    </span>
                  )}
                </div>
                
                <div className="conversation-meta">
                  <span className="customer-email">
                    {getCustomerEmail(userThread)}
                  </span>
                  <span className="status-badge">
                    {userThread.status || 'active'}
                  </span>
                </div>
              </div>
            </div>
          );
        }).filter(Boolean)}
      </div>
    </div>
  );
};

export default ConversationList; 