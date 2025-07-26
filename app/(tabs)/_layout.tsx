import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { COLORS } from '../constants/theme';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../constants/config';


export default function TabLayout() {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        
        if (!token || !userStr) {
          console.log('No token or user data found, skipping notification count fetch');
          return;
        }
        
        const user = JSON.parse(userStr);
        const userModel = user.role === 'admin' ? 'Admin' : user.role === 'worker' ? 'Worker' : 'Customer';
        
        console.log('Fetching notification count for:', userModel);
        
                // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          const response = await axios.get(`${API_URL}/notifications/unread-count?userModel=${userModel}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
            timeout: 10000, // 10 second timeout
          });
          
          clearTimeout(timeoutId);
          setNotificationCount(response.data.unreadCount || 0);
          console.log('Notification count updated:', response.data.unreadCount || 0);
          
        } catch (error: any) {
          // Clear timeout if it was set
          clearTimeout(timeoutId);
          
          // Handle different types of errors
          if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
            console.log('Notification count request timed out');
          } else if (error.response) {
            // Server responded with error status
            console.log('Notification count server error:', error.response.status, error.response.data);
          } else if (error.request) {
            // Network error - no response received
            console.log('Notification count network error - no response received');
          } else {
            // Other errors
            console.log('Notification count error:', error.message);
          }
          
          // Don't show error to user for notification count, just log it
          // This prevents the app from being unusable due to notification count issues
        }
      } catch (error: any) {
        console.log('Error in notification count fetch:', error.message);
      }
    };

    // Initial fetch
    fetchNotificationCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(() => {
      fetchNotificationCount();
    }, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.lightGray,
          paddingTop: 12,
          paddingBottom: 12,
          height: 85,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTitleStyle: {
          color: COLORS.textPrimary,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nearby-shops"
        options={{
          title: 'Shops',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={24} color={color} />
          ),
          tabBarBadge: notificationCount > 0 ? notificationCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.error,
            color: COLORS.white,
            fontSize: 10,
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
      {/* Hide dynamic routes from tab bar */}
      <Tabs.Screen name="payment" options={{ href: null }} />
      <Tabs.Screen name="payment-success" options={{ href: null }} />
      <Tabs.Screen name="service-details" options={{ href: null }} />
      <Tabs.Screen name="booking" options={{ href: null }} />
      <Tabs.Screen name="shop" options={{ href: null }} />
      <Tabs.Screen name="booking-status" options={{ href: null }} />
    </Tabs>
  );
} 