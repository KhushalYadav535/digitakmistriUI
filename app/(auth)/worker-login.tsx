import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, TextInput, Image } from 'react-native';
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

const WorkerLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      console.log('Attempting worker login with:', email);
      const response = await axios.post(`${API_URL}/worker/login`, {
        email,
        password
      });
      console.log('Worker login response:', response.data);
      
      if (response.data.worker && response.data.token) {
        // Use AuthContext to handle login
        const userData = {
          ...response.data.worker,
          role: 'worker'
        };
        await login(response.data.token, userData);
        console.log('Worker login completed');
        // The AuthContext will handle the routing automatically
      } else {
        console.log('No token or worker data received on worker login!');
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Worker login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Watch for authentication changes and redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Worker login screen detected authentication change, redirecting to:', user.role);
      if (user.role === 'worker') {
        router.replace('/(worker)/dashboard');
      }
    }
  }, [isAuthenticated, user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/applogo.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>{t('worker_login')}</Text>
        <Text style={styles.subtitle}>{t('worker_login_subtitle')}</Text>
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
          loading={isLoading}
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
    marginTop: SIZES.base,
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
    marginBottom: SIZES.xxlarge * 2,
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

export default WorkerLoginScreen;