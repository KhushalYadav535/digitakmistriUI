import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ViewStyle, TextStyle } from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from './Input';
import Button from './Button';
import { API_URL } from '../constants/config';

interface Service {
  id: string;
  title: string;
  type: string;
  price?: string; // Add price field
}

interface ServiceItem {
  serviceType: string;
  serviceTitle: string;
  amount: number;
  quantity: number;
}

interface BookingFormProps {
  initialService?: Service;
  selectedServices?: ServiceItem[]; // Add support for multiple services
  onSubmit: (data: {
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
    services?: ServiceItem[]; // Add services array for multiple services
  }) => void;
  isLoading?: boolean;
}

interface LocationInfo {
  latitude: number;
  longitude: number;
  displayName: string;
  accuracy: number;
  accuracyPercentage: number;
}

const BookingForm: React.FC<BookingFormProps> = ({
  initialService,
  selectedServices,
  onSubmit,
  isLoading = false
}) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
  } | null>(null);
  const [isGettingGpsLocation, setIsGettingGpsLocation] = useState(false);

  // Auto-fill amount from service price when component mounts
  React.useEffect(() => {
    if (initialService?.price) {
      const priceValue = initialService.price.replace('₹', '');
      setAmount(priceValue);
    }
  }, [initialService]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!address.street) newErrors.street = 'Street address is required';
    if (!address.city) newErrors.city = 'City is required';
    if (!address.state) newErrors.state = 'State is required';
    if (!address.pincode) newErrors.pincode = 'Pincode is required';
    if (!phone) newErrors.phone = 'Phone number is required';
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!amount) newErrors.amount = 'Amount is required';
    if (amount && (isNaN(Number(amount)) || Number(amount) <= 0)) {
      newErrors.amount = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (!initialService) {
      Alert.alert('Error', 'Please select a service first');
      return;
    }

    // Calculate total amount including distance charge
    let totalAmount = Number(amount);
    let distanceCharge = 0;
    let distance = 0;

    if (gpsLocation) {
      distance = calculateDistanceFromGPS(gpsLocation);
      distanceCharge = Math.round(distance * 10); // ₹10 per km
      totalAmount = Number(amount) + distanceCharge;
    }

    console.log('💰 Total amount calculation:', {
      serviceAmount: Number(amount),
      distance: distance,
      distanceCharge: distanceCharge,
      totalAmount: totalAmount
    });

    const bookingData = {
      serviceId: initialService.id,
      serviceTitle: initialService.title,
      date: date.toISOString().split('T')[0],
      time: formatTime(time),
      address,
      phone,
      amount: Number(amount), // Service amount only
      totalAmount: totalAmount, // Total amount including distance charge
      distance: distance,
      distanceCharge: distanceCharge,
      // Include GPS coordinates if available
      gpsCoordinates: gpsLocation ? {
        latitude: gpsLocation.latitude,
        longitude: gpsLocation.longitude,
        accuracy: gpsLocation.accuracy,
        address: gpsLocation.address
      } : null,
      // Include services array for multiple services if available
      services: selectedServices || undefined
    };

    onSubmit(bookingData);
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Calculate distance from GPS coordinates to Janghai Bazar
  const calculateDistanceFromGPS = (gpsData: { latitude: number; longitude: number }) => {
    // Updated coordinates for Janghai Bazar, Prayagraj (212401)
    // These should be more accurate for the actual Janghai Bazar location
    const janghaiBazarCoords = {
      latitude: 25.541297129300112, // Janghai Bazar, Prayagraj (212401)
      longitude: 82.31064807968316
    };
    
    console.log('📍 Distance calculation debug:', {
      janghaiBazar: janghaiBazarCoords,
      customerLocation: gpsData,
      latDiff: Math.abs(gpsData.latitude - janghaiBazarCoords.latitude),
      lonDiff: Math.abs(gpsData.longitude - janghaiBazarCoords.longitude)
    });
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (gpsData.latitude - janghaiBazarCoords.latitude) * Math.PI / 180;
    const dLon = (gpsData.longitude - janghaiBazarCoords.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(janghaiBazarCoords.latitude * Math.PI / 180) * Math.cos(gpsData.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    const calculatedDistance = Math.round(distance * 100) / 100; // Round to 2 decimal places
    console.log('📍 Calculated distance:', calculatedDistance, 'km');
    
    return calculatedDistance;
  };

  const getGpsLocation = async () => {
    setIsGettingGpsLocation(true);
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to get your exact location for accurate distance calculation.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current location with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10
      });

      console.log('📍 GPS Location obtained:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      });

      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      let resolvedAddress = '';
      if (addressResponse && addressResponse.length > 0) {
        const addr = addressResponse[0];
        resolvedAddress = [
          addr.street,
          addr.city,
          addr.region,
          addr.postalCode,
          addr.country
        ].filter(Boolean).join(', ');
      }

      const gpsData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 100, // Default to 100 meters if null
        address: resolvedAddress
      };

      setGpsLocation(gpsData);

      // Auto-fill address fields if GPS location is accurate
      if ((location.coords.accuracy || 100) <= 50) { // 50 meters accuracy
        if (addressResponse && addressResponse.length > 0) {
          const addr = addressResponse[0];
          setAddress(prev => ({
            ...prev,
            street: addr.street || prev.street,
            city: addr.city || prev.city,
            state: addr.region || prev.state,
            pincode: addr.postalCode || prev.pincode
          }));
        }

        Alert.alert(
          '📍 GPS Location Captured',
          `Location accuracy: ${Math.round(location.coords.accuracy || 100)} meters\n\nAddress: ${resolvedAddress || 'Could not resolve address'}\n\nAddress fields have been auto-filled. Please verify and edit if needed.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '📍 GPS Location Captured',
          `Location accuracy: ${Math.round(location.coords.accuracy || 100)} meters\n\nAddress: ${resolvedAddress || 'Could not resolve address'}\n\nPlease manually fill in your address for better accuracy.`,
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('GPS location error:', error);
      Alert.alert(
        'GPS Error',
        'Failed to get your location. Please check your GPS settings and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGettingGpsLocation(false);
    }
  };

  const verifyLocation = async () => {
    if (!address.street || !address.city || !address.state || !address.pincode) {
      Alert.alert('Error', 'Please fill in all address fields first');
      return;
    }

    setIsVerifyingLocation(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to verify location');
        return;
      }

      const response = await fetch(`${API_URL}/bookings/geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ address })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLocationInfo(data.location);
        Alert.alert(
          'Location Verified',
          `Accuracy: ${data.location.accuracyPercentage}%\n\nResolved Address:\n${data.location.displayName}`
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to verify location');
      }
    } catch (error) {
      console.error('Location verification error:', error);
      Alert.alert('Error', 'Failed to verify location. Please check your internet connection.');
    } finally {
      setIsVerifyingLocation(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Book Service</Text>
        {initialService && (
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>{initialService.title}</Text>
            <Text style={styles.serviceType}>{initialService.type}</Text>
          </View>
        )}
      </View>

      <View style={styles.form}>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={24} color={COLORS.primary} />
            <Text style={styles.dateTimeText}>
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time" size={24} color={COLORS.primary} />
            <Text style={styles.dateTimeText}>
              {formatTime(time)}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setTime(selectedTime);
              }
            }}
          />
        )}

        <Input
          label="Street Address"
          value={address.street}
          onChangeText={(text) => setAddress(prev => ({ ...prev, street: text }))}
          error={errors.street}
          placeholder="Enter your street address"
        />

        <Input
          label="City"
          value={address.city}
          onChangeText={(text) => setAddress(prev => ({ ...prev, city: text }))}
          error={errors.city}
          placeholder="Enter your city"
        />

        <Input
          label="State"
          value={address.state}
          onChangeText={(text) => setAddress(prev => ({ ...prev, state: text }))}
          error={errors.state}
          placeholder="Enter your state"
        />

        <Input
          label="Pincode"
          value={address.pincode}
          onChangeText={(text) => setAddress(prev => ({ ...prev, pincode: text }))}
          error={errors.pincode}
          placeholder="Enter your pincode"
          keyboardType="numeric"
        />

        {/* GPS Location Button */}
        <TouchableOpacity 
          style={[styles.verifyLocationButton, { backgroundColor: COLORS.success }]} 
          onPress={getGpsLocation}
          disabled={isGettingGpsLocation}
        >
          <Ionicons name="navigate" size={20} color={COLORS.white} />
          <Text style={styles.verifyLocationText}>
            {isGettingGpsLocation ? 'Getting GPS Location...' : '📍 Get My GPS Location'}
          </Text>
        </TouchableOpacity>

        {/* GPS Location Info */}
        {gpsLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationAccuracy}>
              📍 GPS Location: {Math.round(gpsLocation.accuracy)}m accuracy
            </Text>
            <Text style={styles.locationAddress}>
              {gpsLocation.address || 'Address could not be resolved'}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.verifyLocationButton} 
          onPress={verifyLocation}
          disabled={isVerifyingLocation}
        >
          <Ionicons name="location" size={20} color={COLORS.white} />
          <Text style={styles.verifyLocationText}>
            {isVerifyingLocation ? 'Verifying Location...' : 'Verify Location Accuracy'}
          </Text>
        </TouchableOpacity>

        {locationInfo && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationAccuracy}>
              Location Accuracy: {locationInfo.accuracyPercentage}%
            </Text>
            <Text style={styles.locationAddress}>
              {locationInfo.displayName}
            </Text>
          </View>
        )}

        <Input
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />

        <Input
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          error={errors.amount}
          placeholder="Enter the amount"
          keyboardType="numeric"
          editable={initialService?.type === 'Multiple'} // Only editable for multiple services
        />
        
        {initialService?.price && initialService.type !== 'Multiple' && (
          <Text style={styles.amountNote}>
            * Amount is pre-filled from service price. You can modify if needed.
          </Text>
        )}
        
        <Text style={styles.distanceNote}>
          * Distance charge of ₹10 per km from Janghai Bazar, Prayagraj (212401) will be added to your final bill.
        </Text>

        {/* Distance Preview */}
        {(gpsLocation || locationInfo) && (
          <View style={styles.distancePreview}>
            <Text style={styles.distancePreviewTitle}>📍 Distance Preview</Text>
            <Text style={styles.distancePreviewText}>
              From: Janghai Bazar, Prayagraj (212401)
            </Text>
            <Text style={styles.distancePreviewText}>
              To: {gpsLocation?.address || locationInfo?.displayName || 'Your Location'}
            </Text>
            <Text style={styles.distancePreviewText}>
              Estimated Distance: {gpsLocation ? 
                `${calculateDistanceFromGPS(gpsLocation)} km` : 
                'Calculating...'
              }
            </Text>
            <Text style={styles.distancePreviewText}>
              Distance Charge: {gpsLocation ? 
                `₹${Math.round(calculateDistanceFromGPS(gpsLocation) * 10)}` : 
                'Calculating...'
              }
            </Text>
            
            {/* Test Distance Button */}
            <TouchableOpacity 
              style={styles.testDistanceButton}
              onPress={() => {
                // Test with different coordinates to find the correct Janghai Bazar location
                Alert.prompt(
                  'Test Distance Calculation',
                  'Enter test coordinates (lat,lon) to verify distance calculation:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Test',
                      onPress: (coordinates) => {
                        if (coordinates) {
                          const [lat, lon] = coordinates.split(',').map(Number);
                          if (!isNaN(lat) && !isNaN(lon)) {
                            const testCoords = { latitude: lat, longitude: lon };
                            const testDistance = calculateDistanceFromGPS(testCoords);
                            Alert.alert(
                              'Distance Test Result',
                              `From Janghai Bazar to (${lat}, ${lon}):\n\nDistance: ${testDistance} km\nCharge: ₹${Math.round(testDistance * 10)}\n\nIf this should be ~7-8 km for Chanethu, we need to adjust Janghai Bazar coordinates.`
                            );
                          }
                        }
                      }
                    }
                  ],
                  'plain-text',
                  '25.4560,81.8560'
                );
              }}
            >
              <Text style={styles.testDistanceButtonText}>Test Distance Calculation</Text>
            </TouchableOpacity>
          </View>
        )}

        <Button
          title="Book Now"
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  serviceInfo: ViewStyle;
  serviceTitle: TextStyle;
  serviceType: TextStyle;
  form: ViewStyle;
  dateTimeContainer: ViewStyle;
  dateTimeButton: ViewStyle;
  dateTimeText: TextStyle;
  submitButton: ViewStyle;
  backButton: ViewStyle;
  amountNote: TextStyle;
  distanceNote: TextStyle;
  verifyLocationButton: ViewStyle;
  verifyLocationText: TextStyle;
  locationInfo: ViewStyle;
  locationAccuracy: TextStyle;
  locationAddress: TextStyle;
  distancePreview: ViewStyle;
  distancePreviewTitle: TextStyle;
  distancePreviewText: TextStyle;
  testDistanceButton: ViewStyle;
  testDistanceButtonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    position: 'relative',
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  serviceInfo: {
    marginTop: SIZES.base,
  },
  serviceTitle: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  serviceType: {
    ...FONTS.body3,
    color: COLORS.gray,
    marginTop: 4,
  },
  form: {
    padding: SIZES.padding,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.base,
  },
  dateTimeText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginLeft: SIZES.base,
  },
  submitButton: {
    marginTop: SIZES.padding * 2,
  },
  backButton: {
    position: 'absolute',
    top: SIZES.padding,
    left: SIZES.padding,
  },
  amountNote: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginTop: SIZES.base,
    marginBottom: SIZES.base,
  },
  distanceNote: {
    ...FONTS.body4,
    color: COLORS.primary,
    marginTop: SIZES.base,
    marginBottom: SIZES.base,
    fontStyle: 'italic',
  },
  verifyLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    marginTop: SIZES.base,
    marginBottom: SIZES.base,
  },
  verifyLocationText: {
    ...FONTS.body3,
    color: COLORS.white,
    marginLeft: SIZES.base,
    fontWeight: '600',
  },
  locationInfo: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    marginTop: SIZES.base,
    marginBottom: SIZES.base,
  },
  locationAccuracy: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationAddress: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  distancePreview: {
    backgroundColor: '#E8F5E8',
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    marginTop: SIZES.base,
    marginBottom: SIZES.base,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  distancePreviewTitle: {
    ...FONTS.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SIZES.small,
  },
  distancePreviewText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  testDistanceButton: {
    backgroundColor: COLORS.warning,
    padding: SIZES.small,
    borderRadius: SIZES.radius,
    marginTop: SIZES.small,
    alignItems: 'center',
  },
  testDistanceButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default BookingForm; 