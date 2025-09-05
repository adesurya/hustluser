export const CACHE_CONFIG = {
  // Cache levels and their priorities
  LEVELS: {
    MEMORY: 'memory',
    LOCAL_STORAGE: 'localStorage', 
    INDEXED_DB: 'indexedDB',
    AUTO: 'auto',
    ALL: 'all'
  },

  // Default TTL values (in milliseconds)
  TTL: {
    VERY_SHORT: 30 * 1000,      // 30 seconds
    SHORT: 2 * 60 * 1000,       // 2 minutes  
    MEDIUM: 15 * 60 * 1000,     // 15 minutes
    LONG: 60 * 60 * 1000,       // 1 hour
    VERY_LONG: 24 * 60 * 60 * 1000  // 24 hours
  },

  // Endpoint-specific cache settings
  ENDPOINTS: {
    // User data - frequently accessed, medium duration
    'userProfile': { 
      ttl: this?.TTL?.LONG || 60 * 60 * 1000, 
      level: 'all',
      priority: 'high' 
    },
    'myPoints': { 
      ttl: this?.TTL?.VERY_SHORT || 30 * 1000, 
      level: 'memory',
      priority: 'high' 
    },

    // Product data - moderately accessed, medium duration
    'categories': { 
      ttl: this?.TTL?.VERY_LONG || 24 * 60 * 60 * 1000, 
      level: 'all',
      priority: 'high' 
    },
    'products': { 
      ttl: this?.TTL?.MEDIUM || 15 * 60 * 1000, 
      level: 'all',
      priority: 'medium' 
    },
    'productDetail': { 
      ttl: this?.TTL?.MEDIUM || 15 * 60 * 1000, 
      level: 'all',
      priority: 'low' 
    },
    'featuredProducts': { 
      ttl: this?.TTL?.SHORT || 2 * 60 * 1000, 
      level: 'memory',
      priority: 'medium' 
    },

    // Campaign data - moderately accessed, medium duration
    'campaigns': { 
      ttl: this?.TTL?.MEDIUM || 15 * 60 * 1000, 
      level: 'all',
      priority: 'medium' 
    },
    'campaignDetail': { 
      ttl: this?.TTL?.MEDIUM || 15 * 60 * 1000, 
      level: 'localStorage',
      priority: 'low' 
    },

    // Leaderboard - frequently changing, short duration
    'leaderboard': { 
      ttl: this?.TTL?.SHORT || 2 * 60 * 1000, 
      level: 'memory',
      priority: 'low' 
    },

    // Transaction history - rarely changing, long duration
    'transactions': { 
      ttl: this?.TTL?.LONG || 60 * 60 * 1000, 
      level: 'localStorage',
      priority: 'low' 
    },
    'redemptions': { 
      ttl: this?.TTL?.LONG || 60 * 60 * 1000, 
      level: 'localStorage',
      priority: 'low' 
    }
  },

  // Memory cache limits
  MEMORY: {
    maxItems: 50,
    maxSizePerItem: 100 * 1024, // 100KB per item
    evictionPolicy: 'LRU' // Least Recently Used
  },

  // LocalStorage limits
  LOCAL_STORAGE: {
    maxTotalSize: 4 * 1024 * 1024, // 4MB total
    maxItemSize: 500 * 1024,       // 500KB per item
    quotaWarningThreshold: 0.8     // Warn at 80% usage
  },

  // IndexedDB configuration
  INDEXED_DB: {
    name: 'HazelCache',
    version: 1,
    storeName: 'cache',
    maxItems: 1000,
    cleanupInterval: 60 * 60 * 1000 // 1 hour
  },

  // Network-aware settings
  NETWORK: {
    slowConnectionThreshold: 1000, // Consider connection slow if > 1s
    offlineGracePeriod: 5 * 60 * 1000, // 5 minutes
    backgroundSyncInterval: 10 * 60 * 1000 // 10 minutes
  }
}

// Fix the circular reference
CACHE_CONFIG.ENDPOINTS.userProfile.ttl = CACHE_CONFIG.TTL.LONG
CACHE_CONFIG.ENDPOINTS.myPoints.ttl = CACHE_CONFIG.TTL.VERY_SHORT
CACHE_CONFIG.ENDPOINTS.categories.ttl = CACHE_CONFIG.TTL.VERY_LONG
CACHE_CONFIG.ENDPOINTS.products.ttl = CACHE_CONFIG.TTL.MEDIUM
CACHE_CONFIG.ENDPOINTS.productDetail.ttl = CACHE_CONFIG.TTL.MEDIUM
CACHE_CONFIG.ENDPOINTS.featuredProducts.ttl = CACHE_CONFIG.TTL.SHORT
CACHE_CONFIG.ENDPOINTS.campaigns.ttl = CACHE_CONFIG.TTL.MEDIUM
CACHE_CONFIG.ENDPOINTS.campaignDetail.ttl = CACHE_CONFIG.TTL.MEDIUM
CACHE_CONFIG.ENDPOINTS.leaderboard.ttl = CACHE_CONFIG.TTL.SHORT
CACHE_CONFIG.ENDPOINTS.transactions.ttl = CACHE_CONFIG.TTL.LONG
CACHE_CONFIG.ENDPOINTS.redemptions.ttl = CACHE_CONFIG.TTL.LONG