import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '../components/Card';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import { socket } from './utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from './constants/config';

interface Notification {
  id: string;
  type: 'new_booking' | 'payment_received' | 'worker_registered' | 'job_completed';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const NotificationsScreen = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let isMounted = true;
    fetchNotifications();

    // Connect socket and register user for real-time notifications
    const setupSocket = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        socket.connect();
        socket.emit('register', { userId: user.id || user._id, role: user.role || 'customer' });
        socket.on('notification', (notification) => {
          setNotifications((prev) => {
            // Avoid duplicate notifications by checking message+type+time
            const exists = prev.some(
              (n) => n.message === notification.message && n.type === notification.type && Math.abs(new Date(n.time).getTime() - Date.now()) < 1000
            );
            if (exists) return prev;
            return [
              {
                id: Date.now().toString(),
                type: notification.type,
                title: notification.title || 'Notification',
                message: notification.message,
                time: new Date().toLocaleString(),
                read: false,
              },
              ...prev,
            ];
          });
        });
      }
    };
    setupSocket();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      socket.off('notification');
      socket.disconnect();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications((prev) => {
        // Merge API notifications with any real-time ones already in state
        const apiNotifs = response.data.notifications || [];
        const merged = [...apiNotifs, ...prev.filter(rt => !apiNotifs.some((an: Notification) => an.id === rt.id))];
        return merged;
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_booking':
        return 'calendar';
      case 'payment_received':
        return 'cash';
      case 'worker_registered':
        return 'person-add';
      case 'job_completed':
        return 'checkmark-circle';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'new_booking':
        return COLORS.primary;
      case 'payment_received':
        return COLORS.success;
      case 'worker_registered':
        return COLORS.warning;
      case 'job_completed':
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.clearButton}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            variant="elevated"
            style={{
              ...styles.notificationCard,
              ...(notification.read ? {} : styles.unreadCard),
            }}
          >
            <View style={styles.notificationHeader}>
              <View style={styles.notificationIconContainer}>
                <Ionicons
                  name={getNotificationIcon(notification.type)}
                  size={20}
                  color={getNotificationColor(notification.type)}
                />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationTime}>
                  {notification.time}
                </Text>
              </View>
              {!notification.read && (
                <View style={styles.unreadBadge} />
              )}
            </View>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
          </Card>
        ))}
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
    ...SHADOWS.small,
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  clearButton: {
    padding: SIZES.base,
  },
  clearText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    padding: SIZES.medium,
  },
  notificationCard: {
    marginBottom: SIZES.medium,
  },
  unreadCard: {
    backgroundColor: `${COLORS.primary}05`,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base / 2,
  },
  notificationTime: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notificationMessage: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default NotificationsScreen; 