const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for React Native libraries
config.resolver = {
  ...config.resolver,
  alias: {
    ...config.resolver.alias,
  },
  resolverMainFields: ['react-native', 'browser', 'main'],
};

// Configure transformer
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config; 