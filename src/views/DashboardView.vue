<template>
  <div class="dashboard-page">
    <!-- Points Section -->
    <div class="points-section">
      <div class="points-card">
        <div class="coin-icon">🪙</div>
        <div class="points-info">
          <span class="points-value">{{ userPoints }}</span>
          <span class="points-label">Points</span>
        </div>
        <button class="refresh-btn">🔄</button>
      </div>
    </div>

    <!-- Search Section -->
    <div class="search-section">
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          class="search-input"
          placeholder="Search..."
          v-model="searchQuery"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- Categories Section -->
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">Today's Hot Picks!</h3>
        <button class="see-more-btn">See More</button>
      </div>
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

    <!-- Featured Products Section -->
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">Featured Products</h3>
        <button class="see-more-btn">See More</button>
      </div>
      <div class="products-list">
        <div v-for="product in featuredProducts" :key="product.id" class="product-card">
          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
            <div class="product-badge">{{ product.category }}</div>
          </div>
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-actions">
              <span class="earn-coins">🪙 Earn 5 Coins</span>
              <button class="add-btn">➕</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Campaign Section -->
    <div class="section">
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
        @click="activeTab = nav.id"
      >
        <span class="nav-icon">{{ nav.icon }}</span>
        <span class="nav-label">{{ nav.label }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'DashboardView',
  setup() {
    const authStore = useAuthStore()
    const searchQuery = ref('')
    const activeTab = ref('home')

    // User points from auth store
    const userPoints = computed(() => authStore.userPoints || 500)

    // Mock data for categories
    const categories = ref([
      { id: 1, name: 'Popular T-Shirts', icon: '👕', color: '#FF1493', badge: '3 days left' },
      { id: 2, name: 'Sport', icon: '⚽', color: '#FFA500' },
      { id: 3, name: 'Gaming', icon: '🎮', color: '#9932CC' }
    ])

    // Mock data for featured products
    const featuredProducts = ref([
      {
        id: 1,
        name: 'Samsung Smart TV 55"',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        coins: 5
      },
      {
        id: 2,
        name: 'Samsung Smart TV 65"',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        coins: 5
      },
      {
        id: 3,
        name: 'Samsung Smart TV 75"',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        coins: 5
      },
      {
        id: 4,
        name: 'Samsung Smart TV 85"',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        coins: 5
      }
    ])

    // Mock data for active campaign
    const activeCampaign = ref({
      id: 1,
      title: 'Summer Sale 2024',
      description: 'Get up to 50% off on selected items',
      discount: 'Up to 50% OFF',
      validity: 'Valid until Aug 31',
      image: '/api/placeholder/300/150'
    })

    // Bottom navigation
    const bottomNav = ref([
      { id: 'home', icon: '🏠', label: 'Home' },
      { id: 'category', icon: '📋', label: 'Category' },
      { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
      { id: 'profile', icon: '👤', label: 'Profile' }
    ])

    const handleSearch = () => {
      console.log('Search query:', searchQuery.value)
      // Implement search functionality
    }

    return {
      searchQuery,
      activeTab,
      userPoints,
      categories,
      featuredProducts,
      activeCampaign,
      bottomNav,
      handleSearch
    }
  }
}
</script>

<style scoped>
/* Mobile First - Base styles */
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 80px;
}

/* Points Section */
.points-section {
  padding: 1rem;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
}

.points-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.coin-icon {
  font-size: 1.5rem;
}

.points-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.points-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.points-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
}

.refresh-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
}

/* Search Section */
.search-section {
  padding: 0 1rem 1rem;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
}

.search-container {
  background: white;
  border-radius: 20px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-icon {
  font-size: 1rem;
  color: #6B7280;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.search-input::placeholder {
  color: #9CA3AF;
}

/* Sections */
.section {
  background: white;
  margin-bottom: 1rem;
  padding: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.see-more-btn {
  background: none;
  border: none;
  color: #4FC3F7;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Baloo 2', sans-serif;
}

/* Categories Grid */
.categories-grid {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
  position: relative;
}

.category-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
}

.category-name {
  font-size: 0.75rem;
  color: #1F2937;
  text-align: center;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.category-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #EF4444;
  color: white;
  font-size: 0.6rem;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Products List */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 12px;
}

.product-image {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: #E5E7EB;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badge {
  position: absolute;
  top: 2px;
  left: 2px;
  background: #4FC3F7;
  color: white;
  font-size: 0.6rem;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  font-family: 'Baloo 2', sans-serif;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.earn-coins {
  font-size: 0.75rem;
  color: #F59E0B;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.add-btn {
  background: #10B981;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Campaign Card */
.campaign-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.campaign-image {
  position: relative;
  height: 150px;
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
  background: rgba(0, 0, 0, 0.4);
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.campaign-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-family: 'Baloo 2', sans-serif;
}

.campaign-description {
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  opacity: 0.9;
  font-family: 'Baloo 2', sans-serif;
}

.campaign-details {
  display: flex;
  gap: 1rem;
}

.campaign-discount {
  background: #EF4444;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
}

.campaign-validity {
  font-size: 0.75rem;
  opacity: 0.8;
  font-family: 'Baloo 2', sans-serif;
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #E5E7EB;
  padding: 0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-around;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.nav-item.active .nav-icon,
.nav-item.active .nav-label {
  color: #4FC3F7;
}

.nav-icon {
  font-size: 1.25rem;
  margin-bottom: 0.125rem;
  color: #6B7280;
}

.nav-label {
  font-size: 0.625rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
}

/* Tablet */
@media (min-width: 768px) {
  .dashboard-page {
    max-width: 420px;
    margin: 0 auto;
  }

  .points-card {
    padding: 1.25rem;
  }

  .section {
    padding: 1.25rem;
  }

  .category-icon {
    width: 70px;
    height: 70px;
  }

  .product-image {
    width: 80px;
    height: 80px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .dashboard-page {
    max-width: 440px;
  }

  .points-card {
    padding: 1.5rem;
  }

  .section {
    padding: 1.5rem;
  }
}
</style>