import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text
        style={[
          styles.label,
          {
            color: error ? COLORS.error : isFocused ? COLORS.primary : COLORS.textSecondary,
          },
          labelStyle,
        ]}
      >
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: error
              ? COLORS.error
              : isFocused
              ? COLORS.primary
              : COLORS.border,
          },
          inputStyle,
        ]}
        placeholderTextColor={COLORS.textSecondary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.medium,
  },
  label: {
    fontSize: FONTS.body4.fontSize,
    fontWeight: '400',
    marginBottom: SIZES.base / 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: SIZES.base,
    paddingHorizontal: SIZES.medium,
    fontSize: FONTS.body3.fontSize,
    fontWeight: '400',
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  errorText: {
    fontSize: FONTS.body4.fontSize,
    fontWeight: '400',
    color: COLORS.error,
    marginTop: SIZES.base / 2,
  },
});

export default Input; 