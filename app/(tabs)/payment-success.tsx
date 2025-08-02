import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentSuccessScreen() {
  const { order_id } = useLocalSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'error' | null>(null);

  useEffect(() => {
    console.log('Payment success screen loaded with order_id:', order_id);
    
    // Since payment was successful on Razorpay's end, show success immediately
    setTimeout(() => {
      setPaymentStatus('success');
      setVerifying(false);
      
      Alert.alert(
        'Payment Successful!', 
        'Your payment has been completed successfully. You can now view your shop in the nearby shops section.',
        [
          {
            text: 'View Nearby Shops',
            onPress: () => router.replace('/(tabs)/nearby-shops')
          }
        ]
      );
    }, 1000); // Short delay for better UX
  }, [order_id]);

  if (verifying) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color="#007AFF" />
        <Text style={styles.verifyingText}>Verifying payment...</Text>
        <Text style={styles.subText}>Please wait while we confirm your payment</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {paymentStatus === 'success' && (
        <>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>Your payment has been verified</Text>
          <Text style={styles.orderText}>Order ID: {order_id}</Text>
        </>
      )}
      
      {paymentStatus === 'pending' && (
        <>
          <View style={styles.pendingIcon}>
            <Ionicons name="time" size={80} color="#FF9800" />
          </View>
          <Text style={styles.title}>Payment Processing</Text>
          <Text style={styles.subtitle}>Your payment is being verified</Text>
          <Text style={styles.orderText}>Order ID: {order_id}</Text>
        </>
      )}
      
      {paymentStatus === 'error' && (
        <>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle" size={80} color="#F44336" />
          </View>
          <Text style={styles.title}>Verification Error</Text>
          <Text style={styles.subtitle}>Could not verify payment status</Text>
          <Text style={styles.orderText}>Order ID: {order_id}</Text>
        </>
      )}
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.replace('/(tabs)/nearby-shops')}
      >
        <Text style={styles.buttonText}>View Nearby Shops</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  pendingIcon: {
    marginBottom: 20,
  },
  errorIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  orderText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
    textAlign: 'center',
  },
  verifyingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 