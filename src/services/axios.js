import axios from 'axios';

const requestInterceptor = async (config) => {
  const token = localStorage.getItem('token')
  // const accessToken = tokenObject.access_token;
  
  if (token) {
    config.headers = config.headers || {} 
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
};

let instance

export const apiClient = () => {
  if (instance) return instance;

  instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  
  });

  // Request interceptor
  instance.interceptors.request.use(requestInterceptor);



  return instance;
};