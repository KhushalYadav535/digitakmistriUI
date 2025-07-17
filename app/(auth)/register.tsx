import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, TouchableOpacity, View, ImageBackground, Dimensions, Alert, ScrollView, Image, TextInput } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import { API_URL } from '../constants/config';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { t } = useTranslation();

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) {
      errors.name = 'Please enter your full name';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    if (!email.trim()) {
      errors.email = 'Please enter your email';
    } else {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!phone.trim()) {
      errors.phone = 'Please enter your phone number';
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        errors.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    if (!password) {
      errors.password = 'Please enter a password';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      console.log('Sending registration request to:', `${API_URL}/customer/register`);
      
      const response = await axios.post(`${API_URL}/customer/register`, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Registration response:', response.data);
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      Alert.alert(t('success'), t('register_success'), [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)' as any)
        }
      ]);
    } catch (error: any) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code
      });
      
      if (!error.response) {
        if (error.code === 'ECONNABORTED') {
          setError(t('request_timeout'));
        } else if (error.message === 'Network Error') {
          setError(t('network_error'));
        } else {
          setError(t('network_error'));
        }
        return;
      }

      const errorData = error.response.data;
      
      if (errorData.fields) {
        // Handle field-specific errors
        const errors: Record<string, string> = {};
        errorData.fields.forEach((field: string) => {
          errors[field] = `Please enter your ${field}`;
        });
        setFieldErrors(errors);
      } else if (errorData.errors) {
        // Handle validation errors
        const errors: Record<string, string> = {};
        errorData.errors.forEach((err: string) => {
          if (err.includes('email')) errors.email = err;
          else if (err.includes('phone')) errors.phone = err;
          else if (err.includes('password')) errors.password = err;
          else if (err.includes('name')) errors.name = err;
        });
        setFieldErrors(errors);
      } else if (errorData.message) {
        // Handle specific error messages
        if (errorData.message === 'Email already registered') {
          setFieldErrors({ email: t('email_already_registered') });
        } else {
          setError(errorData.message);
        }
      } else {
        // Handle generic error
        setError(t('register_failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    icon: string,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default',
    secureTextEntry: boolean = false,
    showPasswordToggle: boolean = false,
    error?: string
  ) => (
    <View>
      <View style={[
        styles.inputContainer,
        error && styles.inputContainerError
      ]}>
        <Ionicons name={icon as any} size={20} color={error ? COLORS.error : COLORS.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
        />
        {showPasswordToggle && (
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
        )}
      </View>
      {error && (
        <Text style={styles.fieldError}>{error}</Text>
      )}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/applogo.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>{t('register_title')}</Text>
        <Text style={styles.subtitle}>{t('register_subtitle')}</Text>
      </View>
      <View style={styles.formContainer}>
        {renderInput(
          "person-outline",
          t('full_name'),
          name,
          setName,
          'default',
          false,
          false,
          fieldErrors.name
        )}
        {renderInput(
          "mail-outline",
          "Email",
          email,
          setEmail,
          'email-address',
          false,
          false,
          fieldErrors.email
        )}
        {renderInput(
          "call-outline",
          "Phone Number",
          phone,
          setPhone,
          'phone-pad',
          false,
          false,
          fieldErrors.phone
        )}
        {renderInput(
          "lock-closed-outline",
          "Password",
          password,
          setPassword,
          'default',
          !showPassword,
          true,
          fieldErrors.password
        )}
        {renderInput(
          "lock-closed-outline",
          "Confirm Password",
          confirmPassword,
          setConfirmPassword,
          'default',
          !showConfirmPassword,
          true,
          fieldErrors.confirmPassword
        )}
        {!!error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error} />
            <Text style={styles.error}>{error}</Text>
          </View>
        )}
        <Button
          title={t('register')}
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
        />
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/login' as any)}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginTextBold}>Login</Text>
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
  loginButton: {
    marginTop: SIZES.medium,
    alignItems: 'center',
  },
  loginText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  loginTextBold: {
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
  inputContainerError: {
    borderColor: COLORS.error,
  },
  inputError: {
    color: COLORS.error,
  },
  fieldError: {
    color: COLORS.error,
    fontSize: FONTS.body4.fontSize,
    marginTop: -SIZES.base,
    marginBottom: SIZES.base,
    marginLeft: SIZES.base,
  },
});

export default RegisterScreen;