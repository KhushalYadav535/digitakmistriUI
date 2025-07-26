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

const CancellationRefundScreen = () => (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>Cancellation & Refund Policy</Text>
    </View>
    <Section icon="close-circle-outline" title="Cancellation Policy">
      <Text style={styles.text}>• You may cancel your booking any time before the service is started without any charges.</Text>
      <Text style={styles.text}>• If you cancel after the service has started, a cancellation fee may apply depending on the service and time spent.</Text>
      <Text style={styles.text}>• To cancel, go to your bookings and select the cancel option or contact our support team.</Text>
    </Section>
    <Section icon="cash-outline" title="Refund Policy">
      <Text style={styles.text}>• If you are eligible for a refund, the amount will be processed to your original payment method within 7 business days.</Text>
      <Text style={styles.text}>• Refunds are only applicable for cancellations made as per the above policy or if the service was not delivered as promised.</Text>
      <Text style={styles.text}>• For any refund-related queries, please contact us at digitalmistri33@gmail.com or call 6307044134.</Text>
    </Section>
    <Section icon="help-circle-outline" title="Contact for Support">
      <Text style={styles.text}>If you have any questions or concerns about our cancellation or refund policy, please reach out to our support team. We are here to help you!</Text>
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

export default CancellationRefundScreen; 