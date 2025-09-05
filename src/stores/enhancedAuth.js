// src/stores/enhancedAuth.js - Enhanced auth store with caching
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import enhancedApiService from '../services/enhancedApi'

export const useEnhancedAuthStore = defineStore('enhancedAuth', () => {
  // State
  const user = ref(null)
  const accessToken = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const pointsData = ref(null)
  const pointsLastUpdated = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const userName = computed(() => user.value?.username || '')
  const userEmail = computed(() => user.value?.email || '')
  const userPoints = computed(() => pointsData.value?.currentBalance || user.value?.currentPoints || 0)
  const userRole = computed(() => user.value?.role || 'user')

  // Actions
  const login = async (credentials) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await enhancedApiService.login(credentials)
      
      if (response.success) {
        user.value = response.data.user
        accessToken.value = response.data.accessToken
        
        // Persist to localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('accessToken', response.data.accessToken)
        
        // Load user points after successful login
        await loadUserPoints()
        
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
      const response = await enhancedApiService.register(userData)
      
      if (response.success) {
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
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const loadUserPoints = async (forceRefresh = false) => {
    try {
      const response = await enhancedApiService.getMyPoints({ forceRefresh })
      if (response.success) {
        pointsData.value = response.data
        pointsLastUpdated.value = Date.now()
        return response.data
      }
    } catch (err) {
      console.warn('Failed to load user points:', err)
      return null
    }
  }

  const refreshUserPoints = async () => {
    if (isAuthenticated.value) {
      await loadUserPoints(true)
    }
  }

  const logout = () => {
    user.value = null
    accessToken.value = null
    pointsData.value = null
    pointsLastUpdated.value = null
    error.value = null
    
    // Clear localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('favoriteProducts')
    
    // Clear all caches
    import('../services/cacheService').then(({ default: cacheService }) => {
      cacheService.clearAll()
    })
  }

  const initializeFromStorage = async () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('accessToken')
    
    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser)
        accessToken.value = storedToken
        
        // Load fresh points data in background
        setTimeout(() => loadUserPoints(), 100)
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
    pointsData,
    pointsLastUpdated,
    
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
    clearError,
    loadUserPoints,
    refreshUserPoints
  }
})

