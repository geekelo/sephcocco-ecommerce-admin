import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import FlexibleTable from "../components/FlexibleTable";
import ChatModal from "../components/ChatModal";
import "../styles/Messages.css";
import { createMessageColumns } from "../columns/messageColumns";
import { useViewMessages } from "../hooks/useMessages";
import { useMessaging } from "../hooks/useMessaging"; 
import { getActiveOutlet } from "../utils/getActiveOutlets";

const MessagesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  
  const activeOutlet = getActiveOutlet();
  const authToken = localStorage.getItem('token');
  
  // Get both API messages and real-time messages
  const { data: apiMessagesData, isLoading } = useViewMessages(activeOutlet);
  const { 
    messages: realtimeMessages, 
    refreshMessages 
  } = useMessaging(authToken, activeOutlet);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = () => {
    console.log("Filter functionality to be implemented");
  };

  const handleViewMessage = (message) => {
    console.log("Viewing message:", message);
    setSelectedMessage(message);
    setIsChatModalOpen(true);
  };

  const closeChatModal = () => {
    setIsChatModalOpen(false);
    setSelectedMessage(null);
    // Refresh messages when closing chat modal to get latest messages
    setTimeout(async () => {
      if (refreshMessages) {
        try {
          await refreshMessages();
        } catch (error) {
          console.error('Failed to refresh messages:', error);
        }
      }
    }, 500); // Small delay to ensure any pending messages are processed
  };

  // Combine API messages with real-time messages
  const combineMessages = () => {
    const apiMessages = apiMessagesData?.messages || [];
    
    // Extract chats from real-time messages
    const realtimeChats = realtimeMessages?.flatMap(msg => 
      msg.chats ? msg.chats.map(chat => ({
        ...chat, 
        conversation_id: msg.conversation_id || 'default',
        status: msg.status || 'open',
        parent_id: msg.id || 'realtime'
      })) : []
    );

    // Create a combined dataset
    const combinedMessages = [...apiMessages];
    
    // Add real-time messages that aren't already in API messages
    realtimeChats?.forEach(rtChat => {
      // Check if this chat already exists in API messages
      const existsInApi = combinedMessages?.some(apiMsg => 
        apiMsg.chats && apiMsg.chats.some(chat => 
          chat.id === rtChat.id || 
          (chat.content === rtChat.content && 
           chat.user_role === rtChat.user_role &&
           Math.abs(new Date(chat.timestamp || chat.created_at) - new Date(rtChat.timestamp || rtChat.created_at)) < 5000)
        )
      );
      
      if (!existsInApi) {
        // Find existing message group or create new one
        let targetMessage = combinedMessages.find(msg => 
          msg.conversation_id === rtChat.conversation_id || 
          msg.id === rtChat.parent_id
        );
        
        if (!targetMessage) {
          // Create new message group for real-time messages
          targetMessage = {
            id: rtChat.parent_id || `rt-${Date.now()}`,
            conversation_id: rtChat.conversation_id || 'default',
            status: rtChat.status || 'open',
            chats: []
          };
          combinedMessages.push(targetMessage);
        }
        
        // Add the real-time chat to the message group
        if (!targetMessage.chats) {
          targetMessage.chats = [];
        }
        targetMessage.chats.push(rtChat);
      }
    });

    return combinedMessages;
  };

  // Flatten and filter chats based on searchTerm
  const filteredChats = combineMessages().flatMap((msg) => {
    return (msg.chats || [])
      .filter((chat) => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          (chat.content || '').toLowerCase().includes(searchLower) ||
          (chat.user_name || '').toLowerCase().includes(searchLower) ||
          (chat.user_email || '').toLowerCase().includes(searchLower) ||
          (chat.user_role || '').toLowerCase().includes(searchLower) ||
          (msg.status || '').toLowerCase().includes(searchLower) ||
          (msg.id || '').toString().includes(searchLower)
        );
      })
      .map((chat) => ({
        id: chat.id || `${msg.id}-${Date.now()}`,
        content: chat.content || 'No content',
        user_name: chat.user_name || 'Unknown User',
        user_email: chat.user_email || '',
        user_role: chat.user_role || 'user',
        status: msg.status || 'open',
        parent_id: msg.id,
        timestamp: chat.timestamp || chat.created_at,
        optimistic: chat.optimistic || false
      }));
  });

  // Sort by timestamp (newest first)
  const sortedChats = filteredChats.sort((a, b) => {
    const timeA = new Date(a.timestamp || 0).getTime();
    const timeB = new Date(b.timestamp || 0).getTime();
    return timeB - timeA;
  });

  return (
    <div className="message-page">
      {!isChatModalOpen ? (
        <>
          <SearchBar
            onSearch={handleSearchChange}
            onFilter={handleFilter}
            searchTerm={searchTerm}
          />
          <div className="message-container">
            <FlexibleTable
              data={sortedChats}
              columns={createMessageColumns(handleViewMessage)}
              keyField="id"
              onRowClick={handleViewMessage}
              clickableRows={true}
              isLoading={isLoading}
              emptyState={
                <div className="messages-empty-state">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                  </div>
                  <h3>No messages found</h3>
                  <p>
                    {searchTerm
                      ? `No messages match "${searchTerm}". Try adjusting your search.`
                      : "No messages available at the moment."
                    }
                  </p>
                </div>
              }
              className="messages-table"
            />
          </div>
        </>
      ) : (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={closeChatModal}
          selectedMessage={selectedMessage}
        />
      )}
    </div>
  );
};

export default MessagesPage;