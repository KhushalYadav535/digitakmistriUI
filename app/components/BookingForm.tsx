import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ViewStyle, TextStyle } from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from './Input';
import Button from './Button';

interface Service {
  id: string;
  title: string;
  type: string;
  price?: string; // Add price field
}

interface BookingFormProps {
  initialService?: Service;
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
  }) => void;
  isLoading?: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({
  initialService,
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

    const bookingData = {
      serviceId: initialService.id,
      serviceTitle: initialService.title,
      date: date.toISOString().split('T')[0],
      time: formatTime(time),
      address,
      phone,
      amount: Number(amount)
    };

    onSubmit(bookingData);
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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
});

export default BookingForm; 