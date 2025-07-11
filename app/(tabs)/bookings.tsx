import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
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

  useEffect(() => {
    loadBookings();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [])
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
    amount: number;
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
          amount: bookingData.amount,
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

  const handleViewDetails = (bookingId: string) => {
    router.push({
      pathname: '/(tabs)/booking-status/[id]' as any,
      params: { id: bookingId }
    });
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
          <TouchableOpacity style={styles.viewDetailsButton} onPress={() => handleViewDetails(item._id)}>
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  viewDetailsButton: {
    marginTop: 10,
    backgroundColor: COLORS.info,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BookingsScreen;