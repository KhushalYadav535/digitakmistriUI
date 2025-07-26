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
    totalAmount: number;
    distance: number;
    distanceCharge: number;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
      accuracy: number;
      address?: string;
    } | null;
    services?: {
      serviceType: string;
      serviceTitle: string;
      amount: number;
      quantity: number;
    }[];
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

      // Navigate to payment screen with total amount
      const bookingDataForPayment = {
        serviceId: bookingData.serviceId,
        serviceTitle: bookingData.serviceTitle,
        servicePrice: bookingData.amount.toString(), // Service amount
        totalAmount: bookingData.totalAmount.toString(), // Total amount including distance
        bookingData: JSON.stringify({
          serviceId: bookingData.serviceId,
          serviceTitle: bookingData.serviceTitle,
          date: bookingData.date,
          time: bookingData.time,
          address: bookingData.address,
          phone: bookingData.phone,
          amount: bookingData.amount,
          totalAmount: bookingData.totalAmount,
          distance: bookingData.distance,
          distanceCharge: bookingData.distanceCharge,
          gpsCoordinates: bookingData.gpsCoordinates,
          services: bookingData.services // Include services for multiple service bookings
        })
      };

      console.log('💰 Navigating to payment with total amount:', bookingDataForPayment);
      
      // Navigate to payment screen
      router.push({
        pathname: '/(tabs)/payment' as any,
        params: bookingDataForPayment
      });
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
