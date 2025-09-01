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
      <div class="dashboard-section">
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

      <!-- Featured Products Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h3 class="section-title">
            {{ selectedCategory ? `${selectedCategory.name} Products` : 'All Products' }}
          </h3>
          <div class="products-info">
            <span class="products-count">{{ products.length }} products</span>
            <button v-if="hasMoreProducts" class="see-more-btn" @click="loadMoreProducts">
              Load More
            </button>
          </div>
        </div>
        
        <div v-if="products.length > 0" class="products-grid">
          <div 
            v-for="product in products" 
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
                <button class="share-btn" @click.stop="shareProduct(product)">
                  <span class="share-icon">📤</span>
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

    <!-- Bottom Navigation -->
    <BottomNavigation />

  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import apiService from '../services/api'

export default {
  name: 'CategoryView',
  components: {
    BottomNavigation,
    HustlHeader
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
    const favorites = ref(new Set())
    const totalPages = ref(1)
    const hasMoreProducts = ref(false)

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
      return favorites.value.has(productId) ? '❤️' : '🤍'
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
        const response = await apiService.getCategories()
        if (response.success) {
          categories.value = response.data
          await loadCategoriesWithCounts()
        } else {
          console.warn('Failed to load categories:', response.message)
        }
      } catch (err) {
        console.error('Error loading categories:', err)
        error.value = 'Failed to load categories'
      }
    }

    const loadCategoriesWithCounts = async () => {
      try {
        const countPromises = categories.value.map(async (category) => {
          try {
            const response = await apiService.getProducts({ 
              categoryId: category.id,
              limit: 1
            })
            
            return {
              ...category,
              productCount: response.meta?.pagination?.totalItems || 0
            }
          } catch (err) {
            console.warn(`Failed to load count for category ${category.id}:`, err)
            return {
              ...category,
              productCount: 0
            }
          }
        })

        const categoriesWithCountsResult = await Promise.all(countPromises)
        categories.value = categoriesWithCountsResult
        
      } catch (err) {
        console.error('Error loading category counts:', err)
      }
    }

    const loadProducts = async (params = {}) => {
      try {
        const queryParams = {
          page: currentPage.value,
          limit: itemsPerPage,
          ...params
        }

        if (selectedCategory.value) {
          queryParams.categoryId = selectedCategory.value.id
        }

        if (searchQuery.value.trim()) {
          queryParams.search = searchQuery.value.trim()
        }

        const response = await apiService.getProducts(queryParams)
        
        if (response.success) {
          products.value = response.data
          
          if (response.meta?.pagination) {
            totalPages.value = response.meta.pagination.totalPages
            hasMoreProducts.value = response.meta.pagination.hasNextPage
          }
        } else {
          console.warn('Failed to load products:', response.message)
          products.value = []
        }
      } catch (err) {
        console.error('Error loading products:', err)
        error.value = 'Failed to load products'
        products.value = []
      }
    }

    const loadFavorites = () => {
      try {
        const storedFavorites = JSON.parse(localStorage.getItem('favoriteProducts') || '[]')
        favorites.value = new Set(storedFavorites.map(fav => fav.id))
      } catch (err) {
        console.error('Error loading favorites:', err)
        favorites.value = new Set()
      }
    }

    const loadData = async () => {
      isLoading.value = true
      error.value = ''

      try {
        await Promise.all([
          loadCategories(),
          loadProducts()
        ])
        
        loadFavorites()

        if (route.query.categoryId) {
          const categoryId = parseInt(route.query.categoryId)
          const category = categories.value.find(cat => cat.id === categoryId)
          if (category) {
            selectedCategory.value = category
            await loadProducts({ categoryId })
          }
        }

        if (route.query.search) {
          searchQuery.value = route.query.search
          await loadProducts({ search: route.query.search })
        }

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

    const selectCategory = async (category) => {
      if (selectedCategory.value?.id === category.id) {
        selectedCategory.value = null
        router.replace({ name: 'Category' })
      } else {
        selectedCategory.value = category
        searchQuery.value = ''
        currentPage.value = 1
        
        router.replace({
          name: 'Category',
          query: { categoryId: category.id }
        })
      }
      
      await loadProducts()
    }

    const toggleFavorite = (product) => {
      const productId = product.id
      const storedFavorites = JSON.parse(localStorage.getItem('favoriteProducts') || '[]')
      
      if (favorites.value.has(productId)) {
        favorites.value.delete(productId)
        const updatedFavorites = storedFavorites.filter(fav => fav.id !== productId)
        localStorage.setItem('favoriteProducts', JSON.stringify(updatedFavorites))
      } else {
        favorites.value.add(productId)
        const favoriteProduct = {
          id: product.id,
          title: product.title,
          price: product.formattedPrice || formatPrice(product.price),
          image: product.image,
          points: product.points
        }
        storedFavorites.push(favoriteProduct)
        localStorage.setItem('favoriteProducts', JSON.stringify(storedFavorites))
      }
    }

    const shareProduct = (product) => {
      const shareData = {
        title: product.title,
        text: `Check out this product: ${product.title} - ${product.formattedPrice || formatPrice(product.price)}. Earn ${product.points} coins!`,
        url: window.location.origin + `/product/${product.id}`
      }
      
      if (navigator.share && navigator.canShare(shareData)) {
        navigator.share(shareData)
          .then(() => console.log('Product shared successfully'))
          .catch((error) => console.log('Error sharing product:', error))
      } else {
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`
        navigator.clipboard.writeText(shareText)
          .then(() => {
            alert('Product link copied to clipboard!')
          })
          .catch(() => {
            prompt('Copy this link to share:', shareText)
          })
      }
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

    // Watch for route changes
    watch(() => route.query, async (newQuery) => {
      if (newQuery.categoryId && !isLoading.value) {
        const categoryId = parseInt(newQuery.categoryId)
        const category = categories.value.find(cat => cat.id === categoryId)
        if (category && selectedCategory.value?.id !== categoryId) {
          selectedCategory.value = category
          currentPage.value = 1
          await loadProducts()
        }
      } else if (!newQuery.categoryId && selectedCategory.value) {
        selectedCategory.value = null
        currentPage.value = 1
        await loadProducts()
      }

      if (newQuery.search && newQuery.search !== searchQuery.value) {
        searchQuery.value = newQuery.search
        selectedCategory.value = null
        currentPage.value = 1
        await loadProducts()
      }
    })

    // Initialize data on mount
    onMounted(() => {
      loadData()
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
      totalPages,
      hasMoreProducts,
      handleSearch,
      clearSearch,
      selectCategory,
      getStarRating,
      toggleFavorite,
      shareProduct,
      viewProductDetails,
      goToPage,
      loadMoreProducts,
      loadData,
      getCategoryColor,
      getCategoryIcon,
      getProductImageUrl,
      formatPrice,
      getFavoriteIcon
    }
  }
}
</script>

<style scoped>
/* Override main.css container restrictions for CategoryView - Fixed for all screen sizes */
.category-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Force full width and transparent background on ALL screen sizes */
.category-view .page-container {
  max-width: none !important;
  width: 100% !important;
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.category-view .app-main {
  max-width: none !important;
  width: 100% !important;
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  min-height: auto !important;
  height: auto !important;
  overflow: visible !important;
}

/* Dashboard sections */
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

/* Categories Grid - Always 2 columns */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
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

/* Products Grid - Always 2 columns */
.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
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

/* Responsive Design - FIXED for 770px - 1023px range */
@media (min-width: 768px) {
  .category-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  /* Force overrides for tablet range */
  .category-view .page-container {
    max-width: none !important;
    width: 100% !important;
    background: transparent !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    justify-content: flex-start !important;
    align-items: stretch !important;
    min-height: 100vh !important;
  }

  .category-view .app-main {
    max-width: none !important;
    width: 100% !important;
    background: transparent !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: auto !important;
    height: auto !important;
    overflow: visible !important;
  }

  .dashboard-section {
    margin: 0 1rem 1.5rem 1rem;
    padding: 1.25rem;
  }

  .dashboard-section:first-child {
    margin-top: 1rem;
  }

  .search-section {
    margin: 0 0 1.5rem 0;
    padding: 1rem 1.25rem;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

/* Desktop Responsive - Keep same overrides */
@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .category-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: auto !important;
  }
  
  .category-view .page-container {
    max-width: none !important;
    width: 100% !important;
    background: transparent !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    justify-content: flex-start !important;
    align-items: stretch !important;
    min-height: 100vh !important;
    height: auto !important;
  }
  
  .category-view .app-main {
    max-width: none !important;
    width: 100% !important;
    background: transparent !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: auto !important;
    height: auto !important;
    overflow: visible !important;
  }
}
</style>