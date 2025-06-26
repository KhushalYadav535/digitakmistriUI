import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const WorkerRegister = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="construct-outline" size={80} color={COLORS.primary} />
      <Text style={styles.title}>Worker Registration</Text>
      <Text style={styles.message}>
        Worker self-registration is currently disabled. Please contact the administrator to create your worker account.
      </Text>
      <Text style={styles.subMessage}>
        Only administrators can create worker accounts at this time.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.background,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.textPrimary,
    marginTop: SIZES.large,
    marginBottom: SIZES.medium,
  },
  message: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.medium,
    lineHeight: 24,
  },
  subMessage: {
    ...FONTS.body2,
    color: COLORS.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default WorkerRegister;