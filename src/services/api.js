// src/services/api.js - Updated version with dashboard APIs
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