// src/composables/useApiCache.js - Vue composable for cached API calls
import { ref, onMounted } from 'vue'
import apiCacheService from '../services/apiCacheService'

export function useApiCache(endpoint, params = {}, options = {}) {
  const data = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const cacheHit = ref(false)

  const {
    immediate = true,
    refreshInterval = null,
    retryCount = 3,
    retryDelay = 1000
  } = options

  const execute = async (forceRefresh = false) => {
    isLoading.value = true
    error.value = null
    cacheHit.value = false

    let retries = 0
    
    while (retries <= retryCount) {
      try {
        const startTime = Date.now()
        const result = await apiCacheService.cachedRequest(endpoint, params, {
          ...options,
          forceRefresh: forceRefresh || retries > 0
        })
        
        const responseTime = Date.now() - startTime
        
        if (result) {
          data.value = result
          cacheHit.value = responseTime < 50 // Likely cache hit if very fast
          break
        } else {
          throw new Error('No data received')
        }
      } catch (err) {
        console.error(`API request failed (attempt ${retries + 1}):`, err)
        error.value = err
        
        if (retries < retryCount) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retries)))
          retries++
        } else {
          break
        }
      }
    }
    
    isLoading.value = false
  }

  const refresh = () => execute(true)

  // Auto-refresh if interval is set
  let intervalId = null
  if (refreshInterval && refreshInterval > 0) {
    intervalId = setInterval(() => {
      if (!isLoading.value) {
        execute(true)
      }
    }, refreshInterval)
  }

  // Cleanup function
  const cleanup = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  if (immediate) {
    onMounted(() => execute())
  }

  return {
    data,
    isLoading,
    error,
    cacheHit,
    execute,
    refresh,
    cleanup
  }
}

// Usage example in components
export function useCachedProducts(categoryId = null) {
  return useApiCache('products', 
    categoryId ? { categoryId } : {}, 
    { 
      immediate: true,
      refreshInterval: 5 * 60 * 1000 // Refresh every 5 minutes
    }
  )
}

export function useCachedCategories() {
  return useApiCache('categories', {}, { 
    immediate: true,
    refreshInterval: 15 * 60 * 1000 // Refresh every 15 minutes
  })
}