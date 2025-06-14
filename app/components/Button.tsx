import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';

type IconName = 'call-outline' | 'chatbubble-outline' | 'person-outline' | 'location-outline' | 'calendar-outline' | 'time-outline';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: IconName;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = {
      borderRadius: SIZES.base * 2,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.medium,
      ...styles[size],
      ...(disabled && styles.disabled),
    } as ViewStyle;

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: COLORS.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: COLORS.secondary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: COLORS.primary,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = {
      ...FONTS.body3,
      ...styles[`${size}Text`],
    } as TextStyle;

    if (variant === 'outline') {
      return {
        ...baseStyle,
        color: COLORS.primary,
      };
    }

    return {
      ...baseStyle,
      color: COLORS.white,
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={20}
              color={variant === 'outline' ? COLORS.primary : COLORS.white}
              style={styles.icon}
            />
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  small: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.medium,
  },
  medium: {
    paddingVertical: SIZES.base * 1.5,
    paddingHorizontal: SIZES.large,
  },
  large: {
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.xlarge,
  },
  smallText: {
    ...FONTS.body4,
    fontWeight: '600',
  },
  mediumText: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  largeText: {
    ...FONTS.body2,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  icon: {
    marginRight: SIZES.base,
  } as TextStyle,
});

export default Button; 