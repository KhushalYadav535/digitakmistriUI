// Use your computer's local IP for device testing on real devices
// Update this to your actual local IP and port if needed
const LOCAL_API = 'http://192.168.1.3:5000/api'; // <-- Updated to your current IP address
const PROD_API = 'https://digital-mistri.onrender.com/api';

// Check if we're in development mode
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development'; 

// API Configuration
export const API_CONFIG = {
  baseURL: isDevelopment ? LOCAL_API : PROD_API,
  timeout: 15000, // Increased to 15 seconds
  retryAttempts: 5, // Increased retry attempts
  retryDelay: 2000, // Increased delay between retries to 2 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Directly export API_URL for synchronous use in frontend
export const API_URL = isDevelopment ? LOCAL_API : PROD_API;

// Error Messages
export const API_ERRORS = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Invalid input. Please check your data.'
};

export const ENV = isDevelopment ? 'development' : 'production';

export const SOCKET_URL = isDevelopment ? 'http://192.168.1.3:5000' : 'https://digital-mistri.onrender.com';

// Razorpay Configuration
// Live keys for production payments
export const RAZORPAY_CONFIG = {
  key_id: 'rzp_live_y6obsZdo01uDnc', // Live key for real payments
  currency: 'INR',
  name: 'Digital Mistri',
  description: 'Service Payment',
  theme: { color: '#007AFF' }
};

// Function to get current API URL
export const getCurrentApiUrl = async () => {
  return isDevelopment ? LOCAL_API : PROD_API;
};

// For backward compatibility
export default {
  API_URL,
};
