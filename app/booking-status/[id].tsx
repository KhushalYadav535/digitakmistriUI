import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../constants/config';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { SHADOWS } from '../constants/theme';

interface Booking {
  _id: string;
  serviceType: string;
  serviceTitle: string;
  bookingDate: string;
  bookingTime: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  phone: string;
  amount: number;
  distance: number;
  distanceCharge: number;
  totalAmount: number;
  customerCoordinates?: {
    latitude: number;
    longitude: number;
    displayName?: string;
    accuracy?: number;
  };
  status: string;
  worker?: {
    name: string;
    phone: string;
  };
  createdAt: string;
  rating?: number;
  review?: string;
}

const statusColors: Record<string, string> = {
  Pending: COLORS.warning,
  Confirmed: COLORS.info,
  'Worker Assigned': COLORS.info,
  Accepted: COLORS.success,
  Rejected: COLORS.error,
  'In Progress': COLORS.primary,
  Completed: COLORS.success,
  Cancelled: COLORS.error,
};

const BookingStatusScreen = () => {
  const { id } = useLocalSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchBooking = async () => {
    if (!id) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Please login to view booking status');
        router.push('/(auth)/login' as any);
        return;
      }
      const res = await axios.get(`${API_URL}/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooking(res.data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 401) {
        setError('Please login to view booking status');
        router.push('/(auth)/login' as any);
      } else {
        setError(axiosError.response?.data?.message || 'Failed to fetch booking');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBooking();
      const interval = setInterval(fetchBooking, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    } else {
      setError('No booking ID provided');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading booking status...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchBooking} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!booking) return null;

  const formatAddress = (address: Booking['address']) => {
    return `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  // Submit review to backend
  const handleSubmitReview = async () => {
    if (!reviewRating) {
      setReviewError('Please select a rating');
      return;
    }
    setSubmittingReview(true);
    setReviewError('');
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${API_URL}/bookings/${booking?._id}/review`, {
        rating: reviewRating,
        review: reviewComment,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewComment('');
      fetchBooking(); // Refresh booking to show review is done
      Alert.alert('Thank you!', 'Your review has been submitted.');
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Booking Status</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Service</Text>
          <Text style={styles.value}>{booking.serviceTitle}</Text>
          <Text style={styles.subValue}>{booking.serviceType}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{formatAddress(booking.address)}</Text>
          {booking.customerCoordinates?.displayName && (
            <Text style={styles.resolvedAddress}>
              Resolved: {booking.customerCoordinates.displayName}
            </Text>
          )}
          {booking.customerCoordinates?.accuracy && (
            <Text style={styles.accuracyText}>
              Location Accuracy: {Math.round(booking.customerCoordinates.accuracy * 100)}%
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{booking.phone}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Service Amount</Text>
          <Text style={styles.value}>₹{booking.amount}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Distance</Text>
          <Text style={styles.value}>{booking.distance} km from Janghai Bazar</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Distance Charge</Text>
          <Text style={styles.value}>₹{booking.distanceCharge}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Total Amount</Text>
          <Text style={[styles.value, styles.totalAmount]}>₹{booking.totalAmount}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[booking.status] }]}>
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>
        </View>

        {booking.worker && (
          <View style={styles.section}>
            <Text style={styles.label}>Worker Assigned</Text>
            <Text style={styles.value}>{booking.worker.name}</Text>
            <Text style={styles.subValue}>{booking.worker.phone}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Booking Date & Time</Text>
          <Text style={styles.value}>
            {new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Created At</Text>
          <Text style={styles.value}>{new Date(booking.createdAt).toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={fetchBooking}>
          <Text style={styles.refreshButtonText}>Refresh Status</Text>
        </TouchableOpacity>

        {booking.worker && booking.status === 'Completed' && (
          <View style={{ marginBottom: 24 }}>
            {typeof (booking as any).rating === 'number' ? (
              <View style={{ alignItems: 'center', marginVertical: 8 }}>
                <Text style={{ color: COLORS.success, fontWeight: 'bold', fontSize: 16 }}>You rated this worker:</Text>
                <View style={{ flexDirection: 'row', marginVertical: 6 }}>
                  {[1,2,3,4,5].map(star => (
                    <Ionicons
                      key={star}
                      name={star <= (booking as any).rating ? 'star' : 'star-outline'}
                      size={28}
                      color={COLORS.warning}
                    />
                  ))}
                </View>
                {Boolean((booking as any).review) && (
                  <Text style={{ color: COLORS.textSecondary, fontStyle: 'italic' }}>
                    "{(booking as any).review}"
                  </Text>
                )}
              </View>
            ) : (
              <Button
                title="Review Worker"
                onPress={() => setShowReviewModal(true)}
                variant="primary"
                style={{ marginTop: 8 }}
              />
            )}
          </View>
        )}
      </View>
      {/* Review Modal */}
      <Modal visible={showReviewModal} animationType="slide" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.title}>Rate Your Worker</Text>
            <View style={modalStyles.starsRow}>
              {[1,2,3,4,5].map(star => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Ionicons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={36}
                    color={COLORS.warning}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              placeholder="Write your review..."
              value={reviewComment}
              onChangeText={setReviewComment}
              style={modalStyles.input}
              multiline
            />
            {reviewError ? <Text style={modalStyles.errorText}>{reviewError}</Text> : null}
            <Button
              title={submittingReview ? 'Submitting...' : 'Submit Review'}
              onPress={handleSubmitReview}
              loading={submittingReview}
              style={modalStyles.submitButton}
            />
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <Text style={modalStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: SIZES.padding,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  section: {
    marginBottom: SIZES.padding,
  },
  label: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  value: {
    ...FONTS.body1,
    color: COLORS.text,
    marginBottom: 2,
  },
  subValue: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderRadius: SIZES.radius,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
  loadingText: {
    ...FONTS.body1,
    color: COLORS.text,
    marginTop: SIZES.base,
  },
  errorText: {
    ...FONTS.body1,
    color: COLORS.error,
    marginBottom: SIZES.base,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    ...FONTS.body2,
    color: COLORS.white,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.padding,
  },
  refreshButtonText: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  resolvedAddress: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  accuracyText: {
    ...FONTS.body4,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
    width: '85%',
    ...SHADOWS.medium,
    alignItems: 'center',
  },
  title: {
    ...FONTS.h3,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: 10,
    minHeight: 60,
    width: '100%',
    marginBottom: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.input,
  },
  submitButton: {
    width: '100%',
    marginBottom: 8,
  },
  cancelText: {
    color: COLORS.error,
    textAlign: 'center',
    fontSize: 15,
    marginTop: 4,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default BookingStatusScreen; 