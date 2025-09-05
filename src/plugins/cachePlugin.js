// src/plugins/cachePlugin.js - Vue plugin for cache integration
import enhancedApiService from '../services/enhancedApiService'
import originalApiService from '../services/api'

export default {
  install(app, options = {}) {
    // Initialize enhanced API service with original API
    enhancedApiService.initialize(originalApiService)
    
    // Provide enhanced API globally
    app.config.globalProperties.$api = enhancedApiService
    app.provide('api', enhancedApiService)
    
    // Add cache control methods
    app.config.globalProperties.$cache = {
      refresh: enhancedApiService.refreshCache.bind(enhancedApiService),
      invalidate: enhancedApiService.invalidateCache.bind(enhancedApiService),
      preWarm: enhancedApiService.preWarmCache.bind(enhancedApiService)
    }
    
    // Auto pre-warm cache on app start
    if (options.preWarm !== false) {
      enhancedApiService.preWarmCache()
    }
  }
}

