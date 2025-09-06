// src/plugins/cachePlugin.js - Vue plugin for cache integration
import apiService from '../services/api'
import cacheOptimization from '../utils/cacheOptimization'

export default {
  install(app, options = {}) {
    // Provide cache optimization globally
    app.config.globalProperties.$cache = cacheOptimization
    app.provide('cache', cacheOptimization)
    
    // Add cache control methods
    app.config.globalProperties.$cacheUtils = {
      refresh: (endpoint, apiCall, cacheOptions) => 
        cacheOptimization.getCachedApiCall(endpoint, apiCall, { 
          ...cacheOptions, 
          forceRefresh: true 
        }),
      invalidate: (pattern) => cacheOptimization.invalidateCache(pattern),
      preWarm: () => cacheOptimization.preloadCriticalData()
    }
    
    // Auto pre-warm cache on app start
    if (options.preWarm !== false) {
      cacheOptimization.preloadCriticalData()
    }
    
    // Setup global API wrapper with caching
    const cachedApiWrapper = {
      async getCategories(options = {}) {
        return cacheOptimization.getCachedApiCall(
          'categories',
          () => apiService.getCategories(),
          { ttl: 30 * 60 * 1000, ...options }
        )
      },
      
      async getFeaturedProducts(options = {}) {
        return cacheOptimization.getCachedApiCall(
          'featuredProducts',
          () => apiService.getFeaturedProducts(),
          { ttl: 10 * 60 * 1000, ...options }
        )
      },
      
      async getMyPoints(options = {}) {
        return cacheOptimization.getCachedApiCall(
          'myPoints',
          () => apiService.getMyPoints(),
          { ttl: 2 * 60 * 1000, ...options }
        )
      },
      
      async getActiveCampaigns(options = {}) {
        return cacheOptimization.getCachedApiCall(
          'campaigns',
          () => apiService.getActiveCampaigns(),
          { ttl: 15 * 60 * 1000, ...options }
        )
      },
      
      async getProducts(params = {}, options = {}) {
        const cacheKey = `products_${JSON.stringify(params)}`
        return cacheOptimization.getCachedApiCall(
          cacheKey,
          () => apiService.getProducts(params),
          { ttl: 10 * 60 * 1000, ...options }
        )
      },
      
      // Delegate other methods to original API
      ...apiService
    }
    
    // Provide enhanced API globally
    app.config.globalProperties.$api = cachedApiWrapper
    app.provide('api', cachedApiWrapper)
  }
}