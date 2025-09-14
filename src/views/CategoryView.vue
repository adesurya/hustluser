<template>
  <div class="category-view dashboard-page">
    <HustlHeader :isDashboard="true" />

    <!-- Loading State -->
    <div v-if="isLoading" class="dashboard-section loading-section">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading categories and products...</p>
    </div>

    <template v-else>
      <!-- Enhanced Search Section -->
      <div class="search-section">
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
          <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn">
            <span class="clear-icon">✕</span>
          </button>
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

      <!-- Products Section with Pagination -->
      <div class="dashboard-section products-section">
        <div class="section-header">
          <h3 class="section-title">
            {{ selectedCategory ? `${selectedCategory.name} Products` : 'All Products' }}
          </h3>
          <div class="products-info">
            <span class="products-count">{{ paginatedProducts.length }} of {{ filteredProducts.length }} products</span>
          </div>
        </div>
        
        <div v-if="paginatedProducts.length > 0" class="products-grid">
          <div 
            v-for="product in paginatedProducts" 
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

        <!-- Enhanced Pagination -->
        <div v-if="totalPages > 1" class="pagination-container">
          <button 
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            ‹
          </button>
          
          <div class="pagination-pages">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              class="page-btn"
              :class="{ active: currentPage === page }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            ›
          </button>
          
          <div class="pagination-info">
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredProducts.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h4 class="empty-title">No products found</h4>
          <p class="empty-message">
            {{ searchQuery ? 'Try different keywords' : (selectedCategory ? 'No products in this category' : 'No products available') }}
          </p>
          <button v-if="searchQuery || selectedCategory" @click="resetFilters" class="reset-filters-btn">
            Clear Filters
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

    <BottomNavigation />
  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import ShareModal from '../components/ShareModal.vue'
import apiService from '../services/api'
import { useCachedApi } from '../composables/useCachedApi'
import { useWishlist } from '../composables/useWishlist'
import { showToast } from '../utils/toast'

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
    const searchResults = ref([])
    const isSearching = ref(false)
    const searchInput = ref(null)
    let searchTimeout = null
    
    const { 
      getCategories,
      getProducts,
      getMyPoints
    } = useCachedApi()
    
    const selectedCategory = ref(null)
    const currentPage = ref(1)
    const itemsPerPage = 12
    
    const isLoading = ref(true)
    const error = ref('')
    const categories = ref([])
    const products = ref([])

    const showShareModal = ref(false)
    const selectedProductForShare = ref(null)

    const { 
      wishlistIds, 
      toggleWishlist, 
      isInWishlist,
      loadWishlist 
    } = useWishlist()

    const filteredProducts = computed(() => {
      let result = products.value

      if (selectedCategory.value) {
        result = result.filter(product => {
          const productCategoryId = product.categoryId || 
                                   product.category_id || 
                                   product.category?.id
          return productCategoryId === selectedCategory.value.id
        })
      }

      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(product => 
          product.title?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.name?.toLowerCase().includes(query)
        )
      }

      return result
    })

    const totalPages = computed(() => 
      Math.ceil(filteredProducts.value.length / itemsPerPage)
    )

    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredProducts.value.slice(start, end)
    })

    const visiblePages = computed(() => {
      const total = totalPages.value
      const current = currentPage.value
      const pages = []
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) pages.push(i)
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        }
      }
      
      return pages
    })

    const categoryColors = [
      '#4FC3F7', '#FF69B4', '#FF6B35', '#4ECDC4', 
      '#FF1493', '#32CD32', '#9932CC', '#FFA500'
    ]

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
        'Books': '📚'
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

    const performLocalSearch = (query) => {
      const localResults = products.value.filter(product => 
        product.title?.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
      searchResults.value = localResults
      isSearching.value = false
    }

    const performOptimizedSearch = async (query) => {
      try {
        const localResults = products.value.filter(product => 
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
          limit: 100,
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
      const queryParam = searchQuery.value.trim()
      searchResults.value = []
      currentPage.value = 1
      selectedCategory.value = null
      
      router.replace({
        name: 'Category',
        query: { search: queryParam }
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
      currentPage.value = 1
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      if (searchInput.value) {
        searchInput.value.focus()
      }
    }

    watch(searchQuery, (newQuery) => {
      if (!newQuery.trim()) {
        searchResults.value = []
        isSearching.value = false
        if (searchTimeout) {
          clearTimeout(searchTimeout)
        }
      }
      currentPage.value = 1
    })

    const loadCategories = async () => {
      try {
        console.log('Loading categories...')
        const response = await getCategories({ 
          ttl: 30 * 60 * 1000
        })
        
        if (response && response.success) {
          categories.value = response.data || []
          console.log(`✅ Categories loaded: ${categories.value.length}`)
        } else {
          console.warn('Failed to load categories:', response?.message)
          error.value = 'Failed to load categories'
        }
      } catch (err) {
        console.error('Error loading categories:', err)
        error.value = 'Failed to load categories'
      }
    }

    const loadProducts = async () => {
      try {
        console.log('Loading products...')
        const response = await getProducts({ 
          limit: 100,
          page: 1 
        }, { 
          ttl: 5 * 60 * 1000
        })
        
        if (response && response.success) {
          products.value = response.data || []
          console.log(`✅ Products loaded: ${products.value.length}`)
          updateCategoryCounts()
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

    const updateCategoryCounts = () => {
      const categoryCounts = {}
      products.value.forEach(product => {
        const categoryId = product.categoryId || 
                         product.category_id || 
                         product.category?.id
        
        if (categoryId) {
          categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1
        }
      })
      
      categories.value = categories.value.map(category => ({
        ...category,
        productCount: categoryCounts[category.id] || 0
      }))
    }

    const loadData = async () => {
      isLoading.value = true
      error.value = ''

      try {
        console.log('🚀 Loading category page data...')
        
        await Promise.all([
          loadCategories(),
          loadProducts()
        ])
        
        loadWishlist()

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
          console.log('Search query from route:', route.query.search)
        }

        console.log('✅ Category page data loaded successfully')

      } catch (err) {
        console.error('💥 Error loading data:', err)
        error.value = 'Failed to load data. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    const selectCategory = async (category) => {
      if (selectedCategory.value?.id === category.id) {
        selectedCategory.value = null
        router.replace({ name: 'Category' })
        console.log('Category deselected - showing all products')
      } else {
        selectedCategory.value = category
        searchQuery.value = ''
        searchResults.value = []
        currentPage.value = 1
        
        router.replace({
          name: 'Category',
          query: { categoryId: category.id }
        })
        
        console.log(`Category selected: ${category.name}`)
      }
    }

    const changePage = async (page) => {
      if (page >= 1 && page <= totalPages.value && page !== '...') {
        currentPage.value = page
        await nextTick()
        const productsSection = document.querySelector('.products-grid')
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }

    const resetFilters = () => {
      searchQuery.value = ''
      searchResults.value = []
      selectedCategory.value = null
      currentPage.value = 1
      router.replace({ name: 'Category' })
    }

    const toggleFavorite = (product) => {
      toggleWishlist(product)
    }

    const viewProductDetails = (product) => {
      sessionStorage.setItem('selectedProduct', JSON.stringify(product))
      router.push(`/product/${product.id}`)
    }

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
        showToast({
          type: 'success',
          title: 'Points Earned!',
          message: `You earned ${shareData.pointsEarned} points for sharing!`,
          duration: 3000
        })

        try {
          await getMyPoints({ forceRefresh: true })
          console.log('Points refreshed after sharing')
        } catch (err) {
          console.warn('Failed to refresh points after sharing:', err)
        }
      }
    }

    const handlePointsEarned = (points) => {
      console.log(`Points earned: ${points}`)
    }

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
        currentPage.value = 1
      }
    })

    onMounted(() => {
      loadData()
    })

    onBeforeUnmount(() => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    })

    return {
      searchQuery,
      searchResults,
      isSearching,
      searchInput,
      debouncedSearch,
      handleSearchEnter,
      clearSearch,
      selectSearchResult,
      showAllSearchResults,
      selectedCategory,
      currentPage,
      itemsPerPage,
      isLoading,
      error,
      categories,
      products,
      filteredProducts,
      paginatedProducts,
      totalPages,
      visiblePages,
      showShareModal,
      selectedProductForShare,
      wishlistIds,
      loadData,
      selectCategory,
      changePage,
      resetFilters,
      toggleFavorite,
      viewProductDetails,
      getCategoryColor,
      getCategoryIcon,
      getProductImageUrl,
      formatPrice,
      getFavoriteIcon,
      getStarRating,
      openShareModal,
      closeShareModal,
      handleShareSuccess,
      handlePointsEarned
    }
  }
}
</script>

<style scoped>
/* Reset and Base Styles */
* {
  box-sizing: border-box;
}

/* Category View Main Container */
.category-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px;
  width: 100%;
  overflow-x: hidden;
  position: relative;
}

/* Container wrapper to control all sections */
.content-wrapper {
  width: 100%;
  max-width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;
}

/* Dashboard sections - Simplified approach */
.dashboard-section {
  background: white;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.9);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.dashboard-section:first-child {
  margin-top: 1rem;
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

/* Search Section */
.search-section {
  position: relative;
  padding: 1rem;
  background: transparent;
  margin-bottom: 1.5rem;
  box-shadow: none;
  border: none;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.search-container:focus-within {
  box-shadow: 0 6px 20px rgba(79, 195, 247, 0.2);
  border-color: #4FC3F7;
}

.search-icon {
  font-size: 1.125rem;
  color: #6B7280;
  flex-shrink: 0;
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

.search-loading {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #E5E7EB;
  border-top: 2px solid #4FC3F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
  flex-wrap: wrap;
  gap: 0.5rem;
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

/* Categories Grid - Simple 2 column */
.categories-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0.75rem;
  border-radius: 12px;
  border: 2px solid #E5E7EB;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 110px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  text-align: center;
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
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
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
  max-width: 100%;
}

.category-name {
  font-size: 0.875rem;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  margin-bottom: 0.25rem;
  line-height: 1.2;
  text-align: center;
  word-wrap: break-word;
}

.category-count-text {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 400;
  text-align: center;
}

/* Products Grid - Single column with tight control */
.products-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.product-card {
  display: flex;
  flex-direction: row;
  background: #F8FAFC;
  border-radius: 12px;
  padding: 0.75rem;
  border: 2px solid #E2E8F0;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  align-items: center;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-2px);
  border-color: #4FC3F7;
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.15);
}

.product-image {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  background: #E5E7EB;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badge {
  position: absolute;
  top: 1px;
  left: 1px;
  background: #4FC3F7;
  color: white;
  font-size: 0.4375rem;
  padding: 0.0625rem 0.1875rem;
  border-radius: 3px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
}

.favorite-btn {
  position: absolute;
  top: 1px;
  right: 1px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.625rem;
  transition: all 0.2s;
}

.favorite-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

.product-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.2;
  margin-bottom: 0.0625rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 0.75rem;
  color: #059669;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  margin-bottom: 0.125rem;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  margin-bottom: 0.125rem;
}

.rating-stars {
  color: #FFA500;
  font-size: 0.625rem;
  line-height: 1;
}

.rating-count {
  font-size: 0.5625rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.25rem;
}

.earn-coins {
  font-size: 0.5rem;
  color: #F59E0B;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-btn {
  background: #4FC3F7;
  color: white;
  border: none;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  font-size: 0.4375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.share-btn:hover {
  background: #29B6F6;
  transform: scale(1.1);
}

/* Pagination */
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem 0;
  border-top: 1px solid #E5E7EB;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
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

.pagination-info {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  text-align: center;
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
  margin-bottom: 1.5rem;
}

.reset-filters-btn {
  background: #4FC3F7;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Baloo 2', sans-serif;
}

.reset-filters-btn:hover {
  background: #29B6F6;
  transform: translateY(-1px);
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

/* Fixed Footer Styles */
:deep(.bottom-navigation) {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  z-index: 1000 !important;
  background: white !important;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1) !important;
}

.bottom-navigation {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  z-index: 1000 !important;
  background: white !important;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1) !important;
}

::v-deep .bottom-navigation,
/deep/ .bottom-navigation,
>>> .bottom-navigation {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  z-index: 1000 !important;
  background: white !important;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1) !important;
}

/* Responsive Design */
@media (min-width: 640px) {
  .content-wrapper {
    padding: 0 1.5rem;
  }
  
  .dashboard-section {
    padding: 1rem;
  }
}

@media (min-width: 768px) {
  .category-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    padding-bottom: 100px;
  }
  
  .page-container,
  .app-main {
    background: transparent !important;
  }
  
  .content-wrapper {
    padding: 0 3rem;
    max-width: calc(100% - 4rem);
    margin: 0 auto;
  }

  .dashboard-section {
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    max-width: 85%;
    margin-left: auto;
    margin-right: auto;
  }

  .search-section .search-container {
    max-width: 85%;
    margin: 0 auto;
  }

  .categories-grid {
    gap: 1rem;
  }

  .category-card {
    min-height: 120px;
    padding: 1.25rem 1rem;
  }

  .category-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
    margin-bottom: 0.875rem;
  }

  .category-name {
    font-size: 0.9375rem;
    margin-bottom: 0.375rem;
  }

  .category-count-text {
    font-size: 0.8125rem;
  }

  .product-card {
    padding: 1rem;
  }

  .product-image {
    width: 60px;
    height: 60px;
    margin-right: 0.75rem;
  }

  .product-name {
    font-size: 0.875rem;
  }

  .product-price {
    font-size: 0.875rem;
  }
}

@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .category-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: auto !important;
    padding-bottom: 100px;
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

  .content-wrapper {
    padding: 0 5rem;
    max-width: calc(100% - 6rem);
    margin: 0 auto;
  }

  .dashboard-section {
    padding: 1.75rem;
    margin-bottom: 2rem;
    max-width: 80%;
    margin-left: auto;
    margin-right: auto;
  }

  .search-section .search-container {
    max-width: 80%;
    margin: 0 auto;
  }

  .categories-grid {
    gap: 1.25rem;
  }

  .category-card {
    min-height: 130px;
    padding: 1.5rem 1.25rem;
  }

  .category-icon {
    width: 54px;
    height: 54px;
    font-size: 1.625rem;
    margin-bottom: 1rem;
  }

  .category-name {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .category-count-text {
    font-size: 0.875rem;
  }

  .product-card {
    padding: 1.25rem;
  }

  .product-image {
    width: 70px;
    height: 70px;
    margin-right: 1rem;
  }

  .product-name {
    font-size: 1rem;
  }

  .product-price {
    font-size: 1rem;
  }

  .earn-coins {
    font-size: 0.625rem;
  }

  .share-btn {
    width: 16px;
    height: 16px;
    font-size: 0.5rem;
  }
}

@media (min-width: 1200px) {
  .content-wrapper {
    padding: 0 6rem;
    max-width: calc(100% - 8rem);
    margin: 0 auto;
  }

  .dashboard-section {
    padding: 2rem;
    margin-bottom: 2.5rem;
    max-width: 75%;
    margin-left: auto;
    margin-right: auto;
  }

  .search-section .search-container {
    max-width: 75%;
    margin: 0 auto;
  }

  .category-view {
    padding-bottom: 100px;
  }

  .categories-grid {
    gap: 1.5rem;
  }

  .category-card {
    min-height: 140px;
    padding: 2rem 1.5rem;
  }

  .category-icon {
    width: 58px;
    height: 58px;
    font-size: 1.75rem;
    margin-bottom: 1.125rem;
  }

  .category-name {
    font-size: 1.0625rem;
  }

  .category-count-text {
    font-size: 0.9375rem;
  }

  .product-card {
    padding: 1.5rem;
  }

  .product-image {
    width: 80px;
    height: 80px;
    margin-right: 1.25rem;
  }

  .product-name {
    font-size: 1.125rem;
  }

  .product-price {
    font-size: 1.0625rem;
  }
}

/* Prevent content overflow on all screen sizes */
.category-view,
.category-view * {
  max-width: 100%;
  box-sizing: border-box;
}

/* Last section margin fix */
.dashboard-section:last-of-type {
  margin-bottom: 2rem;
}
</style>