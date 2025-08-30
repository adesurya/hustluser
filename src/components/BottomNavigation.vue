<template>
  <div class="bottom-nav">
    <button 
      v-for="nav in navigationItems" 
      :key="nav.id"
      class="nav-item"
      :class="{ active: activeTab === nav.id }"
      @click="navigateToTab(nav.id)"
    >
      <span class="nav-icon">{{ nav.icon }}</span>
      <span class="nav-label">{{ nav.label }}</span>
    </button>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'BottomNavigation',
  setup() {
    const router = useRouter()
    const route = useRoute()

    // Navigation items configuration
    const navigationItems = [
      { id: 'home', icon: '🏠', label: 'Home', route: '/dashboard' },
      { id: 'category', icon: '📋', label: 'Category', route: '/category' },
      { id: 'campaign', icon: '🎯', label: 'Campaign', route: '/campaign' },
      { id: 'leaderboard', icon: '🏆', label: 'Leaderboard', route: '/leaderboard' },
      { id: 'account', icon: '👤', label: 'Akun', route: '/profile' }
    ]

    // Determine active tab based on current route
    const activeTab = computed(() => {
      const routeMap = {
        '/dashboard': 'home',
        '/category': 'category',
        '/campaign': 'campaign',
        '/leaderboard': 'leaderboard',
        '/profile': 'account'
      }
      return routeMap[route.path] || 'home'
    })

    // Navigation handler
    const navigateToTab = (tabId) => {
      const navItem = navigationItems.find(item => item.id === tabId)
      
      if (navItem) {
        if (navItem.route === route.path) {
          // Already on this page, no need to navigate
          return
        }     
        router.push(navItem.route)
      }
      
      console.log(`Navigate to ${tabId}`)
    }

    return {
      navigationItems,
      activeTab,
      navigateToTab
    }
  }
}
</script>

<style scoped>
/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #E5E7EB;
  padding: 0.75rem 0 calc(0.75rem + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-around;
  z-index: 1001;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 0.25rem;
  transition: all 0.2s;
  border-radius: 8px;
  min-width: 0;
  flex: 1;
}

.nav-item:hover {
  background: rgba(79, 195, 247, 0.1);
  transform: translateY(-1px);
}

.nav-item.active {
  background: rgba(79, 195, 247, 0.15);
}

.nav-item.active .nav-icon,
.nav-item.active .nav-label {
  color: #4FC3F7;
}

.nav-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
  color: #6B7280;
  transition: all 0.2s;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  text-align: center;
  transition: color 0.2s;
  white-space: nowrap;
}
</style>