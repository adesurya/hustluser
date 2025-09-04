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

/* Page container - full width on mobile */
.page-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(180deg, rgba(35, 235, 250, 0.1) 0%, rgba(255, 0, 128, 0.1) 100%);
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

/* App container - full width on mobile, centered box on tablet+ */
.app-main {
  width: 100%;
  min-height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

/* Tablet and up - centered container */
@media (min-width: 768px) {
  .page-container {
    justify-content: center;
    align-items: center;
    padding: 2rem;
    min-height: 100vh;
  }
  
  .app-main {
    width: 100%;
    max-width: 420px;
    min-height: auto;
    max-height: calc(100vh - 4rem);
    background: rgba(255, 255, 255, 0.95);
    border-radius: 24px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
  }
}

/* Dashboard and Profile override - always full width on desktop */
.dashboard-page,
.profile-page {
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

.dashboard-page .page-container,
.dashboard-page .app-main,
.profile-page .page-container,
.profile-page .app-main {
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

/* Desktop adjustments for non-dashboard pages */
@media (min-width: 1024px) {
  .app-main {
    max-width: 480px;
    border-radius: 28px;
  }
  
  /* Dashboard and Profile specific overrides for desktop */
  .dashboard-page,
  .profile-page {
    width: 100% !important;
    max-width: none !important;
    border-radius: 0 !important;
    min-height: 100vh !important;
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    position: static !important;
    overflow-y: auto !important;
  }
  
  .dashboard-page .page-container,
  .dashboard-page .app-main,
  .profile-page .page-container, 
  .profile-page .app-main {
    width: 100% !important;
    max-width: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }
}

@media (min-width: 1200px) {
  .app-main {
    max-width: 520px;
    border-radius: 32px;
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