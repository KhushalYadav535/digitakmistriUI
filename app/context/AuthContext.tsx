import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios';
import { API_URL } from '../constants/config';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'worker' | 'admin';
  phone?: string;
  address?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Check if user is already authenticated on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (!storedToken || !storedUser) {
        console.log('No stored authentication data found');
        setUser(null);
        setToken(null);
        return false;
      }

      // Verify token is still valid by making a test API call
      try {
        const userData = JSON.parse(storedUser);
        const response = await axios.get(`${API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });

        if (response.status === 200) {
          console.log('Token is valid, user is authenticated');
          setUser(userData);
          setToken(storedToken);
          return true;
        }
      } catch (error: any) {
        console.log('Token verification failed:', error.response?.status);
        // Token is invalid, clear stored data
        await AsyncStorage.multiRemove(['token', 'user']);
        setUser(null);
        setToken(null);
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error checking authentication:', error);
      setUser(null);
      setToken(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, userData: User) => {
    try {
      console.log('AuthContext login called with:', { token: newToken, user: userData });
      
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      console.log('User logged in successfully:', userData.role);
      console.log('AuthContext state updated - isAuthenticated will be:', !!newToken && !!userData);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext logout called');
      await AsyncStorage.multiRemove(['token', 'user']);
      setUser(null);
      setToken(null);
      
      console.log('User logged out successfully, redirecting to role selection');
      // Immediately redirect to role selection after logout
      router.replace('/(auth)/role-selection');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 