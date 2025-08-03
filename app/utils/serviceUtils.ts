import axios from 'axios';
import { API_URL } from '../constants/config';

export interface ServicePrice {
  serviceType: string;
  serviceTitle: string;
  price: number;
  isActive: boolean;
}

export interface ServiceData {
  name: string;
  description: string;
  services: Array<{
    title: string;
    subtitle: string;
    price: string;
    extra: string;
    isDynamic?: boolean;
  }>;
}

let cachedServicePrices: ServicePrice[] | null = null;
let cachedAllServices: ServiceData[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 0; // No cache - always fetch fresh data

export const fetchServicePrices = async (): Promise<ServicePrice[]> => {
  try {
    console.log('Fetching service prices from API...');
    const response = await axios.get(`${API_URL}/services/prices`);
    console.log('Service prices fetched:', response.data.length, 'items');
    
    // Log all plumber services for debugging
    const plumberServices = response.data.filter((sp: ServicePrice) => sp.serviceType === 'plumber');
    console.log('Plumber services from API:', plumberServices.map((sp: ServicePrice) => ({
      title: sp.serviceTitle,
      price: sp.price,
      isActive: sp.isActive
    })));
    
    // Always return fresh data, no caching
    return response.data || [];
  } catch (error) {
    console.error('Error fetching service prices:', error);
    return [];
  }
};

export const getServicePrice = (servicePrices: ServicePrice[], serviceType: string, serviceTitle: string): number | null => {
  console.log(`Looking for service: ${serviceType} - ${serviceTitle}`);
  console.log(`Available service prices:`, servicePrices.map(sp => ({
    serviceType: sp.serviceType,
    serviceTitle: sp.serviceTitle,
    price: sp.price,
    isActive: sp.isActive
  })));
  
  const servicePrice = servicePrices.find(
    sp => sp.serviceType === serviceType && 
          sp.serviceTitle === serviceTitle && 
          sp.isActive
  );
  
  console.log(`Found service price:`, servicePrice);
  
  if (!servicePrice) {
    console.log(`No matching service found for: ${serviceType} - ${serviceTitle}`);
    // Try to find without isActive check
    const anyService = servicePrices.find(
      sp => sp.serviceType === serviceType && sp.serviceTitle === serviceTitle
    );
    if (anyService) {
      console.log(`Found service but not active:`, anyService);
    }
  }
  
  return servicePrice ? servicePrice.price : null;
};

export const clearServicePriceCache = () => {
  cachedServicePrices = null;
  cachedAllServices = null;
  lastFetchTime = 0;
};

// Force refresh service prices (clears cache and fetches fresh data)
export const refreshServicePrices = async (): Promise<ServicePrice[]> => {
  clearServicePriceCache();
  return await fetchServicePrices();
}; 

// Fetch all services including dynamic ones from database
export const fetchAllServices = async (): Promise<Record<string, ServiceData>> => {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (cachedAllServices && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('Using cached all services');
    return cachedAllServices as any;
  }
  
  try {
    console.log('Fetching all services from API...');
    const response = await axios.get(`${API_URL}/services/all`);
    console.log('All services fetched:', Object.keys(response.data).length, 'service types');
    cachedAllServices = response.data;
    lastFetchTime = now;
    return response.data || {};
  } catch (error) {
    console.error('Error fetching all services:', error);
    return {};
  }
}; 