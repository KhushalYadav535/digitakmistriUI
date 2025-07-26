import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants/theme';
import { router } from 'expo-router';

const Section = ({ icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={22} color={COLORS.primary} style={{ marginRight: 8 }} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View>{children}</View>
  </View>
);

const ShippingDeliveryScreen = () => (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>Shipping & Delivery Policy</Text>
    </View>
    <Section icon="bicycle-outline" title="Service Delivery">
      <Text style={styles.text}>• Our services are delivered at the address provided during booking.</Text>
      <Text style={styles.text}>• Please ensure your address and contact details are accurate to avoid delays.</Text>
      <Text style={styles.text}>• Service delivery times may vary based on location and availability.</Text>
    </Section>
    <Section icon="cube-outline" title="Product Shipping">
      <Text style={styles.text}>• If your booking includes product delivery, shipping details will be provided at the time of booking.</Text>
      <Text style={styles.text}>• Delivery timelines may vary depending on your location and product availability.</Text>
      <Text style={styles.text}>• We are not responsible for delays caused by third-party couriers or unforeseen circumstances.</Text>
    </Section>
    <Section icon="pricetag-outline" title="Delivery Charges">
      <Text style={styles.text}>• Delivery charges, if any, will be clearly mentioned at the time of booking.</Text>
      <Text style={styles.text}>• No hidden charges will be applied.</Text>
    </Section>
    <Section icon="call-outline" title="Contact for Delivery Issues">
      <Text style={styles.text}>For any shipping or delivery-related queries, contact us at digitalmistri33@gmail.com or call 6307044134.</Text>
    </Section>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  text: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 6,
    lineHeight: 24,
  },
});

export default ShippingDeliveryScreen; 