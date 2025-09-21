// src/services/apiCacheService.js - Fixed version
import cacheService from './cacheService'
import apiService from './api'

class ApiCacheService {
  constructor() {
    this.cacheConfig = {
      // Cache durations for different endpoints
      'categories': { ttl: 30 * 60 * 1000, level: 'all' },
      'products': { ttl: 15 * 60 * 1000, level: 'all' },
      'productDetail': { ttl: 20 * 60 * 1000, level: 'localStorage' },
      'featuredProducts': { ttl: 10 * 60 * 1000, level: 'memory' },
      'campaigns': { ttl: 20 * 60 * 1000, level: 'all' },
      'campaignDetail': { ttl: 30 * 60 * 1000, level: 'localStorage' },
      'leaderboard': { ttl: 5 * 60 * 1000, level: 'memory' },
      'userProfile': { ttl: 60 * 60 * 1000, level: 'all' },
      'myPoints': { ttl: 30 * 1000, level: 'memory' },
      'transactions': { ttl: 15 * 60 * 1000, level: 'localStorage' },
      'redemptions': { ttl: 15 * 60 * 1000, level: 'localStorage' },
      'wishlist': { ttl: 2 * 60 * 1000, level: 'memory' },
      'wishlistCount': { ttl: 1 * 60 * 1000, level: 'memory' },
      'affiliateLinks': { ttl: 5 * 60 * 1000, level: 'memory' },
      'affiliateLinkDetail': { ttl: 10 * 60 * 1000, level: 'localStorage' },
      'bankAccounts': { ttl: 10 * 60 * 1000, level: 'memory' },
      'bankAccountDetail': { ttl: 15 * 60 * 1000, level: 'localStorage' },
      'gamificationStatus': { ttl: 1 * 60 * 1000, level: 'memory' }, // 1 minute for fresh data
      'missionHistory': { ttl: 5 * 60 * 1000, level: 'localStorage' }
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

  // Enhanced endpoint classification
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
    } else if (endpoint.startsWith('wishlist_') || endpoint === 'wishlist') {
      return 'wishlist'
    } else if (endpoint === 'wishlistCount') {
      return 'wishlistCount'
    } else if (endpoint.startsWith('affiliateLinks_') || endpoint === 'affiliateLinks') {
      return 'affiliateLinks'
    } else if (endpoint.startsWith('affiliateLink_')) {
      return 'affiliateLinkDetail'
    } else if (endpoint.startsWith('bankAccounts_') || endpoint === 'bankAccounts') {
      return 'bankAccounts'
    } else if (endpoint.startsWith('bankAccount_')) {
      return 'bankAccountDetail'
    } else if (endpoint.startsWith('missionHistory_') || endpoint === 'missionHistory') {
      return 'missionHistory'
    } else if (endpoint === 'gamificationStatus') {
      return 'gamificationStatus'
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
    
    // FIXED: Don't default to products for unknown endpoints
    console.warn(`Unknown endpoint pattern: ${endpoint}`)
    return null
  }

  // Enhanced makeApiCall method - FIXED to handle gamification properly
  async makeApiCall(endpoint, params) {
    console.log('makeApiCall called with:', { endpoint, params })
    
    // Handle all dynamic endpoint patterns
    const baseEndpoint = this.getBaseEndpoint(endpoint)
    
    switch (baseEndpoint) {
      case 'gamificationStatus':
        console.log('🎯 Calling gamification status API')
        return await apiService.getGamificationStatus()
      
      case 'missionHistory':
        console.log('📋 Calling mission history API with params:', params)
        return await apiService.getMissionHistory(params)
      
      case 'categories':
        return await apiService.getCategories()
      
      case 'products':
      case 'all_products':
        return await apiService.getProducts(params)
      
      case 'productDetail': {
        const productId = endpoint.replace('product_', '')
        return await apiService.getProductById(productId)
      }
      
      case 'featuredProducts':
        return await apiService.getFeaturedProducts()
      
      case 'campaigns':
        return await apiService.getActiveCampaigns()
      
      case 'campaignDetail': {
        const campaignId = endpoint.replace('campaign_', '')
        return await apiService.getCampaignById(campaignId)
      }
      
      case 'leaderboard': {
        if (params.type === 'daily') {
          return await apiService.getLeaderboardDaily(params.date)
        } else if (params.type === 'monthly') {
          return await apiService.getLeaderboardMonthly(params.year, params.month)
        } else if (params.type === 'weekly') {
          return await apiService.getLeaderboardWeekly(params.startDate, params.endDate)
        }
        break
      }
      
      case 'userProfile':
        return await apiService.getUserProfile()
      
      case 'myPoints':
        return await apiService.getMyPoints()
      
      case 'transactions':
        return await apiService.getMyTransactions(params)
      
      case 'redemptions':
        return await apiService.getMyRedemptions(params)
      
      case 'wishlist':
        return await apiService.getWishlist(params)
      
      case 'wishlistCount':
        return await apiService.getWishlistCount()
      
      case 'affiliateLinks': {
        const safeParams = {
          page: params.page || 1,
          limit: params.limit || 20
        }
        
        if (params.status && params.status.trim() !== '') {
          safeParams.status = params.status
        }
        
        return await apiService.getAffiliateLinks(safeParams)
      }
      
      case 'affiliateLinkDetail': {
        const linkId = endpoint.replace('affiliateLink_', '')
        return await apiService.getAffiliateLinkById(linkId)
      }
      
      case 'bankAccounts': {
        const cleanParams = { ...params }
        delete cleanParams.sortBy
        delete cleanParams.sortOrder
        return await apiService.getBankAccounts(cleanParams)
      }
      
      case 'bankAccountDetail': {
        const accountId = endpoint.replace('bankAccount_', '')
        return await apiService.getBankAccountById(accountId)
      }
      
      default: {
        // FIXED: Handle remaining patterns without defaulting to products
        if (endpoint.startsWith('product_')) {
          const productId = endpoint.replace('product_', '')
          return await apiService.getProductById(productId)
        }
        
        if (endpoint.startsWith('campaign_')) {
          const campaignId = endpoint.replace('campaign_', '')
          return await apiService.getCampaignById(campaignId)
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
        
        if (endpoint.startsWith('wishlist_')) {
          return await apiService.getWishlist(params)
        }
        
        if (endpoint.startsWith('affiliateLinks_')) {
          return await apiService.getAffiliateLinks(params)
        }
        
        if (endpoint.startsWith('affiliateLink_')) {
          const linkId = endpoint.replace('affiliateLink_', '')
          return await apiService.getAffiliateLinkById(linkId)
        }
        
        if (endpoint.startsWith('bankAccounts_')) {
          const cleanParams = { ...params }
          delete cleanParams.sortBy
          delete cleanParams.sortOrder
          return await apiService.getBankAccounts(cleanParams)
        }
        
        if (endpoint.startsWith('bankAccount_')) {
          const accountId = endpoint.replace('bankAccount_', '')
          return await apiService.getBankAccountById(accountId)
        }

        if (endpoint.startsWith('missionHistory_')) {
          return await apiService.getMissionHistory(params)
        }
        
        // FIXED: Throw error instead of defaulting to products
        throw new Error(`Unknown API endpoint: ${endpoint}`)
      }
    }
  }

  // Enhanced base endpoint extraction
  getBaseEndpoint(endpoint) {
    // Handle simple endpoints first
    const simpleEndpoints = [
      'categories', 'featuredProducts', 'campaigns', 
      'userProfile', 'myPoints', 'products', 'wishlist', 'wishlistCount',
      'affiliateLinks', 'bankAccounts', 'gamificationStatus', 'missionHistory'
    ]
    
    if (simpleEndpoints.includes(endpoint)) {
      return endpoint
    }
    
    // Handle complex patterns
    if (endpoint.includes('products') && !endpoint.startsWith('product_')) {
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
    
    if (endpoint.startsWith('wishlist_')) {
      return 'wishlist'
    }
    
    if (endpoint.startsWith('affiliateLinks_')) {
      return 'affiliateLinks'
    }
    
    if (endpoint.startsWith('affiliateLink_')) {
      return 'affiliateLinkDetail'
    }
    
    if (endpoint.startsWith('bankAccounts_')) {
      return 'bankAccounts'
    }
    
    if (endpoint.startsWith('bankAccount_')) {
      return 'bankAccountDetail'
    }
    
    if (endpoint.startsWith('missionHistory_')) {
      return 'missionHistory'
    }
    
    // FIXED: Return null for unknown patterns instead of defaulting
    return null
  }

  // Invalidate specific cache entries
  async invalidateCache(endpoint, params = {}) {
    await cacheService.invalidate('api', endpoint, params)
  }

  // Enhanced invalidate related caches
  // Replace this method in apiCacheService.js (around line 410-460)

async invalidateRelated(action, _data = {}) {
  switch (action) {
    case 'checkinUpdate':
      await this.invalidateCache('gamificationStatus')
      await this.invalidateCache('missionHistory')
      await this.invalidateCache('myPoints')
      await this.invalidateCache('userProfile')
      await this.invalidateCache('leaderboard')
      // Invalidate all mission related patterns
      await cacheService.invalidate('api', 'missionHistory_')
      console.log('Check-in caches invalidated')
      break
    
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
    
    case 'wishlistUpdate':
      await this.invalidateCache('wishlist')
      await this.invalidateCache('wishlistCount')
      await cacheService.invalidate('api', 'wishlist_')
      console.log('Wishlist caches invalidated')
      break

    case 'affiliateLinksUpdate':
      await this.invalidateCache('affiliateLinks')
      await cacheService.invalidate('api', 'affiliateLinks_')
      await this.invalidateCache('myPoints')
      console.log('Affiliate links caches invalidated')
      break

    case 'bankAccountUpdate':
      await this.invalidateCache('bankAccounts')
      await cacheService.invalidate('api', 'bankAccounts_')
      await cacheService.invalidate('api', 'bankAccount_')
      console.log('Bank account caches invalidated')
      break

    case 'login':
      await this.invalidateCache('userProfile')
      await this.invalidateCache('myPoints')
      await this.invalidateCache('gamificationStatus')
      await this.invalidateCache('missionHistory')
      break

    case 'logout':
      await cacheService.invalidate('api')
      break
      
    default:
      console.warn(`Unknown invalidation action: ${action}`)
      break
  }
}

  // FIXED: Pre-warm cache WITHOUT auto-loading problematic endpoints
  async preWarmCache() {
    try {
      console.log('Pre-warming cache...')
      
      // Load only essential data
      const promises = [
        this.cachedRequest('categories'),
        this.cachedRequest('myPoints')
      ]

      // Only load user-specific data if authenticated
      const token = localStorage.getItem('accessToken')
      if (token) {
        promises.push(
          this.cachedRequest('gamificationStatus'),
          this.cachedRequest('userProfile')
        )
      }
      
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