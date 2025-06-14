import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

export type CardVariant = 'flat' | 'elevated' | 'outlined';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  onPress?: () => void;
}

const Card = ({ children, variant = 'flat', style, onPress }: CardProps) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: COLORS.white,
          ...SHADOWS.small,
        };
      case 'outlined':
        return {
          backgroundColor: COLORS.white,
          borderWidth: 1,
          borderColor: COLORS.border,
        };
      default:
        return {
          backgroundColor: COLORS.white,
        };
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container 
      style={[styles.container, getVariantStyle(), style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
  },
});

export default Card; 