import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { API_URL } from '../constants/config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearServicePriceCache } from '../utils/serviceUtils';

// Service data that matches what customers see
interface ServiceMetaItem {
  name: string;
  description: string;
  services: { title: string; price: string }[];
  comingSoon?: boolean;
}

const serviceMeta: Record<string, ServiceMetaItem> = {
  plumber: {
    name: 'Plumber',
    description: 'Professional plumbing services for your home and office',
    services: [
      { title: 'Basin Set Fitting/Repair', price: '₹200' },
      { title: 'Flush Tank Service', price: '₹300' },
      { title: 'Wiring Related Repair', price: '₹250' },
      { title: 'Toti Installation', price: '₹8' },
    ],
  },
  electrician: {
    name: 'Electrician',
    description: 'Professional electrical services for your home and office',
    services: [
      { title: 'Switchbox Installation', price: '₹150' },
      { title: 'AC Switchbox Installation', price: '₹250' },
      { title: 'Wifi Smart Switch Installation', price: '₹300' },
      { title: 'Switchboard/Switch Repair', price: '₹50' },
      { title: 'Fan Installation/Uninstallation', price: '₹100' },
      { title: 'Fan Regulator Repair/Replacement', price: '₹100' },
      { title: 'Tubelight/Bulb Holder Installation', price: '₹100' },
      { title: 'Single-pole MCB Installation', price: '₹150' },
      { title: 'Double-pole MCB Installation', price: '₹200' },
      { title: 'MCB/Fuse Replacement', price: '₹200' },
      { title: 'Submeter Installation', price: '₹200' },
      { title: 'Inverter Installation/Uninstallation', price: '₹300' },
      { title: 'Stabilizer Installation/Uninstallation', price: '₹200' },
    ],
  },
  electronics: {
    name: 'Electronics',
    description: 'Home appliance and electronics repair/installation',
    services: [
      { title: 'Solar Panel Installation', price: '₹250' },
      { title: 'TV Installation/Uninstallation', price: '₹300' },
      { title: 'Fridge Service', price: '₹300' },
      { title: 'Fridge Gas Changing', price: '₹1500' },
      { title: 'AC Installation', price: '₹1500' },
      { title: 'AC Service', price: '₹600' },
      { title: 'Gas Geyser', price: '₹300' },
      { title: 'Washing Machine', price: '₹500' },
      { title: 'RO Service', price: '₹400' },
      { title: 'AC Gas Changing', price: '₹3500' },
    ],
  },
  handpump: {
    name: 'Handpump',
    description: 'Handpump installation and repair',
    services: [
      { title: 'Dhol Fitting (6 No.)', price: '₹200' },
      { title: 'Chakbal Fitting (6 No.)', price: '₹200' },
      { title: 'Section Fitting (6 No.)', price: '₹400' },
      { title: 'New Tullu Fitting (6 No.)', price: '₹400' },
      { title: 'Chakri Setting (6 No.)', price: '₹400' },
      { title: '1.25 inch Coupling Fitting (6 No.)', price: '₹400' },
      { title: 'India Mark 2 Chain Fitting', price: '₹300' },
      { title: 'Bearing Fitting', price: '₹300' },
      { title: 'Dhura Fitting', price: '₹300' },
      { title: 'Packing Fitting', price: '₹300' },
    ],
  },
  carpenter: {
    name: 'Carpenter',
    description: 'Professional carpentry and woodwork services',
    comingSoon: true,
    services: [
      { title: 'Coming Soon', price: 'TBD' },
    ],
  },
  cleaner: {
    name: 'Cleaner',
    description: 'Professional cleaning and maintenance services',
    comingSoon: true,
    services: [
      { title: 'Coming Soon', price: 'TBD' },
    ],
  },
  mechanic: {
    name: 'Auto Part Mechanic',
    description: 'Professional automotive repair and maintenance',
    comingSoon: true,
    services: [
      { title: 'Coming Soon', price: 'TBD' },
    ],
  },
  welder: {
    name: 'Welder',
    description: 'Professional welding and metal fabrication services',
    comingSoon: true,
    services: [
      { title: 'Coming Soon', price: 'TBD' },
    ],
  },
  tailor: {
    name: 'Tailor Technician',
    description: 'Professional tailoring and garment services',
    comingSoon: true,
    services: [
      { title: 'Coming Soon', price: 'TBD' },
    ],
  },
};

interface ServiceItem {
  serviceType: string;
  serviceName: string;
  serviceTitle: string;
  price: string;
  isActive: boolean;
}

const ServicesScreen = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch service prices from database
      const token = await AsyncStorage.getItem('token');
      let servicePrices: any[] = [];
      
      try {
        const response = await axios.get(`${API_URL}/admin/service-prices`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        servicePrices = response.data;
      } catch (err) {
        console.log('No service prices found in database, using defaults');
      }
      
      // Create services list from serviceMeta and merge with database prices
      const servicesList: ServiceItem[] = [];
      
      Object.entries(serviceMeta).forEach(([serviceType, serviceData]) => {
        serviceData.services.forEach((service) => {
          // Find if there's a custom price in the database
          const customPrice = servicePrices.find(
            sp => sp.serviceType === serviceType && sp.serviceTitle === service.title
          );
          
          servicesList.push({
            serviceType,
            serviceName: serviceData.name,
            serviceTitle: service.title,
            price: customPrice ? `₹${customPrice.price}` : service.price,
            isActive: !serviceData.comingSoon,
          });
        });
      });
      
      setServices(servicesList);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditService = (service: ServiceItem) => {
    setSelectedService(service);
    setEditPrice(service.price.replace('₹', ''));
    setEditModalVisible(true);
  };

  const handleDeleteService = (service: ServiceItem) => {
    setSelectedService(service);
    setDeleteModalVisible(true);
  };

  const updateServicePrice = async () => {
    if (!selectedService || !editPrice.trim()) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      setUpdating(true);
      
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/admin/services/price/${encodeURIComponent(selectedService.serviceType)}/${encodeURIComponent(selectedService.serviceTitle)}`,
        { price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the local state
      setServices(prev =>
        prev.map(service =>
          service.serviceType === selectedService.serviceType &&
          service.serviceTitle === selectedService.serviceTitle
            ? { ...service, price: `₹${price}` }
            : service
        )
      );
      
      // Clear the service price cache so customers see updated prices
      clearServicePriceCache();
      
      setEditModalVisible(false);
      setSelectedService(null);
      setEditPrice('');
      Alert.alert(
        'Success', 
        'Service price updated successfully!\n\nNote: Customer app will show updated prices within 30 seconds or after refresh.',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.error('Error updating service:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to update service price');
    } finally {
      setUpdating(false);
    }
  };

  const confirmDeleteService = async () => {
    if (!selectedService) return;

    try {
      setUpdating(true);
      
      const token = await AsyncStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/admin/services/${encodeURIComponent(selectedService.serviceType)}/${encodeURIComponent(selectedService.serviceTitle)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove from local state
      setServices(prev =>
        prev.filter(service =>
          !(service.serviceType === selectedService.serviceType &&
            service.serviceTitle === selectedService.serviceTitle)
        )
      );
      
      setDeleteModalVisible(false);
      setSelectedService(null);
      Alert.alert('Success', 'Service deleted successfully');
    } catch (err: any) {
      console.error('Error deleting service:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete service');
    } finally {
      setUpdating(false);
    }
  };

  const renderService = ({ item }: { item: ServiceItem }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.serviceName}</Text>
        <Text style={styles.serviceTitle}>{item.serviceTitle}</Text>
        <View style={styles.serviceMeta}>
          <Text style={styles.servicePrice}>{item.price}</Text>
          <Text style={styles.serviceCategory}>{item.serviceType}</Text>
        </View>
      </View>
      <View style={styles.serviceActions}>
        {!item.isActive ? (
          <View style={[styles.statusButton, { backgroundColor: COLORS.error }]}>
            <Text style={styles.statusButtonText}>Coming Soon</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditService(item)}
            >
              <Ionicons name="pencil" size={16} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteService(item)}
            >
              <Ionicons name="trash" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading services...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchServices}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Services Management</Text>
        <Text style={styles.subtitle}>Manage service prices and availability</Text>
      </View>
      
      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item, index) => `${item.serviceType}-${item.serviceTitle}-${index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No services found</Text>
          </View>
        }
      />

      {/* Edit Service Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Service Price</Text>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {selectedService && (
                <>
                  <View style={styles.editServiceInfo}>
                    <Text style={styles.editServiceName}>{selectedService.serviceName}</Text>
                    <Text style={styles.editServiceTitle}>{selectedService.serviceTitle}</Text>
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Price (₹)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editPrice}
                      onChangeText={setEditPrice}
                      placeholder="Enter new price"
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelModalButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.updateModalButton, updating && styles.disabledButton]}
                onPress={updateServicePrice}
                disabled={updating}
              >
                <Text style={styles.updateModalButtonText}>
                  {updating ? 'Updating...' : 'Update Price'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Service Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Service</Text>
              <TouchableOpacity 
                onPress={() => setDeleteModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {selectedService && (
                <>
                  <Text style={styles.deleteWarning}>
                    Are you sure you want to delete this service?
                  </Text>
                  <View style={styles.deleteServiceInfo}>
                    <Text style={styles.deleteServiceName}>{selectedService.serviceName}</Text>
                    <Text style={styles.deleteServiceTitle}>{selectedService.serviceTitle}</Text>
                  </View>
                  <Text style={styles.deleteNote}>
                    This action cannot be undone.
                  </Text>
                </>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelModalButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.deleteModalButton, updating && styles.disabledButton]}
                onPress={confirmDeleteService}
                disabled={updating}
              >
                <Text style={styles.deleteModalButtonText}>
                  {updating ? 'Deleting...' : 'Delete Service'}
                </Text>
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
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  serviceTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 12,
  },
  serviceCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  editServiceInfo: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  editServiceName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  editServiceTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  deleteServiceInfo: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  deleteServiceName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  deleteServiceTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  deleteWarning: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: 16,
  },
  deleteNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  updateModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    alignItems: 'center',
  },
  updateModalButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  deleteModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    marginLeft: 8,
    alignItems: 'center',
  },
  deleteModalButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ServicesScreen; 