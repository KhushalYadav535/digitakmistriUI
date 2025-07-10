import { router } from 'expo-router';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { API_URL } from '../constants/config';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = 'digitalmistri33@gmail.com';
const ADMIN_PASSWORD = 'Anubhav@2025';

const AdminLoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, user } = useAuth();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Log the full API URL
      const fullApiUrl = `${API_URL}/admin/login`;
      console.log('=== API Details ===');
      console.log('Base API URL:', API_URL);
      console.log('Full Login URL:', fullApiUrl);
      console.log('Environment:', process.env.NODE_ENV);
      console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);

      // First test the API connection
      console.log('=== Testing API Connection ===');
      try {
        // Test the root endpoint first
        const rootResponse = await axios.get('https://digital-mistri.onrender.com/');
        console.log('Root Response:', rootResponse.data);

        // Then test the API endpoint
        const testResponse = await axios.get('https://digital-mistri.onrender.com/api/test');
        console.log('API Test Response:', testResponse.data);
      } catch (testErr: any) {
        console.error('API Test Failed:', testErr);
        console.error('Error details:', {
          message: testErr.message,
          status: testErr.response?.status,
          data: testErr.response?.data,
          url: testErr.config?.url
        });
        setError('Cannot connect to server. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Validate input
      if (!username.trim() || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      const email = username.trim().toLowerCase();
      console.log('=== Admin Login Attempt ===');
      console.log('Email:', email);
      console.log('API URL:', `${API_URL}/admin/login`);
      
      // Make the request
      const response = await axios.post(`${API_URL}/admin/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('=== Login Response ===');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', response.data);
      
      if (!response.data.token || !response.data.admin) {
        throw new Error('Invalid response format from server');
      }
      
      // Use AuthContext to handle login
      console.log('=== Saving Auth Data ===');
      await login(response.data.token, response.data.admin);
      
      setLoading(false);
      console.log('=== Login Successful ===');
      // The AuthContext will handle the routing automatically
    } catch (err: any) {
      console.error('=== Login Error ===');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      
      let errorMessage = 'Invalid admin credentials';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Watch for authentication changes and redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Admin login screen detected authentication change, redirecting to:', user.role);
      if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      }
    }
  }, [isAuthenticated, user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="shield-checkmark" size={50} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Admin Portal</Text>
        <Text style={styles.subtitle}>Welcome back! Please login to continue</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={COLORS.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {!!error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error} />
            <Text style={styles.error}>{error}</Text>
          </View>
        )}

        <Button
          title="Login"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
  },
  header: {
    alignItems: 'center',
    marginTop: SIZES.xxlarge,
    marginBottom: SIZES.xlarge,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.large,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: FONTS.h1.fontSize,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base * 2,
    padding: SIZES.xlarge,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.base,
    marginBottom: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    padding: SIZES.base,
  },
  input: {
    flex: 1,
    padding: SIZES.base,
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textPrimary,
  },
  eyeButton: {
    padding: SIZES.base,
  },
  button: {
    width: '100%',
    marginTop: SIZES.medium,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.1)',
    padding: SIZES.base,
    borderRadius: SIZES.base,
    marginBottom: SIZES.medium,
  },
  error: {
    color: COLORS.error,
    marginLeft: SIZES.base,
    fontSize: FONTS.body3.fontSize,
    fontWeight: '500',
  },
});

export default AdminLoginScreen;
