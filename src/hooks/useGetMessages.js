import { useState } from "react";

export const useGetMessages = (authToken, outletType = '') => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  const API_BASE_URL = 'https://sephcocco-lounge-api.onrender.com/api/v1';

  const getMessages = async (options = {}) => {
    const {
      messageId = null,
      productId = null,
      status = null,
      page = 1,
      perPage = 20
    } = options;

    if (!authToken) {
      setError('No authentication token provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url;
      let params = new URLSearchParams();

      if (messageId) {
        // Get specific message thread
        url = `${API_BASE_URL}/${outletType}/sephcocco_${outletType}_messages/get_messages`;
        params.append('message_id', messageId);
      } else if (productId) {
        // Get messages for specific product
        url = `${API_BASE_URL}/${outletType}/sephcocco_${outletType}_messages/get_messages`;
        params.append('product_id', productId);
      } else {
        // Get all messages (index)
        url = `${API_BASE_URL}/${outletType}/sephcocco_${outletType}_messages`;
        if (status) params.append('status', status);
      }

      // Add pagination params
      params.append('page', page);
      params.append('per_page', perPage);

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (messageId) {
        // Single message response
        setMessages([data.message]);
        setMeta(null);
      } else {
        // Multiple messages response
        setMessages(data.messages || []);
        setMeta(data.meta || null);
      }

      return data;
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMessageHistory = async (messageId) => {
    return getMessages({ messageId });
  };

  const getProductMessages = async (productId, page = 1) => {
    return getMessages({ productId, page });
  };

  const getAllMessages = async (status = 'open', page = 1) => {
    return getMessages({ status, page });
  };

  const loadMoreMessages = async (page) => {
    const currentMessages = messages;
    const newData = await getMessages({ page });
    
    if (newData.messages) {
      setMessages([...currentMessages, ...newData.messages]);
      setMeta(newData.meta);
    }
    
    return newData;
  };

  return {
    messages,
    loading,
    error,
    meta,
    getMessages,
    getMessageHistory,
    getProductMessages,
    getAllMessages,
    loadMoreMessages,
    setMessages,
    setError
  };
}; 