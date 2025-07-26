import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants/theme';
import { router } from 'expo-router';

const PrivacyPolicyScreen = () => (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>Privacy Policy</Text>
    </View>
    <Text style={styles.sectionTitle}>1. Introduction</Text>
    <Text style={styles.text}>
      Digital Mistri ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our app and services.
    </Text>
    <Text style={styles.sectionTitle}>2. Information We Collect</Text>
    <Text style={styles.text}>
      - <Text style={styles.bold}>Personal Information:</Text> Name, email, phone number, address, and profile photo when you register or update your profile.
      {"\n"}- <Text style={styles.bold}>Booking Information:</Text> Details of your bookings, payments, and service history.
      {"\n"}- <Text style={styles.bold}>Device & Usage Data:</Text> Device type, app version, IP address, and usage analytics to improve our services.
    </Text>
    <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
    <Text style={styles.text}>
      - To provide and manage your bookings and account.
      {"\n"}- To communicate with you about your bookings, offers, and support.
      {"\n"}- To improve our app, services, and user experience.
      {"\n"}- To comply with legal obligations and prevent fraud.
    </Text>
    <Text style={styles.sectionTitle}>4. Sharing Your Information</Text>
    <Text style={styles.text}>
      - We do <Text style={styles.bold}>not</Text> sell your personal information.
      {"\n"}- We may share your data with service providers (e.g., payment gateways, SMS/email providers) only as needed to deliver our services.
      {"\n"}- We may disclose information if required by law or to protect our rights and users.
    </Text>
    <Text style={styles.sectionTitle}>5. Data Security</Text>
    <Text style={styles.text}>
      - We use industry-standard security measures to protect your data.
      {"\n"}- However, no method of transmission over the internet is 100% secure. Use the app at your own risk.
    </Text>
    <Text style={styles.sectionTitle}>6. Your Rights & Choices</Text>
    <Text style={styles.text}>
      - You can access, update, or delete your profile information from the app.
      {"\n"}- You can opt out of marketing communications at any time.
      {"\n"}- For data deletion or privacy requests, contact us at digitalmistri33@gmail.com.
    </Text>
    <Text style={styles.sectionTitle}>7. Children’s Privacy</Text>
    <Text style={styles.text}>
      - Our app is not intended for children under 13. We do not knowingly collect data from children.
    </Text>
    <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
    <Text style={styles.text}>
      - We may update this Privacy Policy from time to time. Changes will be posted in the app. Continued use of the app means you accept the updated policy.
    </Text>
    <Text style={styles.sectionTitle}>9. Contact Us</Text>
    <Text style={styles.text}>
      If you have any questions or concerns about this Privacy Policy, contact us at:
      {"\n"}Email: digitalmistri33@gmail.com
      {"\n"}Phone: 6307044134
      {"\n"}Address: Janghai Market, Prayagraj
    </Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.primary, marginTop: 20, marginBottom: 8 },
  text: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 8, lineHeight: 24 },
  bold: { fontWeight: 'bold', color: COLORS.textPrimary },
});

export default PrivacyPolicyScreen; 