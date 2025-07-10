import { API_URL } from '../constants/config';

/**
 * Constructs the proper URL for images stored in the uploads directory
 * @param imagePath - The image path from the database (e.g., "/uploads/image.jpg")
 * @returns The complete URL for the image
 */
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // Remove /api from the API_URL since static files are served directly
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${imagePath}`;
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