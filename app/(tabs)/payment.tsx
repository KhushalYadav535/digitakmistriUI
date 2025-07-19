import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { API_URL } from '../constants/config';

const PaymentScreen = () => {
  const { serviceTitle, servicePrice, serviceId, bookingData, customFlow, shopData } = useLocalSearchParams();
  const upiId = '9554585320@airtel';
  const payeeName = 'Anubhav Gupta';
  const upiUri = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${servicePrice}&cu=INR`;
  const [installedApps, setInstalledApps] = useState<string[]>([]);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    // Check which payment apps are installed
    const checkInstalledApps = async () => {
      const apps = [
        { id: 'gpay', scheme: 'googleplay://' },
        { id: 'phonepe', scheme: 'phonepe://' },
        { id: 'paytm', scheme: 'paytmmp://' },
        { id: 'bhim', scheme: 'bhim://' },
        { id: 'amazonpay', scheme: 'amazonpay://' },
      ];

      const installed: string[] = [];
      for (const app of apps) {
        try {
          const supported = await Linking.canOpenURL(app.scheme);
          if (supported) {
            installed.push(app.id);
          }
        } catch (error) {
          console.log(`Error checking ${app.id}:`, error);
        }
      }
      setInstalledApps(installed);
    };

    checkInstalledApps();
  }, []);

  const createBooking = async (paymentMethod: string = 'online') => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to create a booking');
        router.push('/(auth)/login' as any);
        return;
      }

      // Parse booking data from params
      let parsedBookingData;
      try {
        parsedBookingData = bookingData ? JSON.parse(bookingData as string) : null;
      } catch (error) {
        console.error('Error parsing booking data:', error);
        Alert.alert('Error', 'Invalid booking data');
        return;
      }

      if (!parsedBookingData) {
        Alert.alert('Error', 'Booking data is missing');
        return;
      }

      const bookingPayload = {
        serviceType: serviceId,
        serviceTitle: serviceTitle,
        bookingDate: parsedBookingData.date,
        bookingTime: parsedBookingData.time,
        address: parsedBookingData.address,
        phone: parsedBookingData.phone,
        paymentMethod: paymentMethod,
        amount: Number(servicePrice), // Ensure amount is a number
      };

      const response = await axios.post(`${API_URL}/bookings`, bookingPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data._id) {
        setBookingId(response.data._id);
        return response.data._id;
      } else {
        throw new Error('No booking ID returned');
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create booking');
      return null;
    }
  };

  const copyToClipboard = () => {
    Clipboard.setStringAsync(upiId);
    Alert.alert('Copied!', 'UPI ID has been copied to clipboard.');
  };

  const handlePaymentSuccess = async () => {
    // If this is the addNearbyShop flow, submit the shop data to backend
    if (customFlow === 'addNearbyShop' && shopData) {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'Please login to continue');
          router.push('/(auth)/login' as any);
          return;
        }
        const parsedShopData = JSON.parse(shopData as string);
        const formData = new FormData();
        formData.append('name', parsedShopData.name);
        formData.append('description', parsedShopData.description);
        formData.append('phone', parsedShopData.phone);
        formData.append('email', parsedShopData.email);
        formData.append('address', JSON.stringify(parsedShopData.address));
        formData.append('location', JSON.stringify(parsedShopData.location));
        formData.append('services', JSON.stringify(parsedShopData.services));
        formData.append('workingHours', JSON.stringify(parsedShopData.workingHours));
        if (parsedShopData.image) {
          const uriParts = parsedShopData.image.split('.');
          const fileType = uriParts[uriParts.length - 1];
          formData.append('image', {
            uri: parsedShopData.image,
            type: `image/${fileType}`,
            name: `photo.${fileType}`,
          } as any);
        }
        const response = await axios.post(
          `${API_URL}/nearby-shops/customer`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        if (response.status === 201) {
          Alert.alert('Success', 'Nearby shop added successfully!');
          router.replace({
            pathname: '/(tabs)/nearby-shops',
            params: { highlightShopId: response.data._id }
          });
          return;
        } else {
          throw new Error('Failed to add shop');
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to add nearby shop. Please contact support.');
        return;
      }
    }
    if (!bookingId && !customFlow) {
      Alert.alert('Error', 'No booking found. Please try again.');
      return;
    }
    if (!customFlow) {
      Alert.alert(
        'Payment Confirmation',
        'Please confirm that you have completed the payment.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => router.replace({
              pathname: '/(tabs)/booking-status/[id]' as any,
              params: { id: bookingId },
            }),
          },
        ]
      );
    }
  };
  
  const handleCashOnDelivery = async () => {
    const newBookingId = await createBooking('cod');
    if (newBookingId) {
      setBookingId(newBookingId);
      Alert.alert(
        'Booking Confirmed',
        'Your Cash on Delivery booking has been created successfully.',
        [
          { 
            text: 'View Booking', 
            onPress: () => router.replace({
              pathname: '/(tabs)/booking-status/[id]' as any,
              params: { id: newBookingId },
            })
          },
        ]
      );
    }
  };

  const handlePayNow = async (paymentMethod: string) => {
    if (customFlow === 'addNearbyShop') {
      // Just open the UPI app, do NOT call createBooking
      let deepLink = upiUri;
      if (paymentMethod === 'gpay') deepLink = `googlepay://upi/pay?pa=${upiId}&pn=${payeeName}&am=${servicePrice}&cu=INR`;
      if (paymentMethod === 'phonepe') deepLink = `phonepe://pay?pa=${upiId}&pn=${payeeName}&am=${servicePrice}&cu=INR`;
      if (paymentMethod === 'paytm') deepLink = `paytmmp://pay?pa=${upiId}&pn=${payeeName}&am=${servicePrice}&cu=INR`;
      if (paymentMethod === 'bhim') deepLink = `bhim://upi/pay?pa=${upiId}&pn=${payeeName}&am=${servicePrice}&cu=INR`;
      if (paymentMethod === 'amazonpay') deepLink = `amazonpay://upi/pay?pa=${upiId}&pn=${payeeName}&am=${servicePrice}&cu=INR`;

      Alert.alert(
        'Opening Payment App',
        'Opening UPI app...',
        [{ text: 'OK' }]
      );

      Linking.canOpenURL(deepLink).then((supported) => {
        if (supported) {
          Linking.openURL(deepLink);
          setTimeout(() => {
            Alert.alert(
              'Payment Status',
              'Did you complete the payment?',
              [
                { text: 'No, I need help', style: 'cancel' },
                { text: 'Yes, I paid', onPress: () => handlePaymentSuccess() },
              ]
            );
          }, 30000);
        } else {
          // fallback to UPI URI
          Linking.openURL(upiUri);
          setTimeout(() => {
            Alert.alert(
              'Payment Status',
              'Did you complete the payment?',
              [
                { text: 'No, I need help', style: 'cancel' },
                { text: 'Yes, I paid', onPress: () => handlePaymentSuccess() },
              ]
            );
          }, 30000);
        }
      });
      return;
    }
    // Create booking first
    const newBookingId = await createBooking('online');
    if (!newBookingId) {
      return; // Booking creation failed
    }
    setBookingId(newBookingId);

    let deepLink = '';
    
    switch (paymentMethod) {
      case 'gpay':
        deepLink = `googleplay://upi/pay?pa=${upiId}&pn=${payeeName}&am=${servicePrice}&cu=INR`;
        break;
      case 'phonepe':
        deepLink = `phonepe://pay?pa=${upiId}&pn=${payeeName}&am=${servicePrice}&cu=INR`;
        break;
      case 'paytm':
        deepLink = `paytmmp://pay?pa=${upiId}&pn=${payeeName}&am=${servicePrice}&cu=INR`;
        break;
      case 'bhim':
        deepLink = `bhim://upi/pay?pa=${upiId}&pn=${payeeName}&am=${servicePrice}&cu=INR`;
        break;
      case 'amazonpay':
        deepLink = `amazonpay://upi/pay?pa=${upiId}&pn=${payeeName}&am=${servicePrice}&cu=INR`;
        break;
      default:
        deepLink = upiUri;
    }

    // Show loading alert
    Alert.alert(
      'Opening Payment App',
      `Opening ${paymentMethod === 'gpay' ? 'Google Pay' : 
                 paymentMethod === 'phonepe' ? 'PhonePe' : 
                 paymentMethod === 'paytm' ? 'Paytm' : 
                 paymentMethod === 'bhim' ? 'BHIM' : 
                 paymentMethod === 'amazonpay' ? 'Amazon Pay' : 'UPI App'}...`,
      [{ text: 'OK' }]
    );

    Linking.canOpenURL(deepLink).then((supported) => {
      if (supported) {
        Linking.openURL(deepLink);
        // Set a timeout to check payment status
        setTimeout(() => {
          Alert.alert(
            'Payment Status',
            'Did you complete the payment?',
            [
              { text: 'No, I need help', style: 'cancel' },
              { 
                text: 'Yes, I paid', 
                onPress: () => handlePaymentSuccess()
              },
            ]
          );
        }, 30000); // Check after 30 seconds
      } else {
        // Fallback to UPI URI
        Alert.alert(
          'App Not Found',
          'The selected payment app is not installed. Opening default UPI app...',
          [{ 
            text: 'OK', 
            onPress: () => {
              Linking.openURL(upiUri);
              setTimeout(() => {
                Alert.alert(
                  'Payment Status',
                  'Did you complete the payment?',
                  [
                    { text: 'No, I need help', style: 'cancel' },
                    { 
                      text: 'Yes, I paid', 
                      onPress: () => handlePaymentSuccess()
                    },
                  ]
                );
              }, 30000);
            }
          }]
        );
      }
    }).catch(() => {
      // Fallback to UPI URI
      Alert.alert(
        'Error',
        'Unable to open payment app. Please use QR code or copy UPI ID.',
        [{ text: 'OK' }]
      );
    });
  };

  const handleInstallApp = (appName: string) => {
    const appStoreLinks = {
      'gpay': 'https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user',
      'phonepe': 'https://play.google.com/store/apps/details?id=com.phonepe.app',
      'paytm': 'https://play.google.com/store/apps/details?id=net.one97.paytm',
      'bhim': 'https://play.google.com/store/apps/details?id=in.org.npci.upiapp',
      'amazonpay': 'https://play.google.com/store/apps/details?id=in.amazonpay',
    };

    const link = appStoreLinks[appName as keyof typeof appStoreLinks];
    if (link) {
      Alert.alert(
        'Install App',
        `Would you like to install ${appName === 'gpay' ? 'Google Pay' : 
                                   appName === 'phonepe' ? 'PhonePe' : 
                                   appName === 'paytm' ? 'Paytm' : 
                                   appName === 'bhim' ? 'BHIM' : 
                                   appName === 'amazonpay' ? 'Amazon Pay' : appName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Install', 
            onPress: () => Linking.openURL(link)
          },
        ]
      );
    }
  };

  const paymentApps = [
    { id: 'gpay', name: 'Google Pay', icon: 'logo-google', color: '#4285F4' },
    { id: 'phonepe', name: 'PhonePe', icon: 'phone-portrait', color: '#5F259F' },
    { id: 'paytm', name: 'Paytm', icon: 'wallet', color: '#00BAF2' },
    { id: 'bhim', name: 'BHIM', icon: 'card', color: '#FF6B35' },
    { id: 'amazonpay', name: 'Amazon Pay', icon: 'logo-amazon', color: '#FF9900' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Your Payment</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <Text style={styles.serviceTitle}>{serviceTitle}</Text>
        <Text style={styles.servicePrice}>Total Amount: ₹{servicePrice}</Text>
      </View>

      {/* Custom payment UI for addNearbyShop */}
      {customFlow === 'addNearbyShop' ? (
        <View style={styles.shopPaymentCard}>
          <Text style={styles.shopPaymentTitle}>Pay for Shop Listing</Text>
          <View style={styles.shopPaymentOptions}>
            <TouchableOpacity style={styles.shopPaymentOption} onPress={() => handlePayNow('upi')} activeOpacity={0.85}>
              <Ionicons name="logo-google" size={28} color="#4285F4" style={{ marginRight: 12 }} />
              <View>
                <Text style={styles.shopPaymentLabel}>UPI Payment</Text>
                <Text style={styles.shopPaymentDesc}>Pay securely using any UPI app</Text>
              </View>
              <View style={styles.shopPaymentAmountBox}>
                <Text style={styles.shopPaymentAmount}>₹{servicePrice}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.shopPaymentQrSection}>
            <Text style={styles.shopPaymentQrLabel}>Or scan QR code</Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={upiUri}
                size={160}
                logo={require('../../assets/images/applogo.png')}
                logoSize={32}
                logoBackgroundColor='white'
              />
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
              <Text style={styles.upiId}>{upiId}</Text>
              <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // ... existing code for normal bookings ...
        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Pay Now</Text>
          <Text style={styles.sectionSubtitle}>Choose your preferred payment app</Text>
          <View style={styles.paymentAppsContainer}>
            {paymentApps.map((app) => {
              const isInstalled = installedApps.includes(app.id);
              return (
                <TouchableOpacity
                  key={app.id}
                  style={[
                    styles.paymentAppButton, 
                    { 
                      backgroundColor: isInstalled ? app.color : COLORS.lightGray,
                      opacity: isInstalled ? 1 : 0.6
                    }
                  ]}
                  onPress={() => isInstalled ? handlePayNow(app.id) : handleInstallApp(app.id)}
                  disabled={false}
                >
                  <Ionicons 
                    name={app.icon as any} 
                    size={24} 
                    color={isInstalled ? COLORS.white : COLORS.gray} 
                  />
                  <Text style={[
                    styles.paymentAppText,
                    { color: isInstalled ? COLORS.white : COLORS.gray }
                  ]}>
                    {app.name}
                  </Text>
                  {!isInstalled && (
                    <Text style={styles.notInstalledText}>Not Installed</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity 
            style={styles.payNowButton} 
            onPress={() => handlePayNow('upi')}
          >
            <Ionicons name="card" size={24} color={COLORS.white} />
            <Text style={styles.payNowButtonText}>Pay Now with UPI</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* QR and other options for normal bookings remain unchanged */}
      {(!customFlow || customFlow !== 'addNearbyShop') && (
        <>
          <View style={styles.paymentCard}>
            <Text style={styles.sectionTitle}>QR Code Payment</Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={upiUri}
                size={200}
                logo={require('../../assets/images/applogo.png')}
                logoSize={40}
                logoBackgroundColor='white'
              />
            </View>
            <Text style={styles.upiIdText}>Pay to: {payeeName}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
              <Text style={styles.upiId}>{upiId}</Text>
              <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </>
      )}
      
      <View style={styles.paymentCard}>
        <Text style={styles.sectionTitle}>Other Options</Text>
        {(!customFlow || customFlow !== 'addNearbyShop') && (
          <TouchableOpacity style={styles.codButton} onPress={handleCashOnDelivery}>
            <Ionicons name="cash-outline" size={24} color={COLORS.success} />
            <Text style={styles.codButtonText}>Cash on Delivery</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SIZES.medium,
  },
  summaryCard: {
    ...SHADOWS.medium,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.large,
    margin: SIZES.medium,
  },
  summaryTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  serviceTitle: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
    marginBottom: SIZES.base,
  },
  servicePrice: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  paymentCard: {
    ...SHADOWS.medium,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.large,
    marginHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.large,
  },
  sectionSubtitle: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SIZES.medium,
    textAlign: 'center',
  },
  qrContainer: {
    marginBottom: SIZES.large,
    padding: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
  },
  upiIdText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.small,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray,
  },
  upiId: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
    marginRight: SIZES.base,
    color: COLORS.textPrimary,
  },
  codButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: SIZES.medium,
    borderRadius: SIZES.radius,
  },
  codButtonText: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    marginLeft: SIZES.medium,
    color: COLORS.textPrimary,
  },
  paymentAppsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: SIZES.large,
    width: '100%',
  },
  paymentAppButton: {
    alignItems: 'center',
    padding: SIZES.medium,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.small,
    minWidth: 80,
    ...SHADOWS.light,
  },
  paymentAppText: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: '600',
    marginTop: SIZES.small,
    color: COLORS.white,
    textAlign: 'center',
  },
  payNowButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    borderRadius: SIZES.radius,
    width: '100%',
    marginTop: SIZES.large,
    ...SHADOWS.medium,
  },
  payNowButtonText: {
    color: COLORS.white,
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    marginLeft: SIZES.small,
  },
  notInstalledText: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    marginTop: SIZES.small,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  shopPaymentCard: {
    ...SHADOWS.medium,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.large,
    marginHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
    alignItems: 'center',
  },
  shopPaymentTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.medium,
    textAlign: 'center',
  },
  shopPaymentOptions: {
    width: '100%',
    marginBottom: SIZES.large,
  },
  shopPaymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.small,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray,
    marginBottom: SIZES.small,
  },
  shopPaymentLabel: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  shopPaymentDesc: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    marginTop: SIZES.small,
  },
  shopPaymentAmountBox: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.radius,
  },
  shopPaymentAmount: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  shopPaymentQrSection: {
    alignItems: 'center',
    marginTop: SIZES.large,
  },
  shopPaymentQrLabel: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SIZES.small,
  },
});

export default PaymentScreen; 