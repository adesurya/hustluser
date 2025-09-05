// src/services/apiCacheService.js - API-specific caching wrapper
import cacheService from './cacheService'
import apiService from './api'

class ApiCacheService {
  constructor() {
    this.cacheConfig = {
      // Cache durations for different endpoints
      'categories': { ttl: 30 * 60 * 1000, level: 'all' }, // 30 minutes
      'products': { ttl: 15 * 60 * 1000, level: 'all' }, // 15 minutes
      'featuredProducts': { ttl: 10 * 60 * 1000, level: 'memory' }, // 10 minutes
      'campaigns': { ttl: 20 * 60 * 1000, level: 'all' }, // 20 minutes
      'leaderboard': { ttl: 5 * 60 * 1000, level: 'memory' }, // 5 minutes
      'userProfile': { ttl: 60 * 60 * 1000, level: 'all' }, // 1 hour
      'myPoints': { ttl: 2 * 60 * 1000, level: 'memory' }, // 2 minutes
      'transactions': { ttl: 30 * 60 * 1000, level: 'localStorage' }, // 30 minutes
      'redemptions': { ttl: 30 * 60 * 1000, level: 'localStorage' } // 30 minutes
    }
  }

  async cachedRequest(endpoint, params = {}, options = {}) {
    const config = this.cacheConfig[endpoint] || { ttl: 5 * 60 * 1000, level: 'memory' }
    const { forceRefresh = false, ...otherOptions } = options
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await cacheService.get('api', endpoint, params)
      if (cached) {
        console.log(`Cache hit for ${endpoint} (${cached.source})`)
        return cached.data
      }
    }
    
    // Make API request
    console.log(`API request for ${endpoint}`)
    const response = await this.makeApiCall(endpoint, params, otherOptions)
    
    // Cache successful responses
    if (response && response.success) {
      await cacheService.set('api', endpoint, response, {
        ...config,
        params
      })
    }
    
    return response
  }

  async makeApiCall(endpoint, params, options) {
    switch (endpoint) {
      case 'categories':
        return await apiService.getCategories()
      
      case 'products':
        return await apiService.getProducts(params)
      
      case 'productDetail':
        return await apiService.getProductById(params.id)
      
      case 'featuredProducts':
        return await apiService.getFeaturedProducts()
      
      case 'campaigns':
        return await apiService.getActiveCampaigns()
      
      case 'campaignDetail':
        return await apiService.getCampaignById(params.id)
      
      case 'leaderboard':
        if (params.type === 'daily') {
          return await apiService.getLeaderboardDaily(params.date)
        } else if (params.type === 'monthly') {
          return await apiService.getLeaderboardMonthly(params.year, params.month)
        }
        break
      
      case 'userProfile':
        return await apiService.getUserProfile()
      
      case 'myPoints':
        return await apiService.getMyPoints()
      
      case 'transactions':
        return await apiService.getMyTransactions(params)
      
      case 'redemptions':
        return await apiService.getMyRedemptions(params)
      
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`)
    }
  }

  // Invalidate specific cache entries
  async invalidateCache(endpoint, params = {}) {
    await cacheService.invalidate('api', endpoint, params)
  }

  // Invalidate related caches (when data changes)
  async invalidateRelated(action, data = {}) {
    switch (action) {
      case 'productPurchase':
        await this.invalidateCache('myPoints')
        await this.invalidateCache('transactions')
        await this.invalidateCache('userProfile')
        break
      
      case 'redemption':
        await this.invalidateCache('myPoints')
        await this.invalidateCache('redemptions')
        await this.invalidateCache('userProfile')
        break
      
      case 'profileUpdate':
        await this.invalidateCache('userProfile')
        break
      
      case 'campaignJoin':
        await this.invalidateCache('campaigns')
        await this.invalidateCache('leaderboard')
        break
      
      case 'productUpdate':
        await this.invalidateCache('products')
        await this.invalidateCache('featuredProducts')
        if (data.productId) {
          await this.invalidateCache('productDetail', { id: data.productId })
        }
        break
    }
  }

  // Pre-warm cache with commonly accessed data
  async preWarmCache() {
    try {
      console.log('Pre-warming cache...')
      
      // Load critical data in background
      const promises = [
        this.cachedRequest('categories'),
        this.cachedRequest('featuredProducts'),
        this.cachedRequest('campaigns'),
        this.cachedRequest('myPoints')
      ]
      
      await Promise.allSettled(promises)
      console.log('Cache pre-warming completed')
    } catch (error) {
      console.warn('Cache pre-warming failed:', error)
    }
  }
}

export default new ApiCacheService()

