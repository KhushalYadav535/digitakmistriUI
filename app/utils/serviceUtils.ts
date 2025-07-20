import axios from 'axios';
import { API_URL } from '../constants/config';

export interface ServicePrice {
  serviceType: string;
  serviceTitle: string;
  price: number;
  isActive: boolean;
}

let cachedServicePrices: ServicePrice[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 1000; // 30 seconds

export const fetchServicePrices = async (): Promise<ServicePrice[]> => {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (cachedServicePrices && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('Using cached service prices');
    return cachedServicePrices;
  }
  
  try {
    console.log('Fetching service prices from API...');
    const response = await axios.get(`${API_URL}/services/prices`);
    console.log('Service prices fetched:', response.data.length, 'items');
    cachedServicePrices = response.data;
    lastFetchTime = now;
    return cachedServicePrices || [];
  } catch (error) {
    console.error('Error fetching service prices:', error);
    return [];
  }
};

export const getServicePrice = (servicePrices: ServicePrice[], serviceType: string, serviceTitle: string): number | null => {
  const servicePrice = servicePrices.find(
    sp => sp.serviceType === serviceType && 
          sp.serviceTitle === serviceTitle && 
          sp.isActive
  );
  console.log(`Looking for service: ${serviceType} - ${serviceTitle}`);
  console.log(`Found service price:`, servicePrice);
  return servicePrice ? servicePrice.price : null;
};

export const clearServicePriceCache = () => {
  cachedServicePrices = null;
  lastFetchTime = 0;
};

// Force refresh service prices (clears cache and fetches fresh data)
export const refreshServicePrices = async (): Promise<ServicePrice[]> => {
  clearServicePriceCache();
  return await fetchServicePrices();
}; 