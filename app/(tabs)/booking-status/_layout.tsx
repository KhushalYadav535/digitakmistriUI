import { Stack } from 'expo-router';
import { COLORS } from '../../constants/theme';

export default function BookingStatusLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTitleStyle: {
          color: COLORS.textPrimary,
          fontSize: 18,
          fontWeight: '600',
        },
        headerTintColor: COLORS.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Booking Status',
          headerShown: true,
        }}
      />
    </Stack>
  );
} 