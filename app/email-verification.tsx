import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, TouchableOpacity, View, Image, TextInput, Alert, ScrollView } from 'react-native';
import Button from './components/Button';
import { COLORS, FONTS, SIZES } from './constants/theme';
import { API_URL } from './constants/config';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface PendingVerification {
  email: string;
  user: any;
}

const EmailVerificationScreen = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    loadPendingVerification();
  }, []);

  const loadPendingVerification = async () => {
    try {
      const stored = await AsyncStorage.getItem('pendingVerification');
      if (stored) {
        const data = JSON.parse(stored);
        setPendingVerification(data);
      } else {
        Alert.alert('Error', 'No pending verification found. Please register again.');
        router.push('/(auth)/register' as any);
      }
    } catch (error) {
      console.error('Error loading pending verification:', error);
      Alert.alert('Error', 'Failed to load verification data. Please register again.');
      router.push('/(auth)/register' as any);
    }
  };

  const handleVerifyEmail = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP from your email');
      return;
    }

    if (!pendingVerification) {
      setError('No verification data found');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(`${API_URL}/customer/verify-email`, {
        email: pendingVerification.email,
        otp: otp.trim()
      });

      console.log('Email verification response:', response.data);

      const { token, user } = response.data;

      // Store authentication data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Clear pending verification
      await AsyncStorage.removeItem('pendingVerification');

      Alert.alert(
        'Success!', 
        'Email verified successfully. You can now use the app.',
        [
          {
            text: 'Continue',
            onPress: () => router.push('/(tabs)' as any)
          }
        ]
      );
    } catch (error: any) {
      console.error('Email verification error:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to verify email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!pendingVerification) {
      setError('No verification data found');
      return;
    }

    try {
      setResendLoading(true);
      setError('');

      await axios.post(`${API_URL}/customer/resend-verification`, {
        email: pendingVerification.email
      });

      Alert.alert('Success', 'New OTP sent to your email address');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToRegister = () => {
    Alert.alert(
      'Go Back to Registration',
      'Are you sure you want to go back? Your registration data will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Go Back',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('pendingVerification');
            router.push('/(auth)/register' as any);
          }
        }
      ]
    );
  };

  if (!pendingVerification) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading verification data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/images/applogo.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>Email Verification</Text>
        <Text style={styles.subtitle}>
          Please enter the 6-digit OTP sent to{'\n'}
          <Text style={styles.emailText}>{pendingVerification.email}</Text>
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.otpContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.otpInput, error && styles.inputError]}
            placeholder="Enter 6-digit OTP"
            placeholderTextColor={COLORS.textSecondary}
            value={otp}
            onChangeText={(text) => {
              setOtp(text.replace(/[^0-9]/g, '').slice(0, 6));
              setError('');
            }}
            keyboardType="numeric"
            maxLength={6}
            autoFocus
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error} />
            <Text style={styles.error}>{error}</Text>
          </View>
        )}

        <Button
          title="Verify Email"
          onPress={handleVerifyEmail}
          loading={loading}
          style={styles.verifyButton}
        />

        <TouchableOpacity 
          style={styles.resendButton}
          onPress={handleResendOTP}
          disabled={resendLoading}
        >
          <Text style={styles.resendText}>
            {resendLoading ? 'Sending...' : "Didn't receive OTP? Resend"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToRegister}
        >
          <Text style={styles.backText}>
            ← Back to Registration
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textSecondary,
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
    lineHeight: 20,
  },
  emailText: {
    color: COLORS.primary,
    fontWeight: '600',
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
  otpContainer: {
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
  otpInput: {
    flex: 1,
    padding: SIZES.base,
    fontSize: FONTS.h2.fontSize,
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '600',
  },
  inputError: {
    borderColor: COLORS.error,
    color: COLORS.error,
  },
  verifyButton: {
    width: '100%',
    marginTop: SIZES.medium,
  },
  resendButton: {
    marginTop: SIZES.medium,
    alignItems: 'center',
    padding: SIZES.base,
  },
  resendText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.primary,
    fontWeight: '500',
  },
  backButton: {
    marginTop: SIZES.medium,
    alignItems: 'center',
    padding: SIZES.base,
  },
  backText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
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

export default EmailVerificationScreen; 