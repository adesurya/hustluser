// src/composables/useWishlist.js - Vue 3 composable untuk mengelola wishlist

import { ref, computed, onMounted, onUnmounted } from 'vue'
import wishlistService from '../services/wishlistService'
import { showToast } from '../utils/toast'

export function useWishlist() {
  const wishlistItems = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Computed properties
  const wishlistCount = computed(() => wishlistItems.value.length)
  const isEmpty = computed(() => wishlistItems.value.length === 0)
  const wishlistIds = computed(() => new Set(wishlistItems.value.map(item => item.id)))

  // Methods
  const loadWishlist = () => {
    try {
      isLoading.value = true
      wishlistItems.value = wishlistService.getWishlistItems()
      error.value = null
    } catch (err) {
      console.error('Error loading wishlist:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const addToWishlist = (product) => {
    const result = wishlistService.addToWishlist(product)
    
    if (result.success) {
      wishlistItems.value = result.data
      showToast({
        type: 'wishlist',
        title: 'Added to Wishlist!',
        message: `${product.title} has been added to your wishlist`,
        duration: 3000
      })
      return true
    } else {
      if (result.message === 'Product already in wishlist') {
        showToast({
          type: 'warning',
          title: 'Already in Wishlist',
          message: 'This product is already in your wishlist',
          duration: 2000
        })
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: result.message,
          duration: 3000
        })
      }
      return false
    }
  }

  const removeFromWishlist = (productId) => {
    const result = wishlistService.removeFromWishlist(productId)
    
    if (result.success) {
      wishlistItems.value = result.data
      showToast({
        type: 'info',
        title: 'Removed from Wishlist',
        message: 'Product has been removed from your wishlist',
        duration: 2000
      })
      return true
    } else {
      showToast({
        type: 'error',
        title: 'Error',
        message: result.message,
        duration: 3000
      })
      return false
    }
  }

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      return removeFromWishlist(product.id)
    } else {
      return addToWishlist(product)
    }
  }

  const clearWishlist = () => {
    const result = wishlistService.clearWishlist()
    
    if (result.success) {
      wishlistItems.value = []
      showToast({
        type: 'info',
        title: 'Wishlist Cleared',
        message: 'All items have been removed from your wishlist',
        duration: 2000
      })
      return true
    } else {
      showToast({
        type: 'error',
        title: 'Error',
        message: result.message,
        duration: 3000
      })
      return false
    }
  }

  const isInWishlist = (productId) => {
    return wishlistIds.value.has(productId)
  }

  const getWishlistItem = (productId) => {
    return wishlistItems.value.find(item => item.id === productId)
  }

  const getWishlistByCategory = (categoryId) => {
    return wishlistService.getWishlistByCategory(categoryId)
  }

  const searchWishlist = (query) => {
    return wishlistService.searchWishlist(query)
  }

  const sortWishlist = (sortBy = 'dateAdded', order = 'desc') => {
    return wishlistService.sortWishlist(sortBy, order)
  }

  const getWishlistStats = () => {
    return wishlistService.getWishlistStats()
  }

  const exportWishlist = () => {
    try {
      const exportData = wishlistService.exportWishlist()
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `wishlist-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      showToast({
        type: 'success',
        title: 'Export Successful',
        message: 'Your wishlist has been exported',
        duration: 3000
      })
      
      return true
    } catch (error) {
      console.error('Error exporting wishlist:', error)
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export wishlist',
        duration: 3000
      })
      return false
    }
  }

  const importWishlist = (file, merge = false) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        try {
          const jsonData = event.target.result
          const result = wishlistService.importWishlist(jsonData, merge)
          
          if (result.success) {
            wishlistItems.value = result.data
            showToast({
              type: 'success',
              title: 'Import Successful',
              message: `Imported ${result.imported} items, skipped ${result.skipped} duplicates`,
              duration: 4000
            })
            resolve(result)
          } else {
            showToast({
              type: 'error',
              title: 'Import Failed',
              message: result.message,
              duration: 3000
            })
            reject(new Error(result.message))
          }
        } catch (error) {
          console.error('Error importing wishlist:', error)
          showToast({
            type: 'error',
            title: 'Import Failed',
            message: 'Invalid file format',
            duration: 3000
          })
          reject(error)
        }
      }
      
      reader.onerror = () => {
        const error = new Error('Failed to read file')
        showToast({
          type: 'error',
          title: 'File Read Error',
          message: 'Failed to read the selected file',
          duration: 3000
        })
        reject(error)
      }
      
      reader.readAsText(file)
    })
  }

  // Batch operations
  const addMultipleToWishlist = (products) => {
    let successCount = 0
    let failCount = 0
    
    products.forEach(product => {
      const result = wishlistService.addToWishlist(product)
      if (result.success) {
        successCount++
      } else {
        failCount++
      }
    })
    
    loadWishlist() // Refresh data
    
    if (successCount > 0) {
      showToast({
        type: 'success',
        title: 'Batch Add Complete',
        message: `Added ${successCount} items to wishlist${failCount > 0 ? `, ${failCount} failed` : ''}`,
        duration: 4000
      })
    }
    
    return { success: successCount, failed: failCount }
  }

  const removeMultipleFromWishlist = (productIds) => {
    let successCount = 0
    let failCount = 0
    
    productIds.forEach(productId => {
      const result = wishlistService.removeFromWishlist(productId)
      if (result.success) {
        successCount++
      } else {
        failCount++
      }
    })
    
    loadWishlist() // Refresh data
    
    if (successCount > 0) {
      showToast({
        type: 'info',
        title: 'Batch Remove Complete',
        message: `Removed ${successCount} items from wishlist${failCount > 0 ? `, ${failCount} failed` : ''}`,
        duration: 4000
      })
    }
    
    return { success: successCount, failed: failCount }
  }

  // Pagination helper
  const getPaginatedWishlist = (page = 1, itemsPerPage = 10) => {
    return wishlistService.getPaginatedWishlist(page, itemsPerPage)
  }

  // Wishlist listener setup
  const handleWishlistChange = () => {
    loadWishlist()
  }

  // Lifecycle hooks
  onMounted(() => {
    loadWishlist()
    wishlistService.addListener(handleWishlistChange)
  })

  onUnmounted(() => {
    wishlistService.removeListener(handleWishlistChange)
  })

  // Return reactive state and methods
  return {
    // State
    wishlistItems,
    isLoading,
    error,
    
    // Computed
    wishlistCount,
    isEmpty,
    wishlistIds,
    
    // Methods
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistItem,
    getWishlistByCategory,
    searchWishlist,
    sortWishlist,
    getWishlistStats,
    exportWishlist,
    importWishlist,
    addMultipleToWishlist,
    removeMultipleFromWishlist,
    getPaginatedWishlist,
    
    // Utility
    handleWishlistChange
  }
}

// Helper function for quick wishlist operations without full composable setup
export function useQuickWishlist() {
  const isInWishlist = (productId) => wishlistService.isInWishlist(productId)
  
  const toggleQuick = (product) => {
    const result = wishlistService.toggleWishlist(product)
    
    if (result.success) {
      const isAdded = wishlistService.isInWishlist(product.id)
      showToast({
        type: isAdded ? 'wishlist' : 'info',
        title: isAdded ? 'Added to Wishlist!' : 'Removed from Wishlist',
        message: `${product.title} ${isAdded ? 'added to' : 'removed from'} your wishlist`,
        duration: 2000
      })
    }
    
    return result.success
  }
  
  const getCount = () => wishlistService.getWishlistCount()
  
  return {
    isInWishlist,
    toggleQuick,
    getCount
  }
}