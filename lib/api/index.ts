import axios from 'axios';

const api = axios.create({
  baseURL: '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses (session expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Check if user was logged in (had a token)
      const token = localStorage.getItem('token');
      if (token) {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show session expired notification
        // Using a custom event that can be caught by the app
        window.dispatchEvent(new CustomEvent('session-expired', {
          detail: { message: 'Your session has expired. Please log in again.' }
        }));
        
        // Redirect to login page
        window.location.href = '/auth/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

