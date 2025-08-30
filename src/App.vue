<template>
  <div id="app">
    <div class="app-main">
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
/* Full width layout with new smoother gradient */
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

/* App container - full width, no constraints */
.app-main {
  width: 100%;
  min-height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
}

/* All screen sizes - maintain full width */
@media (min-width: 768px) {
  #app {
    padding: 0;
  }
  
  .app-main {
    width: 100%;
    min-height: 100vh;
    box-shadow: none;
    border-radius: 0;
    overflow: visible;
    margin: 0;
    background: transparent;
    backdrop-filter: none;
    border: none;
  }
}

@media (min-width: 1024px) {
  #app {
    padding: 0;
  }
  
  .app-main {
    width: 100%;
    min-height: 100vh;
    border-radius: 0;
    box-shadow: none;
  }
}

/* Sticky Layout */
.page-with-sticky-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.sticky-footer {
  position: sticky;
  bottom: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
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