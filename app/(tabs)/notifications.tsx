import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '../../components/Card';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const API_URL = 'http://192.168.1.3:5000/api';

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
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      let userModel = 'Customer'; // default
      
      if (userStr) {
        const user = JSON.parse(userStr);
        userModel = user.role === 'admin' ? 'Admin' : user.role === 'worker' ? 'Worker' : 'Customer';
      }
      
      const response = await axios.get(`${API_URL}/notifications/${userModel.toLowerCase()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const apiNotifs = response.data.notifications || [];
      const formattedNotifications = apiNotifs.map((notif: any) => ({
        id: notif._id,
        type: notif.type,
        title: getNotificationTitle(notif.type),
        message: notif.message,
        time: new Date(notif.createdAt).toLocaleString(),
        read: notif.read || false,
      }));
      
      setNotifications(formattedNotifications);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setError(error.response?.data?.message || 'Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'new_booking_available':
        return 'New Booking Available';
      case 'worker_assigned':
        return 'Worker Assigned';
      case 'booking_assigned':
        return 'Booking Assigned';
      case 'booking_rejected':
        return 'Booking Rejected';
      case 'booking_completed':
        return 'Booking Completed';
      case 'booking_cancelled':
        return 'Booking Cancelled';
      default:
        return 'Notification';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_booking_available':
        return 'calendar';
      case 'worker_assigned':
      case 'booking_assigned':
        return 'person';
      case 'booking_rejected':
        return 'close-circle';
      case 'booking_completed':
        return 'checkmark-circle';
      case 'booking_cancelled':
        return 'close';
      case 'payment_received':
        return 'cash';
      case 'worker_registered':
        return 'person-add';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_booking_available':
        return COLORS.primary;
      case 'worker_assigned':
      case 'booking_assigned':
        return COLORS.success;
      case 'booking_rejected':
      case 'booking_cancelled':
        return COLORS.error;
      case 'booking_completed':
        return COLORS.success;
      case 'payment_received':
        return COLORS.warning;
      case 'worker_registered':
        return COLORS.info;
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