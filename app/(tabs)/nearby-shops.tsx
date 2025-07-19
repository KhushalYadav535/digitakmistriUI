import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import { API_URL } from '../constants/config';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { getImageUrl } from '../utils/imageUtils';
import { useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';

interface Shop {
  _id: string;
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  phone: string;
  email: string;
  services: string[];
  workingHours: {
    [key: string]: { open: string; close: string };
  };
  images: string[];
  rating: number;
  reviews: any[];
}

export default function NearbyShopsScreen() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const { highlightShopId } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadShops();
    }
  }, [userLocation]);

  useEffect(() => {
    if (highlightShopId && shops.length > 0) {
      // Find index of the shop to highlight
      const idx = shops.findIndex(s => s._id === highlightShopId);
      if (idx !== -1 && scrollViewRef.current) {
        setHighlightedId(highlightShopId as string);
        // Scroll to the shop card
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: idx * 260, animated: true });
        }, 300);
        // Remove highlight after 4 seconds
        setTimeout(() => setHighlightedId(null), 4000);
      }
    }
  }, [highlightShopId, shops]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to find nearby shops');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const loadShops = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      console.log('Loading shops with location:', userLocation);
      const response = await axios.get(`${API_URL}/nearby-shops`, {
        params: {
          latitude: userLocation?.latitude,
          longitude: userLocation?.longitude,
          radius: 5 // 5km radius
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Shops loaded:', response.data);
      setShops(response.data);
    } catch (error: any) {
      console.error('Error loading shops:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        Alert.alert('Error', `Failed to load shops: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        Alert.alert('Error', 'No response from server. Please check your connection.');
      } else {
        console.error('Error message:', error.message);
        Alert.alert('Error', 'Failed to load shops. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getLocation();
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (shop: Shop) => {
    const address = `${shop.address.street}, ${shop.address.city}, ${shop.address.state} - ${shop.address.pincode}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleViewDetails = (shop: Shop) => {
    router.push({
      pathname: '/(tabs)/shop/[id]' as any,
      params: { id: shop._id }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Finding nearby shops...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Shops</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ref={scrollViewRef}
      >
        {shops.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No shops found nearby</Text>
          </View>
        ) : (
          shops.map(shop => (
            <View
              key={shop._id}
              style={[styles.shopCard, highlightedId === shop._id && styles.highlightedShopCard]}
            >
              {shop.images && shop.images.length > 0 && (
                <Image
                  source={{ uri: getImageUrl(shop.images[0]) }}
                  style={styles.shopImage}
                />
              )}
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <Text style={styles.shopDescription}>{shop.description}</Text>
                <Text style={styles.shopAddress}>
                  {`${shop.address.street}, ${shop.address.city}, ${shop.address.state} - ${shop.address.pincode}`}
                </Text>
                <View style={styles.workingHours}>
                  <Text style={styles.workingHoursTitle}>Working Hours:</Text>
                  {Object.entries(shop.workingHours).map(([day, hours]) => (
                    <Text key={day} style={styles.workingHoursText}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}: {hours.open} - {hours.close}
                    </Text>
                  ))}
                </View>
                <View style={styles.services}>
                  <Text style={styles.servicesTitle}>Services:</Text>
                  {shop.services.map((service, index) => (
                    <Text key={index} style={styles.serviceText}>
                      • {service}
                    </Text>
                  ))}
                </View>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rating}>{shop.rating.toFixed(1)}</Text>
                  <Text style={styles.reviewCount}>
                    ({shop.reviews.length} reviews)
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.callButton]}
                    onPress={() => handleCall(shop.phone)}
                  >
                    <Ionicons name="call" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.directionsButton]}
                    onPress={() => handleDirections(shop)}
                  >
                    <Ionicons name="navigate" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Directions</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.viewDetailsButton]}
                    onPress={() => handleViewDetails(shop)}
                  >
                    <Ionicons name="information-circle" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: SIZES.medium,
    color: COLORS.textSecondary
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  title: {
    fontSize: FONTS.h2.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary
  },
  scrollView: {
    flex: 1,
    padding: SIZES.medium
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.large
  },
  emptyText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  shopCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.medium,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  shopImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover'
  },
  shopInfo: {
    padding: SIZES.medium
  },
  shopName: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base
  },
  shopDescription: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base
  },
  shopAddress: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base
  },
  workingHours: {
    marginBottom: SIZES.base
  },
  workingHoursTitle: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base / 2
  },
  workingHoursText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  services: {
    marginBottom: SIZES.base
  },
  servicesTitle: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base / 2
  },
  serviceText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.medium
  },
  rating: {
    marginLeft: 4,
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.base,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    minHeight: 40,
  },
  callButton: {
    backgroundColor: COLORS.primary
  },
  directionsButton: {
    backgroundColor: COLORS.info
  },
  viewDetailsButton: {
    backgroundColor: COLORS.secondary
  },
  actionButtonText: {
    color: COLORS.white,
    marginLeft: SIZES.base / 2,
    fontSize: FONTS.body4.fontSize,
    fontWeight: '500'
  },
  highlightedShopCard: {
    borderWidth: 2,
    borderColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
}); 