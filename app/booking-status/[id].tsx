import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../constants/config';
import { COLORS, FONTS, SIZES } from '../constants/theme';

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
  phone: string;
  status: string;
  worker?: {
    name: string;
    phone: string;
  };
  createdAt: string;
}

const statusColors: Record<string, string> = {
  Pending: COLORS.warning,
  Confirmed: COLORS.info,
  'Worker Assigned': COLORS.info,
  Accepted: COLORS.success,
  Rejected: COLORS.error,
  'In Progress': COLORS.primary,
  Completed: COLORS.success,
  Cancelled: COLORS.error,
};

const BookingStatusScreen = () => {
  const { id } = useLocalSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBooking = async () => {
    if (!id) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Please login to view booking status');
        router.push('/(auth)/login' as any);
        return;
      }
      const res = await axios.get(`${API_URL}/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooking(res.data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 401) {
        setError('Please login to view booking status');
        router.push('/(auth)/login' as any);
      } else {
        setError(axiosError.response?.data?.message || 'Failed to fetch booking');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBooking();
      const interval = setInterval(fetchBooking, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    } else {
      setError('No booking ID provided');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading booking status...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchBooking} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!booking) return null;

  const formatAddress = (address: Booking['address']) => {
    return `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Booking Status</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Service</Text>
          <Text style={styles.value}>{booking.serviceTitle}</Text>
          <Text style={styles.subValue}>{booking.serviceType}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{formatAddress(booking.address)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{booking.phone}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[booking.status] }]}>
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>
        </View>

        {booking.worker && (
          <View style={styles.section}>
            <Text style={styles.label}>Worker Assigned</Text>
            <Text style={styles.value}>{booking.worker.name}</Text>
            <Text style={styles.subValue}>{booking.worker.phone}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Booking Date & Time</Text>
          <Text style={styles.value}>
            {new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Created At</Text>
          <Text style={styles.value}>{new Date(booking.createdAt).toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={fetchBooking}>
          <Text style={styles.refreshButtonText}>Refresh Status</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: SIZES.padding,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  section: {
    marginBottom: SIZES.padding,
  },
  label: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  value: {
    ...FONTS.body1,
    color: COLORS.text,
    marginBottom: 2,
  },
  subValue: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderRadius: SIZES.radius,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
  loadingText: {
    ...FONTS.body1,
    color: COLORS.text,
    marginTop: SIZES.base,
  },
  errorText: {
    ...FONTS.body1,
    color: COLORS.error,
    marginBottom: SIZES.base,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    ...FONTS.body2,
    color: COLORS.white,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.padding,
  },
  refreshButtonText: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '600',
  },
});

export default BookingStatusScreen; 