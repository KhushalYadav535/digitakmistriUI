import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Card from '../../components/Card';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { API_URL } from '../constants/config';
import { useLanguage } from '../context/LanguageContext';

interface Rating {
  id: string;
  rating: number;
  review?: string;
  serviceTitle: string;
  customerName: string;
  completedAt: string;
  amount: number;
}

interface RatingStats {
  totalRatings: number;
  averageRating: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  reviewCount: number;
}

interface RatingsData {
  workerId: string;
  workerName: string;
  stats: RatingStats;
  recentReviews: Rating[];
  allRatings: Rating[];
}

const WorkerRatingsScreen = () => {
  const { t } = useLanguage();
  const [ratingsData, setRatingsData] = useState<RatingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error(t('worker.authentication_token_not_found'));
      }

      const response = await fetch(`${API_URL}/worker/ratings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      setRatingsData(data);
    } catch (err: any) {
      console.error('Error fetching ratings:', err);
      setError(err.message || t('worker.failed_to_fetch_ratings'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchRatings();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const renderStars = (rating: number, size: number = 20) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={COLORS.warning}
          />
        ))}
      </View>
    );
  };

  const renderRatingCard = (rating: Rating) => (
    <Card key={rating.id} style={styles.ratingCard}>
      <View style={styles.ratingHeader}>
        <View style={styles.ratingInfo}>
          <Text style={styles.serviceTitle}>{rating.serviceTitle}</Text>
          <Text style={styles.customerName}>{t('worker.customer_label')}: {rating.customerName}</Text>
          <Text style={styles.ratingDate}>
            {new Date(rating.completedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.ratingScore}>
          {renderStars(rating.rating)}
          <Text style={styles.ratingValue}>{rating.rating}/5</Text>
        </View>
      </View>
      {rating.review && (
        <View style={styles.reviewContainer}>
          <Text style={styles.reviewText}>"{rating.review}"</Text>
        </View>
      )}
      <View style={styles.ratingFooter}>
        <Text style={styles.amountText}>Amount: ₹{rating.amount}</Text>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('worker.loading_ratings')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchRatings}
        >
          <Text style={styles.retryButtonText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!ratingsData || ratingsData.stats.totalRatings === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>{t('worker.no_ratings_yet')}</Text>
          <Text style={styles.emptyText}>
            {t('worker.no_ratings_message')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('worker.your_ratings')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Overall Rating Summary */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.overallRating}>
            <Text style={styles.overallRatingValue}>
              {ratingsData.stats.averageRating.toFixed(1)}
            </Text>
            {renderStars(Math.round(ratingsData.stats.averageRating), 24)}
            <Text style={styles.totalRatings}>
              {ratingsData.stats.totalRatings} {t('worker.total_ratings')}
            </Text>
          </View>
        </View>

        {/* Rating Breakdown */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>{t('worker.rating_breakdown')}</Text>
          {[5, 4, 3, 2, 1].map((rating) => (
            <View key={rating} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{rating}★</Text>
              <View style={styles.breakdownBar}>
                <View 
                  style={[
                    styles.breakdownBarFill, 
                    { 
                      width: `${(ratingsData.stats.ratingBreakdown[rating as keyof typeof ratingsData.stats.ratingBreakdown] || 0) / ratingsData.stats.totalRatings * 100}%` 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.breakdownCount}>
                {ratingsData.stats.ratingBreakdown[rating as keyof typeof ratingsData.stats.ratingBreakdown] || 0}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Recent Reviews */}
      {ratingsData.recentReviews.length > 0 && (
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>{t('worker.recent_reviews')}</Text>
          {ratingsData.recentReviews.map(renderRatingCard)}
        </View>
      )}

      {/* All Ratings */}
      <View style={styles.allRatingsSection}>
        <Text style={styles.sectionTitle}>{t('worker.all_ratings')} ({ratingsData.allRatings.length})</Text>
        {ratingsData.allRatings.map(renderRatingCard)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  summaryCard: {
    margin: 20,
    padding: 20,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  overallRating: {
    alignItems: 'center',
  },
  overallRatingValue: {
    fontSize: FONTS.h1.fontSize,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  totalRatings: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  breakdownContainer: {
    marginTop: 20,
  },
  breakdownTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    marginBottom: 15,
    color: COLORS.text,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    width: 30,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 4,
  },
  breakdownCount: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    width: 30,
    textAlign: 'right',
  },
  reviewsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  allRatingsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    marginBottom: 15,
    color: COLORS.text,
  },
  ratingCard: {
    marginBottom: 15,
    padding: 15,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  ratingInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  customerName: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  ratingDate: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
  },
  ratingScore: {
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
  },
  reviewContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  reviewText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  ratingFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  amountText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.success,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textSecondary,
    marginTop: 20,
  },
  errorText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
  },
});

export default WorkerRatingsScreen; 