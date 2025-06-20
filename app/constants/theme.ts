import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',
  background: '#F2F2F7',
  white: '#FFFFFF',
  black: '#000000',
  text: '#000000',
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  lightGray: '#E5E5EA',
  gray: '#8E8E93',
  darkGray: '#636366',
  card: '#FFFFFF',
  input: '#FFFFFF',
  placeholder: '#8E8E93',
  disabled: '#C7C7CC',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const SIZES = {
  base: 8,
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
  xxlarge: 32,
  padding: 16,
  radius: 8,
};

export const FONTS = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  body3: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  body4: {
    fontSize: 10,
    fontWeight: '400',
  },
  body5: {
    fontSize: 8,
    fontWeight: '400',
  },
} as const;

export const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
  light: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
};

export default { COLORS, SIZES, FONTS, SHADOWS }; 