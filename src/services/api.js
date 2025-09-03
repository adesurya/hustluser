// src/services/api.js - Updated version with leaderboard APIs
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

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
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
        return response.data
      },
      (error) => {
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

  // Auth APIs
  async login(credentials) {
    const response = await this.client.post('/auth/login', {
      identifier: credentials.identifier,
      password: credentials.password
    })
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
    // Untuk weekly, kita bisa menggunakan daily API dengan range tanggal
    // atau jika ada endpoint khusus weekly, sesuaikan di sini
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
}

export default new ApiService()