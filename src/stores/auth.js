import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const accessToken = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const userName = computed(() => user.value?.username || '')
  const userEmail = computed(() => user.value?.email || '')
  const userPoints = computed(() => user.value?.currentPoints || 0)
  const userRole = computed(() => user.value?.role || 'user')

  // Actions
  const login = async (credentials) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.login(credentials)
      
      if (response.success) {
        user.value = response.data.user
        accessToken.value = response.data.accessToken
        
        // Persist to localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('accessToken', response.data.accessToken)
        
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.register(userData)
      
      if (response.success) {
        // Store user data but don't set as logged in since email verification is required
        const registeredUser = response.data.user
        
        return { 
          success: true, 
          data: {
            user: registeredUser,
            requiresEmailVerification: response.data.requiresEmailVerification,
            message: response.message
          }
        }
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (err) {
      // Handle different types of errors
      let errorMessage = err.message
      
      // If it's a validation error, the message should already be formatted correctly
      // by the API service interceptor
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    accessToken.value = null
    error.value = null
    
    // Clear localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
  }

  const initializeFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('accessToken')
    
    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser)
        accessToken.value = storedToken
      } catch (err) {
        console.error('Error parsing stored user data:', err)
        logout()
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    accessToken,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userName,
    userEmail,
    userPoints,
    userRole,
    
    // Actions
    login,
    register,
    logout,
    initializeFromStorage,
    clearError
  }
})