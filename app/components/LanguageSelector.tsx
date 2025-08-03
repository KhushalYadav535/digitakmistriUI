import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const LanguageSelector = () => {
  const { language, changeLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage: string) => {
    changeLanguage(newLanguage);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('language')}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.languageButton,
            language === 'en' && styles.activeButton
          ]}
          onPress={() => handleLanguageChange('en')}
        >
          <Text style={[
            styles.languageText,
            language === 'en' && styles.activeText
          ]}>
            English
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.languageButton,
            language === 'hi' && styles.activeButton
          ]}
          onPress={() => handleLanguageChange('hi')}
        >
          <Text style={[
            styles.languageText,
            language === 'hi' && styles.activeText
          ]}>
            हिंदी
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    marginHorizontal: SIZES.medium,
    marginVertical: SIZES.base,
  },
  label: {
    ...FONTS.h3,
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SIZES.base,
  },
  languageButton: {
    flex: 1,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  languageText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  activeText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default LanguageSelector; 