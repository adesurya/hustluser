<template>
  <div class="dashboard-view">
    <HustlHeader :isDashboard="true" />

    <!-- Loading State -->
    <div v-if="isLoading" class="dashboard-section loading-section">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading dashboard...</p>
      <p v-if="cacheStatus.isFromCache" class="cache-info">
        Data loaded from {{ cacheStatus.source }} cache
      </p>
    </div>

    <template v-else>
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
          <button class="see-more-btn" @click="navigateToCategories">See More</button>
        </div>
        <div class="categories-scroll-container">
          <div class="categories-grid">
            <div 
              v-for="category in categories" 
              :key="category.id" 
              class="category-card"
              @click="selectCategory(category)"
            >
              <div class="category-icon" :style="{ background: getCategoryColor(category.id) }">
                <span>{{ getCategoryIcon(category.name) }}</span>
              </div>
              <span class="category-name">{{ category.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Featured Products Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h3 class="section-title">Featured Products</h3>
          <button class="see-more-btn" @click="navigateToCategories">See More</button>
        </div>
        <div v-if="featuredProducts.length > 0" class="products-grid">
          <div 
            v-for="product in featuredProducts" 
            :key="product.id" 
            class="product-card"
            @click="viewProductDetails(product)"
          >
            <div class="product-image">
              <img :src="getProductImageUrl(product.image)" :alt="product.title" />
              <div class="product-badge">{{ product.category?.name || 'Product' }}</div>
            </div>
            <div class="product-info">
              <h4 class="product-name">{{ product.title }}</h4>
              <div class="product-price">{{ product.formattedPrice || formatPrice(product.price) }}</div>
              <div class="product-actions">
                <span class="earn-coins">🪙 Earn {{ product.points }} Coins</span>
                <button class="share-btn" @click="openShareModal(product)" @click.stop>
                  <span class="share-icon">🔗</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-products">
          <p class="empty-text">No featured products available</p>
        </div>
      </div>

      <!-- Campaign Section -->
      <div class="dashboard-section" v-if="activeCampaign">
        <div class="section-header">
          <h3 class="section-title">Active Campaign</h3>
          <button class="see-more-btn" @click="navigateToCampaigns">See More</button>
        </div>
        <div class="campaign-card" @click="viewCampaignDetails(activeCampaign)">
          <div class="campaign-image">
            <img :src="getCampaignImageUrl(activeCampaign.image)" :alt="activeCampaign.name" />
            <div class="campaign-overlay">
              <h4 class="campaign-title">{{ activeCampaign.name }}</h4>
              <p class="campaign-description">{{ activeCampaign.description }}</p>
              <div class="campaign-details">
                <span class="campaign-status" :class="activeCampaign.status">{{ activeCampaign.status }}</span>
                <span class="campaign-validity">{{ formatCampaignDate(activeCampaign.endDate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Messages -->
      <div v-if="error" class="dashboard-section error-section">
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ error }}</span>
          <button class="retry-btn" @click="loadDashboardData">Retry</button>
        </div>
      </div>
    </template>

    <ShareModal 
      :isVisible="showShareModal" 
      :product="selectedProductForShare"
      @close="closeShareModal"
      @shared="handleShareSuccess"
      @points-earned="handlePointsEarned"
    />

    <!-- Bottom Navigation Component -->
    <BottomNavigation />
  </div>
</template>

<script>
// DashboardView.vue <script> section with enhanced and consistent caching
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import ShareModal from '../components/ShareModal.vue'
import apiService from '../services/api'
import { useCachedApi } from '../composables/useCachedApi'

export default {
  name: 'DashboardView',
  components: {
    BottomNavigation,
    HustlHeader,
    ShareModal 
  },
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const authStore = useAuthStore()
    
    // Use cached API composable for consistency with other views
    const { 
      getMyPoints, 
      getCategories, 
      getFeaturedProducts, 
      getCampaigns,
      // loading: isCacheLoading,
      // error: cacheError 
    } = useCachedApi()
    
    // State management
    const isLoading = ref(true)
    const error = ref('')
    const userPointsData = ref(null)
    const categories = ref([])
    const featuredProducts = ref([])
    const activeCampaign = ref(null)

    // Share modal state
    const showShareModal = ref(false)
    const selectedProductForShare = ref(null)

    // Enhanced cache status tracking
    const cacheStatus = ref({
      isFromCache: false,
      source: 'network',
      details: [],
      responseTime: 0,
      lastRefresh: null
    })

    // Performance tracking
    const loadingMetrics = ref({
      startTime: null,
      endTime: null,
      totalTime: 0,
      cacheHits: 0,
      networkCalls: 0
    })

    // User points from API or store
    const userPoints = computed(() => 
      userPointsData.value?.currentBalance || authStore.userPoints || 0
    )

    // Category colors mapping
    const categoryColors = {
      1: '#4FC3F7', // Electronics
      2: '#FF69B4', // Fashion  
      3: '#FF6B35', // Sports
      4: '#4ECDC4', // Home & Living
      5: '#FF1493', // Health & Beauty
      6: '#32CD32'  // Automotive
    }

    // Category icons mapping
    const categoryIcons = {
      'Electronics': '📱',
      'Fashion': '👗',
      'Sports': '⚽',
      'Sport': '⚽',
      'Home & Living': '🏠',
      'Health & Beauty': '💄',
      'Automotive': '🚗'
    }

    // Methods
    const getCategoryColor = (categoryId) => {
      return categoryColors[categoryId] || '#6B7280'
    }

    const getCategoryIcon = (categoryName) => {
      return categoryIcons[categoryName] || '📦'
    }

    const getProductImageUrl = (imagePath) => {
      return apiService.constructor.getImageUrl(imagePath, 'products')
    }

    const getCampaignImageUrl = (imagePath) => {
      return apiService.constructor.getImageUrl(imagePath, 'campaigns')
    }

    const formatPrice = (price) => {
      return apiService.constructor.formatPrice(price)
    }

    const formatCampaignDate = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = date.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'Expired'
      if (diffDays === 0) return 'Ends today'
      if (diffDays === 1) return 'Ends tomorrow'
      return `${diffDays} days left`
    }

    // Share Modal Methods
    const openShareModal = (product) => {
      if (!product) {
        console.warn('No product data available for sharing')
        return
      }
      
      // Validate product has required URL for material ID extraction
      if (!product.url) {
        alert('This product cannot be shared as it does not have a valid product URL.')
        return
      }
      
      selectedProductForShare.value = product
      showShareModal.value = true
    }

    const closeShareModal = () => {
      showShareModal.value = false
      selectedProductForShare.value = null
    }

    const handleShareSuccess = async (shareData) => {
      console.log('Product shared successfully:', shareData)
      
      // Show success notification
      if (shareData.pointsEarned > 0) {
        console.log(`Earned ${shareData.pointsEarned} points for sharing!`)
        
        // Force refresh points data after earning points
        try {
          const updatedPoints = await getMyPoints({ forceRefresh: true })
          if (updatedPoints.success) {
            userPointsData.value = updatedPoints.data
            authStore.setUserPoints(updatedPoints.data.currentBalance)
          }
        } catch (err) {
          console.warn('Failed to refresh points after sharing:', err)
        }
      }
    }

    const handlePointsEarned = async (points) => {
      // Force refresh user points data
      try {
        const updatedPoints = await getMyPoints({ forceRefresh: true })
        if (updatedPoints.success) {
          userPointsData.value = updatedPoints.data
          authStore.setUserPoints(updatedPoints.data.currentBalance)
        }
      } catch (err) {
        console.warn('Failed to refresh points:', err)
        // Fallback to updating auth store directly
        authStore.refreshUserPoints()
      }
      
      console.log(`Points earned: ${points}`)
    }

    // Enhanced load dashboard data with consistent caching
    const loadDashboardData = async (forceRefresh = false) => {
      isLoading.value = true
      error.value = ''
      
      // Reset metrics
      loadingMetrics.value = {
        startTime: Date.now(),
        endTime: null,
        totalTime: 0,
        cacheHits: 0,
        networkCalls: 0
      }

      try {
        console.log('🚀 Loading dashboard data...', forceRefresh ? '(force refresh)' : '(cached)')

        // Load all dashboard data in parallel using cached API
        const [pointsResult, categoriesResult, featuredProductsResult, campaignsResult] = await Promise.allSettled([
          getMyPoints({ 
            ttl: 30 * 1000, // 30 seconds for real-time points
            forceRefresh 
          }),
          getCategories({ 
            ttl: 30 * 60 * 1000, // 30 minutes for stable categories
            forceRefresh 
          }),
          getFeaturedProducts({ 
            ttl: 10 * 60 * 1000, // 10 minutes for featured products
            forceRefresh 
          }),
          getCampaigns({ 
            ttl: 20 * 60 * 1000, // 20 minutes for campaigns
            forceRefresh 
          })
        ])

        // Track cache performance
        const cacheHits = []
        const networkCalls = []
        
        // Handle points data
        if (pointsResult.status === 'fulfilled' && pointsResult.value.success) {
          userPointsData.value = pointsResult.value.data
          cacheHits.push('points')
          console.log('✅ Points data loaded successfully')
        } else {
          console.warn('⚠️ Failed to load points:', pointsResult.reason)
          networkCalls.push('points')
        }

        // Handle categories data
        if (categoriesResult.status === 'fulfilled' && categoriesResult.value.success) {
          categories.value = categoriesResult.value.data.slice(0, 5) // Limit to 5 categories
          cacheHits.push('categories')
          console.log('✅ Categories data loaded successfully')
        } else {
          console.warn('⚠️ Failed to load categories:', categoriesResult.reason)
          networkCalls.push('categories')
        }

        // Handle featured products data
        if (featuredProductsResult.status === 'fulfilled' && featuredProductsResult.value.success) {
          featuredProducts.value = featuredProductsResult.value.data.slice(0, 6) // Limit to 6 products
          cacheHits.push('products')
          console.log('✅ Featured products loaded successfully')
        } else {
          console.warn('⚠️ Failed to load featured products:', featuredProductsResult.reason)
          networkCalls.push('products')
        }

        // Handle campaigns data
        if (campaignsResult.status === 'fulfilled' && campaignsResult.value.success) {
          const campaigns = campaignsResult.value.data
          activeCampaign.value = campaigns.length > 0 ? campaigns[0] : null
          cacheHits.push('campaigns')
          console.log('✅ Campaigns data loaded successfully')
        } else {
          console.warn('⚠️ Failed to load campaigns:', campaignsResult.reason)
          networkCalls.push('campaigns')
        }

        // Calculate metrics
        loadingMetrics.value.endTime = Date.now()
        loadingMetrics.value.totalTime = loadingMetrics.value.endTime - loadingMetrics.value.startTime
        loadingMetrics.value.cacheHits = cacheHits.length
        loadingMetrics.value.networkCalls = networkCalls.length

        // Update cache status
        cacheStatus.value = {
          isFromCache: cacheHits.length > 0,
          source: cacheHits.length === 4 ? 'full-cache' : cacheHits.length > 0 ? 'partial-cache' : 'network',
          details: cacheHits,
          responseTime: loadingMetrics.value.totalTime,
          lastRefresh: new Date(),
          performance: {
            cacheHitRate: ((cacheHits.length / 4) * 100).toFixed(1) + '%',
            loadTime: loadingMetrics.value.totalTime + 'ms'
          }
        }

        // Log performance summary
        console.group('📊 Dashboard Loading Performance')
        console.log(`Total time: ${loadingMetrics.value.totalTime}ms`)
        console.log(`Cache hits: ${cacheHits.join(', ')} (${cacheHits.length}/4)`)
        console.log(`Cache hit rate: ${cacheStatus.value.performance.cacheHitRate}`)
        console.log(`Data source: ${cacheStatus.value.source}`)
        console.groupEnd()

        // Check if all critical data failed to load
        const criticalFailures = [
          pointsResult.status === 'rejected',
          categoriesResult.status === 'rejected',
          featuredProductsResult.status === 'rejected'
        ].filter(Boolean).length

        if (criticalFailures >= 2) {
          error.value = 'Unable to load dashboard data. Please check your connection.'
        }

      } catch (err) {
        console.error('💥 Dashboard loading error:', err)
        error.value = 'Failed to load dashboard data. Please try again.'
        
        // Update metrics for error case
        loadingMetrics.value.endTime = Date.now()
        loadingMetrics.value.totalTime = loadingMetrics.value.endTime - loadingMetrics.value.startTime
        
        cacheStatus.value = {
          isFromCache: false,
          source: 'error',
          details: [],
          responseTime: loadingMetrics.value.totalTime,
          lastRefresh: new Date(),
          performance: {
            cacheHitRate: '0%',
            loadTime: loadingMetrics.value.totalTime + 'ms'
          }
        }
      } finally {
        isLoading.value = false
      }
    }

    // Force refresh dashboard data
    const refreshDashboard = async () => {
      console.log('🔄 Force refreshing dashboard data...')
      await loadDashboardData(true)
    }

    // Smart refresh based on cache age
    const smartRefresh = async () => {
      if (cacheStatus.value.lastRefresh) {
        const timeSinceLastRefresh = Date.now() - cacheStatus.value.lastRefresh.getTime()
        const refreshThreshold = 5 * 60 * 1000 // 5 minutes
        
        if (timeSinceLastRefresh > refreshThreshold) {
          console.log('⏰ Dashboard data is stale, refreshing...')
          await refreshDashboard()
        } else {
          console.log('✨ Dashboard data is fresh, using cached data')
          await loadDashboardData(false)
        }
      } else {
        await loadDashboardData(false)
      }
    }

    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          name: 'Category',
          query: { search: searchQuery.value }
        })
      }
    }

    const selectCategory = (category) => {
      router.push({
        name: 'Category',
        query: { categoryId: category.id }
      })
    }

    const viewProductDetails = (product) => {
      // Store product details for next view
      sessionStorage.setItem('selectedProduct', JSON.stringify(product))
      router.push(`/product/${product.id}`)
    }

    const viewCampaignDetails = (campaign) => {
      // Store campaign details for next view
      sessionStorage.setItem('selectedCampaign', JSON.stringify(campaign))
      router.push(`/campaign/${campaign.id}`)
    }

    const navigateToCategories = () => {
      router.push('/category')
    }

    const navigateToCampaigns = () => {
      router.push('/campaign')
    }

    // Initialize dashboard data on mount with smart refresh
    onMounted(() => {
      smartRefresh()
    })

    return {
      searchQuery,
      isLoading,
      error,
      userPoints,
      categories,
      featuredProducts,
      activeCampaign,
      showShareModal,
      selectedProductForShare,
      cacheStatus,
      loadingMetrics,
      handleSearch,
      selectCategory,
      viewProductDetails,
      viewCampaignDetails,
      navigateToCategories,
      navigateToCampaigns,
      loadDashboardData,
      refreshDashboard,
      smartRefresh,
      getCategoryColor,
      getCategoryIcon,
      getProductImageUrl,
      getCampaignImageUrl,
      formatPrice,
      formatCampaignDate,
      openShareModal,
      closeShareModal,
      handleShareSuccess,
      handlePointsEarned
    }
  }
}
</script>

<style scoped>
/* Dashboard View - Add blue background and fix scrolling */
.dashboard-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 120px; /* Increased to prevent bottom navigation cutoff */
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Loading Section */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(79, 195, 247, 0.3);
  border-top: 4px solid #4FC3F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.cache-info {
  color: #10B981;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Section */
.error-section {
  background: #FEF2F2;
  border: 2px solid #FECACA;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #DC2626;
  font-family: 'Baloo 2', sans-serif;
}

.error-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-weight: 500;
}

.retry-btn {
  background: #DC2626;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Baloo 2', sans-serif;
}

.retry-btn:hover {
  background: #B91C1C;
  transform: translateY(-1px);
}

/* Empty Products */
.empty-products {
  text-align: center;
  padding: 2rem 1rem;
  color: #6B7280;
}

.empty-text {
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Dashboard Section - Clean containers with proper text handling */
.dashboard-section {
  background: white;
  margin: 0 1rem 1.5rem 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.9);
  /* Ensure proper text wrapping */
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.campaign-details {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.campaign-status {
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Baloo 2', sans-serif;
  text-transform: capitalize;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.campaign-status.active {
  background: #10B981;
  color: white;
}

.campaign-status.upcoming {
  background: #F59E0B;
  color: white;
}

.campaign-status.ended {
  background: #EF4444;
  color: white;
}

.campaign-validity {
  font-size: 0.75rem;
  opacity: 0.9;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Responsive Styling for Tablet and Desktop */
@media (min-width: 768px) {
  .dashboard-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .page-container,
  .app-main {
    background: transparent !important;
  }

  .categories-scroll-container {
    scroll-snap-type: x mandatory;
  }
  
  .category-card {
    scroll-snap-align: center;
  }
}

@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .dashboard-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: auto !important;
  }
  
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
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  cursor: grab;
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
  touch-action: pan-x;
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
  /* Fixed text overflow for category names */
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
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
  /* Fixed text overflow for product names */
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
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
  /* Fixed text overflow for campaign titles */
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.campaign-description {
  font-size: 0.875rem;
  margin-bottom: 1rem;
  opacity: 0.95;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.4;
  /* Fixed text overflow for campaign descriptions */
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.campaign-details {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.campaign-status {
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Baloo 2', sans-serif;
  text-transform: capitalize;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.campaign-status.active {
  background: #10B981;
  color: white;
}

.campaign-status.upcoming {
  background: #F59E0B;
  color: white;
}

.campaign-status.ended {
  background: #EF4444;
  color: white;
}

.campaign-validity {
  font-size: 0.75rem;
  opacity: 0.9;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Responsive Styling for Tablet and Desktop */
@media (min-width: 768px) {
  .dashboard-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .page-container,
  .app-main {
    background: transparent !important;
  }

  .categories-scroll-container {
    scroll-snap-type: x mandatory;
  }
  
  .category-card {
    scroll-snap-align: center;
  }
}

@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .dashboard-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: auto !important;
  }
  
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