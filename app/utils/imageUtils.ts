import { API_URL } from '../constants/config';

/**
 * Constructs the proper URL for images stored in Cloudinary or local uploads
 * @param imagePath - The image path from the database (Cloudinary URL or "/uploads/image.jpg")
 * @returns The complete URL for the image
 */
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If it's already a complete URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // For local uploads, construct the full URL properly
  const baseUrl = API_URL.replace('/api', '');
  const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanImagePath = imagePath.replace(/^\//, ''); // Remove leading slash
  
  const fullUrl = `${cleanBaseUrl}/${cleanImagePath}`;
  console.log('🔗 getImageUrl constructed:', { original: imagePath, result: fullUrl });
  
  return fullUrl;
};

/**
 * Constructs the proper URL for multiple images
 * @param imagePaths - Array of image paths from the database
 * @returns Array of complete URLs for the images
 */
export const getImageUrls = (imagePaths: string[]): string[] => {
  if (!imagePaths || imagePaths.length === 0) return [];
  return imagePaths.map(path => getImageUrl(path));
};

/**
 * Get optimized Cloudinary URL with specific transformations
 * @param imageUrl - The original Cloudinary URL
 * @param options - Transformation options
 * @returns Optimized Cloudinary URL
 */
export const getOptimizedImageUrl = (imageUrl: string, options: {
  width?: number;
  height?: number;
  crop?: 'fill' | 'limit' | 'scale';
  quality?: 'auto' | 'auto:good' | 'auto:best';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
} = {}): string => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto:good',
    format = 'auto'
  } = options;

  let optimizedUrl = imageUrl;
  
  // Add transformations to the URL
  if (width || height || crop !== 'fill' || quality !== 'auto:good' || format !== 'auto') {
    const transformations = [];
    
    if (width && height) {
      transformations.push(`w_${width},h_${height},c_${crop}`);
    } else if (width) {
      transformations.push(`w_${width},c_${crop}`);
    } else if (height) {
      transformations.push(`h_${height},c_${crop}`);
    }
    
    if (quality !== 'auto:good') {
      transformations.push(`q_${quality}`);
    }
    
    if (format !== 'auto') {
      transformations.push(`f_${format}`);
    }
    
    if (transformations.length > 0) {
      optimizedUrl = imageUrl.replace('/upload/', `/upload/${transformations.join('/')}/`);
    }
  }
  
  return optimizedUrl;
};

/**
 * Get responsive image URLs for different screen sizes
 * @param imageUrl - The original image URL
 * @returns Object with different sized URLs
 */
export const getResponsiveImageUrls = (imageUrl: string) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return {
      thumbnail: imageUrl,
      small: imageUrl,
      medium: imageUrl,
      large: imageUrl,
      original: imageUrl
    };
  }

  return {
    thumbnail: getOptimizedImageUrl(imageUrl, { width: 150, height: 150, crop: 'fill' }),
    small: getOptimizedImageUrl(imageUrl, { width: 300, height: 300, crop: 'fill' }),
    medium: getOptimizedImageUrl(imageUrl, { width: 600, height: 600, crop: 'fill' }),
    large: getOptimizedImageUrl(imageUrl, { width: 1000, height: 1000, crop: 'limit' }),
    original: imageUrl
  };
}; 