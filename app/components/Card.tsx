import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'default',
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          ...styles.card,
          ...styles.elevated,
        };
      case 'outlined':
        return {
          ...styles.card,
          ...styles.outlined,
        };
      default:
        return styles.card;
    }
  };

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={[getCardStyle(), style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {children}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base * 2,
    padding: SIZES.medium,
    marginVertical: SIZES.base,
  },
  elevated: {
    ...SHADOWS.medium,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

export default Card; 