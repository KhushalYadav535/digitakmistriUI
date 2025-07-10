import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SHADOWS, SIZES } from './constants/theme';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './constants/config';

const ForgotPasswordScreen = () => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/customer/forgot-password`, {
        email: email.trim().toLowerCase()
      });

      Alert.alert('Success', 'OTP sent to your email address', [
        { text: 'OK', onPress: () => setStep(2) }
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Error', 'OTP must be 6 digits');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/customer/verify-otp`, {
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      });

      Alert.alert('Success', 'OTP verified successfully', [
        { text: 'OK', onPress: () => setStep(3) }
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Invalid OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/customer/reset-password`, {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword
      });

      Alert.alert('Success', 'Password reset successfully', [
        { 
          text: 'OK', 
          onPress: () => router.replace('/(auth)/login' as any)
        }
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Enter Your Email</Text>
      <Text style={styles.stepDescription}>
        We'll send a verification code to your email address
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleSendOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Send OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Enter OTP</Text>
      <Text style={styles.stepDescription}>
        Enter the 6-digit code sent to {email}
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>OTP Code</Text>
        <TextInput
          style={styles.input}
          value={otp}
          onChangeText={setOtp}
          placeholder="Enter 6-digit OTP"
          keyboardType="numeric"
          maxLength={6}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleSendOTP}
        disabled={loading}
      >
        <Text style={styles.resendText}>Resend OTP</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Set New Password</Text>
      <Text style={styles.stepDescription}>
        Create a new password for your account
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordInput}>
          <TextInput
            style={styles.passwordTextInput}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordInput}>
          <TextInput
            style={styles.passwordTextInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Forgot Password</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(step / 3) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>Step {step} of 3</Text>
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.large,
    paddingBottom: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  backButton: {
    padding: SIZES.base,
  },
  title: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: SIZES.medium,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: SIZES.base,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
  },
  stepContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.large,
    ...SHADOWS.light,
  },
  stepTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SIZES.large,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: SIZES.medium,
  },
  label: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    backgroundColor: COLORS.white,
  },
  passwordTextInput: {
    flex: 1,
    padding: SIZES.medium,
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textPrimary,
  },
  eyeIcon: {
    padding: SIZES.medium,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    alignItems: 'center',
    marginTop: SIZES.medium,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.body3.fontSize,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: SIZES.medium,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: FONTS.body3.fontSize,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen; 