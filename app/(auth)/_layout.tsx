import { Stack } from 'expo-router';
import { COLORS } from '../constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
        animation: 'none',
        presentation: 'transparentModal',
        header: () => null,
        headerTitle: '',
        headerBackVisible: false,
      }}
    />
  );
} 