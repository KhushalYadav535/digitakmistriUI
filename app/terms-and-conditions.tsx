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

const TermsScreen = () => (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>Terms and Conditions</Text>
    </View>
    <Section icon="document-text-outline" title="Acceptance of Terms">
      <Text style={styles.text}>By using our app, you agree to these terms and conditions. Please read them carefully before using our services.</Text>
    </Section>
    <Section icon="person-circle-outline" title="User Responsibilities">
      <Text style={styles.text}>• You must provide accurate and complete information during registration.</Text>
      <Text style={styles.text}>• You are responsible for maintaining the confidentiality of your account and password.</Text>
      <Text style={styles.text}>• You agree not to misuse the app or engage in fraudulent activities.</Text>
    </Section>
    <Section icon="card-outline" title="Bookings and Payments">
      <Text style={styles.text}>• All bookings are subject to availability and confirmation.</Text>
      <Text style={styles.text}>• Payments must be made as per the instructions in the app.</Text>
      <Text style={styles.text}>• Cancellation and refund policies apply as described in the relevant section.</Text>
    </Section>
    <Section icon="alert-circle-outline" title="Service Limitations">
      <Text style={styles.text}>• We reserve the right to refuse service, terminate accounts, or cancel bookings at our discretion.</Text>
      <Text style={styles.text}>• We are not liable for delays or failures caused by events beyond our control.</Text>
    </Section>
    <Section icon="refresh-circle-outline" title="Changes to Terms">
      <Text style={styles.text}>We may update these terms at any time. Continued use of the app means you accept the new terms.</Text>
    </Section>
    <Section icon="call-outline" title="Contact">
      <Text style={styles.text}>For any questions, contact us at digitalmistri33@gmail.com or call 6307044134.</Text>
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

export default TermsScreen; 