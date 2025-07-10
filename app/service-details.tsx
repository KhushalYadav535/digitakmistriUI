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
    Modal,
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
                price: '₹200',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'Flush Tank Service',
                subtitle: 'Service flush tank',
                price: '₹300',
                extra: 'Per piece + ₹10/km',
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
                extra: 'Per piece + ₹10/km',
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
                title: 'Switchbox Installation',
                subtitle: 'Install switchbox',
                price: '₹150',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'AC Switchbox Installation',
                subtitle: 'Install AC switchbox',
                price: '₹250',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'Wifi Smart Switch Installation',
                subtitle: 'Install wifi smart switch',
                price: '₹300',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'Switchboard/Switch Repair',
                subtitle: 'Repair switchboard or switch',
                price: '₹50',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'Fan Installation/Uninstallation',
                subtitle: 'Install or uninstall fan',
                price: '₹100',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'Fan Regulator Repair/Replacement',
                subtitle: 'Repair or replace fan regulator',
                price: '₹100',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'Tubelight/Bulb Holder Installation',
                subtitle: 'Install tubelight or bulb holder',
                price: '₹100',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'Single-pole MCB Installation',
                subtitle: 'Install single-pole MCB',
                price: '₹150',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'Double-pole MCB Installation',
                subtitle: 'Install double-pole MCB',
                price: '₹200',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'MCB/Fuse Replacement',
                subtitle: 'Replace MCB or fuse',
                price: '₹200',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'Submeter Installation',
                subtitle: 'Install submeter',
                price: '₹200',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'Inverter Installation/Uninstallation',
                subtitle: 'Install or uninstall inverter',
                price: '₹300',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'Stabilizer Installation/Uninstallation',
                subtitle: 'Install or uninstall stabilizer',
                price: '₹200',
                extra: 'Per piece + ₹10/km',
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
                title: 'Solar Panel Installation',
                subtitle: 'Install solar panel (per panel)',
                price: '₹250',
                extra: 'Per panel + 10 km travel charge',
            },
            {
                title: 'TV Installation/Uninstallation',
                subtitle: 'Install or uninstall TV',
                price: '₹300',
                extra: 'Per piece',
            },
            {
                title: 'Fridge Service',
                subtitle: 'Service refrigerator',
                price: '₹300',
                extra: 'Per piece',
            },
            {
                title: 'Fridge Gas Changing',
                subtitle: 'Change fridge gas (including gas)',
                price: '₹1500',
                extra: 'Includes gas cost',
            },
            {
                title: 'AC Installation',
                subtitle: 'Install AC (per piece)',
                price: '₹1500',
                extra: 'Per piece',
            },
            {
                title: 'AC Service',
                subtitle: 'Service AC (per piece)',
                price: '₹600',
                extra: 'Per piece',
            },
            {
                title: 'Gas Geyser',
                subtitle: 'Repair/Service gas geyser',
                price: '₹300',
                extra: 'Per piece',
            },
            {
                title: 'Washing Machine',
                subtitle: 'Repair/Service washing machine',
                price: '₹500',
                extra: 'Per piece',
            },
            {
                title: 'RO Service',
                subtitle: 'Service RO water purifier',
                price: '₹400',
                extra: 'Per piece',
            },
            {
                title: 'AC Gas Changing',
                subtitle: 'Change AC gas (including gas)',
                price: '₹3500',
                extra: 'Includes gas cost',
            },
        ],
    },
    handpump: {
        name: 'Handpump',
        description: 'Handpump installation and repair',
        icon: <FontAwesome5 name="tools" size={36} color="#95E1D3" />,
        color: '#E0F7FA',
        services: [
            {
                title: 'Dhol Fitting (6 No.)',
                subtitle: 'Install dhol fitting',
                price: '₹200',
                extra: 'Per set + ₹10/km',
            },
            {
                title: 'Chakbal Fitting (6 No.)',
                subtitle: 'Install chakbal fitting',
                price: '₹200',
                extra: 'Per set + ₹10/km',
            },
            {
                title: 'Section Fitting (6 No.)',
                subtitle: 'Install section fitting',
                price: '₹400',
                extra: 'Per set',
            },
            {
                title: 'New Tullu Fitting (6 No.)',
                subtitle: 'Install new tullu fitting',
                price: '₹400',
                extra: 'Per set',
            },
            {
                title: 'Chakri Setting (6 No.)',
                subtitle: 'Install chakri setting',
                price: '₹400',
                extra: 'Per set',
            },
            {
                title: '1.25 inch Coupling Fitting (6 No.)',
                subtitle: 'Install coupling fitting',
                price: '₹400',
                extra: 'Per set',
            },
            {
                title: 'India Mark 2 Chain Fitting',
                subtitle: 'Install India Mark 2 chain',
                price: '₹300',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'Bearing Fitting',
                subtitle: 'Install bearing',
                price: '₹300',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'Dhura Fitting',
                subtitle: 'Install dhura fitting',
                price: '₹300',
                extra: 'Per piece + ₹10/km',
            },
            {
                title: 'Packing Fitting',
                subtitle: 'Install packing fitting',
                price: '₹300',
                extra: 'Per piece + ₹10/km',
            },
        ],
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
    const [selectedServices, setSelectedServices] = useState<Array<{
        title: string;
        price: string;
        quantity: number;
    }>>([]);
    const [showSelectedModal, setShowSelectedModal] = useState(false);

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

    const handleAddService = (serviceItem: any) => {
        const existingService = selectedServices.find(s => s.title === serviceItem.title);
        
        if (existingService) {
            setSelectedServices(prev => 
                prev.map(s => 
                    s.title === serviceItem.title 
                        ? { ...s, quantity: s.quantity + 1 }
                        : s
                )
            );
        } else {
            setSelectedServices(prev => [...prev, {
                title: serviceItem.title,
                price: serviceItem.price,
                quantity: 1
            }]);
        }
        
        Alert.alert('Added', `${serviceItem.title} added to your selection`);
    };

    const handleRemoveService = (serviceTitle: string) => {
        setSelectedServices(prev => prev.filter(s => s.title !== serviceTitle));
    };

    const handleQuantityChange = (serviceTitle: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemoveService(serviceTitle);
        } else {
            setSelectedServices(prev => 
                prev.map(s => 
                    s.title === serviceTitle 
                        ? { ...s, quantity: newQuantity }
                        : s
                )
            );
        }
    };

    const handleBookSelected = () => {
        if (selectedServices.length === 0) {
            Alert.alert('No Services Selected', 'Please add some services first.');
            return;
        }

        // Create a combined service title for multiple services
        const combinedTitle = selectedServices.length === 1 
            ? selectedServices[0].title
            : `Multiple Services (${selectedServices.length} items)`;

        router.push({
            pathname: '/bookings' as any,
            params: { 
                serviceTitle: combinedTitle,
                selectedServices: JSON.stringify(selectedServices)
            }
        });
    };

    const calculateTotalPrice = () => {
        return selectedServices.reduce((total, service) => {
            const price = parseInt(service.price.replace('₹', ''));
            return total + (price * service.quantity);
        }, 0);
    };

    if (!service) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Service not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
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
                        <View key={idx} style={styles.serviceItemContainer}>
                            <TouchableOpacity 
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
                            
                            {!bookedServices.includes(item.title) && (
                                <TouchableOpacity 
                                    style={styles.addButton}
                                    onPress={() => handleAddService(item)}
                                >
                                    <Ionicons name="add" size={20} color={COLORS.white} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Floating Action Button for Selected Services */}
            {selectedServices.length > 0 && (
                <TouchableOpacity 
                    style={styles.fab}
                    onPress={() => setShowSelectedModal(true)}
                >
                    <Ionicons name="cart" size={24} color={COLORS.white} />
                    <View style={styles.fabBadge}>
                        <Text style={styles.fabBadgeText}>{selectedServices.length}</Text>
                    </View>
                </TouchableOpacity>
            )}

            {/* Selected Services Modal */}
            <Modal
                visible={showSelectedModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowSelectedModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selected Services</Text>
                            <TouchableOpacity onPress={() => setShowSelectedModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.selectedServicesList}>
                            {selectedServices.map((service, index) => (
                                <View key={index} style={styles.selectedServiceItem}>
                                    <View style={styles.selectedServiceInfo}>
                                        <Text style={styles.selectedServiceTitle}>{service.title}</Text>
                                        <Text style={styles.selectedServicePrice}>{service.price}</Text>
                                    </View>
                                    <View style={styles.quantityContainer}>
                                        <TouchableOpacity 
                                            style={styles.quantityButton}
                                            onPress={() => handleQuantityChange(service.title, service.quantity - 1)}
                                        >
                                            <Ionicons name="remove" size={16} color={COLORS.primary} />
                                        </TouchableOpacity>
                                        <Text style={styles.quantityText}>{service.quantity}</Text>
                                        <TouchableOpacity 
                                            style={styles.quantityButton}
                                            onPress={() => handleQuantityChange(service.title, service.quantity + 1)}
                                        >
                                            <Ionicons name="add" size={16} color={COLORS.primary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Text style={styles.totalText}>Total: ₹{calculateTotalPrice()}</Text>
                            <TouchableOpacity 
                                style={styles.bookButton}
                                onPress={handleBookSelected}
                            >
                                <Text style={styles.bookButtonText}>Book Selected Services</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
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
    serviceItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    subServiceCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        ...SHADOWS.small,
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
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: COLORS.primary,
        borderRadius: 28,
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    fabBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF5722',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabBadgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    selectedServicesList: {
        maxHeight: 400,
    },
    selectedServiceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedServiceInfo: {
        flex: 1,
    },
    selectedServiceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    selectedServicePrice: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        backgroundColor: COLORS.background,
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 15,
        color: COLORS.textPrimary,
    },
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 15,
    },
    bookButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
    },
    bookButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ServiceDetailsScreen; 