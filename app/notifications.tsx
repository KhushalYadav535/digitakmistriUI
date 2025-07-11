import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { apiClient } from './utils/api';

interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const response: any = await apiClient.get(`/notifications/customer`);
      
      if (response && response.data) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response: any = await apiClient.put(`/notifications/${notificationId}/read`);
      
      // Since apiClient returns only the data, we don't need to check response.status
      if (response && response.message) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const userStr = await AsyncStorage.getItem('user');
              if (!userStr) return;

              const user = JSON.parse(userStr);
              const response: any = await apiClient.delete(`/notifications/customer/${user.id}/clear-all`);
              
              // Since apiClient returns only the data, we don't need to check response.status
              if (response && response.message) {
                setNotifications([]);
                Alert.alert('Success', 'All notifications cleared successfully');
              } else {
                Alert.alert('Error', 'Failed to clear notifications');
              }
            } catch (error) {
              console.error('Error clearing notifications:', error);
              Alert.alert('Error', 'Failed to clear notifications. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Mark as read first
      if (!notification.isRead) {
        await markAsRead(notification._id);
      }

      // Navigate based on notification type
      switch (notification.type) {
        case 'booking_created':
        case 'booking_assigned':
        case 'booking_completed':
        case 'booking_cancelled':
          if (notification.data?.bookingId) {
            router.push(`/booking-status/${notification.data.bookingId}`);
          } else {
            // If no bookingId, go to bookings list
            router.push('/bookings');
          }
          break;
        case 'payment_success':
        case 'payment_failed':
          router.push('/payment');
          break;
        case 'service_available':
          router.push('/nearby-shops');
          break;
        case 'worker_assigned':
          if (notification.data?.bookingId) {
            router.push(`/booking-status/${notification.data.bookingId}`);
          } else {
            router.push('/bookings');
          }
          break;
        default:
          // For other notifications, just mark as read
          console.log('Notification clicked:', notification.type);
          break;
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
      Alert.alert('Error', 'Failed to open notification. Please try again.');
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        <Ionicons 
          name={getNotificationIcon(item.type)} 
          size={24} 
          color={getNotificationColor(item.type)} 
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_created': return 'calendar';
      case 'booking_assigned': return 'person';
      case 'booking_completed': return 'checkmark-circle';
      case 'booking_cancelled': return 'close-circle';
      case 'payment_success': return 'card';
      case 'payment_failed': return 'alert-circle';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_created': return COLORS.primary;
      case 'booking_assigned': return '#FF9500';
      case 'booking_completed': return '#34C759';
      case 'booking_cancelled': return '#FF3B30';
      case 'payment_success': return '#34C759';
      case 'payment_failed': return '#FF3B30';
      default: return COLORS.primary;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAllNotifications}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyMessage}>
            You don't have any notifications yet. We'll notify you when something important happens.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  clearAllText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    padding: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    alignSelf: 'center',
  },
});

export default NotificationsScreen; 