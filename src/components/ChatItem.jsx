import React from 'react';
import '../styles/ChatItem.css';

const ChatItem = ({ chat, onReply }) => {
  // Handle both API data structure and mock data structure
  const chatName = chat.user_name || chat.name || 'Unknown User';
  const chatMessage = chat.last_message || chat.message || 'No message';
  const chatTime = chat.created_at ? new Date(chat.created_at).toLocaleTimeString() : (chat.time || 'Unknown time');
  const chatStatus = chat.status || 'Reply';

  return (
    <div className="chat-item">
      <div className="chat-content">
        <div className="chat-header">
          <span className="chat-name">{chatName}</span>
          <span className="chat-time">{chatTime}</span>
        </div>
        <div className="chat-message">{chatMessage}</div>
        {chat.product_name && (
          <div className="chat-product">Product: {chat.product_name}</div>
        )}
        <button className="reply-btn" onClick={() => onReply?.(chat)}>
          {chatStatus} →
        </button>
      </div>
    </div>
  );
};

export default ChatItem;