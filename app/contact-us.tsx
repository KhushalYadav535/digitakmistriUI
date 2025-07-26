import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants/theme';
import { router } from 'expo-router';

const ContactUsScreen = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>Contact Us</Text>
    </View>
    <Text style={styles.text}>
      <Text style={styles.sectionTitle}>Customer Support</Text>
      {"\n"}Email: digitalmistri33@gmail.com
      {"\n"}Phone: 6307044134
      {"\n\n"}
      <Text style={styles.sectionTitle}>Address</Text>
      {"\n"}Digital Mistri, Janghai Market, Prayagraj
      {"\n\n"}
      For any queries, feedback, or complaints, please reach out to us. We are here to help you!
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  text: { fontSize: 16, color: COLORS.textSecondary, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
});

export default ContactUsScreen; 