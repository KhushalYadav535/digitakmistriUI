import React from 'react';
import { Image, ImageProps, View, ActivityIndicator } from 'react-native';
import { getOptimizedImageUrl, getResponsiveImageUrls } from '../utils/imageUtils';
import { COLORS } from '../constants/theme';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  size?: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
  width?: number;
  height?: number;
  crop?: 'fill' | 'limit' | 'scale';
  quality?: 'auto' | 'auto:good' | 'auto:best';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  showLoading?: boolean;
  fallbackUri?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  size = 'medium',
  width,
  height,
  crop = 'fill',
  quality = 'auto:good',
  format = 'auto',
  showLoading = true,
  fallbackUri,
  style,
  ...props
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  // Get the optimized URL based on size or custom dimensions
  const getOptimizedUri = () => {
    if (!uri) return fallbackUri || '';

    if (width || height) {
      // Use custom dimensions
      return getOptimizedImageUrl(uri, {
        width,
        height,
        crop,
        quality,
        format
      });
    } else {
      // Use predefined sizes
      const responsiveUrls = getResponsiveImageUrls(uri);
      return responsiveUrls[size] || uri;
    }
  };

  const optimizedUri = getOptimizedUri();

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  // If there's an error and we have a fallback, try the fallback
  const finalUri = error && fallbackUri ? fallbackUri : optimizedUri;

  return (
    <View style={[{ position: 'relative' }, style]}>
      <Image
        source={{ uri: finalUri }}
        style={[style, { opacity: loading ? 0.5 : 1 }]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />
      {showLoading && loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.1)',
          }}
        >
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

export default OptimizedImage; 