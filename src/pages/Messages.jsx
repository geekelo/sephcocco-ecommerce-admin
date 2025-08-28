import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import FlexibleTable from "../components/FlexibleTable";
import ChatModal from "../components/ChatModal";
import "../styles/Messages.css";
import { createMessageColumns } from "../columns/messageColumns";
import { useMessaging } from "../hooks/useMessaging"; 
import { getActiveOutlet } from "../utils/getActiveOutlets";

const MessagesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  
  const activeOutlet = getActiveOutlet();
  const authToken = localStorage.getItem('token');
  
  console.log('📊 Messages page - activeOutlet:', activeOutlet);
  console.log('📊 Messages page - authToken present:', !!authToken);
  
  // Use the new user thread messaging system
  const { 
    userThreads,
    isLoading,
    isConnected,
    isConnecting,
    connectionError,
    refreshUserThreads
  } = useMessaging(authToken, activeOutlet);



  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = () => {
    console.log("Filter functionality to be implemented");
  };

  const handleViewMessage = (userThread) => {
    console.log("Viewing user thread:", userThread);
    setSelectedUser(userThread);
    setIsChatModalOpen(true);
  };

  const closeChatModal = () => {
    setIsChatModalOpen(false);
    setSelectedUser(null);
    // Refresh user threads when closing chat modal to get latest data
    setTimeout(async () => {
      if (refreshUserThreads) {
        try {
          await refreshUserThreads();
        } catch (error) {
          console.error('Failed to refresh user threads:', error);
        }
      }
    }, 500); // Small delay to ensure any pending messages are processed
  };

  // Transform user threads to table format
  const transformUserThreadsToTableData = () => {
    console.log('🔄 Transforming user threads to table data...');
    console.log('📦 Input userThreads:', userThreads);
    
    if (!userThreads || !Array.isArray(userThreads)) {
      console.log('❌ userThreads is not an array:', userThreads);
      return [];
    }
    
    const transformedData = userThreads.map((userThread, index) => ({
      id: userThread.user_id || `user-${index}-${Date.now()}`,
      customer: userThread.user_name || 'Unknown Customer',
      customer_email: userThread.user_email || '',
      status: userThread.status || 'OPEN',
      preview: userThread.last_message || 'No messages yet',
      message_count: userThread.message_count || 0,
      updated_at: userThread.updated_at || userThread.last_activity,
      // Add the full user thread object for the view action
      userThread: userThread
    }));
    
    console.log('✅ Transformed data:', transformedData);
    return transformedData;
  };
  // Filter data based on search term
  const filteredData = transformUserThreadsToTableData()?.filter(item => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
    const customer = (item.customer || '').toLowerCase();
    const customerEmail = (item.customer_email || '').toLowerCase();
    const preview = (item.preview || '').toLowerCase();
    
    return customer.includes(searchLower) ||
           customerEmail.includes(searchLower) ||
           preview.includes(searchLower);
  });

  // Create columns for user threads
  const columns = [
    {
      header: "Customer",
      accessorKey: "customer",
      cell: ({ row }) => (
        <div className="customer-cell">
          <div className="customer-name">{row.original.customer}</div>
        </div>
      ),
    },
    {
      header: "Customer Email",
      accessorKey: "customer_email",
      cell: ({ row }) => (
        <div className="email-cell">
          {row.original.customer_email}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <span className={`status-badge ${row.original.status.toLowerCase()}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      header: "Preview",
      accessorKey: "preview",
      cell: ({ row }) => (
        <div className="preview-cell">
          <div className="preview-text">{row.original.preview}</div>
          <div className="message-count">Messages: {row.original.message_count}</div>
        </div>
      ),
    },
    {
      header: "Action",
      accessorKey: "action",
      cell: ({ row }) => (
        <button
          className="view-btn"
          onClick={() => handleViewMessage(row.original.userThread)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          View
        </button>
      ),
    },
  ];
console.log('testing',filteredData);

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h1>Messages</h1>
        {/* Connection status indicator */}
        <div className="connection-status-indicator">
          {isConnecting ? (
            <div className="status-connecting">
              <div className="spinner-small"></div>
              <span>Connecting...</span>
            </div>
          ) : isConnected ? (
            <div className="status-connected">
              <div className="status-dot connected"></div>
              <span>Connected</span>
            </div>
          ) : (
            <div className="status-disconnected">
              <div className="status-dot disconnected"></div>
              <span>Disconnected</span>
              {connectionError && <div className="error-text">{connectionError}</div>}
            </div>
          )}
        </div>
      </div>

      <div className="messages-content">
        <div className="search-filter-section">
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search for anything"
          />
          {/* <div className="filter-controls">
            <button className="filter-btn" onClick={handleFilter}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
                    </svg>
              Filter by
            </button>
            <div className="date-filters">
              <div className="date-input">
                <label>Start Date:</label>
                <input type="date" placeholder="dd/mm/yyyy" />
              </div>
              <div className="date-input">
                <label>End Date:</label>
                <input type="date" placeholder="dd/mm/yyyy" />
                  </div>
              <button className="apply-btn">Apply</button>
                </div>
          </div> */}
        </div>

        <div className="table-section">
          <FlexibleTable
            data={filteredData}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No user threads found"
          />
        </div>
      </div>

        <ChatModal
          isOpen={isChatModalOpen}
          onClose={closeChatModal}
        selectedUser={selectedUser}
        />
    </div>
  );
};

export default MessagesPage;