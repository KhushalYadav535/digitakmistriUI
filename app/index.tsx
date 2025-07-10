import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { COLORS } from './constants/theme';

export default function Index() {
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    console.log('Index useEffect - isAuthenticated:', isAuthenticated, 'user:', user, 'isLoading:', isLoading);
    
    if (!isLoading) {
      if (isAuthenticated && user) {
        console.log('User is authenticated, redirecting to:', user.role);
        // User is logged in, redirect based on role
        switch (user.role) {
          case 'admin':
            router.replace('/(admin)/dashboard');
            break;
          case 'worker':
            router.replace('/(worker)/dashboard');
            break;
          case 'customer':
            router.replace('/(tabs)');
            break;
          default:
            router.replace('/(auth)/role-selection');
        }
      } else {
        console.log('User is not authenticated, going to language selection');
        // User is not logged in, go to language selection
        router.replace('/(auth)/language');
      }
    }
  }, [isAuthenticated, user, isLoading]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: COLORS.background 
      }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return null;
}
