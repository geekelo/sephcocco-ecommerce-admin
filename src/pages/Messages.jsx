import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import FlexibleTable from "../components/FlexibleTable"; 
import ChatModal from "../components/ChatModal";
import "../styles/Messages.css";
import { messages } from "../constants/data";
import { createMessageColumns } from "../columns/messageColumns";

const MessagesPage = () => {


  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  };

  // Filter messages based on search term
  const filteredMessages = messages.filter((msg) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      msg.id.toString().includes(searchLower) ||
      msg.product.toLowerCase().includes(searchLower) ||
      msg.customer.toLowerCase().includes(searchLower) ||
      msg.status.toLowerCase().includes(searchLower) ||
      msg.preview.toLowerCase().includes(searchLower)
    );
  });

  // Transform data for the table
  const messageData = filteredMessages.map((msg) => ({
    id: msg.id,
    product: msg.product,
    customer: msg.customer,
    status: msg.status,
    preview: msg.preview,
  }));

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
              data={messageData}
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