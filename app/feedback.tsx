import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';

const FeedbackScreen = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = (value: number) => setRating(value);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.back();
    }, 1200);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback</Text>
        <View style={styles.headerRight} />
      </View>
      <Card variant="elevated" style={styles.card}>
        <Text style={styles.label}>Rate Your Experience</Text>
        <View style={styles.ratingRow}>
          {[1,2,3,4,5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRating(star)}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={32}
                color={COLORS.warning}
                style={styles.star}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Comments (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Write your feedback..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
        />
        <Button
          title="Submit Feedback"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.submitButton}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: { width: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONTS.h4.fontSize, fontWeight: '600', color: COLORS.textPrimary },
  headerRight: { width: 40 },
  card: { margin: SIZES.medium, padding: SIZES.medium },
  label: { fontSize: FONTS.body2.fontSize, color: COLORS.textPrimary, marginBottom: SIZES.base },
  ratingRow: { flexDirection: 'row', marginBottom: SIZES.medium },
  star: { marginHorizontal: 4 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    padding: SIZES.base,
    minHeight: 80,
    marginBottom: SIZES.medium,
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  submitButton: { marginTop: SIZES.medium },
});

export default FeedbackScreen;
