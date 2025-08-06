import { useState, useCallback } from 'react';

const API_BASE_URL = 'https://sephcocco-lounge-api.onrender.com/api/v1';

export const useGetMessages = (authToken, outletType = '') => {
  const [userThreads, setUserThreads] = useState([]);
  const [userMessages, setUserMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  // Get all user threads (for admin dashboard)
  const getUserThreads = useCallback(async (options = {}) => {
    const {
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
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page);
      params.append('per_page', perPage);

      const url = `${API_BASE_URL}/${outletType}/sephcocco_${outletType}_messages/user_threads?${params.toString()}`;

      const response = await fetch(url, {
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
      
      setUserThreads(data.user_threads || []);
      setMeta(data.meta || null);

      return data;
    } catch (err) {
      console.error('Error fetching user threads:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authToken, outletType]);

  // Get messages for a specific user (when admin clicks on user)
  const getUserMessages = useCallback(async (userId, options = {}) => {
    const {
      status = null,
      page = 1,
      perPage = 20
    } = options;

    if (!authToken) {
      setError('No authentication token provided');
      return;
    }

    if (!userId) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('user_id', userId);
      if (status) params.append('status', status);
      params.append('page', page);
      params.append('per_page', perPage);

      const url = `${API_BASE_URL}/${outletType}/sephcocco_${outletType}_messages?${params.toString()}`;

      const response = await fetch(url, {
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
      
      setUserMessages(data.messages || []);
      setMeta(data.meta || null);

      return data;
    } catch (err) {
      console.error('Error fetching user messages:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authToken, outletType]);

  // Get all messages (admin can see all messages)
  const getAllMessages = useCallback(async (options = {}) => {
    const {
      status = null,
      userId = null,
      productId = null,
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
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (userId) params.append('user_id', userId);
      if (productId) params.append('product_id', productId);
      params.append('page', page);
      params.append('per_page', perPage);

      const url = `${API_BASE_URL}/${outletType}/sephcocco_${outletType}_messages?${params.toString()}`;

      const response = await fetch(url, {
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
      
      setUserMessages(data.messages || []);
      setMeta(data.meta || null);

      return data;
    } catch (err) {
      console.error('Error fetching all messages:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authToken, outletType]);

  // Load more user threads (pagination) - use functional updates
  const loadMoreUserThreads = useCallback(async (page) => {
    const newData = await getUserThreads({ page });
    
    if (newData.user_threads) {
      setUserThreads(prev => [...prev, ...newData.user_threads]);
      setMeta(newData.meta);
    }
    
    return newData;
  }, [getUserThreads]);

  // Load more user messages (pagination) - use functional updates
  const loadMoreUserMessages = useCallback(async (page) => {
    const newData = await getUserMessages({ page });
    
    if (newData.messages) {
      setUserMessages(prev => [...prev, ...newData.messages]);
      setMeta(newData.meta);
    }
    
    return newData;
  }, [getUserMessages]);

  // Refresh functions
  const refreshUserThreads = useCallback(async (options = {}) => {
    return getUserThreads(options);
  }, [getUserThreads]);

  const refreshUserMessages = useCallback(async (userId, options = {}) => {
    return getUserMessages(userId, options);
  }, [getUserMessages]);

  // Clear data
  const clearUserThreads = useCallback(() => {
    setUserThreads([]);
    setMeta(null);
  }, []);

  const clearUserMessages = useCallback(() => {
    setUserMessages([]);
    setMeta(null);
  }, []);

  return {
    userThreads,
    userMessages,
    loading,
    error,
    meta,
    getUserThreads,
    loadMoreUserThreads,
    refreshUserThreads,
    clearUserThreads,
    getUserMessages,
    loadMoreUserMessages,
    refreshUserMessages,
    clearUserMessages,
    getAllMessages,
    setUserThreads,
    setUserMessages,
    setError
  };
}; 