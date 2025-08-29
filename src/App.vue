<template>
  <div id="app">
    <div class="app-container">
      <!-- Loading Overlay -->
      <LoadingOverlay v-if="authStore.isLoading" />
      
      <!-- Router View -->
      <router-view />
    </div>
  </div>
</template>

<script>
import { useAuthStore } from './stores/auth'
import LoadingOverlay from './components/LoadingOverlay.vue'

export default {
  name: 'App',
  components: {
    LoadingOverlay
  },
  setup() {
    const authStore = useAuthStore()
    
    return {
      authStore
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.app-container {
  min-height: 100vh;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background: white;
  position: relative;
  overflow-x: hidden;
}

/* Desktop Responsive */
@media (min-width: 768px) {
  #app {
    padding: 1.5rem;
  }
  
  .app-container {
    min-height: calc(100vh - 3rem);
    max-width: 480px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-radius: 16px;
    overflow: hidden;
  }
}

/* Large Desktop */
@media (min-width: 1024px) {
  #app {
    padding: 2rem;
  }
  
  .app-container {
    min-height: calc(100vh - 4rem);
    max-width: 520px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border-radius: 20px;
  }
}

/* Wide Desktop */
@media (min-width: 1440px) {
  .app-container {
    max-width: 560px;
  }
}

/* Mobile - Full Screen */
@media (max-width: 767px) {
  #app {
    padding: 0;
  }
  
  .app-container {
    min-height: 100vh;
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>