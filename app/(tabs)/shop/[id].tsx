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
  Linking,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../constants/config';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { getImageUrl } from '../../utils/imageUtils';

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

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadShopDetails();
    }
  }, [id]);

  useEffect(() => {
    const fetchUser = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserId(user.id || user._id || null);
      }
    };
    fetchUser();
  }, []);

  const hasReviewed = shop?.reviews?.some(r => r.user === userId);

  const handleSubmitReview = async () => {
    if (!reviewRating) {
      Alert.alert('Please select a rating');
      return;
    }
    setSubmittingReview(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${API_URL}/nearby-shops/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewComment('');
      loadShopDetails(); // Refresh reviews
      Alert.alert('Thank you!', 'Your review has been submitted.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const loadShopDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/nearby-shops/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShop(response.data);
    } catch (error: any) {
      console.error('Error loading shop details:', error);
      if (error.response?.status === 404) {
        setError('Shop not found');
      } else {
        setError('Failed to load shop details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (shop?.phone) {
      Linking.openURL(`tel:${shop.phone}`);
    }
  };

  const handleDirections = () => {
    if (shop) {
      const address = `${shop.address.street}, ${shop.address.city}, ${shop.address.state} - ${shop.address.pincode}`;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
      Linking.openURL(url);
    }
  };

  const handleEmail = () => {
    if (shop?.email) {
      Linking.openURL(`mailto:${shop.email}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading shop details...</Text>
      </View>
    );
  }

  if (error || !shop) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>{error || 'Shop not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadShopDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{shop.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shop Image */}
        {shop.images && shop.images.length > 0 && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getImageUrl(shop.images[0]) }}
              style={styles.shopImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Shop Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.shopName}>{shop.name}</Text>
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.rating}>{shop.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>
              ({shop.reviews.length} reviews)
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>{shop.description}</Text>

          {/* Address */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Address</Text>
            </View>
            <Text style={styles.addressText}>
              {`${shop.address.street}, ${shop.address.city}, ${shop.address.state} - ${shop.address.pincode}`}
            </Text>
          </View>

          {/* Services */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="construct" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Services</Text>
            </View>
            <View style={styles.servicesContainer}>
              {shop.services.map((service, index) => (
                <View key={index} style={styles.serviceTag}>
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Working Hours */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Working Hours</Text>
            </View>
            <View style={styles.workingHoursContainer}>
              {Object.entries(shop.workingHours).map(([day, hours]) => (
                <View key={day} style={styles.workingHourRow}>
                  <Text style={styles.dayText}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Text>
                  <Text style={styles.hoursText}>
                    {hours.open} - {hours.close}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            <View style={styles.contactContainer}>
              <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                <Ionicons name="call" size={16} color={COLORS.primary} />
                <Text style={styles.contactText}>{shop.phone}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                <Ionicons name="mail" size={16} color={COLORS.primary} />
                <Text style={styles.contactText}>{shop.email}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* --- REVIEWS SECTION --- */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
            </View>
            {shop.reviews.length === 0 && (
              <Text style={{ color: COLORS.textSecondary }}>No reviews yet.</Text>
            )}
            {shop.reviews.map((review, idx) => (
              <View key={idx} style={{ marginBottom: 16, backgroundColor: '#F8F9FB', borderRadius: 10, padding: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  {[1,2,3,4,5].map(star => (
                    <Ionicons
                      key={star}
                      name={star <= review.rating ? 'star' : 'star-outline'}
                      size={16}
                      color="#FFD700"
                    />
                  ))}
                  <Text style={{ marginLeft: 8, color: COLORS.textSecondary, fontSize: 12 }}>
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                  </Text>
                </View>
                <Text style={{ color: COLORS.textPrimary }}>{review.comment}</Text>
              </View>
            ))}
            {!hasReviewed && userId && (
              <TouchableOpacity
                style={{ backgroundColor: COLORS.primary, borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 8 }}
                onPress={() => setShowReviewModal(true)}
              >
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: 'bold', marginTop: 2 }}>Add Review</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Ionicons name="call" size={20} color={COLORS.white} />
          <Text style={styles.callButtonText}>Call Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.directionsButton} onPress={handleDirections}>
          <Ionicons name="navigate" size={20} color={COLORS.white} />
          <Text style={styles.directionsButtonText}>Directions</Text>
        </TouchableOpacity>
      </View>

      {/* Review Modal */}
      <Modal visible={showReviewModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: COLORS.textPrimary }}>Add Your Review</Text>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              {[1,2,3,4,5].map(star => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Ionicons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={32}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              placeholder="Write your review..."
              value={reviewComment}
              onChangeText={setReviewComment}
              style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, minHeight: 60, marginBottom: 16, color: COLORS.textPrimary }}
              multiline
            />
            <TouchableOpacity
              style={{ backgroundColor: COLORS.primary, borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 8 }}
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{submittingReview ? 'Submitting...' : 'Submit Review'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <Text style={{ color: COLORS.error, textAlign: 'center', fontSize: 15 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    flex: 1,
    fontSize: FONTS.h3.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SIZES.base,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.medium,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.large,
  },
  errorText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.medium,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.radius,
    marginTop: SIZES.medium,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    backgroundColor: COLORS.lightGray,
  },
  shopImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: SIZES.medium,
  },
  shopName: {
    fontSize: FONTS.h2.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  rating: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SIZES.base,
  },
  reviewCount: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginLeft: SIZES.base,
  },
  description: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SIZES.large,
  },
  section: {
    marginBottom: SIZES.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  sectionTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SIZES.base,
  },
  addressText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.base,
  },
  serviceTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
  },
  serviceText: {
    color: COLORS.white,
    fontSize: FONTS.body3.fontSize,
    fontWeight: '500',
  },
  workingHoursContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.medium,
  },
  workingHourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  hoursText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textSecondary,
  },
  contactContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.medium,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.base,
  },
  contactText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textPrimary,
    marginLeft: SIZES.base,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SIZES.medium,
  },
  callButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.radius,
  },
  callButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: SIZES.base,
  },
  directionsButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.radius,
  },
  directionsButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: SIZES.base,
  },
}); 