import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, TouchableOpacity, View, ImageBackground, Dimensions, Alert, ScrollView, Image, TextInput } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import { API_URL } from '../constants/config';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert(t('error'), t('please_enter_email'));
      return false;
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('error'), t('please_enter_valid_email'));
      return false;
    }
    if (!password) {
      Alert.alert(t('error'), t('please_enter_password'));
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError('');
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      console.log('=== Login Debug Info ===');
      console.log('API URL:', API_URL);
      console.log('Environment:', __DEV__ ? 'Development' : 'Production');
      console.log('Attempting login with email:', email);
      
      // Test API connection first
      try {
        console.log('Testing API connection...');
        const testResponse = await axios.get(`${API_URL.replace('/api', '')}/test`);
        console.log('API test successful:', testResponse.data);
      } catch (testError: any) {
        console.error('API test failed:', testError.message);
        console.error('Test error details:', {
          status: testError.response?.status,
          data: testError.response?.data,
          url: testError.config?.url
        });
      }
      
      const response = await axios.post(`${API_URL}/customer/login`, {
        email,
        password
      });

      console.log('Login response:', JSON.stringify(response.data, null, 2));
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      console.log('Login successful - User role:', user.role);
      
      // Use AuthContext to handle login
      await login(token, user);
      
      console.log('Customer login completed, AuthContext updated');
      
      // The AuthContext will handle the routing automatically
      // No need to manually redirect here
    } catch (error: any) {
      console.error('=== Login Error Details ===');
      console.error('Error message:', error.message);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      console.error('Error config URL:', error.config?.url);
      console.error('Error config method:', error.config?.method);
      
      // Check if user needs email verification
      if (error.response?.data?.requiresVerification) {
        const userData = error.response.data.user;
        
        // Store user data for verification
        await AsyncStorage.setItem('pendingVerification', JSON.stringify({
          email: email.trim().toLowerCase(),
          user: userData
        }));
        
        Alert.alert(
          'Email Verification Required',
          'Please verify your email address before logging in.',
          [
            {
              text: 'Verify Email',
              onPress: () => router.push('/email-verification' as any)
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      } else {
        setError(error.response?.data?.message || t('please_check_credentials_and_try_again'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Watch for authentication changes and redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Login screen detected authentication change, redirecting to:', user.role);
      if (user.role === 'customer') {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/applogo.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>{t('customer_login')}</Text>
        <Text style={styles.subtitle}>{t('login_subtitle')}</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('email')}
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('password')}
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((v) => !v)}
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
          title={t('login')}
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        />
        <TouchableOpacity 
          style={styles.forgotPasswordButton}
          onPress={() => router.push('/forgot-password' as any)}
        >
          <Text style={styles.forgotPasswordText}>{t('forgot_password')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => router.push('/(auth)/register' as any)}
        >
          <Text style={styles.registerText}>
            {t('dont_have_account')}{' '}
            <Text style={styles.registerTextBold}>{t('register')}</Text>
          </Text>
        </TouchableOpacity>
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    shadowOffset: { width: 0, height: 2 },
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
  registerButton: {
    marginTop: SIZES.medium,
    alignItems: 'center',
  },
  registerText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  registerTextBold: {
    color: COLORS.primary,
    fontWeight: '600',
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
  forgotPasswordButton: {
    marginTop: SIZES.medium,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default LoginScreen; 