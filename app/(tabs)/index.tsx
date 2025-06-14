import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Animated } from 'react-native';

const services = [
  {
    id: 'handpump',
    name: 'Handpump Mistri',
    image: require('../../assets/images/handpump.jpg'),
  },
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
    image: require('../../assets/images/electrician.jpeg'), // Placeholder, update if you have a separate image
  },
];

const nearbyShops = [
  {
    id: '1',
    name: 'City Plumbing Services',
    rating: 4.8,
    reviews: 128,
    distance: '0.8 km',
    image: 'https://via.placeholder.com/100',
  },
  {
    id: '2',
    name: 'Quick Fix Electrical',
    rating: 4.6,
    reviews: 95,
    distance: '1.2 km',
    image: 'https://via.placeholder.com/100',
  },
  {
    id: '3',
    name: 'Pro Painters',
    rating: 4.9,
    reviews: 156,
    distance: '1.5 km',
    image: 'https://via.placeholder.com/100',
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const HomeScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Animation for fade-in
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
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

  return (
    <LinearGradient
      colors={["#ff90d6", "#f3b6f7", "#8ee7f7"]}
      style={styles.gradientBg}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.logoBrandContainer}>
          <Image source={require('../../assets/images/applogo.jpeg')} style={styles.logo} />
          <Text style={styles.brand}>DIGITAL MISTRI</Text>
        </View>
        {/* Featured Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient colors={["#ffecd2", "#fcb69f"]} style={styles.bannerBg}>
            <Ionicons name="pricetag" size={28} color="#ff90d6" style={{ marginRight: 10 }} />
            <Text style={styles.bannerText}>Get 20% off on your first service!</Text>
          </LinearGradient>
        </View>
        <View style={styles.header}>
          <Ionicons name="person-circle" size={36} color={COLORS.primary} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service, idx) => (
              <Animated.View
                key={service.id}
                style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim }], width: '50%' }}
              >
                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => router.push({ pathname: `/service/${service.id}` } as any)}
                  activeOpacity={0.85}
                >
                  <View style={styles.serviceImageWrapper}>
                    <Image source={service.image} style={styles.serviceImage} />
                  </View>
                  <Text style={styles.serviceName}>{service.name}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Shops</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/nearby' } as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopsContainer}>
            {nearbyShops.map((shop, idx) => (
              <Animated.View
                key={shop.id}
                style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim }] }}
              >
                <BlurView intensity={40} tint="light" style={styles.shopCard}>
                  <View style={styles.shopImageWrapper}>
                    <Image source={{ uri: shop.image }} style={styles.shopImage} />
                    <LinearGradient
                      colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.05)"]}
                      style={styles.shopImageOverlay}
                    />
                  </View>
                  <View style={styles.shopInfo}>
                    <Text style={styles.shopName}>{shop.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.ratingText}>{shop.rating}</Text>
                      <Text style={styles.reviewsText}>({shop.reviews} reviews)</Text>
                    </View>
                    <Text style={styles.distanceText}>{shop.distance}</Text>
                    <TouchableOpacity style={styles.bookNowBtn} onPress={() => router.push({ pathname: `/shop/${shop.id}` } as any)}>
                      <Text style={styles.bookNowText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  gradientBg: {
    flex: 1,
  },
  logoBrandContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 8,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 4,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  brand: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
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
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginRight: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
    marginTop: 4,
  },
  shopImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 90,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  shopImage: {
    width: '100%',
    height: 90,
    borderRadius: 14,
    marginBottom: 8,
  },
  shopInfo: {
    padding: 16,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  bannerContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerBg: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  bannerText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  shopImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  bookNowBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  bookNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default HomeScreen;