import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { API_URL } from '../constants/config';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RAZORPAY_KEY_ID = 'q4Wdq59UtpU97EsEmNJo1Syo';

const PaymentScreen = () => {
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();

  const handlePayNow = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to make payment');
        return;
      }

      // Parse booking data from params
      const bookingData = params.bookingData ? JSON.parse(params.bookingData as string) : null;
      const selectedServices = params.selectedServices ? JSON.parse(params.selectedServices as string) : null;
      const totalAmount = params.totalAmount ? parseInt(params.totalAmount as string) : 0;

      if (!bookingData) {
        Alert.alert('Error', 'Invalid booking data');
        return;
      }

      // Determine if this is a multiple service booking
      const isMultipleService = selectedServices && selectedServices.length > 1;

      let bookingResponse;
      if (isMultipleService) {
        // Call multiple services booking API
        console.log('Creating multiple services booking...');
        const response = await fetch(`${API_URL}/booking/multiple-services`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            services: bookingData.services,
            bookingDate: bookingData.date,
            bookingTime: bookingData.time,
            address: bookingData.address,
            phone: bookingData.phone,
            gpsCoordinates: bookingData.gpsCoordinates
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create multiple services booking');
        }

        bookingResponse = await response.json();
        console.log('Multiple services booking created:', bookingResponse);
      } else {
        // Call single service booking API
        console.log('Creating single service booking...');
        const response = await fetch(`${API_URL}/booking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            serviceType: bookingData.serviceId,
            serviceTitle: bookingData.serviceTitle,
            bookingDate: bookingData.date,
            bookingTime: bookingData.time,
            address: bookingData.address,
            phone: bookingData.phone,
            amount: bookingData.amount,
            gpsCoordinates: bookingData.gpsCoordinates
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create booking');
        }

        bookingResponse = await response.json();
        console.log('Single service booking created:', bookingResponse);
      }

      // Call backend to create Razorpay order
      const res = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          amount: totalAmount * 100, // Convert to paise
          currency: 'INR',
          bookingId: isMultipleService ? bookingResponse.parentBooking._id : bookingResponse._id
        })
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error('Server did not return JSON. Response was: ' + text.slice(0, 120));
      }

      const data = await res.json();
      if (!data.order) throw new Error('Order creation failed');
      const { id: order_id, amount, currency } = data.order;

      // Check if RazorpayCheckout is available
      console.log('RazorpayCheckout:', RazorpayCheckout);
      if (!RazorpayCheckout || !RazorpayCheckout.open) {
        Alert.alert('Error', 'RazorpayCheckout is not available. Make sure the native module is linked and you are running on a real device.');
        setLoading(false);
        return;
      }

      // Open Razorpay Checkout
      RazorpayCheckout.open({
        key: RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'Digital Mistri',
        description: isMultipleService ? 'Multiple Services Payment' : 'Service Payment',
        order_id,
        prefill: {
          email: 'customer@example.com',
          contact: bookingData.phone,
        },
        theme: { color: '#007AFF' },
      })
        .then((paymentData: any) => {
          // Payment Success
          Alert.alert('Payment Success', `Payment ID: ${paymentData.razorpay_payment_id}`);
          // Navigate to payment success screen
          // router.push('/(tabs)/payment-success' as any);
        })
        .catch((error: any) => {
          // Payment Failed
          let userMessage = 'Payment was not completed.';
          if (error && typeof error === 'object') {
            if (error.code === 'NETWORK_ERROR') {
              userMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.description) {
              userMessage = error.description;
            } else if (error.reason === 'Payment cancelled by user') {
              userMessage = 'Payment was cancelled.';
            }
          }
          console.error('Payment failed:', error); // Log for debugging
          Alert.alert('Payment Failed', userMessage);
        });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pay with Razorpay</Text>
      <Text style={styles.amount}>Amount: ₹{params.totalAmount || '0'}</Text>
      <Button title="Pay Now" onPress={handlePayNow} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#007AFF' },
  amount: { fontSize: 18, marginBottom: 24, color: '#333' },
});

export default PaymentScreen; 