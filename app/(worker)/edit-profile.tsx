import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';
import { useLanguage } from '../context/LanguageContext';

const WorkerEditProfileScreen = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    services: [] as string[],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/worker/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(t('worker.failed_to_fetch_profile'));
        const data = await res.json();
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          services: data.services || [],
        });
      } catch (e) {}
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/worker/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
              if (!res.ok) throw new Error(t('worker.failed_to_update_profile'));
        const data = await res.json();
        await AsyncStorage.setItem('worker', JSON.stringify(data));
        router.back();
      } catch (e) { alert(t('worker.failed_to_update_profile')); }
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
        <Text style={styles.headerTitle}>{t('worker.edit_profile')}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('worker.personal_info')}</Text>
                      <Input
              label={t('worker.full_name')}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder={t('worker.enter_full_name')}
            />
            <Input
              label={t('worker.phone_number')}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder={t('worker.enter_phone_number')}
              keyboardType="phone-pad"
            />
            <Input
              label={t('worker.email')}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder={t('worker.enter_email')}
              keyboardType="email-address"
            />
        </View>

        <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('worker.professional_details')}</Text>
        
        <Text style={styles.label}>{t('worker.services_offered')}</Text>
          <View style={styles.servicesContainer}>
            {['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Repair'].map(
              (service) => (
                <TouchableOpacity
                  key={service}
                  style={[
                    styles.serviceChip,
                    formData.services.includes(service) && styles.selectedChip,
                  ]}
                  onPress={() => {
                    const services = formData.services.includes(service)
                      ? formData.services.filter((s) => s !== service)
                      : [...formData.services, service];
                    setFormData({ ...formData, services });
                  }}
                >
                  <Text
                    style={[
                      styles.serviceChipText,
                      formData.services.includes(service) &&
                        styles.selectedChipText,
                    ]}
                  >
                    {service}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        <Button
                      title={t('worker.save_changes')}
          onPress={handleSave}
          style={styles.saveButton}
        />
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
    ...SHADOWS.light,
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  form: {
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
  label: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.base,
  },
  serviceChip: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  serviceChipText: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
  },
  selectedChipText: {
    color: COLORS.white,
  },
  saveButton: {
    marginTop: SIZES.medium,
  },
});

export default WorkerEditProfileScreen; 