<template>
  <div id="app">
    <div class="page-container">
      <div class="app-main">
        <LoadingOverlay v-if="authStore.isLoading" />
        <router-view />
        <ToastNotification />
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import LoadingOverlay from './components/LoadingOverlay.vue'

export default {
  name: 'App',
  components: {
    LoadingOverlay
  },
  setup() {
    const authStore = useAuthStore()
    
    // Watch for authentication state changes
    let unsubscribeAuthWatcher = null
    let pageVisibilityHandler = null
    
    // Function to handle page visibility changes (when user comes back to tab)
    const handleVisibilityChange = async () => {
      if (!document.hidden && authStore.isAuthenticated) {
        try {
          // User came back to the tab and is authenticated
          console.log('Page became visible, checking cache health...')
          
          // Check if we need to refresh cache (older than 5 minutes)
          const lastCacheTime = localStorage.getItem('wishlist_last_cache_time')
          const now = Date.now()
          const fiveMinutes = 5 * 60 * 1000
          
          if (!lastCacheTime || (now - parseInt(lastCacheTime)) > fiveMinutes) {
            await authStore.checkCacheHealth()
            localStorage.setItem('wishlist_last_cache_time', now.toString())
            console.log('Cache health check completed due to page visibility')
          }
        } catch (error) {
          console.warn('Failed to handle visibility change cache refresh:', error)
        }
      }
    }
    
    onMounted(() => {
      // Watch for authentication state changes using Vue's watch
      unsubscribeAuthWatcher = watch(
        () => authStore.isAuthenticated,
        async (newIsAuthenticated, oldIsAuthenticated) => {
          if (newIsAuthenticated && !oldIsAuthenticated) {
            // User just logged in
            console.log('User authenticated, initializing cache...')
            // Cache initialization is already handled in the auth store login method
          } else if (!newIsAuthenticated && oldIsAuthenticated) {
            // User just logged out
            console.log('User logged out, cache already cleared by auth store')
            // Cache cleanup is already handled in the auth store logout method
          }
        },
        { immediate: false }
      )
      
      // Listen for page visibility changes
      pageVisibilityHandler = handleVisibilityChange
      document.addEventListener('visibilitychange', pageVisibilityHandler)
      
      // Initial cache check if already authenticated
      if (authStore.isAuthenticated) {
        setTimeout(() => {
          authStore.checkCacheHealth()
        }, 2000) // Wait 2 seconds after app mount
      }
    })
    
    onUnmounted(() => {
      // Cleanup watchers and listeners
      if (unsubscribeAuthWatcher) {
        unsubscribeAuthWatcher()
      }
      if (pageVisibilityHandler) {
        document.removeEventListener('visibilitychange', pageVisibilityHandler)
      }
    })
    
    return {
      authStore
    }
  }
}
</script>

<style>
/* Your existing styles remain the same */
#app {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(180deg, rgba(35, 235, 250, 0.1) 0%, rgba(255, 0, 128, 0.1) 100%);
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

.page-container {
  min-height: 100vh;
  width: 100%;
  background: inherit;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.app-main {
  width: 100%;
  min-height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

/* Tablet - 768px to 1023px: Centered card design */
@media (min-width: 768px) and (max-width: 1023px) {
  .page-container {
    justify-content: center;
    align-items: center;
    padding: 1.5rem;
    min-height: 100vh;
  }
  
  .app-main {
    width: 100%;
    max-width: 420px;
    min-height: auto;
    max-height: calc(100vh - 3rem);
    background: rgba(255, 255, 255, 0.98);
    border-radius: 20px;
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
  }
}

/* Desktop Small - 1024px to 1199px: Larger centered card */
@media (min-width: 1024px) and (max-width: 1199px) {
  .page-container {
    justify-content: center;
    align-items: center;
    padding: 2rem;
    min-height: 100vh;
  }
  
  .app-main {
    width: 100%;
    max-width: 480px;
    min-height: auto;
    max-height: calc(100vh - 4rem);
    background: rgba(255, 255, 255, 0.98);
    border-radius: 24px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
  }
}

/* Desktop Large - 1200px+: Maximum sized centered card */
@media (min-width: 1200px) {
  .page-container {
    justify-content: center;
    align-items: center;
    padding: 2rem;
    min-height: 100vh;
  }
  
  .app-main {
    width: 100%;
    max-width: 540px;
    min-height: auto;
    max-height: calc(100vh - 4rem);
    background: rgba(255, 255, 255, 0.98);
    border-radius: 28px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
  }
}

/* Special pages that need full width (Dashboard, Profile, etc.) */
.full-width-page {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  border: none !important;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  z-index: 1000;
  overflow-y: auto !important;
}

.full-width-page .page-container,
.full-width-page .app-main {
  width: 100% !important;
  max-width: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  border: none !important;
  background: transparent !important;
  position: static !important;
  height: auto !important;
  min-height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* Sticky Layout Components */
.page-with-sticky-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.98);
  border-bottom: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.sticky-footer {
  position: sticky;
  bottom: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
  margin-top: auto;
  backdrop-filter: blur(10px);
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>