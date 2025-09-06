// src/services/apiCacheService.js - Fixed with proper dynamic endpoint handling
import cacheService from './cacheService'
import apiService from './api'

class ApiCacheService {
  constructor() {
    this.cacheConfig = {
      // Cache durations for different endpoints
      'categories': { ttl: 30 * 60 * 1000, level: 'all' }, // 30 minutes
      'products': { ttl: 15 * 60 * 1000, level: 'all' }, // 15 minutes
      'productDetail': { ttl: 20 * 60 * 1000, level: 'localStorage' }, // 20 minutes
      'featuredProducts': { ttl: 10 * 60 * 1000, level: 'memory' }, // 10 minutes
      'campaigns': { ttl: 20 * 60 * 1000, level: 'all' }, // 20 minutes
      'campaignDetail': { ttl: 30 * 60 * 1000, level: 'localStorage' }, // 30 minutes
      'leaderboard': { ttl: 5 * 60 * 1000, level: 'memory' }, // 5 minutes
      'userProfile': { ttl: 60 * 60 * 1000, level: 'all' }, // 1 hour
      'myPoints': { ttl: 30 * 1000, level: 'memory' }, // 30 seconds
      'transactions': { ttl: 15 * 60 * 1000, level: 'localStorage' }, // 15 minutes
      'redemptions': { ttl: 15 * 60 * 1000, level: 'localStorage' } // 15 minutes
    }
  }

  async cachedRequest(endpoint, params = {}, _options = {}) {
    // Handle dynamic endpoint names for cache config lookup
    let configKey = this.getConfigKey(endpoint)
    
    const config = this.cacheConfig[configKey] || { ttl: 5 * 60 * 1000, level: 'memory' }
    const { forceRefresh = false } = _options
    
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
    const response = await this.makeApiCall(endpoint, params)
    
    // Cache successful responses
    if (response && response.success) {
      await cacheService.set('api', endpoint, response, {
        ...config,
        params
      })
    }
    
    return response
  }

  // FIXED: Better endpoint classification
  getConfigKey(endpoint) {
    if (endpoint.startsWith('product_') && !endpoint.includes('products')) {
      return 'productDetail'
    } else if (endpoint.startsWith('campaign_') && !endpoint.includes('campaigns')) {
      return 'campaignDetail'
    } else if (endpoint.startsWith('leaderboard_')) {
      return 'leaderboard'
    } else if (endpoint.startsWith('transactions_')) {
      return 'transactions'
    } else if (endpoint.startsWith('redemptions_')) {
      return 'redemptions'
    } else if (endpoint.includes('products') || endpoint.startsWith('all_products')) {
      return 'products'
    } else if (endpoint === 'categories') {
      return 'categories'
    } else if (endpoint === 'featuredProducts') {
      return 'featuredProducts'
    } else if (endpoint === 'campaigns') {
      return 'campaigns'
    } else if (endpoint === 'userProfile') {
      return 'userProfile'
    } else if (endpoint === 'myPoints') {
      return 'myPoints'
    }
    
    return 'products' // Default fallback
  }

  // Fixed makeApiCall method with proper case block braces for ESLint
async makeApiCall(endpoint, params) {
  console.log('makeApiCall called with:', { endpoint, params })
  
  // Handle all dynamic endpoint patterns
  const baseEndpoint = this.getBaseEndpoint(endpoint)
  
  switch (baseEndpoint) {
    case 'categories':
      return await apiService.getCategories()
    
    case 'products':
    case 'all_products':
    case 'all_products_for_counting':
    case 'all_products_for_counts':
      return await apiService.getProducts(params)
    
    case 'productDetail': {
      // Extract product ID from endpoint name
      const productId = endpoint.replace('product_', '')
      console.log('Extracted productId:', productId)
      return await apiService.getProductById(productId)
    }
    
    case 'featuredProducts':
      return await apiService.getFeaturedProducts()
    
    case 'campaigns':
      return await apiService.getActiveCampaigns()
    
    case 'campaignDetail': {
      // FIXED: Extract campaign ID from endpoint name
      const campaignId = endpoint.replace('campaign_', '')
      console.log('Extracted campaignId:', campaignId, 'from endpoint:', endpoint)
      return await apiService.getCampaignById(campaignId)
    }
    
    case 'leaderboard':
      if (params.type === 'daily') {
        return await apiService.getLeaderboardDaily(params.date)
      } else if (params.type === 'monthly') {
        return await apiService.getLeaderboardMonthly(params.year, params.month)
      } else if (params.type === 'weekly') {
        return await apiService.getLeaderboardWeekly(params.startDate, params.endDate)
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
    
    default: {
      // Handle remaining dynamic patterns
      if (endpoint.startsWith('product_')) {
        const productId = endpoint.replace('product_', '')
        console.log('Default case - productId:', productId)
        return await apiService.getProductById(productId)
      }
      
      if (endpoint.startsWith('campaign_')) {
        const campaignId = endpoint.replace('campaign_', '')
        console.log('Default case - campaignId:', campaignId)
        return await apiService.getCampaignById(campaignId)
      }
      
      // Handle complex endpoint names with JSON parameters
      if (endpoint.startsWith('all_products_') || endpoint.includes('products')) {
        return await apiService.getProducts(params)
      }
      
      if (endpoint.startsWith('transactions_')) {
        return await apiService.getMyTransactions(params)
      }
      
      if (endpoint.startsWith('redemptions_')) {
        return await apiService.getMyRedemptions(params)
      }
      
      if (endpoint.startsWith('leaderboard_')) {
        const [, type] = endpoint.split('_')
        if (type === 'daily' && params.date) {
          return await apiService.getLeaderboardDaily(params.date)
        } else if (type === 'monthly' && params.year && params.month) {
          return await apiService.getLeaderboardMonthly(params.year, params.month)
        } else if (type === 'weekly' && params.startDate && params.endDate) {
          return await apiService.getLeaderboardWeekly(params.startDate, params.endDate)
        }
      }
      
      console.warn(`Unknown endpoint pattern: ${endpoint}, falling back to products API`)
      return await apiService.getProducts(params)
    }
  }
}

  // FIXED: Extract base endpoint from complex endpoint names
  getBaseEndpoint(endpoint) {
    // Handle simple endpoints first
    const simpleEndpoints = [
      'categories', 'featuredProducts', 'campaigns', 
      'userProfile', 'myPoints', 'products'
    ]
    
    if (simpleEndpoints.includes(endpoint)) {
      return endpoint
    }
    
    // Handle complex patterns
    if (endpoint.startsWith('all_products') || endpoint.includes('products')) {
      return 'products'
    }
    
    if (endpoint.startsWith('product_') && !endpoint.includes('products')) {
      return 'productDetail'
    }
    
    if (endpoint.startsWith('campaign_') && !endpoint.includes('campaigns')) {
      return 'campaignDetail'
    }
    
    if (endpoint.startsWith('leaderboard_')) {
      return 'leaderboard'
    }
    
    if (endpoint.startsWith('transactions_')) {
      return 'transactions'
    }
    
    if (endpoint.startsWith('redemptions_')) {
      return 'redemptions'
    }
    
    // Default to products for unknown patterns
    return 'products'
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
        await this.invalidateCache('transactions')
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

      case 'pointsUpdate':
        await this.invalidateCache('myPoints')
        await this.invalidateCache('userProfile')
        break

      case 'transactionUpdate':
        await this.invalidateCache('transactions')
        await this.invalidateCache('myPoints')
        await this.invalidateCache('userProfile')
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

  // Get cache statistics for monitoring
  async getCacheStats() {
    try {
      const stats = await cacheService.getStats()
      return {
        ...stats,
        endpoints: Object.keys(this.cacheConfig),
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get cache stats:', error)
      return null
    }
  }

  // Clear all API cache
  async clearAllCache() {
    try {
      await cacheService.invalidate('api')
      console.log('All API cache cleared')
    } catch (error) {
      console.error('Failed to clear API cache:', error)
    }
  }
}

export default new ApiCacheService()