import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { API_URL, RAZORPAY_CONFIG } from '../constants/config';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

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
      // Debug: Log payment initiation
      console.log('🚀 Payment initiated with config:', {
        API_URL,
        RAZORPAY_CONFIG: RAZORPAY_CONFIG.key_id,
        isDevelopment: __DEV__,
        displayAmount
      });

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to make payment');
        return;
      }

      // Test backend connectivity first
      try {
        console.log('🔍 Testing backend connectivity...');
        const testResponse = await fetch(`${API_URL}/payment/test`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log('✅ Backend connectivity test successful:', testData);
        } else {
          console.warn('⚠️ Backend connectivity test failed:', testResponse.status);
        }
      } catch (testError) {
        console.warn('⚠️ Backend connectivity test error:', testError);
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
        console.log('🔗 API URL:', `${API_URL}/payment/create-order`);
        
        const requestBody = { 
          amount: displayAmount * 100, // Convert to paise
          currency: 'INR',
          notes: {
            customFlow: 'addNearbyShop',
            shopData: JSON.stringify(shopData)
          }
        };
        
        console.log('📤 Request body:', requestBody);
        
        const res = await fetch(`${API_URL}/payment/create-order`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });

        // Check if response is JSON
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error('Server returned non-JSON response:', text);
          throw new Error('Server error. Please try again later.');
        }

        const data = await res.json();
        
        // Debug: Log the response data
        console.log('🔍 Backend response data:', data);
        console.log('🔍 isMockOrder flag:', data.isMockOrder);
        console.log('🔍 Order data:', data.order);
        
        // Check for server errors
        if (!res.ok) {
          throw new Error(data.message || 'Failed to create payment order');
        }

        if (!data.order) {
          throw new Error('Order creation failed');
        }

        const { id: order_id, amount, currency } = data.order;

        // Check if this is a mock order (for testing)
        if (data.isMockOrder) {
          console.log('🎭 Mock order detected for shop payment, showing success message');
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

        // Debug: Log Razorpay configuration
        console.log('🔧 Razorpay Checkout Configuration:', {
          key: RAZORPAY_CONFIG.key_id,
          amount: amount,
          currency: currency,
          order_id: order_id,
          isDevelopment: __DEV__
        });

        // Open Razorpay Checkout for shop payment
        RazorpayCheckout.open({
          key: RAZORPAY_CONFIG.key_id,
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
          // Simplified configuration for better compatibility
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
            console.error('🔴 Shop payment failed:', error);
            console.error('🔴 Error details:', {
              code: error?.code,
              description: error?.description,
              reason: error?.reason,
              message: error?.message,
              error: error
            });
            
            let userMessage = 'Payment was not completed.';
            if (error && typeof error === 'object') {
              if (error.code === 'NETWORK_ERROR') {
                userMessage = 'Network error. Please check your internet connection and try again.';
              } else if (error.code === 'PAYMENT_CANCELLED') {
                userMessage = 'Payment was cancelled by user.';
              } else if (error.code === 'INVALID_ORDER_ID') {
                userMessage = 'Invalid order. Please try again.';
              } else if (error.code === 'INVALID_AMOUNT') {
                userMessage = 'Invalid amount. Please check your payment details.';
              } else if (error.description) {
                userMessage = error.description;
              } else if (error.reason === 'Payment cancelled by user') {
                userMessage = 'Payment was cancelled.';
              } else if (error.message) {
                userMessage = error.message;
              }
            }
            
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

      // Store booking data for later creation after successful payment
      const bookingDataToStore = {
        isMultipleService,
        bookingData,
        selectedServices
      };

      // Store booking data in AsyncStorage for payment success handler
      await AsyncStorage.setItem('pendingBookingData', JSON.stringify(bookingDataToStore));

      // Call backend to create Razorpay order (without booking ID since booking will be created after payment)
      console.log('💰 Creating Razorpay order with amount:', displayAmount * 100);
      console.log('🔗 API URL:', `${API_URL}/payment/create-order`);
      
      const requestBody = { 
        amount: displayAmount * 100, // Convert to paise
        currency: 'INR',
        notes: {
          isMultipleService,
          bookingData: JSON.stringify(bookingData)
        }
      };
      
      console.log('📤 Request body:', requestBody);
      
      const res = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error('Server error. Please try again later.');
      }

      const data = await res.json();
      
      // Debug: Log the response data
      console.log('🔍 Backend response data (booking):', data);
      console.log('🔍 isMockOrder flag (booking):', data.isMockOrder);
      console.log('🔍 Order data (booking):', data.order);
      
      // Check for server errors
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create payment order');
      }

      if (!data.order) {
        throw new Error('Order creation failed');
      }

      const { id: order_id, amount, currency } = data.order;

      // Check if this is a mock order (for testing)
      if (data.isMockOrder) {
        console.log('🎭 Mock order detected, showing success message');
        // Store payment type for mock payment
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
        return;
      }

      // Check if RazorpayCheckout is available
      console.log('RazorpayCheckout:', RazorpayCheckout);
      if (!RazorpayCheckout || !RazorpayCheckout.open) {
        Alert.alert('Error', 'RazorpayCheckout is not available. Make sure the native module is linked and you are running on a real device.');
        setLoading(false);
        return;
      }

        // Debug: Log Razorpay configuration for booking
        console.log('🔧 Razorpay Checkout Configuration (Booking):', {
          key: RAZORPAY_CONFIG.key_id,
          amount: amount,
          currency: currency,
          order_id: order_id,
          isDevelopment: __DEV__
        });

        // Open Razorpay Checkout
        RazorpayCheckout.open({
          key: RAZORPAY_CONFIG.key_id,
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
          // Simplified configuration for better compatibility
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
          
          // Store payment type for payment success screen
          AsyncStorage.setItem('paymentType', 'booking').then(() => {
            // Navigate to payment success screen with order_id
            router.push({
              pathname: '/(tabs)/payment-success' as any,
              params: { order_id: order_id }
            });
          });
        })
        .catch((error: any) => {
          // Payment Failed
          console.error('🔴 Booking payment failed:', error);
          console.error('🔴 Error details:', {
            code: error?.code,
            description: error?.description,
            reason: error?.reason,
            message: error?.message,
            error: error
          });
          
          let userMessage = 'Payment was not completed.';
          if (error && typeof error === 'object') {
            if (error.code === 'NETWORK_ERROR') {
              userMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.code === 'PAYMENT_CANCELLED') {
              userMessage = 'Payment was cancelled by user.';
            } else if (error.code === 'INVALID_ORDER_ID') {
              userMessage = 'Invalid order. Please try again.';
            } else if (error.code === 'INVALID_AMOUNT') {
              userMessage = 'Invalid amount. Please check your payment details.';
            } else if (error.description) {
              userMessage = error.description;
            } else if (error.reason === 'Payment cancelled by user') {
              userMessage = 'Payment was cancelled.';
            } else if (error.message) {
              userMessage = error.message;
            }
          }
          
          Alert.alert('Payment Failed', userMessage);
        });
    } catch (err: any) {
      console.error('🔴 Payment error:', err);
      console.error('🔴 Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        error: err
      });
      
      let errorMessage = 'Failed to initiate payment';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.name === 'TypeError' && err.message.includes('JSON')) {
        errorMessage = 'Invalid response from server. Please try again.';
      }
      
      Alert.alert('Payment Error', errorMessage);
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