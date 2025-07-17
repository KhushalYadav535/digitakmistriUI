import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import i18n from '../constants/i18n';

const languages = [
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'hi', name: 'हिंदी', flag: '🇮🇳' }
];

const LANGUAGE_KEY = 'selected_language';

const LanguageScreen = () => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    (async () => {
      const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLang && savedLang !== selectedLanguage) {
        setSelectedLanguage(savedLang);
        i18n.changeLanguage(savedLang);
      }
    })();
  }, []);

  const handleLanguageSelect = async (lang: string) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  };

  const handleContinue = () => {
    router.replace('/(auth)/onboarding' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/applogo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>{t('select_language')}</Text>
        <Text style={styles.subtitle}>{t('welcome')}</Text>
      </View>

      <View style={styles.languageContainer}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.id}
            style={[
              styles.languageButton,
              selectedLanguage === language.id && styles.selectedLanguage,
            ]}
            onPress={() => handleLanguageSelect(language.id)}
          >
            <Text style={styles.flag}>{language.flag}</Text>
            <Text
              style={[
                styles.languageText,
                selectedLanguage === language.id && styles.selectedLanguageText,
              ]}
            >
              {language.name}
            </Text>
            {selectedLanguage === language.id && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={COLORS.primary}
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>{t('continue') || 'Continue'}</Text>
          <Ionicons
            name="arrow-forward"
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
    padding: SIZES.medium,
  },
  header: {
    alignItems: 'center',
    marginTop: SIZES.xxlarge,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: SIZES.medium,
    borderRadius: SIZES.base,
  },
  title: {
    fontSize: FONTS.h1.fontSize,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  languageContainer: {
    marginTop: SIZES.xxlarge,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    marginBottom: SIZES.medium,
    ...SHADOWS.small,
  },
  selectedLanguage: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  flag: {
    fontSize: 24,
    marginRight: SIZES.medium,
  },
  languageText: {
    fontSize: FONTS.h3.fontSize,
    color: COLORS.textPrimary,
    flex: 1,
  },
  selectedLanguageText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: SIZES.base,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: SIZES.medium,
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

export default LanguageScreen; 