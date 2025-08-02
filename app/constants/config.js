// Use your computer's local IP for device testing on real devices
// Update this to your actual local IP and port if needed
const LOCAL_API = 'http://192.168.1.3:5000/api'; // <-- Change this to your backend IP:port/api
const PROD_API = 'https://digital-mistri.onrender.com/api';

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'development' ? LOCAL_API : PROD_API,
  timeout: 15000, // Increased to 15 seconds
  retryAttempts: 5, // Increased retry attempts
  retryDelay: 2000, // Increased delay between retries to 2 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Directly export API_URL for synchronous use in frontend
export const API_URL = process.env.NODE_ENV === 'development' ? LOCAL_API : PROD_API;

// Error Messages
export const API_ERRORS = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Invalid input. Please check your data.'
};

export const ENV = process.env.NODE_ENV || 'development';

export const SOCKET_URL = process.env.NODE_ENV === 'development' ? 'http://192.168.1.43:5000' : 'https://digital-mistri.onrender.com';



// For backward compatibility
export default {
  API_URL,
};
