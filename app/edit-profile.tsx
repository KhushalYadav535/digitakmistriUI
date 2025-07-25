import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, TextInput, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SHADOWS, SIZES } from './constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './constants/config';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import OptimizedImage from './components/OptimizedImage';

const CustomerEditProfileScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    profileImage: '',
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${API_URL}/customer/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const customer = response.data;
        setFormData({
          name: customer.name || '',
          phone: customer.phone || '',
          email: customer.email || '',
          address: customer.address || {
            street: '',
            city: '',
            state: '',
            pincode: ''
          },
          profileImage: customer.profileImage || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile data');
      }
    };
    fetchProfile();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access gallery is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setImageUploading(true);
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', {
        uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any);
      const response = await axios.post(`${API_URL}/customer/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData(prev => {
        const updated = { ...prev, profileImage: response.data.profileImage };
        AsyncStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
      Alert.alert('Success', 'Profile image updated!');
    } catch (error: any) {
      console.error('Image upload error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    if (!formData.address.street.trim() || !formData.address.city.trim() || 
        !formData.address.state.trim() || !formData.address.pincode.trim()) {
      Alert.alert('Error', 'Complete address is required');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_URL}/customer/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter your name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.address.street}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                address: { ...prev.address, street: text }
              }))}
              placeholder="Enter street address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              value={formData.address.city}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                address: { ...prev.address, city: text }
              }))}
              placeholder="Enter city"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              value={formData.address.state}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                address: { ...prev.address, state: text }
              }))}
              placeholder="Enter state"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pincode *</Text>
            <TextInput
              style={styles.input}
              value={formData.address.pincode}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                address: { ...prev.address, pincode: text }
              }))}
              placeholder="Enter pincode"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={pickImage} disabled={imageUploading}>
            {imageUploading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <OptimizedImage
                uri={formData.profileImage || 'https://via.placeholder.com/100'}
                size="medium"
                width={90}
                height={90}
                style={{ borderRadius: 45, borderWidth: 2, borderColor: COLORS.primary, backgroundColor: '#eee' }}
                resizeMode="cover"
              />
            )}
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, borderRadius: 12, padding: 4 }}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.large,
    paddingBottom: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: SIZES.medium,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    ...SHADOWS.light,
  },
  sectionTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  inputGroup: {
    marginBottom: SIZES.medium,
  },
  label: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    alignItems: 'center',
    marginTop: SIZES.medium,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body3.fontSize,
    fontWeight: '600',
  },
});

export default CustomerEditProfileScreen; 