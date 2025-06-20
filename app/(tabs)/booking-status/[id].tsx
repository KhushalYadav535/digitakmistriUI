import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../constants/config';
import { COLORS } from '../../constants/theme';

const BookingStatusScreen = () => {
  const { id } = useLocalSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Booking ID:', id);
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        console.log('Token:', token);
        if (!token) {
          setError('Token missing. Please login again.');
          setLoading(false);
          return;
        }
        const res = await axios.get(`${API_URL}/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Booking API response:', res.data);
        setBooking(res.data);
        setError('');
      } catch (e: any) {
        console.error('Failed to load booking details:', e?.response?.data || e);
        const backendMsg = e?.response?.data?.message;
        setError(backendMsg ? `Error: ${backendMsg}` : 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchBooking();
    }
    return () => {
    };
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (error) return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;
  if (!booking) return <View style={styles.center}><Text>No booking found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Booking Details</Text>
      <Text style={styles.label}>Service:</Text>
      <Text style={styles.value}>{booking.serviceTitle}</Text>
      <Text style={styles.label}>Status:</Text>
      <Text style={styles.value}>{booking.status}</Text>
      <Text style={styles.label}>Date & Time:</Text>
      <Text style={styles.value}>{new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}</Text>
      <Text style={styles.label}>Address:</Text>
      <Text style={styles.value}>{booking.address?.street}, {booking.address?.city}, {booking.address?.state} - {booking.address?.pincode}</Text>
      <Text style={styles.label}>Worker:</Text>
      <Text style={styles.value}>{booking.worker ? `${booking.worker.name} (${booking.worker.phone})` : 'Not assigned'}</Text>
      <Text style={styles.label}>Created At:</Text>
      <Text style={styles.value}>{new Date(booking.createdAt).toLocaleString()}</Text>
      {booking.cancelledAt && (
        <>
          <Text style={styles.label}>Cancelled At:</Text>
          <Text style={styles.value}>{new Date(booking.cancelledAt).toLocaleString()}</Text>
        </>
      )}
      {booking.cancellationReason && (
        <>
          <Text style={styles.label}>Cancellation Reason:</Text>
          <Text style={styles.value}>{booking.cancellationReason}</Text>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: COLORS.primary },
  label: { fontWeight: 'bold', marginTop: 12, color: COLORS.textSecondary },
  value: { fontSize: 16, color: COLORS.textPrimary },
  error: { color: COLORS.error, fontSize: 16 },
});

export default BookingStatusScreen; 