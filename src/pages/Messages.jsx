import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import OrderTable from "../components/OrderTable";
import "../styles/Messages.css";
import { messages } from "../constants/data";

const MessagesPage = () => {
  const messagesColumns = [
    { id: "id", label: "Message ID", className: "order-id" },
    { id: "product", label: "Product", className: "customer" },
    { id: "customer", label: "Customer", className: "customer" },
    { id: "status", label: "Status", className: "status" },
    { id: "preview", label: "Preview", className: "customer" },
    { id: "action", label: "Action", className: "action" },
  ];

  const messageData = messages.map((msg) => ({
    id: msg.id,
    product: msg.product,
    customer: msg.customer,
    status: msg.status,
    preview: msg.preview,
    action: "view",
  }));

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = () => {
    console.log("Filter functionality to be implemented");
  };

  const handleViewMessage = (message) => {
    console.log("Viewing message:", message);
    setSelectedMessage(message);
  };

  return (
    <div className="message-page">
      <SearchBar
        onSearch={handleSearchChange}
        onFilter={handleFilter}
        searchTerm={searchTerm}
      />
      <div className="message-container">
        <OrderTable
          orders={messageData}
          columns={messagesColumns}
          keyField="id"
          onViewOrder={handleViewMessage}
        />
      </div>
    </div>
  );
};

export default MessagesPage;
