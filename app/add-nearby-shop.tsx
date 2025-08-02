import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './constants/config';
import { COLORS, FONTS, SIZES, SHADOWS } from './constants/theme';
import { getImageUrl } from './utils/imageUtils';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
// Removed LinearGradient for a softer look

const AddNearbyShopScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    phone: '',
    email: '',
    services: [''],
    workingHours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '09:00', close: '18:00' },
      sunday: { open: '09:00', close: '18:00' }
    },
    images: [] as string[]
  });
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<'monthly' | 'yearly' | null>(null);
  const [cardAnim] = useState(new Animated.Value(0));
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    getLocation();
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Shop name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.address.street.trim()) newErrors.street = 'Street is required';
    if (!formData.address.city.trim()) newErrors.city = 'City is required';
    if (!formData.address.state.trim()) newErrors.state = 'State is required';
    if (!formData.address.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!image) newErrors.image = 'Shop image is required';
    if (!location) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to add shops', [
          { text: 'Retry', onPress: getLocation },
          { text: 'Cancel', style: 'cancel' },
        ]);
        setErrors((e: any) => ({ ...e, location: 'Location permission denied' }));
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setErrors((e: any) => ({ ...e, location: undefined }));
    } catch (err) {
      Alert.alert('Error', 'Failed to get location. Please try again.', [
        { text: 'Retry', onPress: getLocation },
        { text: 'Cancel', style: 'cancel' },
      ]);
      setErrors((e: any) => ({ ...e, location: 'Failed to get location' }));
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // Reduce quality to keep base64 size manageable (max 50MB)
        base64: true, // Enable base64 encoding
      });
      if (!result.canceled) {
        const img = result.assets[0];
        if (img && img.uri) {
          // Check file size (only works on native)
          if (Platform.OS !== 'web') {
            const fileInfo = await ImagePicker.getMediaLibraryPermissionsAsync();
            // fallback: skip size check if not available
            if (img.fileSize && img.fileSize > 5 * 1024 * 1024) {
              Alert.alert('Image too large', 'Please select an image smaller than 5MB.');
              return;
            }
          }
          
          // Convert to base64 for Cloudinary upload
          if (img.base64) {
            const base64Image = `data:image/jpeg;base64,${img.base64}`;
            
            // Check base64 size (roughly 1.33x the base64 string length)
            const estimatedSizeMB = (img.base64.length * 1.33) / (1024 * 1024);
            console.log('📏 Estimated image size:', estimatedSizeMB.toFixed(2), 'MB');
            
            if (estimatedSizeMB > 10) {
              Alert.alert('Image too large', 'Please select a smaller image (under 10MB).');
              return;
            }
            
            setImage(base64Image);
            console.log('📤 Image converted to base64 for Cloudinary upload');
          } else {
            // Fallback to URI if base64 not available
            setImage(img.uri);
            console.log('⚠️ Base64 not available, using URI:', img.uri);
          }
          
          setErrors((e: any) => ({ ...e, image: undefined }));
        }
      }
    } catch (err) {
      Alert.alert('Image Error', 'Failed to pick image. Please try again.');
    }
  };

  const handlePayment = (type: 'monthly' | 'yearly') => {
    if (!validate()) return;
    setSubmitting(true);
    setPaymentType(type);
    
    // Format the shop data properly
    const formattedShopData = {
      ...formData,
      image,
      location: location ? {
        coordinates: [location.coords.longitude, location.coords.latitude]
      } : null,
      services: formData.services || [],
      workingHours: formData.workingHours || {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { open: '09:00', close: '18:00' }
      }
    };
    
    // Pass form data and payment info to payment screen
    const paymentAmount = type === 'monthly' ? 200 : 1000;
    router.push({
      pathname: '/(tabs)/payment',
      params: {
        serviceTitle: 'Nearby Shop Listing',
        servicePrice: paymentAmount.toString(),
        totalAmount: paymentAmount.toString(), // Add totalAmount
        customFlow: 'addNearbyShop',
        shopData: JSON.stringify(formattedShopData),
      },
    });
    setTimeout(() => setSubmitting(false), 2000); // re-enable after navigation
  };



  return (
    <ScrollView style={styles.bg} contentContainerStyle={{ padding: 0 }}>
      <View style={styles.softHeader}>
        <Text style={styles.headerTitle}>Add Nearby Shop</Text>
        <Text style={styles.headerSubtitle}>Fill the details below to list your shop and reach more customers!</Text>
      </View>
      <Animated.View style={[styles.card, { opacity: cardAnim, transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Details</Text>
          <View style={styles.inputRow}>
            <Ionicons name="storefront-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Shop Name"
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
              placeholderTextColor="#b2bec3"
            />
          </View>
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          <View style={styles.inputRow}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={formData.description}
              onChangeText={text => setFormData({ ...formData, description: text })}
              placeholderTextColor="#b2bec3"
            />
          </View>
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Street"
              value={formData.address.street}
              onChangeText={text => setFormData({ ...formData, address: { ...formData.address, street: text } })}
              placeholderTextColor="#b2bec3"
            />
          </View>
          {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
          <View style={styles.inputRow}>
            <Ionicons name="business-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={formData.address.city}
              onChangeText={text => setFormData({ ...formData, address: { ...formData.address, city: text } })}
              placeholderTextColor="#b2bec3"
            />
          </View>
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          <View style={styles.inputRow}>
            <Ionicons name="map-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="State"
              value={formData.address.state}
              onChangeText={text => setFormData({ ...formData, address: { ...formData.address, state: text } })}
              placeholderTextColor="#b2bec3"
            />
          </View>
          {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
          <View style={styles.inputRow}>
            <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Pincode"
              value={formData.address.pincode}
              onChangeText={text => setFormData({ ...formData, address: { ...formData.address, pincode: text } })}
              keyboardType="numeric"
              placeholderTextColor="#b2bec3"
            />
          </View>
          {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.inputRow}>
            <Ionicons name="call-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={formData.phone}
              onChangeText={text => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              placeholderTextColor="#b2bec3"
            />
          </View>
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={text => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              placeholderTextColor="#b2bec3"
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
            <Ionicons name="image-outline" size={24} color={COLORS.primary} />
            <Text style={{ color: COLORS.primary, marginLeft: 8, fontWeight: '600' }}>{image ? 'Change Image' : 'Pick Image'}</Text>
          </TouchableOpacity>
          {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
          {image && <Image source={{ uri: image }} style={styles.previewImage} />}
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.paymentRow}>
            <TouchableOpacity
              style={[styles.paymentButton, submitting && { opacity: 0.5 }]}
              onPress={() => handlePayment('monthly')}
              activeOpacity={0.85}
              disabled={submitting}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.paymentButtonText, { color: COLORS.primary }]}>Pay ₹200 / Month</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentButton, submitting && { opacity: 0.5 }]}
              onPress={() => handlePayment('yearly')}
              activeOpacity={0.85}
              disabled={submitting}
            >
              <Ionicons name="calendar" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.paymentButtonText, { color: COLORS.primary }]}>Pay ₹1000 / Year</Text>
            </TouchableOpacity>

          </View>
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#f7f8fa' },
  softHeader: { paddingTop: 44, paddingBottom: 18, paddingHorizontal: 20, backgroundColor: '#fff', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: -8, borderBottomWidth: 1, borderColor: '#f1f2f6', shadowColor: '#dfe4ea', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 4, letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 14, color: '#636e72', textAlign: 'center', marginBottom: 0, fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, ...SHADOWS.medium, margin: 18, marginTop: 0, elevation: 3, borderWidth: 1, borderColor: '#f1f2f6' },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#636e72', marginBottom: 10, letterSpacing: 0.2 },
  divider: { height: 1, backgroundColor: '#f1f2f6', marginVertical: 8, borderRadius: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#f7f8fa', borderRadius: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#f1f2f6' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, padding: 12, fontSize: 16, color: COLORS.textPrimary, backgroundColor: 'transparent', fontWeight: '500' },
  imagePicker: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#f7f8fa', borderRadius: 8, padding: 12, justifyContent: 'center', borderWidth: 1, borderColor: '#f1f2f6' },
  previewImage: { width: 130, height: 130, borderRadius: 12, marginBottom: 12, alignSelf: 'center', ...SHADOWS.medium, backgroundColor: '#f7f8fa', borderWidth: 1, borderColor: '#f1f2f6' },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  paymentButton: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, flex: 1, marginHorizontal: 4, justifyContent: 'center', borderWidth: 1 },
  paymentButtonText: { textAlign: 'center', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.2 },
  errorText: { color: '#e74c3c', fontSize: 13, marginBottom: 4, marginLeft: 4 },
});

export default AddNearbyShopScreen; 