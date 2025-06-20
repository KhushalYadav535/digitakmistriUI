import { Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
} from 'react-native';
import { COLORS, FONTS, SHADOWS, SIZES } from './constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from './constants/config';

const serviceMeta = {
    plumber: {
        name: 'Plumber',
        description: 'Professional plumbing services for your home and office',
        icon: <MaterialCommunityIcons name="water" size={36} color="#6C63FF" />,
        color: '#EDEBFE',
        services: [
            {
                title: 'Basin Set Fitting/Repair',
                subtitle: 'Install or repair basin set',
                price: '₹750',
                extra: '0–2km free, 2–5km ₹50, 5–10km ₹100',
            },
            {
                title: 'Flush Tank Service',
                subtitle: 'Service flush tank',
                price: '₹200',
                extra: '0–2km free, 2–5km ₹50, 5–10km ₹100',
            },
            {
                title: 'Wiring Related Repair',
                subtitle: 'Repair water pipe wiring',
                price: '₹250',
                extra: '0–2km free, 2–5km ₹50, 5–10km ₹100',
            },
            {
                title: 'Toti Installation',
                subtitle: 'Install toti',
                price: '₹50',
                extra: 'Per piece, 0–2km free, 2–5km ₹50, 5–10km ₹100',
            },
        ],
    },
    electrician: {
        name: 'Electrician',
        description: 'Professional electrical services for your home and office',
        icon: <MaterialIcons name="bolt" size={36} color="#2196F3" />,
        color: '#E3F2FD',
        services: [
            {
                title: 'Fan Installation',
                subtitle: 'Installation of new ceiling fan',
                price: '₹200',
                extra: '',
            },
            {
                title: 'Fan Servicing',
                subtitle: 'Complete fan servicing',
                price: '₹200',
                extra: 'Spare parts extra',
            },
            {
                title: 'Fan Capacitor Change',
                subtitle: 'Change fan capacitor',
                price: '₹50',
                extra: 'Capacitor cost extra',
            },
            {
                title: 'Holder/Button/Socket Change',
                subtitle: 'Change holder, button or socket',
                price: '₹50',
                extra: 'Per piece',
            },
        ],
    },
    electronics: {
        name: 'Electronics',
        description: 'Home appliance and electronics repair/installation',
        icon: <MaterialIcons name="electrical-services" size={36} color="#FF9800" />,
        color: '#FFF3E0',
        services: [
            {
                title: 'AC Installation',
                subtitle: 'Install AC (per piece)',
                price: '₹1600',
                extra: '1500 + 100 (p.c)',
            },
            {
                title: 'AC Service',
                subtitle: 'Service AC (per piece)',
                price: '₹700',
                extra: '600 + 100 (p.c)',
            },
            {
                title: 'AC Gas Charging',
                subtitle: 'Gas charging for AC (per piece)',
                price: '₹3600',
                extra: '3500 + 100 (p.c)',
            },
            {
                title: 'Washing Machine',
                subtitle: 'Repair/Service (per piece)',
                price: '₹600',
                extra: '500 + 100 (p.c)',
            },
            {
                title: 'Gas Geyser',
                subtitle: 'Repair/Service (per piece)',
                price: '₹350',
                extra: '300 + 50 (p.c)',
            },
            {
                title: 'LED TV Repairing',
                subtitle: 'Repair LED TV (per piece)',
                price: '₹350',
                extra: '300 + 50 (p.c)',
            },
            {
                title: 'DTH Set',
                subtitle: 'Install/Repair DTH (per piece)',
                price: '₹250',
                extra: '200 + 50 (p.c)',
            },
            {
                title: 'Inverter Set Kaam',
                subtitle: 'Inverter set work (per piece)',
                price: '₹250',
                extra: '200 + 50 (p.c)',
            },
        ],
    },
    handpump: {
        name: 'Handpump',
        description: 'Handpump installation and repair',
        icon: <FontAwesome5 name="tools" size={36} color="#95E1D3" />,
        color: '#E0F7FA',
        services: [],
    },
};

(Object.keys(serviceMeta) as (keyof typeof serviceMeta)[]).forEach(key => {
    if (serviceMeta[key].services && Array.isArray(serviceMeta[key].services)) {
        serviceMeta[key].services = serviceMeta[key].services.map((service: any) => ({
            ...service,
            extra: service.extra ? `${service.extra}\nPlatform charge ₹50 extra` : 'Platform charge ₹50 extra',
        }));
    }
});

const ServiceDetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const service = serviceMeta[id as keyof typeof serviceMeta];
    const [bookedServices, setBookedServices] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBookedServices();
    }, []);

    const fetchBookedServices = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                router.push('/(auth)/login' as any);
                return;
            }

            const response = await axios.get(`${API_URL}/bookings/customer`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const bookedServiceTitles = response.data.map((booking: any) => booking.serviceTitle);
            setBookedServices(bookedServiceTitles);
        } catch (error) {
            console.error('Error fetching booked services:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleServicePress = (serviceTitle: string) => {
        if (bookedServices.includes(serviceTitle)) {
            Alert.alert(
                'Already Booked',
                'You have already booked this service. Please check your bookings.',
                [
                    {
                        text: 'View Bookings',
                        onPress: () => router.push('/(tabs)/bookings' as any)
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    }
                ]
            );
        } else {
            router.push({
                pathname: '/bookings' as any,
                params: { serviceTitle }
            });
        }
    };

    if (!service) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Service not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>service-details</Text>
                <View style={styles.backButton} />
            </View>

            <View style={[styles.serviceCard, { backgroundColor: service.color }]}> 
                <View style={styles.serviceIconCircle}>{service.icon}</View>
                <Text style={styles.serviceCardTitle}>{service.name}</Text>
                <Text style={styles.serviceCardDesc}>{service.description}</Text>
            </View>

            <View style={styles.servicesSection}>
                <Text style={styles.servicesSectionTitle}>Available Services</Text>
                {service.services.length === 0 && (
                    <Text style={{ color: COLORS.textSecondary, marginTop: 10 }}>No services listed.</Text>
                )}
                {service.services.map((item, idx) => (
                    <TouchableOpacity 
                        key={idx} 
                        style={[
                            styles.subServiceCard,
                            bookedServices.includes(item.title) && styles.bookedServiceCard
                        ]} 
                        onPress={() => handleServicePress(item.title)}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.subServiceTitle}>{item.title}</Text>
                            <Text style={styles.subServiceSubtitle}>{item.subtitle}</Text>
                            <Text style={styles.subServicePrice}>{item.price}</Text>
                            {item.extra ? (
                                <Text style={styles.subServiceExtra}>{item.extra}</Text>
                            ) : null}
                            {bookedServices.includes(item.title) && (
                                <Text style={styles.bookedText}>Already Booked</Text>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                ))}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.medium,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    backButton: {
        padding: SIZES.base,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    serviceCard: {
        margin: 16,
        borderRadius: 16,
        alignItems: 'center',
        padding: 24,
    },
    serviceIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        alignSelf: 'center',
    },
    serviceCardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
        textAlign: 'center',
    },
    serviceCardDesc: {
        fontSize: 15,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    servicesSection: {
        marginHorizontal: 12,
        marginBottom: 30,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
    },
    servicesSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    subServiceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 12,
    },
    subServiceTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    subServiceSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    subServicePrice: {
        fontSize: 18,
        color: '#1976D2',
        fontWeight: 'bold',
        marginTop: 2,
    },
    subServiceExtra: {
        fontSize: 13,
        color: '#FFA726',
        fontStyle: 'italic',
        marginTop: 2,
    },
    errorText: {
        fontSize: FONTS.body2.fontSize,
        color: COLORS.error,
        textAlign: 'center',
        marginTop: SIZES.xxlarge,
    },
    bookedServiceCard: {
        opacity: 0.7,
        backgroundColor: COLORS.background,
    },
    bookedText: {
        color: COLORS.primary,
        fontSize: FONTS.body3.fontSize,
        fontWeight: '600',
        marginTop: 5,
    },
});

export default ServiceDetailsScreen; 