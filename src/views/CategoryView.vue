<template>
  <div class="category-view dashboard-page">
    <HustlHeader :isDashboard="true" />

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
        <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn">
          <span class="clear-icon">✕</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="dashboard-section loading-section">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading categories and products...</p>
    </div>

    <template v-else>
      <!-- Categories Section -->
      <div class="dashboard-section categories-section">
        <div class="section-header">
          <h3 class="section-title">Product Categories</h3>
          <span class="category-count">{{ categories.length }} Categories</span>
        </div>
        <div class="categories-grid">
          <div 
            v-for="category in categories" 
            :key="category.id" 
            class="category-card"
            @click="selectCategory(category)"
            :class="{ active: selectedCategory?.id === category.id }"
          >
            <div class="category-icon" :style="{ background: getCategoryColor(category.id) }">
              <span>{{ getCategoryIcon(category.name) }}</span>
            </div>
            <div class="category-info">
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count-text">{{ category.productCount || 0 }} products</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Section -->
      <div class="dashboard-section products-section">
        <div class="section-header">
          <h3 class="section-title">
            {{ selectedCategory ? `${selectedCategory.name} Products` : 'All Products' }}
          </h3>
          <div class="products-info">
            <span class="products-count">{{ filteredProducts.length }} products</span>
            <button v-if="hasMoreProducts" class="see-more-btn" @click="loadMoreProducts">
              Load More
            </button>
          </div>
        </div>
        
        <div v-if="filteredProducts.length > 0" class="products-grid">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id" 
            class="product-card"
            @click="viewProductDetails(product)"
          >
            <div class="product-image">
              <img :src="getProductImageUrl(product.image)" :alt="product.title" />
              <div class="product-badge">{{ product.category?.name || 'Product' }}</div>
              <button class="favorite-btn" @click.stop="toggleFavorite(product)">
                <span class="heart-icon">{{ getFavoriteIcon(product.id) }}</span>
              </button>
            </div>
            <div class="product-info">
              <h4 class="product-name">{{ product.title }}</h4>
              <div class="product-price">{{ product.formattedPrice || formatPrice(product.price) }}</div>
              <div class="product-rating">
                <span class="rating-stars">{{ getStarRating(4.5) }}</span>
                <span class="rating-count">({{ product.viewCount || 0 }})</span>
              </div>
              <div class="product-actions">
                <span class="earn-coins">🪙 Earn {{ product.points }} Coins</span>
                <button class="share-btn" @click="openShareModal(product)" @click.stop>
                  <span class="share-icon">🔗</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">📦</div>
          <h4 class="empty-title">No products found</h4>
          <p class="empty-message">
            {{ searchQuery ? 'Try different keywords' : (selectedCategory ? 'No products in this category' : 'No products available') }}
          </p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            v-for="page in totalPages" 
            :key="page"
            class="page-btn"
            :class="{ active: currentPage === page }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
      </div>

      <!-- Error Messages -->
      <div v-if="error" class="dashboard-section error-section">
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ error }}</span>
          <button class="retry-btn" @click="loadData">Retry</button>
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

    <!-- Bottom Navigation -->
    <BottomNavigation />

  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import ShareModal from '../components/ShareModal.vue'
import apiService from '../services/api'
import { useWishlist } from '../composables/useWishlist'
import { showToast } from '../utils/toast'
import cacheOptimization from '../utils/cacheOptimization'
import performanceService from '../services/performanceService'

export default {
  name: 'CategoryView',
  components: {
    BottomNavigation,
    HustlHeader,
    ShareModal 
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const searchQuery = ref('')
    const selectedCategory = ref(null)
    const currentPage = ref(1)
    const itemsPerPage = 10
    
    // State management
    const isLoading = ref(true)
    const error = ref('')
    const categories = ref([])
    const products = ref([])
    const totalPages = ref(1)
    const hasMoreProducts = ref(false)

    // Share modal state
    const showShareModal = ref(false)
    const selectedProductForShare = ref(null)

    // Wishlist integration
    const { 
      wishlistIds, 
      toggleWishlist, 
      isInWishlist,
      loadWishlist 
    } = useWishlist()

    // FIXED: Computed property untuk filter products berdasarkan selected category
    const filteredProducts = computed(() => {
      if (!selectedCategory.value) {
        return products.value
      }
      
      return products.value.filter(product => {
        const productCategoryId = product.categoryId || 
                                 product.category_id || 
                                 product.category?.id
        return productCategoryId === selectedCategory.value.id
      })
    })

    // Category colors array for dynamic assignment
    const categoryColors = [
      '#4FC3F7', '#FF69B4', '#FF6B35', '#4ECDC4', 
      '#FF1493', '#32CD32', '#9932CC', '#FFA500'
    ]

    // Utility methods
    const getCategoryColor = (categoryId) => {
      const index = categories.value.findIndex(cat => cat.id === categoryId)
      return categoryColors[index % categoryColors.length] || '#6B7280'
    }

    const getCategoryIcon = (categoryName) => {
      const icons = {
        'Electronics': '📱',
        'Fashion': '👗', 
        'Sports': '⚽',
        'Sport': '⚽',
        'Home & Living': '🏠',
        'Home & Garden': '🏡',
        'Health & Beauty': '💄',
        'Automotive': '🚗',
        'Books': '📚',
        'Test Category': '🧪',
        'Test Category4': '🧪'
      }
      return icons[categoryName] || '📦'
    }

    const getProductImageUrl = (imagePath) => {
      return apiService.constructor.getImageUrl(imagePath, 'products')
    }

    const formatPrice = (price) => {
      return apiService.constructor.formatPrice(price)
    }

    const getFavoriteIcon = (productId) => {
      return isInWishlist(productId) ? '❤️' : '🤍'
    }

    const getStarRating = (rating) => {
      const fullStars = Math.floor(rating)
      const hasHalfStar = rating % 1 >= 0.5
      let stars = '★'.repeat(fullStars)
      if (hasHalfStar) stars += '☆'
      const emptyStars = 5 - Math.ceil(rating)
      stars += '☆'.repeat(emptyStars)
      return stars
    }

    // API loading methods
    const loadCategories = async () => {
      try {
        const startTime = Date.now()
        const response = await cacheOptimization.getCachedApiCall(
          'categories', 
          () => apiService.getCategories(),
          { ttl: 30 * 60 * 1000 }
        )
        
        const responseTime = Date.now() - startTime
        performanceService.notifyCacheOperation('api', 'categories', responseTime)
        
        if (response && response.success) {
          categories.value = response.data || []
          console.log('Categories loaded:', categories.value.length)
        } else {
          console.warn('Failed to load categories:', response?.message)
          error.value = 'Failed to load categories'
        }
      } catch (err) {
        console.error('Error loading categories:', err)
        error.value = 'Failed to load categories'
      }
    }

    // FIXED: Load all products to get accurate counts
    const loadCategoriesWithCounts = async () => {
      if (categories.value.length === 0) return

      try {
        console.log('Loading accurate product counts...')
        
        const startTime = Date.now()
        const response = await cacheOptimization.getCachedApiCall(
          'all_products_for_counting',
          () => apiService.getProducts({ 
            limit: 999, 
            page: 1 
          }),
          { ttl: 5 * 60 * 1000 }
        )
        
        const responseTime = Date.now() - startTime
        performanceService.notifyCacheOperation('api', 'all_products_counting', responseTime)
        
        if (response && response.success && response.data) {
          const allProducts = response.data
          console.log(`Found ${allProducts.length} total products for counting`)
          
          // Count products by category
          const categoryCounts = {}
          allProducts.forEach(product => {
            const categoryId = product.categoryId || 
                             product.category_id || 
                             product.category?.id
            
            if (categoryId) {
              categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1
            }
          })
          
          console.log('Accurate category counts:', categoryCounts)
          
          // Update categories with accurate counts
          categories.value = categories.value.map(category => ({
            ...category,
            productCount: categoryCounts[category.id] || 0
          }))
          
          console.log('Categories updated with accurate counts:', 
            categories.value.map(cat => ({
              name: cat.name,
              id: cat.id,
              count: cat.productCount
            }))
          )
        }
      } catch (err) {
        console.error('Error loading accurate category counts:', err)
      }
    }

    // FIXED: Load all products initially with simpler cache key
    const loadProducts = async (params = {}) => {
      try {
        const startTime = Date.now()
        const queryParams = {
          page: 1,
          limit: 999,
          ...params
        }

        if (searchQuery.value.trim()) {
          queryParams.search = searchQuery.value.trim()
        }

        // FIXED: Use simpler cache key without JSON
        const cacheKey = searchQuery.value ? 'products_search' : 'all_products'
        
        const response = await cacheOptimization.getCachedApiCall(
          cacheKey,
          () => apiService.getProducts(queryParams),
          { ttl: 5 * 60 * 1000 }
        )
        
        const responseTime = Date.now() - startTime
        performanceService.notifyCacheOperation('api', 'products', responseTime)
        
        if (response && response.success) {
          products.value = response.data || []
          console.log(`Loaded ${products.value.length} products`)
          
          if (response.meta?.pagination) {
            totalPages.value = response.meta.pagination.totalPages || 1
            hasMoreProducts.value = response.meta.pagination.hasNextPage || false
          }
        } else {
          console.warn('Failed to load products:', response?.message)
          products.value = []
        }
      } catch (err) {
        console.error('Error loading products:', err)
        error.value = 'Failed to load products'
        products.value = []
      }
    }

    const loadData = async () => {
      isLoading.value = true
      error.value = ''

      try {
        console.log('Starting data load...')
        
        // Load categories first
        await loadCategories()
        
        // Load products
        await loadProducts()
        
        // Load accurate category counts after products are loaded
        if (categories.value.length > 0) {
          await loadCategoriesWithCounts()
        }
        
        // Load wishlist data
        loadWishlist()

        // Handle route parameters
        if (route.query.categoryId) {
          const categoryId = parseInt(route.query.categoryId)
          const category = categories.value.find(cat => cat.id === categoryId)
          if (category) {
            selectedCategory.value = category
            console.log('Selected category from route:', category.name)
          }
        }

        if (route.query.search) {
          searchQuery.value = route.query.search
          await loadProducts({ search: route.query.search })
        }

        console.log('Data loading completed successfully')

      } catch (err) {
        console.error('Error loading data:', err)
        error.value = 'Failed to load data. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    // Event handlers
    const handleSearch = async () => {
      currentPage.value = 1
      selectedCategory.value = null
      
      router.replace({
        name: 'Category',
        query: searchQuery.value ? { search: searchQuery.value } : {}
      })
      
      await loadProducts()
    }

    const clearSearch = async () => {
      searchQuery.value = ''
      currentPage.value = 1
      
      router.replace({ name: 'Category' })
      
      await loadProducts()
    }

    // FIXED: Category selection now properly filters products
    const selectCategory = async (category) => {
      if (selectedCategory.value?.id === category.id) {
        // Deselect category
        selectedCategory.value = null
        router.replace({ name: 'Category' })
        console.log('Category deselected - showing all products')
      } else {
        // Select category
        selectedCategory.value = category
        searchQuery.value = ''
        currentPage.value = 1
        
        router.replace({
          name: 'Category',
          query: { categoryId: category.id }
        })
        
        console.log(`Category selected: ${category.name} - filtering products`)
      }
    }

    const toggleFavorite = (product) => {
      toggleWishlist(product)
    }

    const viewProductDetails = (product) => {
      sessionStorage.setItem('selectedProduct', JSON.stringify(product))
      router.push(`/product/${product.id}`)
    }

    const goToPage = async (page) => {
      currentPage.value = page
      await loadProducts()
    }

    const loadMoreProducts = async () => {
      if (hasMoreProducts.value) {
        currentPage.value++
        await loadProducts()
      }
    }

    // Share Modal Methods
    const openShareModal = (product) => {
      if (!product) {
        console.warn('No product data available for sharing')
        return
      }
      
      selectedProductForShare.value = product
      showShareModal.value = true
    }

    const closeShareModal = () => {
      showShareModal.value = false
      selectedProductForShare.value = null
    }

    const handleShareSuccess = (shareData) => {
      console.log('Product shared successfully:', shareData)
      
      if (shareData.pointsEarned > 0) {
        showToast({
          type: 'success',
          title: 'Points Earned!',
          message: `You earned ${shareData.pointsEarned} points for sharing!`,
          duration: 3000
        })
      }
    }

    const handlePointsEarned = (points) => {
      console.log(`Points earned: ${points}`)
    }

    // Watch for route changes
    watch(() => route.query, async (newQuery) => {
      if (newQuery.categoryId && !isLoading.value) {
        const categoryId = parseInt(newQuery.categoryId)
        const category = categories.value.find(cat => cat.id === categoryId)
        if (category && selectedCategory.value?.id !== categoryId) {
          selectedCategory.value = category
          currentPage.value = 1
        }
      } else if (!newQuery.categoryId && selectedCategory.value) {
        selectedCategory.value = null
        currentPage.value = 1
      }

      if (newQuery.search && newQuery.search !== searchQuery.value) {
        searchQuery.value = newQuery.search
        selectedCategory.value = null
        currentPage.value = 1
        await loadProducts({ search: newQuery.search })
      }
    })

    // Initialize data on mount
    onMounted(() => {
      loadData()
    })

    // Cleanup
    onBeforeUnmount(() => {
      // Clean up any listeners if needed
    })

    return {
      searchQuery,
      selectedCategory,
      currentPage,
      itemsPerPage,
      isLoading,
      error,
      categories,
      products,
      filteredProducts, // FIXED: Use filtered products
      totalPages,
      hasMoreProducts,
      showShareModal,              
      selectedProductForShare,
      wishlistIds,
      handleSearch,
      clearSearch,
      selectCategory,
      getStarRating,
      toggleFavorite,
      viewProductDetails,
      goToPage,
      loadMoreProducts,
      loadData,
      getCategoryColor,
      getCategoryIcon,
      getProductImageUrl,
      formatPrice,
      getFavoriteIcon,
      openShareModal,
      closeShareModal,
      handleShareSuccess,
      handlePointsEarned
    }
  }
}
</script>

<style scoped>
/* FIXED: Proper container layout for desktop */
.category-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

/* FIXED: Remove problematic container overrides */
.category-view * {
  box-sizing: border-box;
}

/* Dashboard sections with proper spacing */
.dashboard-section {
  background: white;
  margin: 0 1rem 1.5rem 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.9);
  width: calc(100% - 2rem);
  max-width: calc(100vw - 2rem);
}

.dashboard-section:first-child {
  margin-top: 1rem;
}

/* FIXED: Proper section containers */
.categories-section,
.products-section {
  background: white;
  margin: 0 1rem 1.5rem 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.9);
  width: calc(100% - 2rem);
  max-width: calc(100vw - 2rem);
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

/* Search Section */
.search-section {
  padding: 1rem 1.25rem;
  background: transparent;
  margin: 0 0 1.5rem 0;
  box-shadow: none;
  border: none;
  width: calc(100% - 2rem);
  max-width: calc(100vw - 2rem);
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
  width: 100%;
  max-width: 100%;
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
  min-width: 0;
}

.search-input::placeholder {
  color: #9CA3AF;
  font-weight: 400;
}

.clear-search-btn {
  background: #EF4444;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 0.75rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.clear-search-btn:hover {
  background: #DC2626;
  transform: scale(1.1);
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  width: 100%;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.category-count,
.products-count {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.products-info {
  display: flex;
  align-items: center;
  gap: 1rem;
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

/* Categories Grid - Responsive */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
  width: 100%;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.875rem 0.625rem;
  border-radius: 16px;
  border: 2px solid #E5E7EB;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  min-height: 110px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.category-card:hover {
  transform: translateY(-2px);
  border-color: #4FC3F7;
  background: rgba(79, 195, 247, 0.05);
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.15);
}

.category-card.active {
  border-color: #4FC3F7;
  background: rgba(79, 195, 247, 0.1);
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.2);
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 0.625rem;
  color: white;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}

.category-card:hover .category-icon {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.category-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  width: 100%;
}

.category-name {
  font-size: 0.8rem;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  margin-bottom: 0.2rem;
  line-height: 1.2;
  text-align: center;
}

.category-count-text {
  font-size: 0.7rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 400;
  text-align: center;
}

/* Products Grid - Responsive */
.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

.product-card {
  display: flex;
  flex-direction: column;
  background: #F8FAFC;
  border-radius: 16px;
  padding: 1rem;
  border: 2px solid #E2E8F0;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.product-card:hover {
  transform: translateY(-2px);
  border-color: #4FC3F7;
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.15);
}

.product-image {
  position: relative;
  width: 100%;
  height: 100px;
  border-radius: 12px;
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
  top: 6px;
  left: 6px;
  background: #4FC3F7;
  color: white;
  font-size: 0.625rem;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
}

.favorite-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.favorite-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
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
  font-size: 0.875rem;
  color: #059669;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.rating-stars {
  color: #FFA500;
  font-size: 0.75rem;
  line-height: 1;
}

.rating-count {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6B7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-family: 'Baloo 2', sans-serif;
}

.empty-message {
  font-size: 0.875rem;
  font-family: 'Baloo 2', sans-serif;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.page-btn {
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Baloo 2', sans-serif;
  min-width: 40px;
}

.page-btn:hover {
  border-color: #4FC3F7;
  color: #4FC3F7;
}

.page-btn.active {
  background: #4FC3F7;
  border-color: #4FC3F7;
  color: white;
}

/* FIXED: Responsive Design - Proper desktop layout */
@media (min-width: 768px) {
  .dashboard-section,
  .categories-section,
  .products-section {
    margin: 0 2rem 1.5rem 2rem;
    padding: 1.5rem;
    width: calc(100% - 4rem);
    max-width: calc(100vw - 4rem);
  }

  .search-section {
    margin: 0 2rem 1.5rem 2rem;
    padding: 1rem 0;
    width: calc(100% - 4rem);
    max-width: calc(100vw - 4rem);
  }

  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .category-card {
    min-height: 120px;
    padding: 1rem;
  }

  .category-name {
    font-size: 0.9rem;
  }

  .category-count-text {
    font-size: 0.75rem;
  }
}

/* Desktop - Large screens */
@media (min-width: 1024px) {
  .dashboard-section,
  .categories-section,
  .products-section {
    margin: 0 3rem 2rem 3rem;
    padding: 2rem;
    width: calc(100% - 6rem);
    max-width: calc(100vw - 6rem);
  }

  .search-section {
    margin: 0 3rem 1.5rem 3rem;
    padding: 1.5rem 0;
    width: calc(100% - 6rem);
    max-width: calc(100vw - 6rem);
  }

  .categories-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }

  .products-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }

  .category-card {
    min-height: 130px;
    padding: 1.25rem 1rem;
  }

  .category-name {
    font-size: 1rem;
  }

  .category-count-text {
    font-size: 0.8rem;
  }

  .product-card {
    padding: 1.25rem;
  }
}

/* Extra large screens */
@media (min-width: 1200px) {
  .dashboard-section,
  .categories-section,
  .products-section {
    margin: 0 4rem 2rem 4rem;
    padding: 2.5rem;
    width: calc(100% - 8rem);
    max-width: calc(100vw - 8rem);
  }

  .search-section {
    margin: 0 4rem 2rem 4rem;
    padding: 2rem 0;
    width: calc(100% - 8rem);
    max-width: calc(100vw - 8rem);
  }

  .categories-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 1.5rem;
  }

  .products-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 1.5rem;
  }

  .category-card {
    min-height: 140px;
    padding: 1.5rem 1.25rem;
  }

  .category-name {
    font-size: 1.1rem;
  }

  .category-count-text {
    font-size: 0.85rem;
  }
}

/* Ultra wide screens */
@media (min-width: 1400px) {
  .dashboard-section,
  .categories-section,
  .products-section {
    margin: 0 auto 2rem auto;
    max-width: 1200px;
    width: calc(100% - 4rem);
  }

  .search-section {
    margin: 0 auto 2rem auto;
    max-width: 1200px;
    width: calc(100% - 4rem);
  }
}
</style>