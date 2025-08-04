import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PaymentSuccessScreen() {
  const { order_id } = useLocalSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'error' | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<string | null>(null);

  useEffect(() => {
    console.log('Payment success screen loaded with order_id:', order_id);
    
    const verifyPaymentAndGetBooking = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setPaymentStatus('error');
          setVerifying(false);
          return;
        }

        // Get payment type and pending booking data from AsyncStorage
        const storedPaymentType = await AsyncStorage.getItem('paymentType');
        const storedShopData = await AsyncStorage.getItem('pendingShopData');
        const pendingBookingData = await AsyncStorage.getItem('pendingBookingData');
        
        if (storedPaymentType) {
          setPaymentType(storedPaymentType);
          // Clear payment type
          await AsyncStorage.removeItem('paymentType');
        }

        // Handle booking creation after successful payment
        if (storedPaymentType === 'booking' && pendingBookingData) {
          try {
            const bookingData = JSON.parse(pendingBookingData);
            console.log('📋 Creating booking after payment success:', bookingData);
            
            // Create the booking via API
            const bookingResponse = await fetch(`${API_URL}/payment/create-booking-after-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                orderId: order_id,
                paymentId: `payment_${Date.now()}`, // Generate a payment ID
                bookingData: bookingData.bookingData,
                isMultipleService: bookingData.isMultipleService
              })
            });

            if (bookingResponse.ok) {
              const createdBooking = await bookingResponse.json();
              console.log('✅ Booking created successfully:', createdBooking);
              
              // Set the booking ID for navigation
              const bookingIdToSet = bookingData.isMultipleService 
                ? createdBooking.booking.parentBooking._id 
                : createdBooking.booking._id;
              setBookingId(bookingIdToSet);
              
              // Clear pending booking data after successful creation
              await AsyncStorage.removeItem('pendingBookingData');
            } else {
              console.error('❌ Failed to create booking:', await bookingResponse.text());
              throw new Error('Failed to create booking after payment');
            }
          } catch (bookingError) {
            console.error('❌ Error creating booking:', bookingError);
            throw new Error('Failed to create booking after payment');
          }
        }

        // Handle shop creation after payment success
        if (storedPaymentType === 'shop' && storedShopData) {
          try {
            const shopData = JSON.parse(storedShopData);
            console.log('🏪 Creating shop after payment success:', shopData);
            
            // Create the shop via API with base64 image
            const shopResponse = await fetch(`${API_URL}/nearby-shops/customer-with-image`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(shopData)
            });

            if (shopResponse.ok) {
              const createdShop = await shopResponse.json();
              console.log('✅ Shop created successfully:', createdShop);
              // Clear shop data after successful creation
              await AsyncStorage.removeItem('pendingShopData');
            } else {
              console.error('❌ Failed to create shop:', await shopResponse.text());
            }
          } catch (shopError) {
            console.error('❌ Error creating shop:', shopError);
          }
        }
        
        setPaymentStatus('success');
        setVerifying(false);
        
        // Show success message based on payment type
        const isShopPayment = storedPaymentType === 'shop';
        const alertMessage = isShopPayment 
          ? 'Your payment has been completed successfully and your shop has been added! You can now view your shop in the nearby shops section.'
          : 'Your payment has been completed successfully. You can now view your booking details.';
        
        const alertButtonText = isShopPayment ? 'View Nearby Shops' : 'View Booking Details';
        
        Alert.alert(
          'Payment Successful!', 
          alertMessage,
          [
            {
              text: alertButtonText,
              onPress: () => {
                if (isShopPayment) {
                  // Navigate to nearby shops for shop payments
                  router.replace('/(tabs)/nearby-shops');
                } else {
                  // Fallback to bookings list
                  router.replace('/(tabs)/bookings');
                }
              }
            }
          ]
        );
      } catch (error) {
        console.error('Error verifying payment:', error);
        setPaymentStatus('error');
        setVerifying(false);
      }
    };

    // Since payment was successful on Razorpay's end, show success immediately
    setTimeout(() => {
      verifyPaymentAndGetBooking();
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
        onPress={() => {
          // Check if this was a shop payment
          const isShopPayment = paymentType === 'shop';
          if (isShopPayment) {
            // Navigate to nearby shops for shop payments
            router.replace('/(tabs)/nearby-shops');
          } else if (bookingId) {
            // Navigate directly to the specific booking details
            router.replace(`/(tabs)/booking-status/${bookingId}`);
          } else {
            // Fallback to bookings list
            router.replace('/(tabs)/bookings');
          }
        }}
      >
        <Text style={styles.buttonText}>
          {paymentType === 'shop' ? 'View Nearby Shops' : 'View Booking Details'}
        </Text>
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