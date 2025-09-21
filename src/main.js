// src/main.js - Updated with automatic cache sync
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import cachePlugin from './plugins/cachePlugin'
import './registerServiceWorker'
import './assets/styles/main.css'
import ToastNotification from './components/ToastNotification.vue'
import cacheOptimization from './utils/cacheOptimization'

cacheOptimization.initialize()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(cachePlugin, { preWarm: true })
app.component('ToastNotification', ToastNotification)

// Add network status monitoring
let isOnline = navigator.onLine
const updateOnlineStatus = () => {
  const wasOffline = !isOnline
  isOnline = navigator.onLine
  
  if (isOnline && wasOffline) {
    // Refresh cache when coming back online
    setTimeout(() => {
      //cacheOptimization.preloadAllCriticalData()

      import('./services/enhancedApi').then(({ default: api }) => {
        api.preWarmCache()
      })

      // Also sync wishlist when coming back online
      syncWishlistOnReconnect()
    }, 1000)
  }
}

// NEW: Automatic wishlist cache sync function
const initializeWishlistCache = async () => {
  try {
    setTimeout(async () => {
      const token = localStorage.getItem('accessToken')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        console.log('User authenticated, cleaning non-auth cache only...')
        
        try {
          // HANYA hapus wishlist cache, bukan auth data
          const cacheKeys = Object.keys(localStorage).filter(key => 
            key.includes('cache:api:wishlist') || 
            key.includes('favoriteProducts') ||
            key.includes('wishlist_last_cache_time')
          )
          
          cacheKeys.forEach(key => {
            localStorage.removeItem(key)
            console.log('Removed stale cache:', key)
          })
          
          console.log('Wishlist cache cleanup completed (auth preserved)')
        } catch (error) {
          console.warn('Wishlist cache cleanup failed:', error)
        }
      } else {
        console.log('User not authenticated, skipping cache cleanup')
      }
    }, 2000)
  } catch (error) {
    console.error('Failed to initialize cache cleanup:', error)
  }
}

// NEW: Sync wishlist when reconnecting to internet
const syncWishlistOnReconnect = async () => {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    
    console.log('Syncing wishlist after reconnection...')
    
    // Dynamic import
    const { useCachedApi } = await import('./composables/useCachedApi')
    const { getWishlist, invalidateCache } = useCachedApi()
    
    // Force refresh wishlist from server
    await invalidateCache('wishlist')
    await getWishlist({ 
      page: 1, 
      limit: 100, 
      includeProduct: true 
    }, { forceRefresh: true })
    
    console.log('Wishlist sync after reconnection completed')
  } catch (error) {
    console.warn('Wishlist sync after reconnection failed:', error)
  }
}

window.addEventListener('online', updateOnlineStatus)
window.addEventListener('offline', updateOnlineStatus)

// Mount the app
app.mount('#app')

// Initialize wishlist cache after app is mounted
initializeWishlistCache()