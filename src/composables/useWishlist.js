// src/composables/useWishlist.js - Fixed template literal parsing errors
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCachedApi } from './useCachedApi'
import { useAuthStore } from '../stores/auth'
import { showToast } from '../utils/toast'

export function useWishlist() {
  const authStore = useAuthStore()
  const {
    getWishlist,
    addToWishlist: apiAddToWishlist,
    removeFromWishlist: apiRemoveFromWishlist
  } = useCachedApi()

  const wishlistItems = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const listeners = ref(new Set())

  // Computed properties
  const wishlistCount = computed(() => wishlistItems.value.length)
  const isEmpty = computed(() => wishlistItems.value.length === 0)
  const wishlistIds = computed(() => new Set(wishlistItems.value.map(item => item.productId || item.id)))

  // Storage keys for backward compatibility
  const STORAGE_KEY = 'favoriteProducts'

  // Event listener management
  const addListener = (callback) => {
    listeners.value.add(callback)
  }

  const removeListener = (callback) => {
    listeners.value.delete(callback)
  }

  const notifyListeners = () => {
    listeners.value.forEach(callback => callback())
  }

  // Helper function to transform API wishlist item to local format
  const transformWishlistItem = (apiItem) => {
    const product = apiItem.product || {}
    return {
      id: product.id || apiItem.productId,
      productId: apiItem.productId,
      wishlistItemId: apiItem.id,
      title: product.title || 'Unknown Product',
      price: formatPrice(product.price),
      formattedPrice: formatPrice(product.price),
      image: product.image,
      imageUrl: getImageUrl(product.image),
      points: product.points || 0,
      categoryId: product.category?.id,
      category: product.category,
      url: product.url,
      dateAdded: apiItem.created_at || new Date().toISOString(),
      originalProduct: product
    }
  }

  // Helper functions for formatting
  const formatPrice = (price) => {
    if (typeof price === 'string') {
      const numPrice = parseFloat(price)
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numPrice)
    }
    return price || 'Rp 0'
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/api/placeholder/120/120'
    if (imagePath.startsWith('http')) return imagePath
    return 'https://apihustl.sijago.ai/uploads/products/' + imagePath
  }

  // Main methods for wishlist management
  const loadWishlist = async (forceRefresh = false) => {
    if (!authStore.isAuthenticated) {
      // Load from localStorage for non-authenticated users
      loadWishlistFromLocalStorage()
      return
    }

    try {
      isLoading.value = true
      error.value = null

      // Load from API for authenticated users
      const response = await getWishlist({ 
        page: 1, 
        limit: 100, 
        includeProduct: true 
      }, { forceRefresh })

      if (response && response.success) {
        // PROBLEM: Data dari API langsung di-transform tanpa validasi
        // SOLUTION: Validasi dan filter data yang valid
        
        const validatedItems = response.data
          .filter(item => {
            // Filter out items yang mungkin corrupt atau invalid
            if (!item.id || !item.productId) {
              console.warn('Invalid wishlist item found:', item)
              return false
            }
            
            // Pastikan product data exists
            if (!item.product || !item.product.id) {
              console.warn('Wishlist item missing product data:', item)
              return false
            }
            
            return true
          })
          .map(transformWishlistItem)

        wishlistItems.value = validatedItems
        
        // Hanya sync ke localStorage jika data valid
        if (validatedItems.length > 0 || response.data.length === 0) {
          syncToLocalStorage()
        }
        
        console.log(`Wishlist loaded from API: ${validatedItems.length} valid items (${response.data.length - validatedItems.length} invalid items filtered out)`)
      } else {
        throw new Error(response?.message || 'Failed to load wishlist')
      }
    } catch (err) {
      console.error('Error loading wishlist from API:', err)
      error.value = err.message
      
      // PROBLEM: Fallback ke localStorage tanpa validasi
      // SOLUTION: Hanya fallback jika memang diperlukan
      console.log('API failed, keeping current state without localStorage fallback to prevent bad data')
    } finally {
      isLoading.value = false
    }
  }

  const loadWishlistFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedItems = JSON.parse(stored)
        wishlistItems.value = parsedItems.map(item => ({
          ...item,
          productId: item.productId || item.id,
          wishlistItemId: item.wishlistItemId || null,
          dateAdded: item.dateAdded || new Date().toISOString()
        }))
      } else {
        wishlistItems.value = []
      }
      console.log('Wishlist loaded from localStorage: ' + wishlistItems.value.length + ' items')
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error)
      wishlistItems.value = []
    }
  }

  const syncToLocalStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems.value))
    } catch (error) {
      console.warn('Failed to sync wishlist to localStorage:', error)
    }
  }

  const addToWishlist = async (product) => {
    if (!product || !product.id) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Invalid product data',
        duration: 3000
      })
      return false
    }

    // Check if already in wishlist
    if (isInWishlist(product.id)) {
      showToast({
        type: 'warning',
        title: 'Already in Wishlist',
        message: 'This product is already in your wishlist',
        duration: 2000
      })
      return false
    }

    try {
      isLoading.value = true

      if (authStore.isAuthenticated) {
        // Use API for authenticated users
        const response = await apiAddToWishlist(product.id)
        
        if (response && response.success) {
          const newItem = transformWishlistItem(response.data)
          wishlistItems.value.push(newItem)
          syncToLocalStorage()
          
          showToast({
            type: 'wishlist',
            title: 'Added to Wishlist!',
            message: product.title + ' has been added to your wishlist',
            duration: 3000
          })
          
          notifyListeners()
          return true
        } else {
          throw new Error(response?.message || 'Failed to add to wishlist')
        }
      } else {
        // Use localStorage for non-authenticated users
        const wishlistItem = {
          id: product.id,
          productId: product.id,
          wishlistItemId: null,
          title: product.title,
          price: product.formattedPrice || formatPrice(product.price),
          formattedPrice: product.formattedPrice || formatPrice(product.price),
          image: product.image,
          imageUrl: product.imageUrl || getImageUrl(product.image),
          points: product.points || 0,
          categoryId: product.categoryId || product.category?.id,
          category: product.category,
          url: product.url,
          dateAdded: new Date().toISOString(),
          originalProduct: product
        }

        wishlistItems.value.push(wishlistItem)
        syncToLocalStorage()
        
        showToast({
          type: 'wishlist',
          title: 'Added to Wishlist!',
          message: product.title + ' has been added to your wishlist',
          duration: 3000
        })
        
        notifyListeners()
        return true
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err)
      error.value = err.message
      
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to add to wishlist',
        duration: 3000
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  const removeFromWishlist = async (productId) => {
    const item = wishlistItems.value.find(item => 
      item.productId === productId || item.id === productId
    )
    
    if (!item) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Product not found in wishlist',
        duration: 3000
      })
      return false
    }

    try {
      isLoading.value = true

      if (authStore.isAuthenticated && item.wishlistItemId) {
        try {
          const response = await apiRemoveFromWishlist(item.wishlistItemId)
          
          if (response && response.success) {
            // Success: remove from local state
            await handleSuccessfulRemoval(productId, 'Removed from wishlist')
            return true
          } else {
            throw new Error(response?.message || 'Failed to remove from wishlist')
          }
        } catch (apiError) {
          console.warn('API removal failed:', apiError)
          
          // Check if it's a 404 error (item doesn't exist in database)
          if (apiError.message?.includes('not found') || apiError.message?.includes('404')) {
            console.log('Item already deleted from database, cleaning local state')
            
            // Treat 404 as success since item is already gone
            await handleSuccessfulRemoval(productId, 'Item was already removed from database')
            
            // Force a full resync to clean up any other phantom items
            setTimeout(() => {
              console.log('Triggering full resync due to 404 error...')
              forceResyncWithDatabase()
            }, 1000)
            
            return true
          }
          
          // For other API errors, still remove locally and suggest resync
          console.log('API failed with non-404 error, removing locally')
          await handleSuccessfulRemoval(productId, 'Removed locally, will sync when possible')
          
          showToast({
            type: 'warning',
            title: 'Sync Warning',
            message: 'Item removed locally. Consider refreshing to sync with database.',
            duration: 4000
          })
          
          return true
        }
      } else {
        // Non-authenticated or localStorage-only items
        await handleSuccessfulRemoval(productId, 'Removed from local wishlist')
        return true
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err)
      error.value = err.message
      
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove from wishlist. Try refreshing the page.',
        duration: 3000
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  const toggleWishlist = async (product) => {
    if (!product || !product.id) {
      return false
    }

    const productId = product.id
    const isCurrentlyInWishlist = isInWishlist(productId)

    if (isCurrentlyInWishlist) {
      return await removeFromWishlist(productId)
    } else {
      return await addToWishlist(product)
    }
  }

  const clearWishlist = async () => {
    try {
      isLoading.value = true

      if (authStore.isAuthenticated) {
        // Remove all items via API
        const removePromises = wishlistItems.value
          .filter(item => item.wishlistItemId)
          .map(item => apiRemoveFromWishlist(item.wishlistItemId))

        await Promise.allSettled(removePromises)
      }

      // Clear local data
      wishlistItems.value = []
      localStorage.removeItem(STORAGE_KEY)
      
      showToast({
        type: 'info',
        title: 'Wishlist Cleared',
        message: 'All items have been removed from your wishlist',
        duration: 2000
      })
      
      notifyListeners()
      return true
    } catch (err) {
      console.error('Error clearing wishlist:', err)
      error.value = err.message
      
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to clear wishlist',
        duration: 3000
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  const isInWishlist = (productId) => {
    return wishlistIds.value.has(productId)
  }

  const getWishlistItem = (productId) => {
    return wishlistItems.value.find(item => 
      item.productId === productId || item.id === productId
    )
  }

  // Additional utility methods
  const getWishlistByCategory = (categoryId) => {
    return wishlistItems.value.filter(item => item.categoryId === categoryId)
  }

  const searchWishlist = (query) => {
    const searchTerm = query.toLowerCase()
    return wishlistItems.value.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      (item.category?.name && item.category.name.toLowerCase().includes(searchTerm))
    )
  }

  const sortWishlist = (sortBy = 'dateAdded', order = 'desc') => {
    return [...wishlistItems.value].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'dateAdded': {
          comparison = new Date(a.dateAdded) - new Date(b.dateAdded)
          break
        }
        case 'title': {
          comparison = a.title.localeCompare(b.title)
          break
        }
        case 'price': {
          const priceA = extractPriceNumber(a.price)
          const priceB = extractPriceNumber(b.price)
          comparison = priceA - priceB
          break
        }
        case 'points': {
          comparison = a.points - b.points
          break
        }
        default: {
          comparison = 0
        }
      }
      
      return order === 'desc' ? -comparison : comparison
    })
  }

  const extractPriceNumber = (priceString) => {
    if (typeof priceString === 'number') return priceString
    if (typeof priceString !== 'string') return 0
    
    const numberStr = priceString.replace(/[^0-9]/g, '')
    return parseInt(numberStr) || 0
  }

  const getWishlistStats = () => {
    const items = wishlistItems.value
    
    if (items.length === 0) {
      return {
        totalItems: 0,
        totalValue: 0,
        totalPoints: 0,
        categories: {},
        oldestItem: null,
        newestItem: null,
        averagePrice: 0
      }
    }

    const categories = {}
    let totalValue = 0
    let totalPoints = 0
    let oldestDate = new Date()
    let newestDate = new Date(0)
    let oldestItem = null
    let newestItem = null

    items.forEach(item => {
      const categoryName = item.category?.name || 'Uncategorized'
      categories[categoryName] = (categories[categoryName] || 0) + 1

      const itemPrice = extractPriceNumber(item.price)
      totalValue += itemPrice
      totalPoints += item.points || 0

      const itemDate = new Date(item.dateAdded)
      if (itemDate < oldestDate) {
        oldestDate = itemDate
        oldestItem = item
      }
      if (itemDate > newestDate) {
        newestDate = itemDate
        newestItem = item
      }
    })

    return {
      totalItems: items.length,
      totalValue,
      totalPoints,
      categories,
      oldestItem,
      newestItem,
      averagePrice: Math.round(totalValue / items.length)
    }
  }

  const getPaginatedWishlist = (page = 1, itemsPerPage = 10) => {
    const items = wishlistItems.value
    const totalItems = items.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedItems = items.slice(startIndex, endIndex)

    return {
      items: paginatedItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  }

  // Migration method (optional)
  const migrateLocalStorageToAPI = async () => {
    if (!authStore.isAuthenticated) {
      return { success: false, message: 'User not authenticated' }
    }

    try {
      const localItems = []
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        localItems.push(...JSON.parse(stored))
      }

      if (localItems.length === 0) {
        return { success: true, message: 'No local items to migrate' }
      }

      let migratedCount = 0
      let failedCount = 0

      for (const item of localItems) {
        try {
          const productId = item.productId || item.id
          if (productId) {
            await apiAddToWishlist(productId)
            migratedCount++
          }
        } catch (err) {
          console.warn('Failed to migrate item ' + item.id + ':', err)
          failedCount++
        }
      }

      // Refresh wishlist from API
      await loadWishlist(true)

      return {
        success: true,
        message: 'Migrated ' + migratedCount + ' items, ' + failedCount + ' failed',
        migrated: migratedCount,
        failed: failedCount
      }
    } catch (err) {
      console.error('Migration failed:', err)
      return {
        success: false,
        message: 'Migration failed',
        error: err.message
      }
    }
  }

  //Sync Frontend with backend
  const syncWishlistWithAPI = async () => {
    if (!authStore.isAuthenticated) {
      console.log('User not authenticated, skipping API sync')
      return { success: false, message: 'User not authenticated' }
    }

    try {
      isLoading.value = true
      
      // Get fresh data from API
      const response = await getWishlist({
        page: 1,
        limit: 1000, // Get all items
        includeProduct: true
      }, { forceRefresh: true })

      if (response && response.success) {
        // Transform API items to local format
        const apiItems = response.data.map(transformWishlistItem)
        
        // Update local state with API data
        wishlistItems.value = apiItems
        syncToLocalStorage()
        notifyListeners()
        
        console.log(`Wishlist synced: ${apiItems.length} items from API`)
        
        return {
          success: true,
          message: 'Wishlist synced successfully',
          itemCount: apiItems.length
        }
      } else {
        throw new Error(response?.message || 'Failed to sync wishlist')
      }
    } catch (error) {
      console.error('Failed to sync wishlist with API:', error)
      return {
        success: false,
        message: 'Failed to sync wishlist',
        error: error.message
      }
    } finally {
      isLoading.value = false
    }
  }

  // Add this method to detect and clean phantom wishlist items
  const cleanPhantomWishlistItems = async () => {
    console.log('Cleaning phantom wishlist items...')
    
    const localItems = wishlistItems.value
    const validItems = []
    let removedCount = 0
    
    for (const item of localItems) {
      // Check if item has a wishlistItemId (API item) vs localStorage-only item
      if (item.wishlistItemId) {
        // This is an API item, but we can't verify individually due to the endpoint limitation
        // We'll keep it for now and let the sync method handle cleanup
        validItems.push(item)
      } else {
        // This is a localStorage-only item, keep it
        validItems.push(item)
      }
    }
    
    // For API items, we need to do a full sync to clean phantom items
    if (authStore.isAuthenticated) {
      const syncResult = await syncWishlistWithAPI()
      if (syncResult.success) {
        removedCount = localItems.length - wishlistItems.value.length
      }
    } else {
      // For non-authenticated users, just update with valid items
      if (validItems.length !== localItems.length) {
        wishlistItems.value = validItems
        syncToLocalStorage()
        notifyListeners()
        removedCount = localItems.length - validItems.length
      }
    }
    
    console.log(`Cleaned ${removedCount} phantom items`)
    return { removed: removedCount, remaining: wishlistItems.value.length }
  }

  const forceRefreshWishlist = async () => {
    try {
      isLoading.value = true
      
      // Clear all wishlist-related cache first
      await invalidateAllWishlistCache()
      
      // Force fresh load from API
      await loadWishlist(true) // forceRefresh = true
      
      console.log('Wishlist force refreshed successfully')
      return true
    } catch (error) {
      console.error('Failed to force refresh wishlist:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const invalidateAllWishlistCache = async () => {
    try {
      // Clear memory cache
      const { invalidateCache } = useCachedApi()
      
      // Invalidate all wishlist patterns
      await invalidateCache('wishlist')
      await invalidateCache('wishlistCount')
      
      // Clear localStorage
      localStorage.removeItem('favoriteProducts')
      
      // Clear any other wishlist-related cache keys
      const cacheKeys = [
        'wishlist_',
        'wishlistCount',
        'favoriteProducts'
      ]
      
      // Clear from all storage types
      cacheKeys.forEach(key => {
        // Clear from localStorage
        Object.keys(localStorage).forEach(storageKey => {
          if (storageKey.includes(key)) {
            localStorage.removeItem(storageKey)
          }
        })
        
        // Clear from sessionStorage
        Object.keys(sessionStorage).forEach(storageKey => {
          if (storageKey.includes(key)) {
            sessionStorage.removeItem(storageKey)
          }
        })
      })
      
      console.log('All wishlist cache invalidated')
    } catch (error) {
      console.error('Failed to invalidate wishlist cache:', error)
    }
  }

  const handleSuccessfulRemoval = async (productId, message) => {
    // Remove from local state
    const originalLength = wishlistItems.value.length
    wishlistItems.value = wishlistItems.value.filter(item => 
      item.productId !== productId && item.id !== productId
    )
    
    // Only proceed if we actually removed something
    if (wishlistItems.value.length < originalLength) {
      // Update localStorage
      syncToLocalStorage()
      
      // Clear cache to ensure consistency
      const { invalidateCache } = useCachedApi()
      await invalidateCache('wishlist')
      await invalidateCache('wishlistCount')
      
      // Show success message
      showToast({
        type: 'info',
        title: 'Removed from Wishlist',
        message: message,
        duration: 2000
      })
      
      // Notify listeners
      notifyListeners()
    }
  }

  const forceResyncWithDatabase = async () => {
    try {
      console.log('🔄 Force resyncing wishlist with database...')
      isLoading.value = true
      
      if (!authStore.isAuthenticated) {
        console.log('User not authenticated, clearing local wishlist only')
        wishlistItems.value = []
        localStorage.removeItem('favoriteProducts')
        return { success: true, message: 'Local wishlist cleared' }
      }

      // Step 1: Clear ALL local wishlist data
      console.log('Step 1: Clearing all local wishlist data...')
      wishlistItems.value = []
      localStorage.removeItem('favoriteProducts')
      
      // Clear all wishlist-related cache
      Object.keys(localStorage).forEach(key => {
        if (key.includes('wishlist') || key.includes('cache:api:wishlist')) {
          localStorage.removeItem(key)
          console.log('Cleared cache key:', key)
        }
      })

      // Step 2: Force fresh API call
      console.log('Step 2: Fetching fresh data from API...')
      const { invalidateCache } = useCachedApi()
      await invalidateCache('wishlist')
      await invalidateCache('wishlistCount')
      
      // Get fresh data with maximum items to ensure we get everything
      const response = await getWishlist({
        page: 1,
        limit: 1000, // Get all items
        includeProduct: true,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      }, { forceRefresh: true })

      if (response && response.success) {
        // Step 3: Transform and set fresh data
        const freshItems = response.data.map(transformWishlistItem)
        wishlistItems.value = freshItems
        
        // Step 4: Save clean data to localStorage
        syncToLocalStorage()
        
        console.log(`✅ Resync completed: ${freshItems.length} items from database`)
        
        showToast({
          type: 'success',
          title: 'Wishlist Synced',
          message: `Successfully synced ${freshItems.length} items from database`,
          duration: 3000
        })
        
        notifyListeners()
        
        return {
          success: true,
          itemCount: freshItems.length,
          message: 'Wishlist resynced successfully'
        }
      } else {
        throw new Error('Failed to fetch wishlist from API')
      }

    } catch (error) {
      console.error('Force resync failed:', error)
      
      // If API fails, at least clear the bad local data
      wishlistItems.value = []
      localStorage.removeItem('favoriteProducts')
      
      showToast({
        type: 'error',
        title: 'Sync Failed',
        message: 'Could not sync with database, cleared local data',
        duration: 4000
      })
      
      return {
        success: false,
        error: error.message,
        message: 'Sync failed but cleared bad local data'
      }
    } finally {
      isLoading.value = false
    }
  }

  // Initialize on mount
  onMounted(async () => {
    await loadWishlist()
  })

  onUnmounted(() => {
    listeners.value.clear()
  })

  // Return all methods and computed properties
  return {
    // State
    wishlistItems,
    isLoading,
    error,
    
    // Computed
    wishlistCount,
    isEmpty,
    wishlistIds,
    
    // Core methods
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistItem,
    
    // Utility methods
    getWishlistByCategory,
    searchWishlist,
    sortWishlist,
    getWishlistStats,
    getPaginatedWishlist,
    
    // Event management
    addListener,
    removeListener,
    
    // Migration
    migrateLocalStorageToAPI,
    forceRefreshWishlist,
    syncWishlistWithAPI,
    cleanPhantomWishlistItems,
    invalidateAllWishlistCache
  }
}

// Quick wishlist helper for simple operations
export function useQuickWishlist() {
  const { isInWishlist, toggleWishlist, wishlistCount } = useWishlist()
  
  const toggleQuick = async (product) => {
    return await toggleWishlist(product)
  }
  
  const getCount = () => wishlistCount.value
  
  return {
    isInWishlist,
    toggleQuick,
    getCount
  }
}