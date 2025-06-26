// Use your computer's local IP for device testing on real devices
const LOCAL_API = 'http://192.168.1.3:5000/api'; // Your computer's local IP
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

// Function to determine which API URL to use
const getApiUrl = async () => {
  if (process.env.NODE_ENV === 'development') {
    return LOCAL_API;
  }

  // Try to ping the production server
  try {
    const response = await fetch('https://digital-mistri.onrender.com/health');
    if (response.ok) {
      return PROD_API;
    }
  } catch (error) {
    console.warn('Production server is down, falling back to local API');
  }
  
  return LOCAL_API;
};

// Export a function to get the current API URL
export const getCurrentApiUrl = async () => {
  return await getApiUrl();
};

// For backward compatibility
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

export const SOCKET_URL = process.env.NODE_ENV === 'development' ? 'http://192.168.1.3:5000' : 'https://digital-mistri.onrender.com';

// Default export for Expo Router compatibility
const config = {
  API_CONFIG,
  getCurrentApiUrl,
  API_URL,
  API_ERRORS,
  ENV,
  SOCKET_URL,
};

export default config;
