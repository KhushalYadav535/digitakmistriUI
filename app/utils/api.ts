import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, getCurrentApiUrl, SOCKET_URL } from '../constants/config';
import { io, Socket } from 'socket.io-client';

interface ErrorResponse {
  message?: string;
  [key: string]: any;
}

class ApiClient {
  private client: AxiosInstance;
  private retryCount: number = 0;
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Update baseURL before each request
        const currentApiUrl = await getCurrentApiUrl();
        config.baseURL = currentApiUrl;

        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ErrorResponse>) => {
        if (this.shouldRetry(error) && this.retryCount < API_CONFIG.retryAttempts) {
          this.retryCount++;
          console.log(`Retrying request (${this.retryCount}/${API_CONFIG.retryAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
          return this.client(error.config as AxiosRequestConfig);
        }

        return this.handleError(error);
      }
    );
  }

  private shouldRetry(error: AxiosError<ErrorResponse>): boolean {
    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600) ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT'
    );
  }

  private handleError(error: AxiosError<ErrorResponse>) {
    let errorMessage = 'An unexpected error occurred';

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch (error.response.status) {
        case 401:
          errorMessage = 'Please log in again';
          // Handle token expiration
          AsyncStorage.removeItem('token');
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action';
          break;
        case 404:
          errorMessage = 'The requested resource was not found';
          break;
        case 503:
          errorMessage = 'Service is temporarily unavailable. Please try again later';
          break;
        default:
          errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server. Please check your internet connection';
    }

    console.error('API Error:', {
      message: errorMessage,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method
    });

    return Promise.reject(new Error(errorMessage));
  }

  // Add methods for making requests
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export a singleton Socket.IO client instance
export const socket = io(SOCKET_URL, {
  autoConnect: false, // We'll connect after login
  transports: ['websocket'],
}); 