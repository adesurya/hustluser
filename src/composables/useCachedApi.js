// src/composables/useCachedApi.js - Enhanced with bank accounts endpoints
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

  // WISHLIST API METHODS
  const getWishlist = async (params = {}, options = {}) => {
    const cacheKey = `wishlist_${JSON.stringify(params)}`
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getWishlist(params)
    }, { ttl: 2 * 60 * 1000, params, ...options }) // 2 minutes for fresh wishlist data
  }

  const getWishlistCount = async (options = {}) => {
    return await cachedCall('wishlistCount', async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getWishlistCount()
    }, { ttl: 1 * 60 * 1000, ...options }) // 1 minute for count
  }

  const addToWishlist = async (productId) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.addToWishlist(productId)
      
      // Invalidate wishlist-related caches after successful addition
      await invalidateRelated('wishlistUpdate', { productId, action: 'added' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to add to wishlist'
      console.error('Failed to add to wishlist:', err)
      throw err
    }
  }

  const removeFromWishlist = async (wishlistItemId) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.removeFromWishlist(wishlistItemId)
      
      // Invalidate wishlist-related caches after successful removal
      await invalidateRelated('wishlistUpdate', { wishlistItemId, action: 'removed' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to remove from wishlist'
      console.error('Failed to remove from wishlist:', err)
      throw err
    }
  }

  const toggleWishlist = async (productId) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.toggleWishlist(productId)
      
      // Invalidate wishlist-related caches after successful toggle
      await invalidateRelated('wishlistUpdate', { 
        productId, 
        action: result.data?.action || 'toggled' 
      })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to toggle wishlist'
      console.error('Failed to toggle wishlist:', err)
      throw err
    }
  }

  const isInWishlist = async (productId) => {
    try {
      const { default: apiService } = await import('../services/api')
      return await apiService.isInWishlist(productId)
    } catch (err) {
      console.warn('Failed to check wishlist status:', err)
      return false
    }
  }

  // BANK ACCOUNTS API METHODS - NEW IMPLEMENTATION
  const getBankAccounts = async (params = {}, options = {}) => {
    const cacheKey = `bankAccounts_${JSON.stringify(params)}`
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getBankAccounts(params)
    }, { ttl: 10 * 60 * 1000, params, ...options }) // 10 minutes for bank accounts
  }

  const getBankAccountById = async (accountId, options = {}) => {
    return await cachedCall(`bankAccount_${accountId}`, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getBankAccountById(accountId)
    }, { ttl: 15 * 60 * 1000, params: { accountId }, ...options }) // 15 minutes
  }

  const addBankAccount = async (bankAccountData) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.addBankAccount(bankAccountData)
      
      // Invalidate bank account related caches after successful addition
      await invalidateRelated('bankAccountUpdate', { bankAccountData, action: 'added' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to add bank account'
      console.error('Failed to add bank account:', err)
      throw err
    }
  }

  const updateBankAccount = async (accountId, bankAccountData) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.updateBankAccount(accountId, bankAccountData)
      
      // Invalidate bank account related caches after successful update
      await invalidateRelated('bankAccountUpdate', { accountId, bankAccountData, action: 'updated' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to update bank account'
      console.error('Failed to update bank account:', err)
      throw err
    }
  }

  const setPrimaryBankAccount = async (accountId) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.setPrimaryBankAccount(accountId)
      
      // Invalidate bank account related caches after setting primary
      await invalidateRelated('bankAccountUpdate', { accountId, action: 'setPrimary' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to set primary bank account'
      console.error('Failed to set primary bank account:', err)
      throw err
    }
  }

  const deleteBankAccount = async (accountId) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.deleteBankAccount(accountId)
      
      // Invalidate bank account related caches after successful deletion
      await invalidateRelated('bankAccountUpdate', { accountId, action: 'deleted' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to delete bank account'
      console.error('Failed to delete bank account:', err)
      throw err
    }
  }

  // AFFILIATE LINKS API METHODS - EXISTING IMPLEMENTATION
  const getAffiliateLinks = async (params = {}, options = {}) => {
    const cacheKey = `affiliateLinks_${JSON.stringify(params)}`
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getAffiliateLinks(params)
    }, { ttl: 5 * 60 * 1000, params, ...options }) // 5 minutes for fresh affiliate data
  }

  const getAffiliateLinkById = async (linkId, options = {}) => {
    return await cachedCall(`affiliateLink_${linkId}`, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getAffiliateLinkById(linkId)
    }, { ttl: 10 * 60 * 1000, params: { linkId }, ...options }) // 10 minutes
  }

  const generateAffiliateLink = async (productData) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.generateAffiliateLink(productData)
      
      // Invalidate affiliate links caches after successful generation
      await invalidateRelated('affiliateLinksUpdate', { productData, action: 'generated' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to generate affiliate link'
      console.error('Failed to generate affiliate link:', err)
      throw err
    }
  }

  const shareAffiliateLink = async (shareData) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.shareAffiliateLink(shareData)
      
      // Invalidate affiliate links caches after successful share
      await invalidateRelated('affiliateLinksUpdate', { shareData, action: 'shared' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to share affiliate link'
      console.error('Failed to share affiliate link:', err)
      throw err
    }
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
    // Wishlist methods
    getWishlist,
    getWishlistCount,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    // Bank Account methods - NEW
    getBankAccounts,
    getBankAccountById,
    addBankAccount,
    updateBankAccount,
    setPrimaryBankAccount,
    deleteBankAccount,
    // Affiliate Links methods
    getAffiliateLinks,
    getAffiliateLinkById,
    generateAffiliateLink,
    shareAffiliateLink,
    // Cache management
    invalidateCache,
    invalidateRelated,
    refreshCache,
    getCacheStats,
    clearAllCache
  }
}