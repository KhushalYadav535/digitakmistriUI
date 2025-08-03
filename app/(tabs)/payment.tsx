import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { API_URL } from '../constants/config';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const RAZORPAY_KEY_ID = 'rzp_test_yCyh9MfP8o6z3K';

const PaymentScreen = () => {
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const { user } = useAuth();

  // Get the total amount from params, with fallback to 0
  const totalAmount = params.totalAmount ? parseInt(params.totalAmount as string) : 0;

  // Debug: Log all received parameters
  React.useEffect(() => {
    console.log('🔍 Payment screen received params:', params);
    console.log('💰 Total amount from params:', params.totalAmount);
    console.log('💰 Parsed total amount:', totalAmount);
    console.log('📱 All param keys:', Object.keys(params));
    console.log('📱 All param values:', Object.values(params));
    
    // Check if we're coming from a specific flow
    if (params.customFlow) {
      console.log('🏪 Custom flow detected:', params.customFlow);
    }
    if (params.bookingData) {
      try {
        const bookingData = JSON.parse(params.bookingData as string);
        console.log('📋 Booking data totalAmount:', bookingData.totalAmount);
        console.log('📋 Booking data amount:', bookingData.amount);
      } catch (error) {
        console.error('Error parsing booking data:', error);
      }
    }
  }, [params, totalAmount]);

  // Get amount from booking data as fallback
  const getAmountFromBookingData = () => {
    try {
      if (params.bookingData) {
        const bookingData = JSON.parse(params.bookingData as string);
        return bookingData.totalAmount || bookingData.amount || 0;
      }
    } catch (error) {
      console.error('Error parsing booking data:', error);
    }
    return totalAmount;
  };

  // Prioritize amount from booking data over totalAmount parameter
  const displayAmount = getAmountFromBookingData() || totalAmount;

  // Debug: Log which amount is being used
  React.useEffect(() => {
    console.log('💰 Final display amount:', displayAmount);
    console.log('💰 Amount source:', displayAmount === getAmountFromBookingData() ? 'booking data' : 'totalAmount parameter');
  }, [displayAmount]);

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
      const customFlow = params.customFlow;

      // Handle custom flows (like nearby shop payments)
      if (customFlow === 'addNearbyShop') {
        console.log('🏪 Processing nearby shop payment...');
        const shopData = params.shopData ? JSON.parse(params.shopData as string) : null;
        
        if (!shopData) {
          Alert.alert('Error', 'Invalid shop data');
          return;
        }

        // Call backend to create Razorpay order for shop payment
        console.log('💰 Creating Razorpay order for shop payment with amount:', displayAmount * 100);
        const res = await fetch(`${API_URL}/payment/create-order`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            amount: displayAmount * 100, // Convert to paise
            currency: 'INR',
            notes: {
              customFlow: 'addNearbyShop',
              shopData: JSON.stringify(shopData)
            }
          })
        });

        // Check if response is JSON
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error('Server returned non-JSON response:', text);
          throw new Error('Server error. Please try again later.');
        }

        const data = await res.json();
        
        // Check for server errors
        if (!res.ok) {
          throw new Error(data.message || 'Failed to create payment order');
        }

        if (!data.order) {
          throw new Error('Order creation failed');
        }

        const { id: order_id, amount, currency } = data.order;

        // Check if this is a mock order (for testing) or if we're in development mode
        if (data.isMockOrder || __DEV__) {
          console.log('🎭 Mock/Development mode detected for shop payment, showing success message');
          // Store payment type for mock shop payment
          AsyncStorage.setItem('paymentType', 'shop').then(() => {
            // Store shop data for payment success screen
            AsyncStorage.setItem('pendingShopData', JSON.stringify(shopData)).then(() => {
              Alert.alert(
                'Payment Success (Development Mode)', 
                `Shop listing payment successful!\nOrder ID: ${order_id}\nAmount: ₹${amount / 100}\n\nThis is a development payment. In production, this would open Razorpay.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to payment success screen
                      router.push({
                        pathname: '/(tabs)/payment-success' as any,
                        params: { order_id: order_id }
                      });
                    }
                  }
                ]
              );
            });
          });
          return;
        }

        // Check if RazorpayCheckout is available
        console.log('RazorpayCheckout:', RazorpayCheckout);
        if (!RazorpayCheckout || !RazorpayCheckout.open) {
          Alert.alert('Error', 'RazorpayCheckout is not available. Make sure the native module is linked and you are running on a real device.');
          setLoading(false);
          return;
        }

        // Open Razorpay Checkout for shop payment
        RazorpayCheckout.open({
          key: RAZORPAY_KEY_ID,
          amount: amount,
          currency: currency,
          name: 'Digital Mistri',
          description: 'Nearby Shop Listing Payment',
          order_id,
          prefill: {
            email: user?.email || 'customer@example.com',
            contact: shopData.phone || '',
          },
          theme: { color: '#007AFF' },
          // Add test mode configuration
          config: {
            display: {
              blocks: {
                banks: {
                  name: "Pay using UPI",
                  instruments: [
                    {
                      method: "upi"
                    }
                  ]
                }
              },
              sequence: ["block.banks"],
              preferences: {
                show_default_blocks: false
              }
            }
          }
        })
          .then((paymentData: any) => {
                    // Payment Success
        console.log('Shop payment successful:', paymentData);
        
        // For shop payments, we don't have a booking ID, so we'll navigate to nearby shops
        AsyncStorage.setItem('paymentType', 'shop').then(() => {
          // Store shop data for payment success screen
          AsyncStorage.setItem('pendingShopData', JSON.stringify(shopData)).then(() => {
            // Navigate to payment success screen with order_id
            router.push({
              pathname: '/(tabs)/payment-success' as any,
              params: { order_id: order_id }
            });
          });
        });
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
            console.error('Shop payment failed:', error);
            Alert.alert('Payment Failed', userMessage);
          });
        return;
      }

      // Regular booking flow
      if (!bookingData) {
        Alert.alert('Error', 'Invalid booking data');
        return;
      }

      // Validate amount
      if (displayAmount <= 0) {
        Alert.alert('Error', 'Invalid amount. Please check your booking details.');
        return;
      }

      // Determine if this is a multiple service booking
      const isMultipleService = selectedServices && selectedServices.length > 1;

      let bookingResponse;
      if (isMultipleService) {
        // Call multiple services booking API
        console.log('Creating multiple services booking...');
        const response = await fetch(`${API_URL}/bookings/multiple-services`, {
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
        const response = await fetch(`${API_URL}/bookings`, {
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
      console.log('💰 Creating Razorpay order with amount:', displayAmount * 100);
      const res = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          amount: displayAmount * 100, // Convert to paise
          currency: 'INR',
          bookingId: isMultipleService ? bookingResponse.parentBooking._id : bookingResponse._id
        })
      });

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error('Server error. Please try again later.');
      }

      const data = await res.json();
      
      // Check for server errors
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create payment order');
      }

      if (!data.order) {
        throw new Error('Order creation failed');
      }

      const { id: order_id, amount, currency } = data.order;

      // Check if this is a mock order (for testing) - only for development
      if (data.isMockOrder) {
        console.log('🎭 Mock order detected, showing success message');
        // Store booking ID and payment type for mock payment
        const bookingIdToStore = isMultipleService ? bookingResponse.parentBooking._id : bookingResponse._id;
        AsyncStorage.setItem('lastBookingId', bookingIdToStore).then(() => {
          AsyncStorage.setItem('paymentType', 'booking').then(() => {
            Alert.alert(
              'Payment Success (Development Mode)', 
              `Mock payment successful!\nOrder ID: ${order_id}\nAmount: ₹${amount / 100}\n\nThis is a development payment. In production, this would open Razorpay.`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navigate to payment success screen
                    router.push({
                      pathname: '/(tabs)/payment-success' as any,
                      params: { order_id: order_id }
                    });
                  }
                }
              ]
            );
          });
        });
        return;
      }

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
          email: user?.email || 'customer@example.com',
          contact: bookingData.phone,
        },
        theme: { color: '#007AFF' },
        // Add test mode configuration
        config: {
          display: {
            blocks: {
              banks: {
                name: "Pay using UPI",
                instruments: [
                  {
                    method: "upi"
                  }
                ]
              }
            },
            sequence: ["block.banks"],
            preferences: {
              show_default_blocks: false
            }
          }
        }
      })
        .then((paymentData: any) => {
                  // Payment Success
        console.log('Payment successful:', paymentData);
        
        // Store booking ID and payment type for payment success screen
        const bookingIdToStore = isMultipleService ? bookingResponse.parentBooking._id : bookingResponse._id;
        AsyncStorage.setItem('lastBookingId', bookingIdToStore).then(() => {
          AsyncStorage.setItem('paymentType', 'booking').then(() => {
            // Navigate to payment success screen with order_id
            router.push({
              pathname: '/(tabs)/payment-success' as any,
              params: { order_id: order_id }
            });
          });
        });
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
      console.error('Payment error:', err);
      Alert.alert('Error', err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pay with Razorpay</Text>
      <Text style={styles.amount}>Amount: ₹{displayAmount}</Text>
      <Button title="Pay Now" onPress={handlePayNow} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#007AFF' },
  amount: { fontSize: 18, marginBottom: 24, color: '#333' },
  testMode: {
    fontSize: 14,
    color: '#FF0000', // Red color for test mode
    marginBottom: 10,
    fontStyle: 'italic',
  },
});

export default PaymentScreen; 