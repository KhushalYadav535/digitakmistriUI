import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../constants/config';
import { COLORS } from '../constants/theme';
import BookingForm from '../components/BookingForm';
import { useRouter, useFocusEffect } from 'expo-router';

type BookingStatus = 'Pending' | 'Confirmed' | 'Worker Assigned' | 'Accepted' | 'Rejected' | 'In Progress' | 'Completed' | 'Cancelled';

interface Booking {
  _id: string;
  serviceType: string;
  serviceTitle: string;
  bookingDate: string;
  bookingTime: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  status: BookingStatus;
  worker?: {
    name: string;
    phone: string;
  };
}

const getStatusColor = (status: BookingStatus): string => {
  const statusColors: Record<BookingStatus, string> = {
    'Pending': COLORS.warning,
    'Confirmed': COLORS.info,
    'Worker Assigned': COLORS.info,
    'Accepted': COLORS.success,
    'Rejected': COLORS.error,
    'In Progress': COLORS.primary,
    'Completed': COLORS.success,
    'Cancelled': COLORS.error
  };
  return statusColors[status];
};

const getStatusText = (status: BookingStatus): string => {
  const statusTexts: Record<BookingStatus, string> = {
    'Pending': 'Waiting for confirmation',
    'Confirmed': 'Booking confirmed',
    'Worker Assigned': 'Worker assigned',
    'Accepted': 'Worker accepted',
    'Rejected': 'Booking rejected',
    'In Progress': 'Service in progress',
    'Completed': 'Service completed',
    'Cancelled': 'Booking cancelled'
  };
  return statusTexts[status];
};

const BookingsScreen = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const router = useRouter();

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const response = await axios.get(`${API_URL}/bookings/customer`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      const axiosError = error as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setNotifLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await axios.get(`${API_URL}/notifications/customer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (activeTab === 'bookings') {
        loadBookings();
      }
    }, [activeTab])
  );

  const handleBooking = async (bookingData: {
    serviceId: string;
    serviceTitle: string;
    date: string;
    time: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    phone: string;
  }) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to book a service');
        router.push('/(auth)/login' as any);
        return;
      }

      const response = await axios.post(
        `${API_URL}/bookings`,
        {
          serviceType: bookingData.serviceId,
          serviceTitle: bookingData.serviceTitle,
          bookingDate: bookingData.date,
          bookingTime: bookingData.time,
          address: bookingData.address,
          phone: bookingData.phone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        Alert.alert('Success', 'Booking created successfully');
        loadBookings(); // Refresh the bookings list
      }
    } catch (error) {
      console.error('Booking error:', error);
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 401) {
        Alert.alert('Error', 'Please login to book a service');
        router.push('/(auth)/login' as any);
      } else {
        Alert.alert(
          'Error',
          axiosError.response?.data?.message || 'Failed to create booking'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try {
          setIsLoading(true);
          const token = await AsyncStorage.getItem('token');
          await axios.put(`${API_URL}/bookings/${bookingId}/cancel`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          Alert.alert('Success', 'Booking cancelled successfully');
          loadBookings();
        } catch (error) {
          Alert.alert('Error', 'Failed to cancel booking');
        } finally {
          setIsLoading(false);
        }
      }}
    ]);
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const formatAddress = (address: Booking['address']) => {
      if (!address) return 'Address not available';
      return `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`;
    };

    const canCancel = !['Completed', 'Cancelled', 'Rejected'].includes(item.status);

    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingTitle}>{item.serviceTitle}</Text>
          <Text style={styles.bookingDate}>
            {new Date(item.bookingDate).toLocaleDateString()} at {item.bookingTime}
          </Text>
          <Text style={[styles.bookingStatus, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
          <Text style={styles.bookingAddress}>{formatAddress(item.address)}</Text>
          {item.worker && (
            <View style={styles.workerInfo}>
              <Text style={styles.workerLabel}>Assigned Worker:</Text>
              <Text style={styles.workerName}>{item.worker.name}</Text>
              <Text style={styles.workerPhone}>{item.worker.phone}</Text>
            </View>
          )}
          {canCancel && (
            <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelBooking(item._id)}>
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
          onPress={() => setActiveTab('bookings')}
        >
          <Ionicons name="calendar" size={24} color={activeTab === 'bookings' ? COLORS.primary : '#666'} />
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Ionicons name="notifications" size={24} color={activeTab === 'notifications' ? COLORS.primary : '#666'} />
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.tabTextActive]}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons name="person" size={24} color={activeTab === 'profile' ? COLORS.primary : '#666'} />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'bookings' ? (
        <View style={styles.content}>
          <View style={styles.bookingForm}>
            <Text style={styles.sectionTitle}>Book a Service</Text>
            <BookingForm
              onSubmit={handleBooking}
              isLoading={isLoading}
            />
          </View>

          <View style={styles.bookingsList}>
            <Text style={styles.sectionTitle}>Your Bookings</Text>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading bookings...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadBookings}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : bookings.length > 0 ? (
              <FlatList
                data={bookings}
                keyExtractor={item => item._id}
                renderItem={renderBookingCard}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="book-outline" size={48} color="#666" />
                <Text style={styles.emptyStateText}>No bookings yet</Text>
              </View>
            )}
          </View>
        </View>
      ) : activeTab === 'notifications' ? (
        <View style={styles.notificationsContainer}>
          {notifLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : notifications.length > 0 ? (
            <FlatList
              data={notifications}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <View style={styles.notificationCard}>
                  <Text style={styles.notificationMessage}>{item.message}</Text>
                  <Text style={styles.notificationDate}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
              )}
              contentContainerStyle={styles.flatListContent}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off" size={48} color="#666" />
              <Text style={styles.emptyStateText}>No notifications yet</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.profileContainer}>
          <Ionicons name="person-outline" size={48} color="#666" />
          <Text style={styles.comingSoon}>Profile coming soon...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  bookingForm: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bookingsList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoon: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bookingDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  bookingAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  workerInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  workerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  workerName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  workerPhone: {
    fontSize: 14,
    color: '#666',
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: COLORS.error,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  notificationsContainer: {
    flex: 1,
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  notificationMessage: {
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default BookingsScreen;