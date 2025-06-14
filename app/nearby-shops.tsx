import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
    TextStyle,
} from 'react-native';
import NearbyShop from './components/NearbyShop';
import { COLORS, FONTS, SHADOWS, SIZES } from './constants/theme';

const nearbyShops = [
    {
        id: '1',
        name: 'प्रदीप बम्बावाले',
        phone: '8565810575',
        address: 'जंघई बाजार (बरगद के पेड़ के पास दुकान)',
        description: 'हमारे यहाँ 6 नं नल नया बोरींग और पुराना रिपेयर किया जाता है। हमारे यहाँ इंडिया मार्क का समान और पुराना इंडिया मार्क नल रिपेयर किया जाता है।',
    },
];

const NearbyShopsScreen = () => {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Nearby Shops</Text>
            </View>

            <View style={styles.content}>
                {nearbyShops.map((shop) => (
                    <NearbyShop
                        key={shop.id}
                        name={shop.name}
                        phone={shop.phone}
                        address={shop.address}
                        description={shop.description}
                    />
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    } as ViewStyle,
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.medium,
        backgroundColor: COLORS.white,
        ...SHADOWS.light,
    } as ViewStyle,
    backButton: {
        marginRight: SIZES.medium,
    } as ViewStyle,
    title: {
        ...FONTS.h3,
        color: COLORS.textPrimary,
    } as TextStyle,
    content: {
        padding: SIZES.medium,
    } as ViewStyle,
});

export default NearbyShopsScreen; 