import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewToken,
} from 'react-native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to Digital Village',
    description: 'Connect with skilled workers in your village for all your service needs',
    image: require('../../assets/images/applogo.png'),
  },
  {
    id: '2',
    title: 'Find Trusted Workers',
    description: 'Browse through verified workers with ratings and reviews',
    image: require('../../assets/images/splash-icon.png'),
  },
  {
    id: '3',
    title: 'Easy Booking',
    description: 'Book services with just a few taps and track your bookings',
    image: require('../../assets/images/icon.png'),
  },
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<any>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/(auth)/role-selection' as any);
    }
  };

  const Pagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.skipContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => {
            router.replace('/(auth)/role-selection' as any);
          }}
        >
          <Text style={styles.skipText}>{t('skip')}</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        data={slides}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{t('onboarding_title')}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <Pagination />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={scrollTo}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={currentIndex === slides.length - 1 ? 'arrow-forward' : 'chevron-forward'}
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  skipContainer: {
    position: 'absolute',
    top: SIZES.xxlarge,
    right: SIZES.medium,
    zIndex: 1,
  },
  skipButton: {
    padding: SIZES.base,
  },
  skipText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  slide: {
    width,
    alignItems: 'center',
    padding: SIZES.medium,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: 'contain',
    marginTop: SIZES.xxlarge,
    borderRadius: SIZES.base,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: SIZES.xxlarge,
  },
  title: {
    fontSize: FONTS.h2.fontSize,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.medium,
  },
  description: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SIZES.medium,
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.medium,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginHorizontal: 4,
  },
  buttonContainer: {
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  button: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    ...SHADOWS.medium,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    marginRight: SIZES.base,
  },
});

export default OnboardingScreen; 