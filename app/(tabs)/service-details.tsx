import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import BookingForm from '../components/BookingForm';

// Service details data
const serviceDetails = {
  plumber: {
    name: 'Plumber',
    description: 'Professional plumbing services for your home and office',
    image: require('../../assets/images/plumber.jpeg'),
    icon: 'water-outline' as const,
    services: [
      {
        title: 'Basin Set Fitting/Repair',
        subtitle: 'Install or repair basin set',
        price: '₹200',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Flush Tank Service',
        subtitle: 'Service flush tank',
        price: '₹300',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Wiring Related Repair',
        subtitle: 'Repair water pipe wiring',
        price: '₹250',
        charges: '0–2km free, 2–5km ₹50, 5–10km ₹100',
      },
      {
        title: 'Toti Installation',
        subtitle: 'Install toti',
        price: '₹50',
        charges: 'Per piece + ₹10/km',
      },
    ],
  },
  electrician: {
    name: 'Electrician',
    description: 'Certified electricians for all electrical needs',
    image: require('../../assets/images/electrician.jpeg'),
    icon: 'flash-outline' as const,
    services: [
      {
        title: 'Switchbox Installation',
        subtitle: 'Install switchbox',
        price: '₹150',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'AC Switchbox Installation',
        subtitle: 'Install AC switchbox',
        price: '₹250',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Wifi Smart Switch Installation',
        subtitle: 'Install wifi smart switch',
        price: '₹300',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Switchboard/Switch Repair',
        subtitle: 'Repair switchboard or switch',
        price: '₹50',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Fan Installation/Uninstallation',
        subtitle: 'Install or uninstall fan',
        price: '₹100',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Fan Regulator Repair/Replacement',
        subtitle: 'Repair or replace fan regulator',
        price: '₹100',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Tubelight/Bulb Holder Installation',
        subtitle: 'Install tubelight or bulb holder',
        price: '₹100',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Single-pole MCB Installation',
        subtitle: 'Install single-pole MCB',
        price: '₹150',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Double-pole MCB Installation',
        subtitle: 'Install double-pole MCB',
        price: '₹200',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'MCB/Fuse Replacement',
        subtitle: 'Replace MCB or fuse',
        price: '₹200',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Submeter Installation',
        subtitle: 'Install submeter',
        price: '₹200',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Inverter Installation/Uninstallation',
        subtitle: 'Install or uninstall inverter',
        price: '₹300',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Stabilizer Installation/Uninstallation',
        subtitle: 'Install or uninstall stabilizer',
        price: '₹200',
        charges: 'Per piece + ₹10/km',
      },
    ],
  },
  electronic: {
    name: 'Electronic',
    description: 'Electronic appliance repair and installation',
    image: require('../../assets/images/electrician.jpeg'),
    icon: 'tv-outline' as const,
    services: [
      {
        title: 'Solar Panel Installation',
        subtitle: 'Install solar panel (per panel)',
        price: '₹250',
        charges: 'Per panel + 10 km travel charge',
      },
      {
        title: 'TV Installation/Uninstallation',
        subtitle: 'Install or uninstall TV',
        price: '₹300',
        charges: 'Per piece',
      },
      {
        title: 'Fridge Service',
        subtitle: 'Service refrigerator',
        price: '₹300',
        charges: 'Per piece',
      },
      {
        title: 'Fridge Gas Changing',
        subtitle: 'Change fridge gas (including gas)',
        price: '₹1500',
        charges: 'Includes gas cost',
      },
      {
        title: 'AC Installation',
        subtitle: 'Install AC (per piece)',
        price: '₹1500',
        charges: 'Per piece',
      },
      {
        title: 'AC Service',
        subtitle: 'Service AC (per piece)',
        price: '₹600',
        charges: 'Per piece',
      },
      {
        title: 'Gas Geyser',
        subtitle: 'Repair/Service gas geyser',
        price: '₹300',
        charges: 'Per piece',
      },
      {
        title: 'Washing Machine',
        subtitle: 'Repair/Service washing machine',
        price: '₹500',
        charges: 'Per piece',
      },
      {
        title: 'RO Service',
        subtitle: 'Service RO water purifier',
        price: '₹400',
        charges: 'Per piece',
      },
      {
        title: 'AC Gas Changing',
        subtitle: 'Change AC gas (including gas)',
        price: '₹3500',
        charges: 'Includes gas cost',
      },
    ],
  },
  handpumpmistri: {
    name: 'Handpump Mistri',
    description: 'Expert handpump repair and installation services',
    image: require('../../assets/images/handpump.jpg'),
    icon: 'water-outline' as const,
    services: [
      {
        title: 'Dhol Fitting (6 No.)',
        subtitle: 'Install dhol fitting',
        price: '₹200',
        charges: 'Per set + ₹10/km',
      },
      {
        title: 'Chakbal Fitting (6 No.)',
        subtitle: 'Install chakbal fitting',
        price: '₹200',
        charges: 'Per set + ₹10/km',
      },
      {
        title: 'Section Fitting (6 No.)',
        subtitle: 'Install section fitting',
        price: '₹400',
        charges: 'Per set',
      },
      {
        title: 'New Tullu Fitting (6 No.)',
        subtitle: 'Install new tullu fitting',
        price: '₹400',
        charges: 'Per set',
      },
      {
        title: 'Chakri Setting (6 No.)',
        subtitle: 'Install chakri setting',
        price: '₹400',
        charges: 'Per set',
      },
      {
        title: '1.25 inch Coupling Fitting (6 No.)',
        subtitle: 'Install coupling fitting',
        price: '₹400',
        charges: 'Per set',
      },
      {
        title: 'India Mark 2 Chain Fitting',
        subtitle: 'Install India Mark 2 chain',
        price: '₹300',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Bearing Fitting',
        subtitle: 'Install bearing',
        price: '₹300',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Dhura Fitting',
        subtitle: 'Install dhura fitting',
        price: '₹300',
        charges: 'Per piece + ₹10/km',
      },
      {
        title: 'Packing Fitting',
        subtitle: 'Install packing fitting',
        price: '₹300',
        charges: 'Per piece + ₹10/km',
      },
    ],
  },
  carpenter: {
    name: 'Carpenter',
    description: 'Professional carpentry and woodwork services',
    image: require('../../assets/images/carpenter.jpeg'),
    icon: 'hammer-outline' as const,
    comingSoon: true,
    services: [
      {
        title: 'Coming Soon',
        subtitle: 'This service will be available soon',
        price: 'TBD',
        charges: 'Stay tuned for updates',
      },
    ],
  },
  cleaner: {
    name: 'Cleaner',
    description: 'Professional cleaning and maintenance services',
    image: require('../../assets/images/cleaner.jpeg'),
    icon: 'brush-outline' as const,
    comingSoon: true,
    services: [
      {
        title: 'Coming Soon',
        subtitle: 'This service will be available soon',
        price: 'TBD',
        charges: 'Stay tuned for updates',
      },
    ],
  },
  mechanic: {
    name: 'Mechanic',
    description: 'Professional automotive repair and maintenance',
    image: require('../../assets/images/mechanic.jpeg'),
    icon: 'construct-outline' as const,
    comingSoon: true,
    services: [
      {
        title: 'Coming Soon',
        subtitle: 'This service will be available soon',
        price: 'TBD',
        charges: 'Stay tuned for updates',
      },
    ],
  },
  welder: {
    name: 'Welder',
    description: 'Professional welding and metal fabrication services',
    image: require('../../assets/images/welder.jpeg'),
    icon: 'flame-outline' as const,
    comingSoon: true,
    services: [
      {
        title: 'Coming Soon',
        subtitle: 'This service will be available soon',
        price: 'TBD',
        charges: 'Stay tuned for updates',
      },
    ],
  },
  tailor: {
    name: 'Tailor',
    description: 'Professional tailoring and garment services',
    image: require('../../assets/images/tailor.jpeg'),
    icon: 'cut-outline' as const,
    comingSoon: true,
    services: [
      {
        title: 'Coming Soon',
        subtitle: 'This service will be available soon',
        price: 'TBD',
        charges: 'Stay tuned for updates',
      },
    ],
  },
};

const ServiceDetailScreen = () => {
  const { serviceId } = useLocalSearchParams();
  const service = serviceDetails[serviceId as keyof typeof serviceDetails];
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Array<{
    title: string;
    price: string;
    quantity: number;
  }>>([]);
  const [showSelectedModal, setShowSelectedModal] = useState(false);
  // Add for cart booking flow
  const [showBookingFormForCart, setShowBookingFormForCart] = useState(false);
  const [selectedServicesForCart, setSelectedServicesForCart] = useState<any[]>([]);

  if (!service) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Service not found.</Text>
      </View>
    );
  }

  const handleBookNow = (item: any) => {
    setSelectedService(item);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = (bookingData: any) => {
    // Navigate to payment page with booking data
    router.push({ 
      pathname: '/(tabs)/payment' as any, 
      params: { 
        serviceId: serviceId,
        serviceTitle: selectedService.title,
        servicePrice: selectedService.price.replace('₹', ''),
        bookingData: JSON.stringify(bookingData)
      } 
    });
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
    // Instead of navigating directly to payment, show booking form for cart
    setSelectedServicesForCart(selectedServices);
    setShowSelectedModal(false);
    setShowBookingFormForCart(true);
  };

  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, service) => {
      const price = parseInt(service.price.replace('₹', ''));
      return total + (price * service.quantity);
    }, 0);
  };

  if (showBookingForm && selectedService) {
    return (
      <BookingForm
        initialService={{
          id: serviceId as string,
          title: selectedService.title,
          type: selectedService.subtitle,
          price: selectedService.price // Pass the service price
        }}
        onSubmit={handleBookingSubmit}
      />
    );
  }
  // Show booking form for cart
  if (showBookingFormForCart && selectedServicesForCart.length > 0) {
    return (
      <BookingForm
        initialService={{
          id: serviceId as string,
          title: selectedServicesForCart.length === 1 ? selectedServicesForCart[0].title : `Multiple Services (${selectedServicesForCart.length} items)`,
          type: 'Multiple',
          price: `₹${calculateTotalPrice()}` // Pass the calculated total price
        }}
        onSubmit={(bookingData: any) => {
          // Navigate to payment with all selected services and booking details
          router.push({
            pathname: '/(tabs)/payment' as any,
            params: {
              serviceId: serviceId,
              serviceTitle: selectedServicesForCart.length === 1 ? selectedServicesForCart[0].title : `Multiple Services (${selectedServicesForCart.length} items)`,
              servicePrice: calculateTotalPrice().toString(),
              selectedServices: JSON.stringify(selectedServicesForCart),
              bookingData: JSON.stringify(bookingData)
            }
          });
          setShowBookingFormForCart(false);
          setSelectedServicesForCart([]);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{service.name}</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.card}>
          <Ionicons name={service.icon} size={40} color={COLORS.primary} style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text style={styles.name}>{service.name}</Text>
          <Text style={styles.description}>{service.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          {service.services?.map((item, idx) => (
            <View key={idx} style={styles.serviceItemContainer}>
              <View style={styles.serviceItem}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={styles.serviceTitle}>{item.title}</Text>
                    <Text style={styles.serviceSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Text style={styles.servicePrice}>{item.price}</Text>
                </View>
                <Text style={styles.serviceCharges}>{item.charges}</Text>
                <View style={{ marginTop: 8, alignItems: 'flex-end' }}>
                  {/*
                <TouchableOpacity
                  style={styles.bookNowBtn}
                  onPress={() => handleBookNow(item)}
                >
                  <Text style={styles.bookNowText}>Book Now</Text>
                </TouchableOpacity>
                */}
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddService(item)}
              >
                <Ionicons name="add" size={20} color={COLORS.white} />
              </TouchableOpacity>
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
    backgroundColor: '#F8F9FB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'left',
  },
  serviceItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingVertical: 12,
    marginBottom: 4,
  },
  serviceItem: {
    flex: 1,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  serviceSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginLeft: 8,
  },
  serviceCharges: {
    fontSize: 12,
    color: '#F9A825',
    marginTop: 4,
  },
  bookNowBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bookNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
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
    backgroundColor: '#F8F9FB',
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

export default ServiceDetailScreen;
