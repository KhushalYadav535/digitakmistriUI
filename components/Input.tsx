import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

const Input = ({
  label,
  error,
  leftIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  ...props
}: InputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputContainer,
        error && styles.inputError,
        props.editable === false && styles.inputDisabled,
      ]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={COLORS.textSecondary}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithIcon,
            inputStyle,
          ]}
          placeholderTextColor={COLORS.textSecondary}
          {...props}
        />
      </View>
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.medium,
  },
  label: {
    ...FONTS.body2,
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    backgroundColor: COLORS.input,
    paddingHorizontal: SIZES.medium,
  },
  input: {
    flex: 1,
    height: 48,
    color: COLORS.textPrimary,
    ...FONTS.body2,
  },
  inputWithIcon: {
    paddingLeft: SIZES.base,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputDisabled: {
    backgroundColor: COLORS.disabled,
  },
  leftIcon: {
    marginRight: SIZES.base,
  },
  errorText: {
    ...FONTS.body3,
    color: COLORS.error,
    marginTop: SIZES.base,
  },
});

export default Input; 