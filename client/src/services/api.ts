import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', 
  timeout: 10000, 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.log('Unauthorized - might need to refresh token or logout');
    }
    
    if (error.response?.status === 500) {
      console.error('Server error occurred');
    }

    // Network errors (no response received)
    if (!error.response) {
      console.error('Network error - server might be down or CORS issue');
    }
    
    return Promise.reject(error);
  }
);

export default api;