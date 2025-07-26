import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../constants/config';
import { COLORS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { FONTS, SIZES, SHADOWS } from '../../constants/theme';

const BookingStatusScreen = () => {
  const { id } = useLocalSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    console.log('📱 BookingStatusScreen mounted');
    console.log('📋 Booking ID:', id);
    console.log('🔗 API URL:', API_URL);
    
    const fetchBooking = async () => {
      try {
        console.log('🔄 Starting to fetch booking...');
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        console.log('🔑 Token available:', !!token);
        
        if (!token) {
          console.error('❌ No token found');
          setError('Token missing. Please login again.');
          setLoading(false);
          return;
        }
        
        const url = `${API_URL}/bookings/${id}`;
        console.log('🌐 Fetching from URL:', url);
        
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Booking API response received');
        console.log('📊 Booking data:', res.data);
        setBooking(res.data);
        setError('');
      } catch (e: any) {
        console.error('❌ Failed to load booking details:', e?.response?.data || e);
        console.error('🔍 Error details:', {
          status: e?.response?.status,
          statusText: e?.response?.statusText,
          data: e?.response?.data
        });
        const backendMsg = e?.response?.data?.message;
        setError(backendMsg ? `Error: ${backendMsg}` : 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchBooking();
    } else {
      console.error('❌ No booking ID provided');
      setError('No booking ID provided');
      setLoading(false);
    }
    
    return () => {
      console.log('📱 BookingStatusScreen unmounting');
    };
  }, [id]);

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
      // Re-fetch booking to show review is done
      const res = await axios.get(`${API_URL}/bookings/${booking?._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooking(res.data);
      Alert.alert('Thank you!', 'Your review has been submitted.');
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading booking details...</Text>
    </View>
  );
  
  if (error) return (
    <View style={styles.center}>
      <Text style={styles.error}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton} 
        onPress={() => {
          setError('');
          setLoading(true);
          // Re-fetch the booking
          const fetchBooking = async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) {
                setError('Token missing. Please login again.');
                setLoading(false);
                return;
              }
              const res = await axios.get(`${API_URL}/bookings/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setBooking(res.data);
              setError('');
            } catch (e: any) {
              const backendMsg = e?.response?.data?.message;
              setError(backendMsg ? `Error: ${backendMsg}` : 'Failed to load booking details');
            } finally {
              setLoading(false);
            }
          };
          fetchBooking();
        }}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
  
  if (!booking) return (
    <View style={styles.center}>
      <Text style={styles.error}>No booking found</Text>
      <TouchableOpacity 
        style={styles.retryButton} 
        onPress={() => router.back()}
      >
        <Text style={styles.retryButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Booking Details</Text>
      <Text style={styles.label}>Service:</Text>
      <Text style={styles.value}>{booking.serviceTitle}</Text>
      <Text style={styles.label}>Status:</Text>
      <Text style={styles.value}>{booking.status}</Text>
      <Text style={styles.label}>Date & Time:</Text>
      <Text style={styles.value}>{new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}</Text>
      <Text style={styles.label}>Address:</Text>
      <Text style={styles.value}>{booking.address?.street}, {booking.address?.city}, {booking.address?.state} - {booking.address?.pincode}</Text>
      <Text style={styles.label}>Worker:</Text>
      <Text style={styles.value}>{booking.worker ? `${booking.worker.name} (${booking.worker.phone})` : 'Not assigned'}</Text>
      <Text style={styles.label}>Created At:</Text>
      <Text style={styles.value}>{new Date(booking.createdAt).toLocaleString()}</Text>
      {booking.cancelledAt && (
        <>
          <Text style={styles.label}>Cancelled At:</Text>
          <Text style={styles.value}>{new Date(booking.cancelledAt).toLocaleString()}</Text>
        </>
      )}
      {booking.cancellationReason && (
        <>
          <Text style={styles.label}>Cancellation Reason:</Text>
          <Text style={styles.value}>{booking.cancellationReason}</Text>
        </>
      )}
      {booking.worker && booking.status === 'Completed' && (
        <View style={{ marginBottom: 24 }}>
          {typeof booking.rating === 'number' ? (
            <View style={{ alignItems: 'center', marginVertical: 8 }}>
              <Text style={{ color: COLORS.success, fontWeight: 'bold', fontSize: 16 }}>You rated this worker:</Text>
              <View style={{ flexDirection: 'row', marginVertical: 6 }}>
                {[1,2,3,4,5].map(star => (
                  <Ionicons
                    key={star}
                    name={star <= booking.rating ? 'star' : 'star-outline'}
                    size={28}
                    color={COLORS.warning}
                  />
                ))}
              </View>
              {Boolean(booking.review) && (
                <Text style={{ color: COLORS.textSecondary, fontStyle: 'italic' }}>
                  "{booking.review}"
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
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: COLORS.primary },
  label: { fontWeight: 'bold', marginTop: 12, color: COLORS.textSecondary },
  value: { fontSize: 16, color: COLORS.textPrimary },
  error: { color: COLORS.error, fontSize: 16 },
  loadingText: { marginTop: 16, fontSize: 16, color: COLORS.textSecondary },
  retryButton: { 
    marginTop: 16, 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8 
  },
  retryButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
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