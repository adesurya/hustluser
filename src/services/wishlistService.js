// src/services/wishlistService.js - Enhanced service with API integration

import apiService from './api'

class WishlistService {
  constructor() {
    this.STORAGE_KEY = 'favoriteProducts'
    this.listeners = new Set()
    this.isOnline = navigator.onLine
    this.pendingOperations = []
    
    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncPendingOperations()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  // Event listener management
  addListener(callback) {
    this.listeners.add(callback)
  }

  removeListener(callback) {
    this.listeners.delete(callback)
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback()
      } catch (err) {
        console.warn('Wishlist listener error:', err)
      }
    })
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('accessToken')
  }

  // Get wishlist items from API or localStorage
  async getWishlistItems() {
    if (this.isAuthenticated() && this.isOnline) {
      try {
        const response = await apiService.getWishlist({
          page: 1,
          limit: 100,
          includeProduct: true,
          sortBy: 'created_at',
          sortOrder: 'DESC'
        })

        if (response && response.success) {
          const items = response.data.map(this.transformApiItem)
          
          // Sync to localStorage for offline access
          this.saveToLocalStorage(items)
          
          return items
        }
      } catch (error) {
        console.warn('Failed to load wishlist from API, falling back to localStorage:', error)
      }
    }
    
    // Fallback to localStorage
    return this.getLocalStorageItems()
  }

  // Transform API wishlist item to local format
  transformApiItem(apiItem) {
    const product = apiItem.product || {}
    return {
      id: product.id || apiItem.productId,
      productId: apiItem.productId,
      wishlistItemId: apiItem.id, // Important for API operations
      title: product.title || 'Unknown Product',
      price: this.formatPrice(product.price),
      formattedPrice: this.formatPrice(product.price),
      image: product.image,
      imageUrl: this.getImageUrl(product.image),
      points: product.points || 0,
      categoryId: product.category?.id,
      category: product.category,
      url: product.url,
      dateAdded: apiItem.created_at || new Date().toISOString(),
      originalProduct: product
    }
  }

  // Get items from localStorage
  getLocalStorageItems() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error)
      return []
    }
  }

  // Save items to localStorage
  saveToLocalStorage(items) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.warn('Failed to save wishlist to localStorage:', error)
    }
  }

  // Get wishlist count
  async getWishlistCount() {
    if (this.isAuthenticated() && this.isOnline) {
      try {
        const response = await apiService.getWishlistCount()
        if (response && response.success) {
          return response.data.count
        }
      } catch (error) {
        console.warn('Failed to get wishlist count from API:', error)
      }
    }
    
    // Fallback to local count
    const items = this.getLocalStorageItems()
    return items.length
  }

  // Check if product is in wishlist
  async isInWishlist(productId) {
    const items = await this.getWishlistItems()
    return items.some(item => 
      item.productId === productId || item.id === productId
    )
  }

  // Add product to wishlist
  async addToWishlist(product) {
    try {
      // Check if already exists
      if (await this.isInWishlist(product.id)) {
        return {
          success: false,
          message: 'Product already in wishlist',
          data: await this.getWishlistItems()
        }
      }

      if (this.isAuthenticated() && this.isOnline) {
        // Use API for authenticated users
        const response = await apiService.addToWishlist(product.id)
        
        if (response && response.success) {
          const items = await this.getWishlistItems() // Refresh from API
          this.notifyListeners()
          
          return {
            success: true,
            message: 'Product added to wishlist',
            data: items,
            item: this.transformApiItem(response.data)
          }
        } else {
          throw new Error(response?.message || 'Failed to add to wishlist')
        }
      } else {
        // Use localStorage for non-authenticated users or offline
        const items = this.getLocalStorageItems()
        
        const wishlistItem = {
          id: product.id,
          productId: product.id,
          wishlistItemId: null, // No API ID for localStorage items
          title: product.title,
          price: product.formattedPrice || this.formatPrice(product.price),
          formattedPrice: product.formattedPrice || this.formatPrice(product.price),
          image: product.image,
          imageUrl: product.imageUrl || this.getImageUrl(product.image),
          points: product.points || 0,
          categoryId: product.categoryId || product.category?.id,
          category: product.category,
          url: product.url,
          dateAdded: new Date().toISOString(),
          originalProduct: product
        }

        items.push(wishlistItem)
        this.saveToLocalStorage(items)
        
        // Queue for API sync when online
        if (this.isAuthenticated()) {
          this.queuePendingOperation('add', product.id)
        }
        
        this.notifyListeners()
        
        return {
          success: true,
          message: 'Product added to wishlist',
          data: items,
          item: wishlistItem
        }
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      return {
        success: false,
        message: error.message || 'Failed to add to wishlist',
        error: error.message
      }
    }
  }

  // Remove product from wishlist
  async removeFromWishlist(productId) {
    try {
      const items = await this.getWishlistItems()
      const item = items.find(item => 
        item.productId === productId || item.id === productId
      )
      
      if (!item) {
        return {
          success: false,
          message: 'Product not found in wishlist',
          data: items
        }
      }

      if (this.isAuthenticated() && this.isOnline && item.wishlistItemId) {
        // Use API for authenticated users with API items
        const response = await apiService.removeFromWishlist(item.wishlistItemId)
        
        if (response && response.success) {
          const updatedItems = await this.getWishlistItems() // Refresh from API
          this.notifyListeners()
          
          return {
            success: true,
            message: 'Product removed from wishlist',
            data: updatedItems
          }
        } else {
          throw new Error(response?.message || 'Failed to remove from wishlist')
        }
      } else {
        // Use localStorage
        const localItems = this.getLocalStorageItems()
        const filteredItems = localItems.filter(item => 
          item.productId !== productId && item.id !== productId
        )
        
        this.saveToLocalStorage(filteredItems)
        
        // Queue for API sync when online
        if (this.isAuthenticated() && item.wishlistItemId) {
          this.queuePendingOperation('remove', item.wishlistItemId)
        }
        
        this.notifyListeners()
        
        return {
          success: true,
          message: 'Product removed from wishlist',
          data: filteredItems
        }
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      return {
        success: false,
        message: error.message || 'Failed to remove from wishlist',
        error: error.message
      }
    }
  }

  // Toggle wishlist status
  async toggleWishlist(product) {
    if (await this.isInWishlist(product.id)) {
      return await this.removeFromWishlist(product.id)
    } else {
      return await this.addToWishlist(product)
    }
  }

  // Clear all wishlist items
  async clearWishlist() {
    try {
      if (this.isAuthenticated() && this.isOnline) {
        // Remove all items via API
        const items = await this.getWishlistItems()
        const apiItems = items.filter(item => item.wishlistItemId)
        
        const removePromises = apiItems.map(item => 
          apiService.removeFromWishlist(item.wishlistItemId).catch(err => {
            console.warn(`Failed to remove item ${item.wishlistItemId}:`, err)
          })
        )
        
        await Promise.allSettled(removePromises)
      }
      
      // Clear localStorage
      localStorage.removeItem(this.STORAGE_KEY)
      this.notifyListeners()
      
      return {
        success: true,
        message: 'Wishlist cleared',
        data: []
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      return {
        success: false,
        message: error.message || 'Failed to clear wishlist',
        error: error.message
      }
    }
  }

  // Get wishlist items with pagination
  async getPaginatedWishlist(page = 1, itemsPerPage = 10) {
    const items = await this.getWishlistItems()
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

  // Filter wishlist by category
  async getWishlistByCategory(categoryId) {
    const items = await this.getWishlistItems()
    return items.filter(item => item.categoryId === categoryId)
  }

  // Search wishlist items
  async searchWishlist(query) {
    const items = await this.getWishlistItems()
    const searchTerm = query.toLowerCase()
    
    return items.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.category?.name?.toLowerCase().includes(searchTerm)
    )
  }

  // Sort wishlist items
  async sortWishlist(sortBy = 'dateAdded', order = 'desc') {
    const items = await this.getWishlistItems()
    
    return items.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'dateAdded':
          comparison = new Date(a.dateAdded) - new Date(b.dateAdded)
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'price':
          const priceA = this.extractPriceNumber(a.price)
          const priceB = this.extractPriceNumber(b.price)
          comparison = priceA - priceB
          break
        case 'points':
          comparison = a.points - b.points
          break
        default:
          comparison = 0
      }
      
      return order === 'desc' ? -comparison : comparison
    })
  }

  // Get wishlist statistics
  async getWishlistStats() {
    const items = await this.getWishlistItems()
    
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

      const itemPrice = this.extractPriceNumber(item.price)
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

  // Export wishlist to JSON
  async exportWishlist() {
    const items = await this.getWishlistItems()
    const exportData = {
      exportDate: new Date().toISOString(),
      itemCount: items.length,
      items: items
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  // Import wishlist from JSON
  async importWishlist(jsonData, merge = false) {
    try {
      const importData = JSON.parse(jsonData)
      
      if (!importData.items || !Array.isArray(importData.items)) {
        return {
          success: false,
          message: 'Invalid wishlist format'
        }
      }

      let currentItems = merge ? await this.getWishlistItems() : []
      const newItems = importData.items.filter(item => 
        !currentItems.some(existing => existing.id === item.id)
      )

      // Add new items
      for (const item of newItems) {
        await this.addToWishlist(item.originalProduct || item)
      }
      
      const finalItems = await this.getWishlistItems()
      this.notifyListeners()
      
      return {
        success: true,
        message: `Imported ${newItems.length} items`,
        data: finalItems,
        imported: newItems.length,
        skipped: importData.items.length - newItems.length
      }
    } catch (error) {
      console.error('Error importing wishlist:', error)
      return {
        success: false,
        message: 'Failed to import wishlist',
        error: error.message
      }
    }
  }

  // Queue pending operations for sync when online
  queuePendingOperation(operation, data) {
    this.pendingOperations.push({
      operation,
      data,
      timestamp: Date.now()
    })
  }

  // Sync pending operations when coming back online
  async syncPendingOperations() {
    if (!this.isAuthenticated() || this.pendingOperations.length === 0) {
      return
    }

    console.log(`Syncing ${this.pendingOperations.length} pending wishlist operations`)
    
    const operations = [...this.pendingOperations]
    this.pendingOperations = []

    for (const op of operations) {
      try {
        if (op.operation === 'add') {
          await apiService.addToWishlist(op.data)
        } else if (op.operation === 'remove') {
          await apiService.removeFromWishlist(op.data)
        }
      } catch (error) {
        console.warn(`Failed to sync operation ${op.operation}:`, error)
        // Re-queue failed operations
        this.pendingOperations.push(op)
      }
    }

    // Refresh wishlist after sync
    if (operations.length > 0) {
      this.notifyListeners()
    }
  }

  // Migrate localStorage wishlist to API
  async migrateToAPI() {
    if (!this.isAuthenticated()) {
      return {
        success: false,
        message: 'User not authenticated'
      }
    }

    const localItems = this.getLocalStorageItems()
    if (localItems.length === 0) {
      return {
        success: true,
        message: 'No local items to migrate'
      }
    }

    let migratedCount = 0
    let failedCount = 0

    for (const item of localItems) {
      try {
        if (!item.wishlistItemId) { // Only migrate localStorage-only items
          const productId = item.productId || item.id
          await apiService.addToWishlist(productId)
          migratedCount++
        }
      } catch (error) {
        console.warn(`Failed to migrate item ${item.id}:`, error)
        failedCount++
      }
    }

    // Refresh from API after migration
    const updatedItems = await this.getWishlistItems()
    this.notifyListeners()

    return {
      success: true,
      message: `Migrated ${migratedCount} items, ${failedCount} failed`,
      data: updatedItems,
      migrated: migratedCount,
      failed: failedCount
    }
  }

  // Utility methods
  formatPrice(price) {
    if (typeof price === 'string') {
      return price // Already formatted
    }
    
    if (typeof price === 'number') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price)
    }
    
    return 'Rp 0'
  }

  extractPriceNumber(priceString) {
    if (typeof priceString === 'number') return priceString
    if (typeof priceString !== 'string') return 0
    
    const numberStr = priceString.replace(/[^0-9]/g, '')
    return parseInt(numberStr) || 0
  }

  getImageUrl(imagePath) {
    if (!imagePath) return '/api/placeholder/120/120'
    if (imagePath.startsWith('http')) return imagePath
    return `https://apihustl.sijago.ai/uploads/products/${imagePath}`
  }

  // Debug method
  async debugWishlist() {
    const items = await this.getWishlistItems()
    const stats = await this.getWishlistStats()
    const count = await this.getWishlistCount()
    
    console.group('🛍️ Wishlist Debug Info')
    console.log('Total Items:', items.length)
    console.log('API Count:', count)
    console.log('Items:', items)
    console.log('Stats:', stats)
    console.log('Storage Key:', this.STORAGE_KEY)
    console.log('Listeners:', this.listeners.size)
    console.log('Pending Operations:', this.pendingOperations)
    console.log('Is Authenticated:', this.isAuthenticated())
    console.log('Is Online:', this.isOnline)
    console.groupEnd()
    
    return {
      items,
      stats,
      count,
      listenerCount: this.listeners.size,
      pendingOperations: this.pendingOperations.length,
      isAuthenticated: this.isAuthenticated(),
      isOnline: this.isOnline
    }
  }
}

// Export singleton instance
export default new WishlistService()