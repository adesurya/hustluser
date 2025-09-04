// src/services/wishlistService.js - Service untuk mengelola wishlist produk

class WishlistService {
  constructor() {
    this.STORAGE_KEY = 'favoriteProducts'
    this.listeners = new Set()
  }

  // Event listener untuk perubahan wishlist
  addListener(callback) {
    this.listeners.add(callback)
  }

  removeListener(callback) {
    this.listeners.delete(callback)
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback())
  }

  // Mendapatkan semua item wishlist
  getWishlistItems() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading wishlist:', error)
      return []
    }
  }

  // Mendapatkan jumlah item dalam wishlist
  getWishlistCount() {
    return this.getWishlistItems().length
  }

  // Mengecek apakah produk ada di wishlist
  isInWishlist(productId) {
    const items = this.getWishlistItems()
    return items.some(item => item.id === productId)
  }

  // Menambahkan produk ke wishlist
  addToWishlist(product) {
    try {
      const items = this.getWishlistItems()
      
      // Cek apakah produk sudah ada
      if (this.isInWishlist(product.id)) {
        return {
          success: false,
          message: 'Product already in wishlist',
          data: items
        }
      }

      // Tambahkan metadata
      const wishlistItem = {
        id: product.id,
        title: product.title,
        price: product.formattedPrice || this.formatPrice(product.price),
        image: product.image,
        imageUrl: product.imageUrl,
        points: product.points || 0,
        categoryId: product.categoryId,
        category: product.category,
        url: product.url,
        dateAdded: new Date().toISOString(),
        originalProduct: product // Simpan data produk lengkap
      }

      items.push(wishlistItem)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items))
      
      this.notifyListeners()
      
      return {
        success: true,
        message: 'Product added to wishlist',
        data: items,
        item: wishlistItem
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      return {
        success: false,
        message: 'Failed to add to wishlist',
        error: error.message
      }
    }
  }

  // Menghapus produk dari wishlist
  removeFromWishlist(productId) {
    try {
      let items = this.getWishlistItems()
      const initialCount = items.length
      
      items = items.filter(item => item.id !== productId)
      
      if (items.length === initialCount) {
        return {
          success: false,
          message: 'Product not found in wishlist',
          data: items
        }
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items))
      
      this.notifyListeners()
      
      return {
        success: true,
        message: 'Product removed from wishlist',
        data: items
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      return {
        success: false,
        message: 'Failed to remove from wishlist',
        error: error.message
      }
    }
  }

  // Toggle status wishlist (add/remove)
  toggleWishlist(product) {
    if (this.isInWishlist(product.id)) {
      return this.removeFromWishlist(product.id)
    } else {
      return this.addToWishlist(product)
    }
  }

  // Menghapus semua item dari wishlist
  clearWishlist() {
    try {
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
        message: 'Failed to clear wishlist',
        error: error.message
      }
    }
  }

  // Mendapatkan item wishlist dengan pagination
  getPaginatedWishlist(page = 1, itemsPerPage = 10) {
    const items = this.getWishlistItems()
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

  // Filter wishlist berdasarkan kategori
  getWishlistByCategory(categoryId) {
    const items = this.getWishlistItems()
    return items.filter(item => item.categoryId === categoryId)
  }

  // Mencari item dalam wishlist
  searchWishlist(query) {
    const items = this.getWishlistItems()
    const searchTerm = query.toLowerCase()
    
    return items.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.category?.name?.toLowerCase().includes(searchTerm)
    )
  }

  // Mengurutkan wishlist
  sortWishlist(sortBy = 'dateAdded', order = 'desc') {
    const items = this.getWishlistItems()
    
    return items.sort((a, b) => {
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
          // Extract numeric value from price string
          const priceA = this.extractPriceNumber(a.price)
          const priceB = this.extractPriceNumber(b.price)
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

  // Export wishlist ke JSON
  exportWishlist() {
    const items = this.getWishlistItems()
    const exportData = {
      exportDate: new Date().toISOString(),
      itemCount: items.length,
      items: items
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  // Import wishlist dari JSON
  importWishlist(jsonData, merge = false) {
    try {
      const importData = JSON.parse(jsonData)
      
      if (!importData.items || !Array.isArray(importData.items)) {
        return {
          success: false,
          message: 'Invalid wishlist format'
        }
      }

      let currentItems = merge ? this.getWishlistItems() : []
      const newItems = importData.items.filter(item => 
        !currentItems.some(existing => existing.id === item.id)
      )

      const finalItems = [...currentItems, ...newItems]
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(finalItems))
      
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

  // Mendapatkan statistik wishlist
  getWishlistStats() {
    const items = this.getWishlistItems()
    
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
      // Kategori
      const categoryName = item.category?.name || 'Uncategorized'
      categories[categoryName] = (categories[categoryName] || 0) + 1

      // Total value dan points
      const itemPrice = this.extractPriceNumber(item.price)
      totalValue += itemPrice
      totalPoints += item.points || 0

      // Oldest dan newest
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
    
    // Remove currency symbols and extract number
    const numberStr = priceString.replace(/[^0-9]/g, '')
    return parseInt(numberStr) || 0
  }

  // Migration helper untuk data lama
  migrateOldWishlistData() {
    try {
      const items = this.getWishlistItems()
      let hasChanges = false
      
      const migratedItems = items.map(item => {
        const migrated = { ...item }
        
        // Add missing dateAdded
        if (!migrated.dateAdded) {
          migrated.dateAdded = new Date().toISOString()
          hasChanges = true
        }
        
        // Add missing points
        if (typeof migrated.points === 'undefined') {
          migrated.points = 0
          hasChanges = true
        }
        
        return migrated
      })
      
      if (hasChanges) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(migratedItems))
        this.notifyListeners()
      }
      
      return {
        success: true,
        migrated: hasChanges,
        itemCount: migratedItems.length
      }
    } catch (error) {
      console.error('Error migrating wishlist:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Debug method
  debugWishlist() {
    const items = this.getWishlistItems()
    const stats = this.getWishlistStats()
    
    console.group('🛍️ Wishlist Debug Info')
    console.log('Total Items:', items.length)
    console.log('Items:', items)
    console.log('Stats:', stats)
    console.log('Storage Key:', this.STORAGE_KEY)
    console.log('Listeners:', this.listeners.size)
    console.groupEnd()
    
    return {
      items,
      stats,
      listenerCount: this.listeners.size
    }
  }
}

// Export singleton instance
export default new WishlistService()