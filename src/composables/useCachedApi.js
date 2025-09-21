// src/composables/useCachedApi.js - Complete fixed version
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

  // GAMIFICATION APIs - PRIMARY for leaderboard
  const getGamificationStatus = async (options = {}) => {
    const cacheKey = 'gamificationStatus'
    
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      
      console.log('🎯 Calling getGamificationStatus API')
      
      const result = await apiService.getGamificationStatus()
      
      console.log('📥 Gamification API response:', result)
      
      // Validate response structure
      if (!result || !result.success) {
        throw new Error('Invalid gamification status response')
      }
      
      // Ensure proper data structure based on API response
      if (!result.data || typeof result.data !== 'object') {
        console.warn('⚠️ Invalid data structure, creating default')
        
        return {
          success: true,
          data: {
            checkin: {
              hasCheckedInToday: false,
              currentStreak: 0,
              nextBonusIn: 7,
              lastCheckinDate: null,
              todayCheckinId: null,
              streakHistory: {
                streakCount: 0,
                isBonusDay: false,
                bonusPoints: 0
              }
            },
            missions: [],
            configs: {
              checkin: {
                streak_days: 7,
                bonus_points: 100,
                reset_on_miss: true
              }
            }
          }
        }
      }
      
      // Handle array response (wrong endpoint called)
      if (Array.isArray(result.data)) {
        console.error('❌ Received array data - wrong API endpoint called!')
        
        return {
          success: true,
          data: {
            checkin: {
              hasCheckedInToday: false,
              currentStreak: 0,
              nextBonusIn: 7,
              lastCheckinDate: null,
              todayCheckinId: null,
              streakHistory: {
                streakCount: 0,
                isBonusDay: false,
                bonusPoints: 0
              }
            },
            missions: [],
            configs: {
              checkin: {
                streak_days: 7,
                bonus_points: 100,
                reset_on_miss: true
              }
            }
          }
        }
      }
      
      // Ensure checkin structure exists with all required fields
      if (!result.data.checkin) {
        result.data.checkin = {
          hasCheckedInToday: false,
          currentStreak: 0,
          nextBonusIn: 7,
          lastCheckinDate: null,
          todayCheckinId: null,
          streakHistory: {
            streakCount: 0,
            isBonusDay: false,
            bonusPoints: 0
          }
        }
      } else {
        const checkin = result.data.checkin
        
        // Validate and set defaults for missing fields
        if (typeof checkin.hasCheckedInToday !== 'boolean') {
          checkin.hasCheckedInToday = false
        }
        
        if (typeof checkin.currentStreak !== 'number') {
          checkin.currentStreak = 0
        }
        
        if (typeof checkin.nextBonusIn !== 'number') {
          const streakDays = result.data.configs?.checkin?.streak_days || 7
          checkin.nextBonusIn = streakDays - (checkin.currentStreak % streakDays)
          if (checkin.nextBonusIn === 0) {
            checkin.nextBonusIn = 7
          }
        }
        
        if (!checkin.streakHistory) {
          checkin.streakHistory = {
            streakCount: checkin.currentStreak || 0,
            isBonusDay: false,
            bonusPoints: 0
          }
        }
      }
      
      // Ensure missions array exists
      if (!Array.isArray(result.data.missions)) {
        result.data.missions = []
      }
      
      // Ensure configs exist
      if (!result.data.configs) {
        result.data.configs = {
          checkin: {
            streak_days: 7,
            bonus_points: 100,
            reset_on_miss: true
          }
        }
      }
      
      console.log('✅ Processed gamification data:', {
        hasCheckedInToday: result.data.checkin.hasCheckedInToday,
        currentStreak: result.data.checkin.currentStreak,
        nextBonusIn: result.data.checkin.nextBonusIn
      })
      
      return result
      
    }, { 
      ttl: 1 * 60 * 1000, // 1 minute for fresh data
      forceRefresh: options.forceRefresh || false,
      ...options 
    })
  }

  const getMissionHistory = async (params = {}, options = {}) => {
    const cacheKey = `missionHistory_${JSON.stringify(params)}`
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      
      console.log('📋 Calling getMissionHistory API with params:', params)
      
      return await apiService.getMissionHistory(params)
    }, { ttl: 5 * 60 * 1000, params, ...options })
  }

  const performCheckin = async () => {
    try {
      console.log('🎯 Performing check-in...')
      
      const { default: apiService } = await import('../services/api')
      const result = await apiService.performCheckin()
      
      console.log('📥 Check-in API response:', result)
      
      // Invalidate related caches after successful checkin
      await Promise.all([
        invalidateCache('gamificationStatus'),
        invalidateCache('myPoints'),
        invalidateRelated('checkinUpdate', result)
      ])
      
      console.log('✅ Check-in completed and caches invalidated')
      return result
      
    } catch (err) {
      console.error('❌ Check-in failed:', err)
      error.value = err.message || 'Failed to perform check-in'
      throw err
    }
  }

  // LEADERBOARD APIs
  const getLeaderboard = async (type = 'daily', params = {}, options = {}) => {
    const cacheKey = `leaderboard_${type}_${JSON.stringify(params)}`
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      
      console.log(`🏆 Calling leaderboard API - type: ${type}, params:`, params)
      
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
    }, { ttl: 5 * 60 * 1000, params, ...options })
  }

  // BASIC APIs
  const getMyPoints = async (options = {}) => {
    return await cachedCall('myPoints', async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getMyPoints()
    }, { ttl: 30 * 1000, ...options })
  }

  const getUserProfile = async (options = {}) => {
    return await cachedCall('userProfile', async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getUserProfile()
    }, { ttl: 60 * 60 * 1000, ...options })
  }

  // PRODUCTS APIs - Only for product-related pages
  const getProducts = async (params = {}, options = {}) => {
    const cacheKey = `products_${JSON.stringify(params)}`
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      console.log('🛍️ Calling products API with params:', params)
      return await apiService.getProducts(params)
    }, { ttl: 15 * 60 * 1000, params, ...options })
  }

  const getProductDetail = async (productId, options = {}) => {
    return await cachedCall(`product_${productId}`, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getProductById(productId)
    }, { ttl: 20 * 60 * 1000, params: { productId }, ...options })
  }

  const getFeaturedProducts = async (options = {}) => {
    return await cachedCall('featuredProducts', async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getFeaturedProducts()
    }, { ttl: 10 * 60 * 1000, ...options })
  }

  const getCategories = async (options = {}) => {
    return await cachedCall('categories', async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getCategories()
    }, { ttl: 30 * 60 * 1000, ...options })
  }

  // CAMPAIGNS APIs
  const getCampaigns = async (options = {}) => {
    return await cachedCall('campaigns', async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getActiveCampaigns()
    }, { ttl: 20 * 60 * 1000, ...options })
  }

  const getCampaignDetail = async (campaignId, options = {}) => {
    return await cachedCall(`campaign_${campaignId}`, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getCampaignById(campaignId)
    }, { ttl: 30 * 60 * 1000, params: { campaignId }, ...options })
  }

  // TRANSACTIONS APIs
  const getTransactions = async (params = {}, options = {}) => {
    const cacheKey = `transactions_${JSON.stringify(params)}`
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getMyTransactions(params)
    }, { ttl: 15 * 60 * 1000, params, ...options })
  }

  const getRedemptions = async (params = {}, options = {}) => {
    const cacheKey = `redemptions_${JSON.stringify(params)}`
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getMyRedemptions(params)
    }, { ttl: 15 * 60 * 1000, params, ...options })
  }

  // WISHLIST APIs - FIXED: Complete implementation
  const getWishlist = async (params = {}, options = {}) => {
    const cacheKey = `wishlist_${JSON.stringify(params)}`
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getWishlist(params)
    }, { ttl: 2 * 60 * 1000, params, ...options })
  }

  const getWishlistCount = async (options = {}) => {
    return await cachedCall('wishlistCount', async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getWishlistCount()
    }, { ttl: 1 * 60 * 1000, ...options })
  }

  const addToWishlist = async (productId) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.addToWishlist(productId)
      
      await invalidateRelated('wishlistUpdate', { productId, action: 'added' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to add to wishlist'
      throw err
    }
  }

  const removeFromWishlist = async (wishlistItemId) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.removeFromWishlist(wishlistItemId)
      
      await invalidateRelated('wishlistUpdate', { wishlistItemId, action: 'removed' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to remove from wishlist'
      throw err
    }
  }

  const toggleWishlist = async (productId) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.toggleWishlist(productId)
      
      await invalidateRelated('wishlistUpdate', { 
        productId, 
        action: result.data?.action || 'toggled' 
      })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to toggle wishlist'
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

  // BANK ACCOUNTS APIs
  const getBankAccounts = async (params = {}, options = {}) => {
    const defaultParams = {
      page: 1,
      limit: 20,
      ...params
    }
    
    delete defaultParams.sortBy
    delete defaultParams.sortOrder
    
    const cacheKey = `bankAccounts_${JSON.stringify(defaultParams)}`
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getBankAccounts(defaultParams)
    }, { ttl: 10 * 60 * 1000, params: defaultParams, ...options })
  }

  const getBankAccountById = async (accountId, options = {}) => {
    return await cachedCall(`bankAccount_${accountId}`, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getBankAccountById(accountId)
    }, { ttl: 15 * 60 * 1000, params: { accountId }, ...options })
  }

  const addBankAccount = async (bankAccountData) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.addBankAccount(bankAccountData)
      
      await invalidateRelated('bankAccountUpdate', { bankAccountData, action: 'added' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to add bank account'
      throw err
    }
  }

  const updateBankAccount = async (accountId, bankAccountData) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.updateBankAccount(accountId, bankAccountData)
      
      await invalidateRelated('bankAccountUpdate', { accountId, bankAccountData, action: 'updated' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to update bank account'
      throw err
    }
  }

  const setPrimaryBankAccount = async (accountId) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.setPrimaryBankAccount(accountId)
      
      await invalidateRelated('bankAccountUpdate', { accountId, action: 'setPrimary' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to set primary bank account'
      throw err
    }
  }

  const deleteBankAccount = async (accountId) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.deleteBankAccount(accountId)
      
      await invalidateRelated('bankAccountUpdate', { accountId, action: 'deleted' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to delete bank account'
      throw err
    }
  }

  // AFFILIATE LINKS APIs
  const getAffiliateLinks = async (params = {}, options = {}) => {
    const cacheParams = Object.fromEntries(
      Object.entries(params).filter(([key]) => !['sortBy', 'sortOrder'].includes(key))
    )
    const cacheKey = `affiliateLinks_${JSON.stringify(cacheParams)}`
    
    return await cachedCall(cacheKey, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getAffiliateLinks(params)
    }, { ttl: 5 * 60 * 1000, params: cacheParams, ...options })
  }

  const getAffiliateLinkById = async (linkId, options = {}) => {
    return await cachedCall(`affiliateLink_${linkId}`, async () => {
      const { default: apiService } = await import('../services/api')
      return await apiService.getAffiliateLinkById(linkId)
    }, { ttl: 10 * 60 * 1000, params: { linkId }, ...options })
  }

  const generateAffiliateLink = async (productData) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.generateAffiliateLink(productData)
      
      await invalidateRelated('affiliateLinksUpdate', { productData, action: 'generated' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to generate affiliate link'
      throw err
    }
  }

  const shareAffiliateLink = async (shareData) => {
    try {
      const { default: apiService } = await import('../services/api')
      const result = await apiService.shareAffiliateLink(shareData)
      
      await invalidateRelated('affiliateLinksUpdate', { shareData, action: 'shared' })
      
      return result
    } catch (err) {
      error.value = err.message || 'Failed to share affiliate link'
      throw err
    }
  }

  // CACHE MANAGEMENT utilities
  const invalidateCache = async (endpoint, params = {}) => {
    try {
      console.log(`🗑️ Invalidating cache for: ${endpoint}`)
      
      const apiCacheServiceModule = await import('../services/apiCacheService')
      const apiCacheService = apiCacheServiceModule.default
      
      if (typeof apiCacheService.invalidateCache === 'function') {
        await apiCacheService.invalidateCache(endpoint, params)
      } else if (typeof apiCacheService.clearCache === 'function') {
        await apiCacheService.clearCache(endpoint)
      } else {
        console.warn('⚠️ No cache invalidation method available')
      }
      
      console.log(`✅ Cache invalidated for ${endpoint}`)
    } catch (err) {
      console.error(`❌ Failed to invalidate cache for ${endpoint}:`, err)
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

  // DEBUG method
  const debugApiEndpoints = async () => {
    try {
      console.log('🔧 === API ENDPOINTS DEBUG ===')
      
      const { default: apiService } = await import('../services/api')
      
      // Test gamification endpoint
      console.log('🧪 Testing gamification status endpoint...')
      const gamificationResult = await apiService.getGamificationStatus()
      console.log('📊 Gamification result:', gamificationResult)
      
      // Test mission history endpoint
      console.log('🧪 Testing mission history endpoint...')
      const missionHistoryResult = await apiService.getMissionHistory({ limit: 1 })
      console.log('📊 Mission history result:', missionHistoryResult)
      
      console.log('🔧 === DEBUG COMPLETE ===')
      
      return {
        gamification: gamificationResult,
        missionHistory: missionHistoryResult
      }
      
    } catch (error) {
      console.error('❌ API debug failed:', error)
      return null
    }
  }

  return {
    loading,
    error,
    cachedCall,
    
    // Gamification & Missions - PRIMARY for leaderboard
    getGamificationStatus,
    getMissionHistory,
    performCheckin,
    
    // Leaderboard
    getLeaderboard,
    
    // Basic user data
    getMyPoints,
    getUserProfile,
    getTransactions,
    getRedemptions,
    
    // Products - Only when needed
    getProducts,
    getProductDetail,
    getFeaturedProducts,
    getCategories,
    
    // Campaigns
    getCampaigns,
    getCampaignDetail,
    
    // Wishlist methods
    getWishlist,
    getWishlistCount,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    
    // Bank Account methods
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
    clearAllCache,
    debugApiEndpoints
  }
}