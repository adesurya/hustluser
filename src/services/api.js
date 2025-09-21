// src/services/api.js - Enhanced version with bank account API endpoints
import axios from 'axios'

class ApiService {
  constructor() {
    this.baseURL = 'https://apihustl.sijago.ai/api/v1'
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Performance tracking for cache optimization
    this.requestMetrics = {
      totalRequests: 0,
      averageResponseTime: 0,
      endpointMetrics: new Map()
    }

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        // Track request start time for performance metrics
        config.metadata = { startTime: Date.now() }
        
        console.log('API Request:', config.method.toUpperCase(), config.url, 'Token:', token ? 'Present' : 'Missing')
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Track response time for cache optimization
        if (response.config.metadata) {
          const responseTime = Date.now() - response.config.metadata.startTime
          this.recordRequestMetrics(response.config.url, responseTime, 'success')
        }
        
        return response.data
      },
      (error) => {
        // Track failed request metrics
        if (error.config && error.config.metadata) {
          const responseTime = Date.now() - error.config.metadata.startTime
          this.recordRequestMetrics(error.config.url, responseTime, 'error')
        }

        if (error.response) {
          // Server responded with error status
          const errorData = error.response.data
          
          // Handle validation errors specifically
          if (errorData.code === 'VALIDATION_ERROR' && errorData.data?.errors) {
            // Extract validation error messages
            const validationMessages = errorData.data.errors.map(err => {
              // Format field-specific error messages
              return `${err.field}: ${err.message}`
            })
            
            // Create a custom error object with more details
            const validationError = new Error(validationMessages[0]) // Show first error primarily
            validationError.type = 'VALIDATION_ERROR'
            validationError.validationErrors = errorData.data.errors
            validationError.allMessages = validationMessages
            throw validationError
          }
          
          // Handle other specific error codes
          if (errorData.code === 'DUPLICATE_EMAIL') {
            throw new Error('This email is already registered. Please use a different email or try logging in.')
          }
          
          if (errorData.code === 'DUPLICATE_USERNAME') {
            throw new Error('This username is already taken. Please choose a different username.')
          }
          
          // Handle other server errors
          const message = errorData?.message || 'An error occurred'
          throw new Error(message)
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('Network error. Please check your connection.')
        } else {
          // Something else happened
          throw new Error('An unexpected error occurred')
        }
      }
    )
  }

  // Record request metrics for cache optimization
  recordRequestMetrics(url, responseTime, status) {
    this.requestMetrics.totalRequests++
    
    // Extract endpoint from URL for grouping
    const endpoint = this.extractEndpointName(url)
    
    if (!this.requestMetrics.endpointMetrics.has(endpoint)) {
      this.requestMetrics.endpointMetrics.set(endpoint, {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        successCount: 0,
        errorCount: 0
      })
    }
    
    const endpointMetric = this.requestMetrics.endpointMetrics.get(endpoint)
    endpointMetric.count++
    endpointMetric.totalTime += responseTime
    endpointMetric.averageTime = endpointMetric.totalTime / endpointMetric.count
    
    if (status === 'success') {
      endpointMetric.successCount++
    } else {
      endpointMetric.errorCount++
    }
    
    // Update global average
    const totalTime = Array.from(this.requestMetrics.endpointMetrics.values())
      .reduce((sum, metric) => sum + metric.totalTime, 0)
    this.requestMetrics.averageResponseTime = totalTime / this.requestMetrics.totalRequests
  }

  extractEndpointName(url) {
    // Extract meaningful endpoint name from URL for metrics
    const urlParts = url.split('/')
    const relevantParts = urlParts.slice(-2) // Take last 2 parts
    return relevantParts.join('/').split('?')[0] // Remove query params
  }

  // Auth APIs
  async login(credentials) {
    const response = await this.client.post('/auth/login', {
      identifier: credentials.identifier,
      password: credentials.password
    })
    
    // Trigger cache invalidation for user-specific data
    this.notifyCacheInvalidation('login', response)
    return response
  }

  async register(userData) {
    const response = await this.client.post('/auth/register', {
      username: userData.username,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      password: userData.password,
      confirmPassword: userData.confirmPassword
    })
    return response
  }

  async refreshToken() {
    const response = await this.client.post('/auth/refresh')
    return response
  }

  async getUserProfile() {
    const response = await this.client.get('/user/profile')
    return response
  }

  async updateProfile(userData) {
    const response = await this.client.put('/user/profile', userData)
    
    // Notify cache to invalidate profile-related data
    this.notifyCacheInvalidation('profileUpdate', response)
    return response
  }

  // Dashboard APIs
  async getMyPoints() {
    const response = await this.client.get('/points/my-points')
    return response
  }

  async getCategories() {
    const response = await this.client.get('/categories/')
    return response
  }

  async getCategoryById(categoryId) {
    const response = await this.client.get(`/categories/${categoryId}`)
    return response
  }

  async getProducts(params = {}) {
    const response = await this.client.get('/products', { params })
    return response
  }

  async getFeaturedProducts() {
    const response = await this.client.get('/products/featured')
    return response
  }

  async getProductById(productId) {
    const response = await this.client.get(`/products/${productId}`)
    return response
  }

  async getActiveCampaigns() {
    const response = await this.client.get('/campaigns/active')
    return response
  }

  async getCampaignById(campaignId) {
    const response = await this.client.get(`/campaigns/${campaignId}`)
    return response
  }

  // Leaderboard APIs
  async getLeaderboardDaily(date) {
    const formattedDate = date || new Date().toISOString().split('T')[0]
    const response = await this.client.get(`/leaderboard/daily?date=${formattedDate}`)
    return response
  }

  async getLeaderboardWeekly(startDate, endDate) {
    const response = await this.client.get(`/leaderboard/weekly?start_date=${startDate}&end_date=${endDate}`)
    return response
  }

  async getLeaderboardMonthly(year, month) {
    const currentYear = year || new Date().getFullYear()
    const currentMonth = month || (new Date().getMonth() + 1)
    const response = await this.client.get(`/leaderboard/monthly?year=${currentYear}&month=${currentMonth}`)
    return response
  }

  // Profile APIs
  async getUserProfileById(userId) {
    const response = await this.client.get(`/auth/profile/${userId}`)
    return response
  }

  async getMyTransactions(params = {}) {
    const response = await this.client.get('/points/my-transactions', { params })
    return response
  }

  async getMyRedemptions(params = {}) {
    const response = await this.client.get('/points/my-redemptions', { params })
    return response
  }

  async createRedemption(redemptionData) {
    const response = await this.client.post('/points/redeem', redemptionData)
    
    // Notify cache to invalidate redemption and points related data
    this.notifyCacheInvalidation('redemption', response)
    return response
  }

  // BANK ACCOUNT APIs - NEW IMPLEMENTATION
  async getBankAccounts(params = {}) {
    const {
      page = 1,
      limit = 20,
    } = params
    
    const queryParams = {
      page,
      limit,
    }
    
    const response = await this.client.get('/bank-accounts', { params: queryParams })
    return response
  }

  async getBankAccountById(accountId) {
    const response = await this.client.get(`/bank-accounts/${accountId}`)
    return response
  }

  async addBankAccount(bankAccountData) {
    const response = await this.client.post('/bank-accounts', {
      bankName: bankAccountData.bankName,
      accountNumber: bankAccountData.accountNumber,
      accountName: bankAccountData.accountName,
      isPrimary: bankAccountData.isPrimary || false,
      notes: bankAccountData.notes || ''
    })
    
    // Notify cache to invalidate bank account related data
    this.notifyCacheInvalidation('bankAccountUpdate', response)
    return response
  }

  async updateBankAccount(accountId, bankAccountData) {
    const response = await this.client.put(`/bank-accounts/${accountId}`, {
      bankName: bankAccountData.bankName,
      accountName: bankAccountData.accountName,
      notes: bankAccountData.notes
    })
    
    // Notify cache to invalidate bank account related data
    this.notifyCacheInvalidation('bankAccountUpdate', response)
    return response
  }

  async setPrimaryBankAccount(accountId) {
    const response = await this.client.patch(`/bank-accounts/${accountId}/set-primary`)
    
    // Notify cache to invalidate bank account related data
    this.notifyCacheInvalidation('bankAccountUpdate', response)
    return response
  }

  async deleteBankAccount(accountId) {
    const response = await this.client.delete(`/bank-accounts/${accountId}`)
    
    // Notify cache to invalidate bank account related data
    this.notifyCacheInvalidation('bankAccountUpdate', response)
    return response
  }

  // WISHLIST APIs - EXISTING IMPLEMENTATION
  async getWishlist(params = {}) {
    const {
      page = 1,
      limit = 10,
      includeProduct = true,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = params
    
    const queryParams = {
      page,
      limit,
      includeProduct,
      sortBy,
      sortOrder
    }
    
    const response = await this.client.get('/wishlist', { params: queryParams })
    return response
  }

  async getWishlistCount() {
    const response = await this.client.get('/wishlist/count')
    return response
  }

  async addToWishlist(productId) {
    const response = await this.client.post('/wishlist', {
      productId: productId
    })
    
    // Notify cache to invalidate wishlist related data
    this.notifyCacheInvalidation('wishlistUpdate', response)
    return response
  }

  async removeFromWishlist(wishlistItemId) {
    // Validate the wishlistItemId
    if (!wishlistItemId || wishlistItemId === null || wishlistItemId === undefined) {
      throw new Error('Invalid wishlist item ID')
    }

    try {
      const response = await this.client.delete(`/wishlist/${wishlistItemId}`)
      
      // Notify cache to invalidate wishlist related data
      this.notifyCacheInvalidation('wishlistUpdate', response)
      return response
    } catch (error) {
      // Handle specific 404 error for wishlist items
      if (error.response && error.response.status === 404) {
        // Item might already be deleted, treat as success
        console.warn(`Wishlist item ${wishlistItemId} not found, might already be deleted`)
        
        // Still invalidate cache to sync state
        this.notifyCacheInvalidation('wishlistUpdate', { 
          wishlistItemId, 
          alreadyDeleted: true 
        })
        
        return {
          success: true,
          message: 'Item already removed from wishlist',
          data: { wishlistItemId, alreadyDeleted: true }
        }
      }
      
      // Re-throw other errors
      throw error
    }
  }

  async toggleWishlist(productId) {
    const response = await this.client.post('/wishlist/toggle', {
      productId: productId
    })
    
    // Notify cache to invalidate wishlist related data
    this.notifyCacheInvalidation('wishlistUpdate', response)
    return response
  }

  async isInWishlist(productId) {
    try {
      // Get wishlist and check if product exists
      const wishlistResponse = await this.getWishlist({ limit: 100 })
      
      if (wishlistResponse.success && wishlistResponse.data) {
        return wishlistResponse.data.some(item => 
          item.productId === productId || item.product?.id === productId
        )
      }
      
      return false
    } catch (error) {
      console.warn('Error checking wishlist status:', error)
      return false
    }
  }

  // AFFILIATE LINKS APIs - EXISTING IMPLEMENTATION
  async getAffiliateLinks(params = {}) {
    const {
      page = 1,
      limit = 20,
      status = null
    } = params
    
    // Only send parameters that the API actually supports
    const queryParams = {
      page,
      limit
    }
    
    // Only add status if it's provided and not empty
    if (status && status.trim() !== '') {
      queryParams.status = status
    }
    
    try {
      console.log('Making affiliate links request with params:', queryParams)
      
      const response = await this.client.get('/affiliate-links', { 
        params: queryParams,
        headers: {
          'Content-Type': 'application/json'
          // Authorization header will be added by interceptor
        }
      })
      
      console.log('Affiliate links response:', response)
      
      // Apply client-side sorting if needed
      if (response && response.success && response.data && Array.isArray(response.data)) {
        const data = [...response.data]
        
        // Apply client-side sorting based on original params
        const { sortBy, sortOrder } = params
        if (sortBy && sortBy !== 'id') {
          data.sort((a, b) => {
            let aVal, bVal
            
            switch (sortBy) {
              case 'created_at':
              case 'createdAt':
                aVal = new Date(a.created_at || a.createdAt || 0)
                bVal = new Date(b.created_at || b.createdAt || 0)
                break
              case 'earnings':
                aVal = parseFloat(a.earnings || 0)
                bVal = parseFloat(b.earnings || 0)
                break
              case 'clicksCount':
                aVal = parseInt(a.clicksCount || a.clicks || 0)
                bVal = parseInt(b.clicksCount || b.clicks || 0)
                break
              case 'conversionsCount':
                aVal = parseInt(a.conversionsCount || a.conversions || 0)
                bVal = parseInt(b.conversionsCount || b.conversions || 0)
                break
              default:
                aVal = a.id || 0
                bVal = b.id || 0
            }
            
            if (sortOrder === 'ASC') {
              return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
            } else {
              return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
            }
          })
        }
        
        return {
          ...response,
          data
        }
      }
      
      return response
      
    } catch (error) {
      console.error('Affiliate links API error:', error)
      
      // Enhanced error handling for 500 errors
      if (error.response?.status === 500) {
        console.warn('Server error, trying minimal request...')
        
        // Try with absolute minimal parameters
        try {
          const minimalResponse = await this.client.get('/affiliate-links')
          console.log('Minimal request succeeded:', minimalResponse)
          return minimalResponse
        } catch (minimalError) {
          console.error('Even minimal request failed:', minimalError)
          throw new Error('Server is currently unavailable. Please try again later.')
        }
      }
      
      // Re-throw other errors
      throw error
    }
  }

  async getAffiliateLinkById(linkId) {
    const response = await this.client.get(`/affiliate-links/${linkId}`)
    return response
  }

  // Generate Affiliate Link API
  async generateAffiliateLink(productData) {
    const response = await this.client.post('/tiktok/affiliate-links', {
      productId: productData.productId,
      materialId: productData.materialId,
      channel: productData.channel || 'hazel',
      tags: productData.tags || ['user_share'],
      materialType: productData.materialType || 1
    })
    
    // Notify cache about potential points change and affiliate links update
    this.notifyCacheInvalidation('productPurchase', response)
    this.notifyCacheInvalidation('affiliateLinksUpdate', response)
    return response
  }

  // Share Affiliate Link API
  async shareAffiliateLink(shareData) {
    const response = await this.client.post('/share/affiliate-link', {
      affiliateLinkId: shareData.affiliateLinkId,
      platform: shareData.platform,
      metadata: {
        userAgent: navigator.userAgent,
        ipAddress: shareData.ipAddress || 'unknown',
        ...shareData.metadata
      }
    })
    return response
  }

  async performCheckin() {
  const response = await this.client.post('/gamification/checkin')
  
  // Notify cache to invalidate points and user related data
  this.notifyCacheInvalidation('checkinUpdate', response)
  return response
    }

    async getGamificationStatus() {
      const response = await this.client.get('/gamification/status')
      return response
    }

    async getMissionHistory(params = {}) {
      const {
        page = 1,
        limit = 20
      } = params
      
      const queryParams = { page, limit }
      const response = await this.client.get('/gamification/missions/history', { params: queryParams })
      return response
    }

    // Add to cache invalidation notification helper
    async notifyCacheInvalidation(action, responseData = {}) {
      try {
        // Dynamically import to avoid circular dependencies
        const { default: apiCacheService } = await import('./apiCacheService')
        await apiCacheService.invalidateRelated(action, responseData)
      } catch (error) {
        console.warn('Cache invalidation notification failed:', error)
      }
    }

  // Utility method to extract material ID from product URL
  static extractMaterialId(productUrl) {
    if (!productUrl) return null
    
    // Extract material ID from URLs like:
    // https://shop-id.tokopedia.com/view/product/1730865346384987673
    // https://www.tokopedia.com/product/1730865346384987673
    const regex = /product\/(\d+)/i
    const match = productUrl.match(regex)
    
    return match ? match[1] : null
  }

   // Helper method untuk mendapatkan tanggal awal dan akhir minggu ini
  static getCurrentWeekDates() {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust when day is Sunday
    
    const monday = new Date(now.setDate(diff))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    }
  }

  // Debug method to check authentication status
  checkAuthStatus() {
    const token = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')
    
    console.log('=== AUTH DEBUG INFO ===')
    console.log('Token exists:', !!token)
    console.log('User exists:', !!user)
    
    if (token) {
      console.log('Token preview:', token.substring(0, 30) + '...')
      console.log('Token length:', token.length)
    }
    
    if (user) {
      try {
        const parsedUser = JSON.parse(user)
        console.log('User data:', parsedUser)
      } catch (err) {
        console.log('Error parsing user data:', err)
      }
    }
    
    console.log('Current headers:', this.client.defaults.headers)
    console.log('======================')
    
    return {
      hasToken: !!token,
      hasUser: !!user,
      token: token,
      tokenPreview: token ? token.substring(0, 30) + '...' : null
    }
  }

  // Get performance metrics for cache optimization
  getPerformanceMetrics() {
    const metrics = {
      totalRequests: this.requestMetrics.totalRequests,
      averageResponseTime: this.requestMetrics.averageResponseTime,
      endpointBreakdown: {}
    }
    
    // Convert Map to object for easier consumption
    for (const [endpoint, data] of this.requestMetrics.endpointMetrics) {
      metrics.endpointBreakdown[endpoint] = {
        ...data,
        successRate: data.count > 0 ? (data.successCount / data.count * 100).toFixed(2) : 0
      }
    }
    
    return metrics
  }

  // Utility method to format price from API
  static formatPrice(price) {
    if (typeof price === 'string') {
      const numPrice = parseFloat(price)
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numPrice)
    }
    return price
  }

  // Utility method to get image URL
  static getImageUrl(imagePath, type = 'products') {
    if (!imagePath) return '/api/placeholder/120/120'
    if (imagePath.startsWith('http')) return imagePath
    return `https://apihustl.sijago.ai/uploads/${type}/${imagePath}`
  }

  // Utility method to format earnings
  static formatEarnings(earnings) {
    if (!earnings || earnings === '0') return 'Rp 0'
    
    const numEarnings = parseFloat(earnings)
    if (isNaN(numEarnings)) return 'Rp 0'
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numEarnings)
  }

  // Utility method to format date
  static formatDate(dateString) {
    if (!dateString) return 'Unknown'
    
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Bank account utility methods
  static formatBankAccountNumber(accountNumber) {
    if (!accountNumber) return ''
    
    // Mask account number (show first 4 and last 4 digits)
    if (accountNumber.length <= 8) return accountNumber
    
    const firstPart = accountNumber.substring(0, 4)
    const lastPart = accountNumber.substring(accountNumber.length - 4)
    const middleMask = '*'.repeat(Math.min(6, accountNumber.length - 8))
    
    return `${firstPart}${middleMask}${lastPart}`
  }

  static formatBankName(bankName) {
    if (!bankName) return 'Unknown Bank'
    
    // Common bank name mappings for Indonesia
    const bankMappings = {
      'BCA': 'Bank Central Asia',
      'BRI': 'Bank Rakyat Indonesia',
      'BNI': 'Bank Negara Indonesia',
      'MANDIRI': 'Bank Mandiri',
      'CIMB': 'CIMB Niaga',
      'DANAMON': 'Bank Danamon',
      'PERMATA': 'Bank Permata',
      'OCBC': 'OCBC NISP'
    }
    
    const upperName = bankName.toUpperCase()
    return bankMappings[upperName] || bankName
  }

  static validateBankAccount(bankAccountData) {
    const errors = []
    
    if (!bankAccountData.bankName || bankAccountData.bankName.trim() === '') {
      errors.push('Bank name is required')
    }
    
    if (!bankAccountData.accountNumber || bankAccountData.accountNumber.trim() === '') {
      errors.push('Account number is required')
    } else if (!/^\d{8,20}$/.test(bankAccountData.accountNumber.replace(/\s/g, ''))) {
      errors.push('Account number must be 8-20 digits')
    }
    
    if (!bankAccountData.accountName || bankAccountData.accountName.trim() === '') {
      errors.push('Account name is required')
    } else if (bankAccountData.accountName.length < 3) {
      errors.push('Account name must be at least 3 characters')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export default new ApiService()