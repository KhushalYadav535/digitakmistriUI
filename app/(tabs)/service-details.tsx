import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Service details data
const serviceDetails = {
  plumber: {
    name: 'Plumber',
    description: 'Professional plumbing services for your home and office',
    image: require('../../assets/images/plumber.jpeg'),
    icon: 'water-outline' as const,
    services: [
      {
        title: 'Basin Set Fitting/Repair',
        subtitle: 'Install or repair basin set',
        price: '₹750',
        charges: '0–2km free, 2–5km ₹50, 5–10km ₹100',
      },
      {
        title: 'Flush Tank Service',
        subtitle: 'Service flush tank',
        price: '₹200',
        charges: '0–2km free, 2–5km ₹50, 5–10km ₹100',
      },
      {
        title: 'Wiring Related Repair',
        subtitle: 'Repair water pipe wiring',
        price: '₹250',
        charges: '0–2km free, 2–5km ₹50, 5–10km ₹100',
      },
      {
        title: 'Toti Installation',
        subtitle: 'Install toti',
        price: '₹50',
        charges: 'Per piece, 0–2km free, 2–5km ₹50, 5–10km ₹100',
      },
    ],
  },
  electrician: {
    name: 'Electrician',
    description: 'Certified electricians for all electrical needs',
    image: require('../../assets/images/electrician.jpeg'),
    icon: 'flash-outline' as const,
    services: [
      {
        title: 'Switch Repair',
        subtitle: 'Repair or replace switches',
        price: '₹150',
        charges: '0–2km free, 2–5km ₹50, 5–10km ₹100',
      },
      {
        title: 'Light Installation',
        subtitle: 'Install new lights',
        price: '₹200',
        charges: '0–2km free, 2–5km ₹50, 5–10km ₹100',
      },
      {
        title: 'Wiring Work',
        subtitle: 'New wiring installation',
        price: '₹500',
        charges: '0–2km free, 2–5km ₹50, 5–10km ₹100',
      },
    ],
  },
  electronic: {
    name: 'Electronic',
    description: 'Electronic appliance repair and installation',
    image: require('../../assets/images/electrician.jpeg'),
    icon: 'tv-outline' as const,
    services: [
      {
        title: 'AC Installation',
        subtitle: 'Install AC (per piece)',
        price: '₹1600',
        charges: '1500 + 100 (p.c)',
      },
      {
        title: 'AC Service',
        subtitle: 'Service AC (per piece)',
        price: '₹700',
        charges: '600 + 100 (p.c)',
      },
      {
        title: 'Washing Machine',
        subtitle: 'Repair/Service (per piece)',
        price: '₹600',
        charges: '500 + 100 (p.c)',
      },
      {
        title: 'LED TV Repairing',
        subtitle: 'Repair LED TV (per piece)',
        price: '₹350',
        charges: '300 + 50 (p.c)',
      },
    ],
  },
  handpumpmistri: {
    name: 'Handpump Mistri',
    description: 'Expert handpump repair and installation services',
    image: require('../../assets/images/handpump.jpg'),
    icon: 'water-outline' as const,
    services: [
      {
        title: 'Handpump Installation',
        subtitle: 'New handpump installation',
        price: '₹2000',
        charges: 'Price includes basic materials',
      },
      {
        title: 'Handpump Repair',
        subtitle: 'Repair existing handpump',
        price: '₹500',
        charges: 'Basic repair charges',
      },
      {
        title: 'Handpump Maintenance',
        subtitle: 'Regular maintenance service',
        price: '₹300',
        charges: 'Quarterly maintenance',
      },
    ],
  },
};

const ServiceDetailScreen = () => {
  const { serviceId } = useLocalSearchParams();
  const service = serviceDetails[serviceId as keyof typeof serviceDetails];

  if (!service) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Service not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{service.name}</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.card}>
        <Ionicons name={service.icon} size={40} color={COLORS.primary} style={{ alignSelf: 'center', marginBottom: 8 }} />
        <Text style={styles.name}>{service.name}</Text>
        <Text style={styles.description}>{service.description}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Available Services</Text>
        {service.services?.map((item, idx) => (
          <View key={idx} style={styles.serviceItem}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.serviceSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.servicePrice}>{item.price}</Text>
            </View>
            <Text style={styles.serviceCharges}>{item.charges}</Text>
            <View style={{ marginTop: 8, alignItems: 'flex-end' }}>
              <TouchableOpacity
                style={styles.bookNowBtn}
                onPress={() => router.push({ 
                  pathname: '/(tabs)/booking' as any, 
                  params: { 
                    serviceId: serviceId,
                    serviceTitle: item.title,
                    servicePrice: item.price
                  } 
                })}
              >
                <Text style={styles.bookNowText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'left',
  },
  serviceItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingVertical: 12,
    marginBottom: 4,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  serviceSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginLeft: 8,
  },
  serviceCharges: {
    fontSize: 12,
    color: '#F9A825',
    marginTop: 4,
  },
  bookNowBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bookNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
});

export default ServiceDetailScreen;
