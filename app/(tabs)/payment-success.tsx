import { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import { API_URL } from '../constants/config';

export default function PaymentSuccessScreen() {
  const { order_id } = useLocalSearchParams();

  useEffect(() => {
    if (order_id) {
      axios.get(`${API_URL}/bookings/order/${order_id}`)
        .then(res => {
          if (res.data.paymentVerified) {
            Alert.alert('Success', 'Payment successful!');
            router.replace('/(tabs)/bookings');
          } else {
            Alert.alert('Pending', 'Payment not completed yet.');
          }
        })
        .catch(() => {
          Alert.alert('Error', 'Could not verify payment.');
        });
    }
  }, [order_id]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size='large' />
      <Text>Verifying payment...</Text>
    </View>
  );
} 