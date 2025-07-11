import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../constants/config';
import BookingForm from '../components/BookingForm';

const BookingScreen = () => {
  const { serviceId, serviceTitle, servicePrice } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    let alertShown = false;
    try {
      console.log('Submitting booking', bookingData);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to book a service');
        alertShown = true;
        router.push('/(auth)/login' as any);
        return;
      }

      const res = await axios.post(
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
      console.log('Booking API response:', res.status, res.data);
      if (res.status === 201 || res.status === 200) {
        alertShown = true;
        Alert.alert(
          'Booking Successful',
          'Your booking has been created successfully.',
          [
            {
              text: 'View Booking Status',
              onPress: () => {
                if (res.data._id) {
                  router.push(`/booking-status/${res.data._id}` as any);
                } else if (res.data.success) {
                  Alert.alert('Notice', 'Booking created, but no ID returned. Please check your bookings list.');
                } else {
                  Alert.alert('Error', 'Failed to get booking ID');
                }
              }
            },
            {
              text: 'Go Back',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      console.error('Booking error:', error);
      const axiosError = error as AxiosError<{ message: string }>;
      alertShown = true;
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
      if (!alertShown) {
        Alert.alert('Notice', 'No response received from server. Please try again.');
      }
    }
  };

  if (!serviceId || !serviceTitle) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Service information is missing</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BookingForm
        initialService={{ 
          id: serviceId as string, 
          title: serviceTitle as string,
          type: serviceId as string,
          price: servicePrice ? `₹${servicePrice}` : undefined // Pass service price if available
        }}
        onSubmit={handleBooking}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default BookingScreen;
