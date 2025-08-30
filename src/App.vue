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
/* Mobile First - Base styles for mobile */
#app {
  min-height: 100vh;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.app-container {
  min-height: 100vh;
  width: 100%;
  background: white;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* Sticky Layout untuk pages dengan header dan footer */
.page-with-sticky-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sticky-footer {
  position: sticky;
  bottom: 0;
  z-index: 100;
  background: white;
  border-top: 1px solid #E5E7EB;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
  margin-top: auto;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}

/* Tablet - 768px and up */
@media (min-width: 768px) {
  #app {
    padding: 1rem;
  }
  
  .app-container {
    min-height: calc(100vh - 2rem);
    max-width: 420px;
    margin: 0 auto;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    overflow: hidden;
  }
}

/* Desktop Small - 1024px and up */
@media (min-width: 1024px) {
  #app {
    padding: 1.5rem;
  }
  
  .app-container {
    min-height: calc(100vh - 3rem);
    max-width: 440px;
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
    border-radius: 20px;
  }
}

/* Desktop Large - 1200px and up */
@media (min-width: 1200px) {
  #app {
    padding: 2rem;
  }
  
  .app-container {
    min-height: calc(100vh - 4rem);
    max-width: 460px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
  }
}

/* Ultra Wide - 1440px and up */
@media (min-width: 1440px) {
  .app-container {
    max-width: 480px;
  }
}
</style>