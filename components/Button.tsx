import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'success' | 'danger';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: COLORS.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: COLORS.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          paddingVertical: 0,
        };
      case 'success':
        return {
          backgroundColor: COLORS.success,
        };
      case 'danger':
        return {
          backgroundColor: COLORS.error,
        };
      default:
        return {
          backgroundColor: COLORS.primary,
        };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'outline':
      case 'text':
        return COLORS.primary;
      default:
        return COLORS.white;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: SIZES.base,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
  },
  text: {
    ...FONTS.body2,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button; 