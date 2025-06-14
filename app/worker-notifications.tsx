import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SHADOWS, SIZES } from './constants/theme';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './constants/config';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    bookingId?: string;
    serviceId?: string;
  };
}

const WorkerNotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data.notifications);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error fetching notifications');
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.patch(
        `${API_URL}/notifications/${notification._id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n
        )
      );

      if (notification.data?.bookingId) {
        router.push({
          pathname: "/booking-details/[id]",
          params: { id: notification.data.bookingId }
        } as any);
      } else if (notification.data?.serviceId) {
        router.push({
          pathname: "/service-details/[id]",
          params: { id: notification.data.serviceId }
        } as any);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to mark notification as read'
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.patch(
        `${API_URL}/notifications/mark-all-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to mark all notifications as read'
      );
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to delete notification'
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {notifications.some((n) => !n.isRead) && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllRead}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification._id}
              style={[
                styles.notificationCard,
                !notification.isRead && styles.unreadCard,
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.notificationInfo}>
                  <Ionicons
                    name={
                      notification.type === 'booking'
                        ? 'calendar'
                        : notification.type === 'payment'
                        ? 'cash'
                        : 'information-circle'
                    }
                    size={24}
                    color={COLORS.primary}
                  />
                  <View style={styles.notificationTitleContainer}>
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteNotification(notification._id)}
                >
                  <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
            </TouchableOpacity>
          ))
        )}
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
  markAllButton: {
    padding: SIZES.small,
  },
  markAllText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.primary,
  },
  content: {
    padding: SIZES.medium,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    ...SHADOWS.light,
  },
  unreadCard: {
    backgroundColor: `${COLORS.primary}10`,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.small,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationTitleContainer: {
    marginLeft: SIZES.small,
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  notificationTime: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginTop: SIZES.small / 2,
  },
  deleteButton: {
    padding: SIZES.small,
  },
  notificationMessage: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textPrimary,
    marginTop: SIZES.small,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxlarge,
  },
  emptyText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textSecondary,
    marginTop: SIZES.medium,
  },
  errorText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SIZES.xxlarge,
  },
});

export default WorkerNotificationsScreen;