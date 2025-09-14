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

      <!-- Search Section with Optimized Debounced Search -->
      <div class="dashboard-section search-section">
        <div class="search-container">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            class="search-input"
            placeholder="Search products..."
            v-model="searchQuery"
            @input="debouncedSearch"
            @keydown.enter="handleSearchEnter"
            ref="searchInput"
          />
          <div v-if="isSearching" class="search-loading">
            <div class="mini-spinner"></div>
          </div>
          <button v-if="searchQuery" class="clear-search" @click="clearSearch">✕</button>
        </div>
        
        <!-- Search Results Dropdown -->
        <div v-if="searchResults.length > 0 && searchQuery" class="search-results">
          <div 
            v-for="product in searchResults.slice(0, 5)" 
            :key="product.id"
            class="search-result-item"
            @click="selectSearchResult(product)"
          >
            <img :src="getProductImageUrl(product.image)" :alt="product.title" class="search-result-image" />
            <div class="search-result-info">
              <h4 class="search-result-title">{{ product.title }}</h4>
              <p class="search-result-price">{{ formatPrice(product.price) }}</p>
              <span class="search-result-category">{{ product.category?.name }}</span>
            </div>
          </div>
          <div v-if="searchResults.length > 5" class="search-result-more" @click="showAllSearchResults">
            View all {{ searchResults.length }} results
          </div>
        </div>
        
        <!-- No Results -->
        <div v-if="searchQuery && !isSearching && searchResults.length === 0" class="search-no-results">
          <p>No products found for "{{ searchQuery }}"</p>
        </div>
      </div>

      <!-- Featured Products Section with Pagination -->
      <div class="dashboard-section">
        <div class="section-header">
          <h3 class="section-title">Hot / Winning Products</h3>
          <button class="see-more-btn" @click="navigateToCategories">See More</button>
        </div>
        
        <div v-if="paginatedFeaturedProducts.length > 0" class="products-grid">
          <div 
            v-for="product in paginatedFeaturedProducts" 
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
        
        <!-- Products Pagination -->
        <div v-if="totalProductPages > 1" class="pagination-container">
          <button 
            class="pagination-btn"
            :disabled="currentProductPage === 1"
            @click="changeProductPage(currentProductPage - 1)"
          >
            ‹
          </button>
          <span class="pagination-info">{{ currentProductPage }} / {{ totalProductPages }}</span>
          <button 
            class="pagination-btn"
            :disabled="currentProductPage === totalProductPages"
            @click="changeProductPage(currentProductPage + 1)"
          >
            ›
          </button>
        </div>
        
        <div v-if="featuredProducts.length === 0" class="empty-products">
          <p class="empty-text">No featured products available</p>
        </div>
      </div>

      <!-- Active Campaigns Section with Pagination -->
      <div class="dashboard-section" v-if="activeCampaigns.length > 0">
        <div class="section-header">
          <h3 class="section-title">Active Campaigns</h3>
          <button class="see-more-btn" @click="navigateToCampaigns">See More</button>
        </div>
        
        <div class="campaigns-container">
          <div 
            v-for="campaign in paginatedActiveCampaigns" 
            :key="campaign.id" 
            class="campaign-card"
            @click="viewCampaignDetails(campaign)"
          >
            <div class="campaign-image">
              <img :src="getCampaignImageUrl(campaign.image)" :alt="campaign.name" />
              <div class="campaign-overlay">
                <h4 class="campaign-title">{{ campaign.name }}</h4>
                <p class="campaign-description">{{ campaign.description }}</p>
                <div class="campaign-details">
                  <span class="campaign-status" :class="campaign.status">{{ campaign.status }}</span>
                  <span class="campaign-validity">{{ formatCampaignDate(campaign.endDate) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Campaigns Pagination -->
        <div v-if="totalCampaignPages > 1" class="pagination-container">
          <button 
            class="pagination-btn"
            :disabled="currentCampaignPage === 1"
            @click="changeCampaignPage(currentCampaignPage - 1)"
          >
            ‹
          </button>
          <span class="pagination-info">{{ currentCampaignPage }} / {{ totalCampaignPages }}</span>
          <button 
            class="pagination-btn"
            :disabled="currentCampaignPage === totalCampaignPages"
            @click="changeCampaignPage(currentCampaignPage + 1)"
          >
            ›
          </button>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
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
    const authStore = useAuthStore()
    
    // Search functionality
    const searchQuery = ref('')
    const searchResults = ref([])
    const isSearching = ref(false)
    const searchInput = ref(null)
    let searchTimeout = null
    
    // Use cached API composable
    const { 
      getMyPoints, 
      getFeaturedProducts, 
      getCampaigns,
      getProducts
    } = useCachedApi()
    
    // State management
    const isLoading = ref(true)
    const error = ref('')
    const userPointsData = ref(null)
    const featuredProducts = ref([])
    const activeCampaigns = ref([])

    // Pagination state
    const currentProductPage = ref(1)
    const currentCampaignPage = ref(1)
    const itemsPerPage = 10
    const campaignsPerPage = 3

    // Share modal state
    const showShareModal = ref(false)
    const selectedProductForShare = ref(null)

    // Cache status tracking
    const cacheStatus = ref({
      isFromCache: false,
      source: 'network',
      details: [],
      responseTime: 0,
      lastRefresh: null
    })

    // Computed properties
    const userPoints = computed(() => 
      userPointsData.value?.currentBalance || authStore.userPoints || 0
    )

    // Pagination computed properties
    const totalProductPages = computed(() => 
      Math.ceil(featuredProducts.value.length / itemsPerPage)
    )

    const totalCampaignPages = computed(() => 
      Math.ceil(activeCampaigns.value.length / campaignsPerPage)
    )

    const paginatedFeaturedProducts = computed(() => {
      const start = (currentProductPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return featuredProducts.value.slice(start, end)
    })

    const paginatedActiveCampaigns = computed(() => {
      const start = (currentCampaignPage.value - 1) * campaignsPerPage
      const end = start + campaignsPerPage
      return activeCampaigns.value.slice(start, end)
    })

    // Pagination methods
    const changeProductPage = (page) => {
      if (page >= 1 && page <= totalProductPages.value) {
        currentProductPage.value = page
        nextTick(() => {
          const productsSection = document.querySelector('.products-grid')
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        })
      }
    }

    const changeCampaignPage = (page) => {
      if (page >= 1 && page <= totalCampaignPages.value) {
        currentCampaignPage.value = page
        nextTick(() => {
          const campaignsSection = document.querySelector('.campaigns-container')
          if (campaignsSection) {
            campaignsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        })
      }
    }

    // Search functionality
    const performLocalSearch = (query) => {
      const localResults = featuredProducts.value.filter(product => 
        product.title?.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
      searchResults.value = localResults
      isSearching.value = false
    }

    const performOptimizedSearch = async (query) => {
      try {
        const localResults = featuredProducts.value.filter(product => 
          product.title?.toLowerCase().includes(query.toLowerCase()) ||
          product.category?.name?.toLowerCase().includes(query.toLowerCase())
        )

        if (localResults.length > 0 && query.length < 4) {
          searchResults.value = localResults.slice(0, 10)
          isSearching.value = false
          return
        }

        const response = await getProducts({ 
          search: query, 
          limit: 20,
          forceRefresh: false
        }, { 
          ttl: 2 * 60 * 1000
        })

        if (response?.success && response?.data?.length > 0) {
          searchResults.value = response.data
        } else {
          searchResults.value = localResults.slice(0, 10)
        }

      } catch (err) {
        console.error('Search error:', err)
        performLocalSearch(query)
      } finally {
        isSearching.value = false
      }
    }

    const debouncedSearch = () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }

      const query = searchQuery.value.trim()

      if (!query) {
        searchResults.value = []
        isSearching.value = false
        return
      }

      isSearching.value = true

      if (query.length <= 2) {
        searchTimeout = setTimeout(() => {
          performLocalSearch(query)
        }, 150)
        return
      }

      searchTimeout = setTimeout(async () => {
        await performOptimizedSearch(query)
      }, 300)
    }

    const selectSearchResult = (product) => {
      searchQuery.value = ''
      searchResults.value = []
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      viewProductDetails(product)
    }

    const showAllSearchResults = () => {
      const query = searchQuery.value.trim()
      searchQuery.value = ''
      searchResults.value = []
      router.push({
        name: 'Category',
        query: { search: query }
      })
    }

    const handleSearchEnter = () => {
      if (searchQuery.value.trim()) {
        showAllSearchResults()
      }
    }

    const clearSearch = () => {
      searchQuery.value = ''
      searchResults.value = []
      isSearching.value = false
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      if (searchInput.value) {
        searchInput.value.focus()
      }
    }

    // Watch search query
    watch(searchQuery, (newQuery) => {
      if (!newQuery.trim()) {
        searchResults.value = []
        isSearching.value = false
        if (searchTimeout) {
          clearTimeout(searchTimeout)
        }
      }
    })

    // Utility methods
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
      if (!product?.url) {
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
      if (shareData.pointsEarned > 0) {
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
      try {
        const updatedPoints = await getMyPoints({ forceRefresh: true })
        if (updatedPoints.success) {
          userPointsData.value = updatedPoints.data
          authStore.setUserPoints(updatedPoints.data.currentBalance)
        }
      } catch (err) {
        console.warn('Failed to refresh points:', err)
        authStore.refreshUserPoints()
      }
      console.log(`Points earned: ${points}`)
    }

    // Enhanced load dashboard data
    const loadDashboardData = async (forceRefresh = false) => {
      isLoading.value = true
      error.value = ''
      
      const startTime = Date.now()

      try {
        console.log('🚀 Loading dashboard data...', forceRefresh ? '(force refresh)' : '(cached)')

        const [pointsResult, featuredProductsResult, campaignsResult] = await Promise.allSettled([
          getMyPoints({ 
            ttl: 30 * 1000,
            forceRefresh 
          }),
          getFeaturedProducts({ 
            ttl: 5 * 60 * 1000,
            forceRefresh 
          }),
          getCampaigns({ 
            ttl: 10 * 60 * 1000,
            forceRefresh 
          })
        ])

        if (pointsResult.status === 'fulfilled' && pointsResult.value.success) {
          userPointsData.value = pointsResult.value.data
          console.log('✅ Points data loaded successfully')
        }

        if (featuredProductsResult.status === 'fulfilled' && featuredProductsResult.value.success) {
          featuredProducts.value = featuredProductsResult.value.data || []
          console.log(`✅ Featured products loaded: ${featuredProducts.value.length} products`)
        }

        if (campaignsResult.status === 'fulfilled' && campaignsResult.value.success) {
          const campaigns = campaignsResult.value.data || []
          activeCampaigns.value = campaigns.filter(campaign => 
            campaign.status === 'active' || campaign.status === 'ongoing'
          )
          console.log(`✅ Active campaigns loaded: ${activeCampaigns.value.length} campaigns`)
        }

        currentProductPage.value = 1
        currentCampaignPage.value = 1

        const responseTime = Date.now() - startTime
        cacheStatus.value = {
          isFromCache: responseTime < 200,
          source: responseTime < 200 ? 'cache' : 'network',
          responseTime,
          lastRefresh: new Date()
        }

        console.log(`📊 Dashboard loaded in ${responseTime}ms`)

      } catch (err) {
        console.error('💥 Dashboard loading error:', err)
        error.value = 'Failed to load dashboard data. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    // Navigation methods
    const viewProductDetails = (product) => {
      sessionStorage.setItem('selectedProduct', JSON.stringify(product))
      router.push(`/product/${product.id}`)
    }

    const viewCampaignDetails = (campaign) => {
      sessionStorage.setItem('selectedCampaign', JSON.stringify(campaign))
      router.push(`/campaign/${campaign.id}`)
    }

    const navigateToCategories = () => {
      router.push('/category')
    }

    const navigateToCampaigns = () => {
      router.push('/campaign')
    }

    // Initialize dashboard data
    onMounted(() => {
      loadDashboardData()
    })

    return {
      // Search
      searchQuery,
      searchResults,
      isSearching,
      searchInput,
      debouncedSearch,
      handleSearchEnter,
      clearSearch,
      selectSearchResult,
      showAllSearchResults,
      
      // Data
      isLoading,
      error,
      userPoints,
      featuredProducts,
      activeCampaigns,
      paginatedFeaturedProducts,
      paginatedActiveCampaigns,
      
      // Pagination
      currentProductPage,
      currentCampaignPage,
      totalProductPages,
      totalCampaignPages,
      changeProductPage,
      changeCampaignPage,
      
      // Share modal
      showShareModal,
      selectedProductForShare,
      openShareModal,
      closeShareModal,
      handleShareSuccess,
      handlePointsEarned,
      
      // Utilities
      cacheStatus,
      loadDashboardData,
      viewProductDetails,
      viewCampaignDetails,
      navigateToCategories,
      navigateToCampaigns,
      getProductImageUrl,
      getCampaignImageUrl,
      formatPrice,
      formatCampaignDate
    }
  }
}
</script>

<style scoped>
/* Dashboard View Complete Styling */
.dashboard-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 120px;
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

/* Dashboard Sections */
.dashboard-section {
  background: white;
  margin: 0 1rem 1.5rem 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.9);
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
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
  position: relative;
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
  position: relative;
  transition: box-shadow 0.2s;
}

.search-container:focus-within {
  box-shadow: 0 6px 20px rgba(79, 195, 247, 0.2);
  border-color: #4FC3F7;
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

.search-loading {
  display: flex;
  align-items: center;
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #E5E7EB;
  border-top: 2px solid #4FC3F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.clear-search {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.clear-search:hover {
  background: #F3F4F6;
  color: #6B7280;
}

/* Search Results */
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #F1F5F9;
}

.search-result-item:hover {
  background: #F8FAFC;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: #F3F4F6;
}

.search-result-info {
  flex: 1;
  min-width: 0;
}

.search-result-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 0.25rem;
  font-family: 'Baloo 2', sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-result-price {
  font-size: 0.75rem;
  color: #059669;
  font-weight: 700;
  font-family: 'Baloo 2', sans-serif;
  margin-bottom: 0.125rem;
}

.search-result-category {
  font-size: 0.6875rem;
  color: #6B7280;
  font-weight: 500;
  font-family: 'Baloo 2', sans-serif;
  background: #F3F4F6;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  display: inline-block;
}

.search-result-more {
  padding: 0.75rem 1rem;
  text-align: center;
  color: #4FC3F7;
  font-weight: 600;
  cursor: pointer;
  border-top: 1px solid #F1F5F9;
  font-family: 'Baloo 2', sans-serif;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.search-result-more:hover {
  background: #F8FAFC;
}

.search-no-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 0.5rem;
  padding: 1rem;
  text-align: center;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-size: 0.875rem;
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

/* Products Grid */
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

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem 0;
}

.pagination-btn {
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #4FC3F7;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Baloo 2', sans-serif;
}

.pagination-btn:hover:not(:disabled) {
  background: #4FC3F7;
  color: white;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #9CA3AF;
}

.pagination-info {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Campaigns */
.campaigns-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

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

.campaign-status.ongoing {
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

/* Error States */
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

/* Empty States */
.empty-products {
  text-align: center;
  padding: 2rem 1rem;
  color: #6B7280;
}

.empty-text {
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Responsive Design */
@media (min-width: 768px) {
  .dashboard-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .page-container,
  .app-main {
    background: transparent !important;
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
}
</style>