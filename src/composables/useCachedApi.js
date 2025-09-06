// src/composables/useCachedApi.js - Enhanced with all missing endpoints
import { ref } from 'vue'
import cacheOptimization from '../utils/cacheOptimization'
import apiCacheService from '../services/apiCacheService'

export function useCachedApi() {
  const loading = ref(false)
  const error = ref('')

  const cachedCall = async (cacheKey, apiFunction, options = {}) => {
    loading.value = true
    error.value = ''

    try {
      const result = await cacheOptimization.getCachedApiCall(
        cacheKey, 
        apiFunction, 
        options
      )
      return result
    } catch (err) {
      error.value = err.message || 'API call failed'
      console.error(`Cached API call failed for ${cacheKey}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Specific methods for common APIs
  const getMyPoints = async (options = {}) => {
    return await cachedCall('myPoints', async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getMyPoints()
    }, { ttl: 30 * 1000, ...options }) // 30 seconds for real-time points
  }

  const getRedemptions = async (params = {}, options = {}) => {
    const cacheKey = `redemptions_${JSON.stringify(params)}`
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getMyRedemptions(params)
    }, { ttl: 15 * 60 * 1000, params, ...options }) // 15 minutes
  }

  const getTransactions = async (params = {}, options = {}) => {
    const cacheKey = `transactions_${JSON.stringify(params)}`
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getMyTransactions(params)
    }, { ttl: 15 * 60 * 1000, params, ...options }) // 15 minutes
  }

  const getCampaigns = async (options = {}) => {
    return await cachedCall('campaigns', async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getActiveCampaigns()
    }, { ttl: 20 * 60 * 1000, ...options }) // 20 minutes
  }

  const getLeaderboard = async (type = 'daily', params = {}, options = {}) => {
    const cacheKey = `leaderboard_${type}_${JSON.stringify(params)}`
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      
      switch (type) {
        case 'daily':
          return await apiService.getLeaderboardDaily(params.date)
        case 'weekly':
          return await apiService.getLeaderboardWeekly(params.startDate, params.endDate)
        case 'monthly':
          return await apiService.getLeaderboardMonthly(params.year, params.month)
        default:
          throw new Error(`Unknown leaderboard type: ${type}`)
      }
    }, { ttl: 5 * 60 * 1000, params, ...options }) // 5 minutes
  }

  const getProductDetail = async (productId, options = {}) => {
    return await cachedCall(`product_${productId}`, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getProductById(productId)
    }, { ttl: 20 * 60 * 1000, params: { productId }, ...options }) // 20 minutes
  }

  const getCampaignDetail = async (campaignId, options = {}) => {
    return await cachedCall(`campaign_${campaignId}`, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getCampaignById(campaignId)
    }, { ttl: 30 * 60 * 1000, params: { campaignId }, ...options }) // 30 minutes
  }

  const getUserProfile = async (options = {}) => {
    return await cachedCall('userProfile', async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getUserProfile()
    }, { ttl: 60 * 60 * 1000, ...options }) // 1 hour
  }

  const getCategories = async (options = {}) => {
    return await cachedCall('categories', async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getCategories()
    }, { ttl: 30 * 60 * 1000, ...options }) // 30 minutes
  }

  const getFeaturedProducts = async (options = {}) => {
    return await cachedCall('featuredProducts', async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getFeaturedProducts()
    }, { ttl: 10 * 60 * 1000, ...options }) // 10 minutes
  }

  const getProducts = async (params = {}, options = {}) => {
    const cacheKey = `products_${JSON.stringify(params)}`
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getProducts(params)
    }, { ttl: 15 * 60 * 1000, params, ...options }) // 15 minutes
  }

  // Utility methods for cache management
  const invalidateCache = async (endpoint, params = {}) => {
    try {
      await apiCacheService.invalidateCache(endpoint, params)
      console.log(`Cache invalidated for ${endpoint}`)
    } catch (err) {
      console.error(`Failed to invalidate cache for ${endpoint}:`, err)
    }
  }

  const invalidateRelated = async (action, data = {}) => {
    try {
      await apiCacheService.invalidateRelated(action, data)
      console.log(`Related caches invalidated for action: ${action}`)
    } catch (err) {
      console.error(`Failed to invalidate related caches for ${action}:`, err)
    }
  }

  const refreshCache = async (endpoint, apiFunction, options = {}) => {
    return await cachedCall(endpoint, apiFunction, { 
      ...options, 
      forceRefresh: true 
    })
  }

  const getCacheStats = async () => {
    try {
      return await apiCacheService.getCacheStats()
    } catch (err) {
      console.error('Failed to get cache stats:', err)
      return null
    }
  }

  const clearAllCache = async () => {
    try {
      await apiCacheService.clearAllCache()
      console.log('All API cache cleared successfully')
    } catch (err) {
      console.error('Failed to clear cache:', err)
    }
  }

  return {
    loading,
    error,
    cachedCall,
    getMyPoints,
    getRedemptions,
    getTransactions,
    getCampaigns,
    getLeaderboard,
    getProductDetail,
    getCampaignDetail,
    getUserProfile,
    getCategories,
    getFeaturedProducts,
    getProducts,
    invalidateCache,
    invalidateRelated,
    refreshCache,
    getCacheStats,
    clearAllCache
  }
}