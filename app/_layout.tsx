import { Stack } from "expo-router";
import { COLORS } from "./constants/theme";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";

// Define the route types
declare global {
  namespace ReactNavigation {
    interface RootParamList {
      "/": undefined;
      "/booking-details/[id]": { id: string };
      "/bookings": undefined;
      "/booking-status/[id]": { id: string };
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
      "/add-nearby-shop": undefined;
    }
  }
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            header: () => null,
            headerTitle: '',
            headerBackVisible: false,
            animation: 'none',
            presentation: 'transparentModal',
            contentStyle: {
              backgroundColor: COLORS.background,
            },
          }}
        />
      </LanguageProvider>
    </AuthProvider>
  );
}
