import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Animated } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';
import { getImageUrl } from '../utils/imageUtils';

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

const services = [
  {
    id: 'plumber',
    name: 'Plumber',
    image: require('../../assets/images/plumber.jpeg'),
  },
  {
    id: 'electrician',
    name: 'Electrician',
    image: require('../../assets/images/electrician.jpeg'),
  },
  {
    id: 'electronic',
    name: 'Electronic',
    image: require('../../assets/images/electrician.jpeg'),
  },
  {
    id: 'handpumpmistri',
    name: 'Handpump Mistri',
    image: require('../../assets/images/handpump.jpg'),
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const TabLayout = () => {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyShops, setNearbyShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation for fade-in
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) setUser(JSON.parse(userStr));
      } catch (e) {}
    };
    fetchUser();
  }, []);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadNearbyShops();
    }
  }, [userLocation]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadNearbyShops = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      console.log('Loading nearby shops with location:', userLocation);
      const response = await axios.get(`${API_URL}/nearby-shops`, {
        params: {
          latitude: userLocation?.latitude,
          longitude: userLocation?.longitude,
          radius: 5 // 5km radius
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Nearby shops loaded:', response.data);
      setNearbyShops(response.data);

      // Animate the shops appearing
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading nearby shops:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#F8FFAE", "#43C6AC", "#191654"]}
      style={styles.gradientBg}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.logoBrandContainer}>
            <Image source={require('../../assets/images/applogo.png')} style={styles.logo} />
            <Text style={styles.brand}>DIGITAL MISTRI</Text>
          </View>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          </View>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search"
            />
          </View>
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <LinearGradient 
                colors={["#43C6AC", "#191654"]} 
                style={{ width: 6, height: 28, borderRadius: 3, marginRight: 10 }}
              />
              <Text style={[styles.sectionTitle, { fontSize: 22, letterSpacing: 1 }]}>Services</Text>
            </View>
            <View style={styles.servicesGrid}>
              {services.map((service, idx) => (
                <Animated.View
                  key={service.id}
                  style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim }], width: '50%' }}
                >
                  <TouchableOpacity
                    style={[styles.serviceCard, { backgroundColor: 'rgba(255,255,255,0.65)', borderWidth: 1, borderColor: '#e0e0e0', shadowColor: '#43C6AC', shadowOpacity: 0.10, shadowRadius: 22, elevation: 6 }]}
                    onPressIn={() => Animated.spring(fadeAnim, { toValue: 1.08, useNativeDriver: true }).start()}
                    onPressOut={() => Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true }).start()}
                    onPress={() => router.push({ 
                      pathname: '/service-details', 
                      params: { serviceId: service.id } 
                    } as any)}
                    activeOpacity={0.88}
                  >
                    <BlurView intensity={30} tint="light" style={[styles.serviceImageWrapper, { borderWidth: 0 }]}>
                      <Image source={service.image} style={styles.serviceImage} />
                    </BlurView>
                    <Text style={[styles.serviceName, { color: '#191654', fontWeight: 'bold', fontSize: 18 }]}>{service.name}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby Shops</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/nearby-shops' } as any)}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopsContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : nearbyShops.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No shops found nearby</Text>
                </View>
              ) : (
                nearbyShops.map((shop) => (
                  <Animated.View
                    key={shop._id}
                    style={[
                      styles.shopCard,
                      { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
                    ]}
                  >
                    <View style={styles.shopImageWrapper}>
                      {shop.images && shop.images.length > 0 ? (
                        <Image source={{ uri: getImageUrl(shop.images[0]) }} style={styles.shopImage} />
                      ) : (
                        <View style={[styles.shopImage, styles.placeholderImage]}>
                          <Ionicons name="business" size={40} color={COLORS.textSecondary} />
                        </View>
                      )}
                      <LinearGradient
                        colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.05)"]}
                        style={styles.shopImageOverlay}
                      />
                    </View>
                    <View style={styles.shopInfo}>
                      <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>{shop.rating.toFixed(1)}</Text>
                        <Text style={styles.reviewsText}>({shop.reviews.length} reviews)</Text>
                      </View>
                      <Text style={styles.shopAddress} numberOfLines={2}>
                        {`${shop.address.street}, ${shop.address.city}`}
                      </Text>
                      <TouchableOpacity 
                        style={styles.bookNowBtn}
                        onPress={() => router.push({ pathname: `/shop/${shop._id}` } as any)}
                      >
                        <Text style={styles.bookNowText}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                ))
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </LinearGradient>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginTop: 8,
  },
  gradientBg: {
    flex: 1,
  },
  logoBrandContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  greetingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  serviceCard: {
    alignItems: 'center',
    marginBottom: 24,
    marginHorizontal: 8,
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
    marginTop: 8,
  },
  serviceImageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginBottom: 12,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 6,
    textAlign: 'center',
  },
  shopsContainer: {
    paddingLeft: 20,
  },
  shopCard: {
    width: 280,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginRight: SIZES.medium,
    overflow: 'hidden',
    ...SHADOWS.medium
  },
  shopImageWrapper: {
    position: 'relative',
    height: 160
  },
  shopImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  placeholderImage: {
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  shopInfo: {
    padding: SIZES.medium
  },
  shopName: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base
  },
  ratingText: {
    marginLeft: 4,
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary
  },
  reviewsText: {
    marginLeft: 4,
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary
  },
  shopAddress: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SIZES.medium
  },
  bookNowBtn: {
    backgroundColor: COLORS.primary,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    alignItems: 'center'
  },
  bookNowText: {
    color: COLORS.white,
    fontSize: FONTS.body3.fontSize,
    fontWeight: '500'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.large
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.large
  },
  emptyText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  shopImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});

export default TabLayout;