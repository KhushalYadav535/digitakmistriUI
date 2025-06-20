import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from 'expo-router';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
];

export default function LanguageScreen() {
  const { t, changeLanguage } = useLanguage();
  const router = useRouter();

  const handleLanguageSelect = (langCode: string) => {
    changeLanguage(langCode);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('select_language')}</Text>
      <View style={styles.languageContainer}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={styles.languageButton}
            onPress={() => handleLanguageSelect(lang.code)}
          >
            <Text style={styles.languageText}>{lang.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  languageContainer: {
    width: '100%',
    maxWidth: 300,
  },
  languageButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  languageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 