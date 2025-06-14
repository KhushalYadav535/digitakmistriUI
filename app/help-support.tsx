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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SHADOWS, SIZES } from './constants/theme';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://digital-mistri.onrender.com/api';

const HelpSupportScreen = () => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }

    try {
      setSending(true);
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/support`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert('Success', 'Your message has been sent. We will get back to you soon.');
      setMessage('');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send message'
      );
    } finally {
      setSending(false);
    }
  };

  const faqs = [
    {
      question: 'How do I update my availability?',
      answer:
        'You can update your availability by going to the Schedule section in your profile. There you can set your working hours for each day of the week.',
    },
    {
      question: 'How do I get paid?',
      answer:
        'Payments are processed automatically after each completed service. The amount will be transferred to your registered bank account within 2-3 business days.',
    },
    {
      question: 'What if I need to cancel a booking?',
      answer:
        'You can cancel a booking through the booking details page. Please note that frequent cancellations may affect your rating and future bookings.',
    },
    {
      question: 'How do I update my profile information?',
      answer:
        'You can update your profile information by going to Settings > Edit Profile. Make sure to keep your contact information up to date.',
    },
    {
      question: 'How do I handle customer complaints?',
      answer:
        'If you receive a complaint, please contact our support team immediately. We will help you resolve the issue and maintain your professional reputation.',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <View
                key={index}
                style={[
                  styles.faqItem,
                  index === faqs.length - 1 && styles.lastFaqItem,
                ]}
              >
                <Text style={styles.question}>{faq.question}</Text>
                <Text style={styles.answer}>{faq.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.contactContainer}>
            <Text style={styles.contactText}>
              If you have any questions or need assistance, please send us a
              message and we will get back to you as soon as possible.
            </Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message here..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="send" size={20} color={COLORS.white} />
                  <Text style={styles.sendButtonText}>Send Message</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <View style={styles.emergencyContainer}>
            <View style={styles.emergencyItem}>
              <Ionicons name="call" size={24} color={COLORS.primary} />
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyLabel}>Phone</Text>
                <Text style={styles.emergencyValue}>+1 234 567 8900</Text>
              </View>
            </View>
            <View style={styles.emergencyItem}>
              <Ionicons name="mail" size={24} color={COLORS.primary} />
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyLabel}>Email</Text>
                <Text style={styles.emergencyValue}>support@digitalmistri.com</Text>
              </View>
            </View>
          </View>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  backButton: {
    padding: SIZES.small,
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
  section: {
    marginBottom: SIZES.medium,
  },
  sectionTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  faqContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  faqItem: {
    padding: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastFaqItem: {
    borderBottomWidth: 0,
  },
  question: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.small,
  },
  answer: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  contactContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    ...SHADOWS.light,
  },
  contactText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  messageInput: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textPrimary,
    height: 120,
    marginBottom: SIZES.medium,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
  },
  sendButtonText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: SIZES.small,
  },
  emergencyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    ...SHADOWS.light,
  },
  emergencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  emergencyInfo: {
    marginLeft: SIZES.medium,
  },
  emergencyLabel: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SIZES.small / 2,
  },
  emergencyValue: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textPrimary,
  },
});

export default HelpSupportScreen;