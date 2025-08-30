<template>
  <div class="dashboard-view dashboard-page">
    <!-- Points Section -->
    <div class="dashboard-section points-section">
      <div class="points-card">
        <div class="coin-icon">🪙</div>
        <div class="points-info">
          <span class="points-value">{{ userPoints }}</span>
          <span class="points-label">Points</span>
        </div>
      </div>
    </div>

    <!-- Search Section -->
    <div class="dashboard-section search-section">
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          class="search-input"
          placeholder="Search products..."
          v-model="searchQuery"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- Categories Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h3 class="section-title">Today's Hot Picks!</h3>
        <button class="see-more-btn">See More</button>
      </div>
      <div class="categories-scroll-container">
        <div class="categories-grid">
          <div v-for="category in categories" :key="category.id" class="category-card">
            <div class="category-icon" :style="{ background: category.color }">
              <span>{{ category.icon }}</span>
            </div>
            <span class="category-name">{{ category.name }}</span>
            <div v-if="category.badge" class="category-badge">{{ category.badge }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Products Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h3 class="section-title">Featured Products</h3>
        <button class="see-more-btn">See More</button>
      </div>
      <div class="products-grid">
        <div v-for="product in featuredProducts" :key="product.id" class="product-card">
          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
            <div class="product-badge">{{ product.category }}</div>
          </div>
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-price">{{ product.price }}</div>
            <div class="product-actions">
              <span class="earn-coins">🪙 Earn {{ product.coins }} Coins</span>
              <button class="share-btn">
                <span class="share-icon">📤</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Campaign Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h3 class="section-title">Active Campaign</h3>
        <button class="see-more-btn">See More</button>
      </div>
      <div v-if="activeCampaign" class="campaign-card">
        <div class="campaign-image">
          <img :src="activeCampaign.image" :alt="activeCampaign.title" />
          <div class="campaign-overlay">
            <h4 class="campaign-title">{{ activeCampaign.title }}</h4>
            <p class="campaign-description">{{ activeCampaign.description }}</p>
            <div class="campaign-details">
              <span class="campaign-discount">{{ activeCampaign.discount }}</span>
              <span class="campaign-validity">{{ activeCampaign.validity }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="bottom-nav">
      <button 
        v-for="nav in bottomNav" 
        :key="nav.id"
        class="nav-item"
        :class="{ active: activeTab === nav.id }"
        @click="navigateToTab(nav.id)"
      >
        <span class="nav-icon">{{ nav.icon }}</span>
        <span class="nav-label">{{ nav.label }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const searchQuery = ref('')
    const activeTab = ref('home')

    // User points from auth store
    const userPoints = computed(() => authStore.userPoints || 1250)

    // 5 Categories with scrollable functionality
    const categories = ref([
      { id: 1, name: 'Popular T-Shirts', icon: '👕', color: '#FF1493', badge: '3 days left' },
      { id: 2, name: 'Sport', icon: '⚽', color: '#FFA500' },
      { id: 3, name: 'Gaming', icon: '🎮', color: '#9932CC' },
      { id: 4, name: 'Electronics', icon: '📱', color: '#00CED1' },
      { id: 5, name: 'Fashion', icon: '👗', color: '#FFB6C1' }
    ])

    // 10 Featured products sorted by last update, displayed 2 per row
    const featuredProducts = ref([
      {
        id: 1,
        name: 'Samsung Smart TV 55"',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        price: 'Rp 7,500,000',
        coins: 75,
        lastUpdated: '2025-08-30T10:00:00Z'
      },
      {
        id: 2,
        name: 'iPhone 15 Pro Max',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        price: 'Rp 18,000,000',
        coins: 180,
        lastUpdated: '2025-08-30T09:45:00Z'
      },
      {
        id: 3,
        name: 'MacBook Air M3',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        price: 'Rp 15,000,000',
        coins: 150,
        lastUpdated: '2025-08-30T09:30:00Z'
      },
      {
        id: 4,
        name: 'Nike Air Max 270',
        category: 'Fashion',
        image: '/api/placeholder/80/80',
        price: 'Rp 1,800,000',
        coins: 18,
        lastUpdated: '2025-08-30T09:15:00Z'
      },
      {
        id: 5,
        name: 'Sony WH-1000XM5',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        price: 'Rp 4,500,000',
        coins: 45,
        lastUpdated: '2025-08-30T09:00:00Z'
      },
      {
        id: 6,
        name: 'Adidas Ultraboost 22',
        category: 'Sport',
        image: '/api/placeholder/80/80',
        price: 'Rp 2,200,000',
        coins: 22,
        lastUpdated: '2025-08-30T08:45:00Z'
      },
      {
        id: 7,
        name: 'PlayStation 5',
        category: 'Gaming',
        image: '/api/placeholder/80/80',
        price: 'Rp 8,000,000',
        coins: 80,
        lastUpdated: '2025-08-30T08:30:00Z'
      },
      {
        id: 8,
        name: 'iPad Pro 12.9"',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        price: 'Rp 12,000,000',
        coins: 120,
        lastUpdated: '2025-08-30T08:15:00Z'
      },
      {
        id: 9,
        name: 'Microsoft Surface Pro',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        price: 'Rp 13,500,000',
        coins: 135,
        lastUpdated: '2025-08-30T08:00:00Z'
      },
      {
        id: 10,
        name: 'Canon EOS R6',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        price: 'Rp 25,000,000',
        coins: 250,
        lastUpdated: '2025-08-30T07:45:00Z'
      }
    ].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))) // Sort by last updated

    // Active campaign data
    const activeCampaign = ref({
      id: 1,
      title: 'Summer Sale 2024',
      description: 'Get up to 50% off on selected electronics and fashion items',
      discount: 'Up to 50% OFF',
      validity: 'Valid until Aug 31',
      image: '/api/placeholder/400/200'
    })

    // Updated bottom navigation with 5 items
    const bottomNav = ref([
      { id: 'home', icon: '🏠', label: 'Home' },
      { id: 'category', icon: '📋', label: 'Category' },
      { id: 'campaign', icon: '🎯', label: 'Campaign' },
      { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
      { id: 'account', icon: '👤', label: 'Akun' }
    ])

    // Add touch scroll functionality for categories
    const initializeCategoryScrolling = () => {
      const container = document.querySelector('.categories-scroll-container')
      if (container) {
        let isDown = false
        let startX
        let scrollLeft

        container.addEventListener('mousedown', (e) => {
          isDown = true
          startX = e.pageX - container.offsetLeft
          scrollLeft = container.scrollLeft
        })

        container.addEventListener('mouseleave', () => {
          isDown = false
        })

        container.addEventListener('mouseup', () => {
          isDown = false
        })

        container.addEventListener('mousemove', (e) => {
          if (!isDown) return
          e.preventDefault()
          const x = e.pageX - container.offsetLeft
          const walk = (x - startX) * 2
          container.scrollLeft = scrollLeft - walk
        })
      }
    }

    const handleSearch = () => {
      console.log('Search query:', searchQuery.value)
    }

    const navigateToTab = (tabId) => {
      activeTab.value = tabId
      if (tabId === 'account') {
        router.push('/profile')
      }
      // Add other navigation logic here
      console.log(`Navigate to ${tabId}`)
    }

    // Initialize scrolling after component mounts
    onMounted(() => {
      initializeCategoryScrolling()
    })

    return {
      searchQuery,
      activeTab,
      userPoints,
      categories,
      featuredProducts,
      activeCampaign,
      bottomNav,
      handleSearch,
      navigateToTab
    }
  }
}
</script>

<style scoped>
/* Dashboard View - Add blue background and fix scrolling */
.dashboard-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Enable vertical scrolling */
}

/* Force scrolling on all screen sizes */
html, body {
  overflow-y: auto !important;
  height: auto !important;
}

/* Override any container restrictions */
.page-container,
.app-main {
  overflow-y: visible !important;
  height: auto !important;
}

/* Dashboard Section - Clean containers */
.dashboard-section {
  background: white;
  margin: 0 1rem 1.5rem 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.9);
}

.dashboard-section:first-child {
  margin-top: 1rem;
}

/* Points Section */
.points-section {
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.points-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.25);
  color: white;
}

.coin-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.points-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.points-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1;
}

.points-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Search Section */
.search-section {
  padding: 1rem 1.25rem;
  background: transparent;
  margin: 0 0 1.5rem 0;
  box-shadow: none;
  border: none;
}

.search-container {
  background: white;
  border-radius: 24px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.9);
}

.search-icon {
  font-size: 1.125rem;
  color: #6B7280;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.search-input::placeholder {
  color: #9CA3AF;
  font-weight: 400;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.see-more-btn {
  background: none;
  border: none;
  color: #4FC3F7;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Baloo 2', sans-serif;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.see-more-btn:hover {
  background: rgba(79, 195, 247, 0.1);
  transform: translateY(-1px);
}

/* Categories - Enhanced scrollable with touch support */
.categories-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  scroll-behavior: smooth; /* Smooth scrolling animation */
  cursor: grab; /* Visual indicator for dragging */
}

.categories-scroll-container:active {
  cursor: grabbing;
}

.categories-scroll-container::-webkit-scrollbar {
  display: none;
}

.categories-grid {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  width: max-content;
  min-width: 100%;
  touch-action: pan-x; /* Enable horizontal touch scrolling */
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
  flex-shrink: 0;
  position: relative;
  padding: 0.5rem;
  border-radius: 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-2px);
  background: rgba(79, 195, 247, 0.05);
}

.category-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}

.category-card:hover .category-icon {
  transform: scale(1.05);
}

.category-name {
  font-size: 0.8rem;
  color: #1F2937;
  text-align: center;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  line-height: 1.2;
}

.category-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #EF4444;
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

/* Products Grid - 2 products per row */
.products-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.product-card {
  display: flex;
  flex-direction: column;
  background: #F8FAFC;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s;
  border: 1px solid #E2E8F0;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #CBD5E1;
}

.product-image {
  position: relative;
  width: 100%;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #E5E7EB;
  margin-bottom: 0.75rem;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: #4FC3F7;
  color: white;
  font-size: 0.625rem;
  padding: 0.25rem 0.375rem;
  border-radius: 6px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(79, 195, 247, 0.3);
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.3;
  margin-bottom: 0.25rem;
}

.product-price {
  font-size: 0.8rem;
  color: #059669;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.earn-coins {
  font-size: 0.7rem;
  color: #F59E0B;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
}

.share-btn {
  background: #4FC3F7;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(79, 195, 247, 0.3);
}

.share-btn:hover {
  background: #29B6F6;
  transform: scale(1.1);
}

/* Campaign Card */
.campaign-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.campaign-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.campaign-image {
  position: relative;
  height: 160px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.campaign-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.campaign-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%);
  color: white;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.campaign-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  font-family: 'Baloo 2', sans-serif;
}

.campaign-description {
  font-size: 0.875rem;
  margin-bottom: 1rem;
  opacity: 0.95;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.4;
}

.campaign-details {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.campaign-discount {
  background: #EF4444;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Baloo 2', sans-serif;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

.campaign-validity {
  font-size: 0.75rem;
  opacity: 0.9;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

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

/* Responsive Styling for Tablet and Desktop */
@media (min-width: 768px) {
  /* Ensure blue background shows on all screen sizes */
  .dashboard-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  /* Override any container background that might interfere */
  .page-container,
  .app-main {
    background: transparent !important;
  }

  /* Ensure scrolling works on tablet */
  .categories-scroll-container {
    scroll-snap-type: x mandatory;
  }
  
  .category-card {
    scroll-snap-align: center;
  }
}

@media (min-width: 1024px) {
  /* Ensure blue background is visible on desktop */
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .dashboard-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: auto !important;
  }
  
  /* Make sure container doesn't override background */
  .page-container {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: 100vh !important;
    height: auto !important;
    padding: 0 !important;
    justify-content: flex-start !important;
    align-items: stretch !important;
  }
  
  .app-main {
    background: transparent !important;
    box-shadow: none !important;
    min-height: auto !important;
    max-height: none !important;
    height: auto !important;
    overflow: visible !important;
    max-width: none !important;
    width: 100% !important;
    border-radius: 0 !important;
  }

  /* Enhanced scrolling for desktop */
  .categories-scroll-container {
    scrollbar-width: thin;
    scrollbar-color: rgba(79, 195, 247, 0.3) transparent;
  }
  
  .categories-scroll-container::-webkit-scrollbar {
    display: block;
    height: 4px;
  }
  
  .categories-scroll-container::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  
  .categories-scroll-container::-webkit-scrollbar-thumb {
    background: rgba(79, 195, 247, 0.5);
    border-radius: 2px;
  }
  
  .categories-scroll-container::-webkit-scrollbar-thumb:hover {
    background: rgba(79, 195, 247, 0.7);
  }
}
</style>