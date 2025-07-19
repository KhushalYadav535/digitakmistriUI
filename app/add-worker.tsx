import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import { API_URL } from './constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const services = [
  'plumber',
  'electrician',
  'electronic',
  'painter',
  'carpenter',
  'cleaner',
  'mechanic',
  'welder',
  'tailor',
  'handpump mistri',
];

const AddWorkerScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    experience: '',
    services: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Prepare worker data for backend
      const workerData = {
        ...formData,
        services: formData.services, // Send as array of strings
        yearsOfExperience: formData.experience ? Number(formData.experience) : undefined,
      };
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/admin/workers`,
        workerData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsLoading(false);
      alert(`Worker Created!\nID: ${formData.phone}\nPassword: ${formData.phone}`);
      router.back();
    } catch (error: any) {
      setIsLoading(false);
      alert(
        error.response?.data?.message || 'Failed to create worker. Please try again.'
      );
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
        <Text style={styles.headerTitle}>Add New Worker</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Input
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, name: text }))
            }
          />
          <Input
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, phone: text }))
            }
            keyboardType="phone-pad"
          />
          <Input
            placeholder="Email Address"
            value={formData.email}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, email: text }))
            }
            keyboardType="email-address"
          />
          <Input
            placeholder="Address"
            value={formData.address}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, address: text }))
            }
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Details</Text>
          <Input
            placeholder="Years of Experience"
            value={formData.experience}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, experience: text }))
            }
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Offered</Text>
          <View style={styles.servicesContainer}>
            {services.map((service) => (
              <TouchableOpacity
                key={service}
                style={[
                  styles.serviceBadge,
                  formData.services.includes(service) && styles.selectedService,
                ]}
                onPress={() => handleServiceToggle(service)}
              >
                <Text
                  style={[
                    styles.serviceText,
                    formData.services.includes(service) &&
                      styles.selectedServiceText,
                  ]}
                >
                  {service}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title="Add Worker"
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitButton}
        />
        <Text style={styles.workerNote}>
          Worker ID & Password will be same as phone number. Share with worker after creation.
        </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    padding: SIZES.medium,
  },
  section: {
    marginBottom: SIZES.medium,
  },
  sectionTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.base,
  },
  serviceBadge: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.base,
    backgroundColor: `${COLORS.primary}10`,
  },
  selectedService: {
    backgroundColor: COLORS.primary,
  },
  serviceText: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.primary,
    fontWeight: '500',
  },
  selectedServiceText: {
    color: COLORS.white,
  },
  submitButton: {
    marginTop: SIZES.medium,
  },
  workerNote: {
    color: COLORS.textSecondary,
    fontSize: FONTS.body4.fontSize,
    marginTop: SIZES.base,
    textAlign: 'center',
  },
});

export default AddWorkerScreen;