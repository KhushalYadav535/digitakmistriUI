import { Stack } from "expo-router";
import { COLORS } from "./constants/theme";

// Define the route types
declare global {
  namespace ReactNavigation {
    interface RootParamList {
      "/": undefined;
      "/booking-details/[id]": { id: string };
      "/bookings": undefined;
      "/profile": undefined;
      "/edit-profile": undefined;
      "/change-password": undefined;
      "/worker-dashboard": undefined;
      "/worker-profile": undefined;
      "/worker-edit-profile": undefined;
      "/worker-schedule": undefined;
      "/worker-earnings": undefined;
      "/worker-reviews": undefined;
      "/worker-notifications": undefined;
      "/worker-settings": undefined;
      "/help-support": undefined;
    }
  }
}

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: COLORS.textPrimary,
        },
        headerTintColor: COLORS.textPrimary,
      }}
    />
  );
}
