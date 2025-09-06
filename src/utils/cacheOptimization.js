// src/utils/cacheOptimization.js - Enhanced with full endpoint support
import apiCacheService from '../services/apiCacheService'

class CacheOptimization {
  constructor() {
    this.performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      slowQueries: []
    }
    
    this.initializeOptimizations()
  }

  initializeOptimizations() {
    // Pre-load critical data when app starts
    this.schedulePreloading()
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring()
  }

  async getCachedApiCall(cacheKey, apiCall, options = {}) {
    const startTime = Date.now()
    this.performanceMetrics.totalRequests++
    
    try {
      // Use apiCacheService for consistent caching
      const result = await apiCacheService.cachedRequest(cacheKey, options.params || {}, options)
      
      const responseTime = Date.now() - startTime
      this.recordMetrics(cacheKey, responseTime, result ? 'hit' : 'miss')
      
      // If no cached result, make API call
      if (!result) {
        const apiResult = await apiCall()
        const apiResponseTime = Date.now() - startTime
        this.recordMetrics(cacheKey, apiResponseTime, 'miss')
        return apiResult
      }
      
      return result
    } catch (error) {
      const errorTime = Date.now() - startTime
      this.recordMetrics(cacheKey, errorTime, 'error')
      throw error
    }
  }

  recordMetrics(endpoint, responseTime, type) {
    if (type === 'hit') {
      this.performanceMetrics.cacheHits++
    } else if (type === 'miss') {
      this.performanceMetrics.cacheMisses++
    }
    
    // Track slow queries
    if (responseTime > 1000) {
      this.performanceMetrics.slowQueries.push({
        endpoint,
        responseTime,
        timestamp: Date.now(),
        type
      })
      
      // Keep only last 10 slow queries
      if (this.performanceMetrics.slowQueries.length > 10) {
        this.performanceMetrics.slowQueries.shift()
      }
    }
    
    // Update average response time
    const totalTime = this.performanceMetrics.averageResponseTime * 
                     (this.performanceMetrics.totalRequests - 1) + responseTime
    this.performanceMetrics.averageResponseTime = totalTime / this.performanceMetrics.totalRequests
  }

  async preloadCriticalData() {
    try {
      console.log('Preloading critical data...')
      
      const criticalEndpoints = [
        'categories',
        'featuredProducts', 
        'myPoints',
        'campaigns'
      ]
      
      const promises = criticalEndpoints.map(endpoint => 
        apiCacheService.cachedRequest(endpoint, {}, { forceRefresh: false })
          .catch(err => {
            console.warn(`Failed to preload ${endpoint}:`, err)
            return null
          })
      )
      
      const results = await Promise.allSettled(promises)
      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length
      
      console.log(`Preloaded ${successful}/${criticalEndpoints.length} critical endpoints`)
    } catch (error) {
      console.warn('Critical data preloading failed:', error)
    }
  }

  schedulePreloading() {
    // Preload immediately
    setTimeout(() => this.preloadCriticalData(), 1000)
    
    // Schedule periodic background refresh
    setInterval(() => {
      this.backgroundRefresh()
    }, 10 * 60 * 1000) // Every 10 minutes
  }

  async backgroundRefresh() {
    try {
      console.log('Background cache refresh started...')
      
      const refreshEndpoints = [
        { endpoint: 'myPoints', ttl: 30 * 1000 },
        { endpoint: 'featuredProducts', ttl: 10 * 60 * 1000 },
        { endpoint: 'campaigns', ttl: 20 * 60 * 1000 }
      ]
      
      const promises = refreshEndpoints.map(({ endpoint, ttl }) =>
        apiCacheService.cachedRequest(endpoint, {}, { forceRefresh: true, ttl })
          .catch(err => {
            console.warn(`Background refresh failed for ${endpoint}:`, err)
            return null
          })
      )
      
      await Promise.allSettled(promises)
      console.log('Background cache refresh completed')
    } catch (error) {
      console.warn('Background refresh error:', error)
    }
  }

  setupPerformanceMonitoring() {
    // Log performance metrics every 5 minutes
    setInterval(() => {
      this.logPerformanceMetrics()
    }, 5 * 60 * 1000)
  }

  logPerformanceMetrics() {
    const hitRate = this.performanceMetrics.totalRequests > 0 
      ? (this.performanceMetrics.cacheHits / this.performanceMetrics.totalRequests * 100).toFixed(2)
      : 0
    
    console.group('Cache Performance Metrics')
    console.log(`Cache Hit Rate: ${hitRate}%`)
    console.log(`Total Requests: ${this.performanceMetrics.totalRequests}`)
    console.log(`Average Response Time: ${this.performanceMetrics.averageResponseTime.toFixed(2)}ms`)
    console.log(`Slow Queries: ${this.performanceMetrics.slowQueries.length}`)
    
    if (this.performanceMetrics.slowQueries.length > 0) {
      console.log('Recent Slow Queries:', this.performanceMetrics.slowQueries.slice(-3))
    }
    console.groupEnd()
  }

  async invalidateCache(pattern) {
    try {
      if (typeof pattern === 'string') {
        await apiCacheService.invalidateCache(pattern)
      } else if (Array.isArray(pattern)) {
        const promises = pattern.map(p => apiCacheService.invalidateCache(p))
        await Promise.all(promises)
      }
      console.log(`Cache invalidated for pattern: ${pattern}`)
    } catch (error) {
      console.error('Cache invalidation failed:', error)
    }
  }

  async optimizeForConnection() {
    try {
      // Detect connection speed (basic implementation)
      const startTime = Date.now()
      await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' })
      const connectionTime = Date.now() - startTime
      
      if (connectionTime > 1000) {
        console.log('Slow connection detected, optimizing cache strategy...')
        // Extend cache TTL for slow connections
        return this.adjustCacheForSlowConnection()
      } else {
        console.log('Fast connection detected, using standard cache strategy')
        return this.adjustCacheForFastConnection()
      }
    } catch (error) {
      console.warn('Connection optimization failed:', error)
      return false
    }
  }

  adjustCacheForSlowConnection() {
    // Extend cache TTL and increase memory usage for slow connections
    const slowConnectionConfig = {
      myPoints: { ttl: 2 * 60 * 1000, level: 'memory' }, // 2 minutes
      categories: { ttl: 60 * 60 * 1000, level: 'all' }, // 1 hour
      products: { ttl: 30 * 60 * 1000, level: 'all' }, // 30 minutes
      featuredProducts: { ttl: 20 * 60 * 1000, level: 'memory' }, // 20 minutes
      campaigns: { ttl: 40 * 60 * 1000, level: 'all' }, // 40 minutes
      transactions: { ttl: 30 * 60 * 1000, level: 'localStorage' }, // 30 minutes
      redemptions: { ttl: 30 * 60 * 1000, level: 'localStorage' } // 30 minutes
    }
    
    // Update cache config
    Object.assign(apiCacheService.cacheConfig, slowConnectionConfig)
    return true
  }

  adjustCacheForFastConnection() {
    // Use shorter TTL for fast connections to get fresher data
    const fastConnectionConfig = {
      myPoints: { ttl: 30 * 1000, level: 'memory' }, // 30 seconds
      categories: { ttl: 30 * 60 * 1000, level: 'all' }, // 30 minutes
      products: { ttl: 15 * 60 * 1000, level: 'all' }, // 15 minutes
      featuredProducts: { ttl: 10 * 60 * 1000, level: 'memory' }, // 10 minutes
      campaigns: { ttl: 20 * 60 * 1000, level: 'all' }, // 20 minutes
      transactions: { ttl: 15 * 60 * 1000, level: 'localStorage' }, // 15 minutes
      redemptions: { ttl: 15 * 60 * 1000, level: 'localStorage' } // 15 minutes
    }
    
    // Update cache config
    Object.assign(apiCacheService.cacheConfig, fastConnectionConfig)
    return true
  }

  getMetrics() {
    const hitRate = this.performanceMetrics.totalRequests > 0 
      ? (this.performanceMetrics.cacheHits / this.performanceMetrics.totalRequests * 100)
      : 0
    
    return {
      ...this.performanceMetrics,
      cacheHitRate: hitRate.toFixed(2),
      recentRequests: this.performanceMetrics.slowQueries
    }
  }

  resetMetrics() {
    this.performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      slowQueries: []
    }
  }

  async warmupSpecificEndpoints(endpoints = []) {
    try {
      console.log(`Warming up specific endpoints: ${endpoints.join(', ')}`)
      
      const promises = endpoints.map(endpoint =>
        apiCacheService.cachedRequest(endpoint, {}, { forceRefresh: false })
          .catch(err => {
            console.warn(`Warmup failed for ${endpoint}:`, err)
            return null
          })
      )
      
      const results = await Promise.allSettled(promises)
      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length
      
      console.log(`Warmed up ${successful}/${endpoints.length} endpoints`)
      return successful === endpoints.length
    } catch (error) {
      console.error('Endpoint warmup failed:', error)
      return false
    }
  }
}

export default new CacheOptimization()