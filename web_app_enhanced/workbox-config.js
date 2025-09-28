// Workbox configuration for PWA offline functionality
module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{js,css,html,png,jpg,jpeg,svg,woff,woff2,ttf,eot,ico}'
  ],
  swDest: 'build/sw.js',
  skipWaiting: true,
  clientsClaim: true,
  
  // Runtime caching strategies
  runtimeCaching: [
    // Cache API responses
    {
      urlPattern: /^http:\/\/localhost:3001\/api\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        backgroundSync: {
          name: 'api-queue',
          options: {
            maxRetentionTime: 24 * 60, // Retry for max of 24 Hours (specified in minutes)
          },
        },
      },
    },
    
    // Cache images with stale-while-revalidate
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    
    // Cache Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
      },
    },
    
    // Cache Google Fonts Web Fonts
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    
    // Cache dashboard data with network first for freshness
    {
      urlPattern: /^http:\/\/localhost:3001\/api\/dashboard\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'dashboard-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 2 * 60, // 2 minutes
        },
      },
    },
    
    // Cache crop recommendations data
    {
      urlPattern: /^http:\/\/localhost:3001\/api\/karnataka\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'crop-recommendations-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 10 * 60, // 10 minutes
        },
      },
    },
    
    // Cache static assets from CDN
    {
      urlPattern: /^https:\/\/cdn\./,
      handler: 'CacheFirst',
      options: {
        cacheName: 'cdn-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
  ],
  
  // Handle navigation requests
  navigateFallback: '/index.html',
  navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
  
  // Manifest transformation
  manifestTransforms: [
    (manifestEntries) => {
      const manifest = manifestEntries.reduce((acc, entry) => {
        // Exclude source maps and test files from precaching
        if (entry.url.endsWith('.map') || entry.url.includes('test')) {
          return acc;
        }
        return [...acc, entry];
      }, []);
      
      return { manifest, warnings: [] };
    },
  ],
  
  // Mode configuration
  mode: 'production',
  
  // Additional configuration
  cleanupOutdatedCaches: true,
  offlineGoogleAnalytics: true,
};