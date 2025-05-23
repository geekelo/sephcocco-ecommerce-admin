import '../styles/ChatItem.css'
const ChatItem = ({ chat, onReply }) => {
  return (
    <div className="chat-item">
      <div className="chat-content">
        <div className="chat-header">
          <span className="chat-name">{chat.name}</span>
          <span className="chat-time">{chat.time}</span>
        </div>
        <div className="chat-message">{chat.message}</div>
        <button className="reply-btn" onClick={() => onReply?.(chat)}>
          {chat.status} →
        </button>
      </div>
    </div>
  );
};


export default ChatItem