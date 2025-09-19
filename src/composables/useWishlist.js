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
        wishlistItems.value = response.data.map(transformWishlistItem)
        
        // Sync with localStorage for offline access
        syncToLocalStorage()
        
        console.log('Wishlist loaded from API: ' + wishlistItems.value.length + ' items')
      } else {
        throw new Error(response?.message || 'Failed to load wishlist')
      }
    } catch (err) {
      console.error('Error loading wishlist from API:', err)
      error.value = err.message
      
      // Fallback to localStorage
      loadWishlistFromLocalStorage()
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
        // Use API for authenticated users
        const response = await apiRemoveFromWishlist(item.wishlistItemId)
        
        if (response && response.success) {
          wishlistItems.value = wishlistItems.value.filter(item => 
            item.productId !== productId && item.id !== productId
          )
          syncToLocalStorage()
          
          showToast({
            type: 'info',
            title: 'Removed from Wishlist',
            message: 'Product has been removed from your wishlist',
            duration: 2000
          })
          
          notifyListeners()
          return true
        } else {
          throw new Error(response?.message || 'Failed to remove from wishlist')
        }
      } else {
        // Use localStorage for non-authenticated users or items without wishlistItemId
        wishlistItems.value = wishlistItems.value.filter(item => 
          item.productId !== productId && item.id !== productId
        )
        syncToLocalStorage()
        
        showToast({
          type: 'info',
          title: 'Removed from Wishlist',
          message: 'Product has been removed from your wishlist',
          duration: 2000
        })
        
        notifyListeners()
        return true
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err)
      error.value = err.message
      
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to remove from wishlist',
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
    migrateLocalStorageToAPI
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