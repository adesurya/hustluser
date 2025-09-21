import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const accessToken = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const pointsData = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const userName = computed(() => user.value?.username || '')
  const userEmail = computed(() => user.value?.email || '')
  const userPoints = computed(() => pointsData.value?.currentBalance || user.value?.currentPoints || 0)
  const userRole = computed(() => user.value?.role || 'user')

  // NEW: Cache management helper functions
  const clearUserCache = async () => {
    try {
      console.log('Clearing user cache (preserving auth data)...')
      
      // PROBLEM: Kode lama menghapus semua cache termasuk auth
      // SOLUTION: Hanya hapus cache non-auth
      const authKeys = ['accessToken', 'user']
      const cacheKeys = Object.keys(localStorage).filter(key => 
        (key.startsWith('cache:api:') ||
        key.includes('wishlist') ||
        key.includes('favoriteProducts') ||
        key.includes('cache_initialized_at') ||
        key.includes('wishlist_last_cache_time')) &&
        !authKeys.includes(key) // PENTING: Jangan hapus auth keys
      )
      
      cacheKeys.forEach(key => {
        localStorage.removeItem(key)
        console.log('Removed cache key:', key)
      })
      
      // Clear sessionStorage (non-auth)
      const sessionKeys = Object.keys(sessionStorage).filter(key => 
        (key.includes('cache') || key.includes('wishlist')) &&
        !authKeys.includes(key)
      )
      
      sessionKeys.forEach(key => {
        sessionStorage.removeItem(key)
      })
      
      // Clear API cache service if available
      try {
        const { useCachedApi } = await import('../composables/useCachedApi')
        const { invalidateCache } = useCachedApi()
        
        // Hanya invalidate cache tertentu, bukan clearAllCache()
        await invalidateCache('wishlist')
        await invalidateCache('wishlistCount')
        await invalidateCache('products')
        
        console.log('Specific API cache invalidated (auth preserved)')
      } catch (error) {
        console.warn('Failed to invalidate specific cache:', error)
      }
      
      console.log('User cache cleared successfully (auth data preserved)')
    } catch (error) {
      console.warn('Failed to clear user cache:', error)
    }
  }

  const initializeUserCache = async () => {
    try {
      console.log('Initializing user cache after login...')
      
      // Clear any stale cache first
      await clearUserCache()
      
      // Set cache initialization timestamp
      localStorage.setItem('cache_initialized_at', Date.now().toString())
      
      // PROBLEM: Pre-load wishlist otomatis
      // SOLUTION: Hanya invalidate cache, biarkan load on-demand
      setTimeout(async () => {
        try {
          const { useCachedApi } = await import('../composables/useCachedApi')
          const { invalidateCache } = useCachedApi()
          
          // Hanya invalidate cache, JANGAN load data
          await invalidateCache('wishlist')
          await invalidateCache('wishlistCount')
          
          // Hanya load points yang lebih aman
          await loadUserPoints()
          
          console.log('User cache initialized - wishlist will load on first access')
        } catch (error) {
          console.warn('User cache initialization partial failure:', error)
        }
      }, 1000)
      
    } catch (error) {
      console.warn('Failed to initialize user cache:', error)
    }
  }

  const checkCacheHealth = async () => {
    try {
      if (!isAuthenticated.value) return
      
      const cacheInitTime = localStorage.getItem('cache_initialized_at')
      if (!cacheInitTime) {
        // PROBLEM: initializeUserCache() bisa menyebabkan logout
        // SOLUTION: Hanya set timestamp, jangan force init
        localStorage.setItem('cache_initialized_at', Date.now().toString())
        console.log('Cache timestamp initialized')
        return
      }
      
      const now = Date.now()
      const cacheAge = now - parseInt(cacheInitTime)
      const oneHour = 60 * 60 * 1000
      
      // If cache is older than 1 hour, refresh it
      if (cacheAge > oneHour) {
        console.log('Cache is stale, refreshing non-critical data only...')
        
        // HANYA refresh data non-critical, jangan touch auth
        try {
          const { useCachedApi } = await import('../composables/useCachedApi')
          const { invalidateCache } = useCachedApi()
          
          await invalidateCache('wishlist')
          await invalidateCache('products')
          
          localStorage.setItem('cache_initialized_at', Date.now().toString())
          console.log('Non-critical cache refreshed')
        } catch (error) {
          console.warn('Non-critical cache refresh failed:', error)
          // Jangan logout karena ini
        }
      }
    } catch (error) {
      console.warn('Cache health check failed (non-critical):', error)
      // JANGAN logout karena cache health check gagal
    }
  }

  // Enhanced Actions
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
        
        // Load user points after successful login
        await loadUserPoints()
        
        // NEW: Initialize cache after successful login
        await initializeUserCache()
        
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

  const loadUserPoints = async () => {
    try {
      const response = await apiService.getMyPoints()
      if (response.success) {
        pointsData.value = response.data
        return response.data
      }
    } catch (err) {
      console.warn('Failed to load user points:', err)
      return null
    }
  }

  const refreshUserPoints = async () => {
    if (isAuthenticated.value) {
      await loadUserPoints()
    }
  }

  const logout = async () => {
    console.log('Logging out user...')
    
    // NEW: Clear cache before clearing auth state
    await clearUserCache()
    
    user.value = null
    accessToken.value = null
    pointsData.value = null
    error.value = null
    
    // Clear localStorage (auth-related items)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('favoriteProducts')
    
    console.log('User logged out and cache cleared')
  }

  const initializeFromStorage = async () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('accessToken')
    
    console.log('Initializing auth from storage:')
    console.log('Stored user:', storedUser ? 'Present' : 'Missing')
    console.log('Stored token:', storedToken ? 'Present' : 'Missing')
    
    if (storedUser && storedToken) {
      try {
        // PROBLEM: Error parsing bisa menyebabkan logout
        // SOLUTION: Validasi parsing dengan error handling yang lebih baik
        let parsedUser
        try {
          parsedUser = JSON.parse(storedUser)
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError)
          console.log('Stored user data:', storedUser.substring(0, 100))
          
          // Jangan langsung logout, coba ambil dari API
          if (storedToken) {
            console.log('Attempting to recover user data from API...')
            try {
              const profileResponse = await apiService.getUserProfile()
              if (profileResponse && profileResponse.success) {
                parsedUser = profileResponse.data
                // Update localStorage dengan data yang valid
                localStorage.setItem('user', JSON.stringify(parsedUser))
                console.log('User data recovered from API')
              } else {
                throw new Error('Failed to recover user data from API')
              }
            } catch (apiError) {
              console.error('Failed to recover user data from API:', apiError)
              // Baru sekarang logout jika semua gagal
              await logout()
              return
            }
          } else {
            await logout()
            return
          }
        }
        
        // Set auth state
        user.value = parsedUser
        accessToken.value = storedToken
        
        console.log('Auth initialized successfully')
        console.log('User:', user.value?.username)
        console.log('Token preview:', storedToken.substring(0, 20) + '...')
        
        // Load fresh points data
        await loadUserPoints()
        
        // PROBLEM: checkCacheHealth() mungkin terlalu agresif
        // SOLUTION: Delay dan optional cache health check
        setTimeout(async () => {
          try {
            await checkCacheHealth()
          } catch (error) {
            console.warn('Cache health check failed (non-critical):', error)
            // Jangan logout karena cache health check gagal
          }
        }, 3000) // Delay 3 detik untuk stabilitas
        
      } catch (err) {
        console.error('Critical error initializing auth:', err)
        // Hanya logout jika benar-benar critical error
        await logout()
      }
    } else {
      console.log('No valid auth data found in storage')
    }
  }

  const clearError = () => {
    error.value = null
  }

  // NEW: Manual cache refresh method
  const refreshCache = async () => {
    if (!isAuthenticated.value) {
      console.log('User not authenticated, skipping cache refresh')
      return
    }

    try {
      console.log('Manually refreshing user cache...')
      await initializeUserCache()
      console.log('Manual cache refresh completed')
      return { success: true }
    } catch (error) {
      console.error('Manual cache refresh failed:', error)
      return { success: false, error: error.message }
    }
  }

  // NEW: Force sync wishlist method
  const syncWishlist = async () => {
    if (!isAuthenticated.value) {
      return { success: false, message: 'User not authenticated' }
    }

    try {
      console.log('Force syncing wishlist...')
      const { useCachedApi } = await import('../composables/useCachedApi')
      const { getWishlist, invalidateCache } = useCachedApi()
      
      // Clear existing cache
      await invalidateCache('wishlist')
      await invalidateCache('wishlistCount')
      
      // Force refresh from API
      const response = await getWishlist({
        page: 1,
        limit: 1000,
        includeProduct: true
      }, { forceRefresh: true })
      
      if (response && response.success) {
        localStorage.setItem('wishlist_last_sync', Date.now().toString())
        console.log('Wishlist sync completed:', response.data.length, 'items')
        return { 
          success: true, 
          itemCount: response.data.length,
          message: 'Wishlist synced successfully' 
        }
      } else {
        throw new Error('Failed to sync wishlist')
      }
    } catch (error) {
      console.error('Wishlist sync failed:', error)
      return { 
        success: false, 
        error: error.message,
        message: 'Failed to sync wishlist' 
      }
    }
  }

  return {
    // State
    user,
    accessToken,
    isLoading,
    error,
    pointsData,
    
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
    refreshUserPoints,
    
    // NEW: Cache management actions
    clearUserCache,
    initializeUserCache,
    checkCacheHealth,
    refreshCache,
    syncWishlist
  }
})