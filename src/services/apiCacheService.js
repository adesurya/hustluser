// src/services/apiCacheService.js - Enhanced with bank account endpoint handling
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
      'redemptions': { ttl: 15 * 60 * 1000, level: 'localStorage' }, // 15 minutes
      // Wishlist cache configurations
      'wishlist': { ttl: 2 * 60 * 1000, level: 'memory' }, // 2 minutes for fresh data
      'wishlistCount': { ttl: 1 * 60 * 1000, level: 'memory' }, // 1 minute for count
      // Affiliate Links cache configurations
      'affiliateLinks': { ttl: 5 * 60 * 1000, level: 'memory' }, // 5 minutes for fresh data
      'affiliateLinkDetail': { ttl: 10 * 60 * 1000, level: 'localStorage' }, // 10 minutes
      // Bank Accounts cache configurations - NEW
      'bankAccounts': { ttl: 10 * 60 * 1000, level: 'memory' }, // 10 minutes for bank accounts
      'bankAccountDetail': { ttl: 15 * 60 * 1000, level: 'localStorage' } // 15 minutes
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

  // Enhanced endpoint classification with bank account support
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

  // Enhanced makeApiCall method with bank account support
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
        // Extract campaign ID from endpoint name
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
      
      // WISHLIST API CALLS
      case 'wishlist':
        return await apiService.getWishlist(params)
      
      case 'wishlistCount':
        return await apiService.getWishlistCount()
      
      // AFFILIATE LINKS API CALLS
      case 'affiliateLinks':
        return await apiService.getAffiliateLinks(params)
      
      case 'affiliateLinkDetail': {
        // Extract affiliate link ID from endpoint name
        const linkId = endpoint.replace('affiliateLink_', '')
        console.log('Extracted affiliateLinkId:', linkId)
        return await apiService.getAffiliateLinkById(linkId)
      }
      
      // BANK ACCOUNTS API CALLS - NEW IMPLEMENTATION
      case 'bankAccounts':
        return await apiService.getBankAccounts(params)
      
      case 'bankAccountDetail': {
        // Extract bank account ID from endpoint name
        const accountId = endpoint.replace('bankAccount_', '')
        console.log('Extracted bankAccountId:', accountId)
        return await apiService.getBankAccountById(accountId)
      }
      
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
        
        // Handle wishlist patterns
        if (endpoint.startsWith('wishlist_')) {
          return await apiService.getWishlist(params)
        }
        
        // Handle affiliate links patterns
        if (endpoint.startsWith('affiliateLinks_')) {
          return await apiService.getAffiliateLinks(params)
        }
        
        if (endpoint.startsWith('affiliateLink_')) {
          const linkId = endpoint.replace('affiliateLink_', '')
          return await apiService.getAffiliateLinkById(linkId)
        }
        
        // Handle bank account patterns
        if (endpoint.startsWith('bankAccounts_')) {
          return await apiService.getBankAccounts(params)
        }
        
        if (endpoint.startsWith('bankAccount_')) {
          const accountId = endpoint.replace('bankAccount_', '')
          return await apiService.getBankAccountById(accountId)
        }
        
        console.warn(`Unknown endpoint pattern: ${endpoint}, falling back to products API`)
        return await apiService.getProducts(params)
      }
    }
  }

  // Enhanced base endpoint extraction with bank account support
  getBaseEndpoint(endpoint) {
    // Handle simple endpoints first
    const simpleEndpoints = [
      'categories', 'featuredProducts', 'campaigns', 
      'userProfile', 'myPoints', 'products', 'wishlist', 'wishlistCount',
      'affiliateLinks', 'bankAccounts'
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
    
    // Default to products for unknown patterns
    return 'products'
  }

  // Invalidate specific cache entries
  async invalidateCache(endpoint, params = {}) {
    await cacheService.invalidate('api', endpoint, params)
  }

  // Enhanced invalidate related caches with bank account support
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

      // WISHLIST INVALIDATION
      case 'wishlistUpdate':
        await this.invalidateCache('wishlist')
        await this.invalidateCache('wishlistCount')
        // Invalidate all wishlist-related patterns
        await cacheService.invalidate('api', 'wishlist_')
        console.log('Wishlist caches invalidated')
        break

      // AFFILIATE LINKS INVALIDATION
      case 'affiliateLinksUpdate':
        await this.invalidateCache('affiliateLinks')
        // Invalidate all affiliate links related patterns
        await cacheService.invalidate('api', 'affiliateLinks_')
        // Also invalidate points as affiliate actions might affect points
        await this.invalidateCache('myPoints')
        console.log('Affiliate links caches invalidated')
        break

      // BANK ACCOUNTS INVALIDATION - NEW IMPLEMENTATION
      case 'bankAccountUpdate':
        await this.invalidateCache('bankAccounts')
        // Invalidate all bank account related patterns
        await cacheService.invalidate('api', 'bankAccounts_')
        await cacheService.invalidate('api', 'bankAccount_')
        console.log('Bank account caches invalidated')
        break

      case 'login':
        // When user logs in, invalidate all user-specific data
        await this.invalidateCache('userProfile')
        await this.invalidateCache('myPoints')
        await this.invalidateCache('wishlist')
        await this.invalidateCache('wishlistCount')
        await this.invalidateCache('affiliateLinks')
        await this.invalidateCache('bankAccounts')
        await this.invalidateCache('transactions')
        await this.invalidateCache('redemptions')
        break

      case 'logout':
        // When user logs out, clear all user-specific cached data
        await this.invalidateCache('userProfile')
        await this.invalidateCache('myPoints')
        await this.invalidateCache('wishlist')
        await this.invalidateCache('wishlistCount')
        await this.invalidateCache('affiliateLinks')
        await this.invalidateCache('bankAccounts')
        await this.invalidateCache('transactions')
        await this.invalidateCache('redemptions')
        await cacheService.invalidate('api', 'wishlist_')
        await cacheService.invalidate('api', 'affiliateLinks_')
        await cacheService.invalidate('api', 'bankAccounts_')
        await cacheService.invalidate('api', 'bankAccount_')
        break
    }
  }

  // Pre-warm cache with commonly accessed data including bank accounts
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

      // Add user-specific pre-warming for authenticated users
      const token = localStorage.getItem('accessToken')
      if (token) {
        promises.push(
          this.cachedRequest('wishlistCount'),
          this.cachedRequest('wishlist', { page: 1, limit: 20, includeProduct: true }),
          this.cachedRequest('affiliateLinks', { page: 1, limit: 10, sortBy: 'created_at', sortOrder: 'DESC' }),
          this.cachedRequest('bankAccounts', { page: 1, limit: 20, sortBy: 'created_at', sortOrder: 'DESC' })
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