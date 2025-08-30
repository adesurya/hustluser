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
}

export default new ApiService()