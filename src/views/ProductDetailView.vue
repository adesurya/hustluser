<template>
  <div class="product-detail-view dashboard-page">
    <HustlHeader :isDashboard="true" />

    <!-- Header with Back Button -->
    <div class="dashboard-section header-section">
      <div class="header-container">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span class="back-text">Back</span>
        </button>
        <button class="share-btn" @click="openShareModal">
          <span class="share-icon">🔗</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="dashboard-section loading-section">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading product details...</p>
    </div>

    <!-- Product Information Section -->
    <div v-else-if="product" class="dashboard-section product-info-section">
      <!-- Product Image -->
      <div class="product-image-container">
        <div class="product-image">
          <img :src="product.imageUrl || getProductImageUrl(product.image)" :alt="product.title" />
          <div class="product-badge">{{ product.category?.name || 'Product' }}</div>
        </div>
      </div>
      
      <!-- Product Details -->
      <div class="product-details">
        <h1 class="product-title">{{ product.title }}</h1>
        
        <div class="product-pricing">
          <div class="current-price">{{ product.formattedPrice || formatPrice(product.price) }}</div>
        </div>
        
        <div class="product-info-row">
          <div class="info-item">
            <span class="info-label">Views:</span>
            <span class="info-value">{{ product.viewCount || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Stock:</span>
            <span class="info-value">{{ product.stockQuantity || 0 }}</span>
          </div>
        </div>

        <div class="coins-earned">
          <span class="coins-icon">🪙</span>
          <span class="coins-text">Earn {{ product.points }} Coins from this purchase</span>
        </div>
      </div>
    </div>

    <!-- Product Description Section -->
    <div v-if="product" class="dashboard-section description-section">
      <h3 class="section-title">Product Description</h3>
      <p class="description-text">{{ product.description }}</p>
      
      <!-- Additional Product Info -->
      <div class="product-meta">
        <div class="meta-item">
          <span class="meta-label">Product ID:</span>
          <span class="meta-value">{{ product.id }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">SKU:</span>
          <span class="meta-value">{{ product.slug }}</span>
        </div>
        <div v-if="product.metaTitle" class="meta-item">
          <span class="meta-label">Meta Title:</span>
          <span class="meta-value">{{ product.metaTitle }}</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons Section -->
    <div v-if="product" class="dashboard-section actions-section">
      <div class="action-buttons">
        <button 
          class="favorite-btn" 
          @click="handleToggleFavorite" 
          :class="{ active: isInWishlist(product.id) }"
          :disabled="wishlistLoading"
        >
          <span class="heart-icon">{{ isInWishlist(product.id) ? '❤️' : '🤍' }}</span>
          <span class="favorite-text">
            {{ isInWishlist(product.id) ? 'Favorited' : 'Add to Favorites' }}
            {{ wishlistLoading ? ' (...)' : '' }}
          </span>
        </button>
        
        <button class="share-product-btn" @click="openShareModal">
          <span class="share-icon">🔗</span>
          <span class="share-text">Share Product</span>
        </button>
      </div>
    </div>

    <!-- Purchase/Buy Button -->
    <div v-if="product && product.stockQuantity > 0" class="dashboard-section purchase-section">
      <button class="buy-btn" @click="handlePurchase">
        <span class="buy-icon">🛒</span>
        <span class="buy-text">Buy Now - {{ product.formattedPrice || formatPrice(product.price) }}</span>
      </button>
      <div class="purchase-info">
        <p class="info-text">🚚 Free shipping for orders above Rp 500.000</p>
        <p class="info-text">🔒 Secure payment guaranteed</p>
      </div>
    </div>

    <!-- Out of Stock Message -->
    <div v-else-if="product && product.stockQuantity === 0" class="dashboard-section out-of-stock-section">
      <div class="out-of-stock-message">
        <span class="stock-icon">📭</span>
        <span class="stock-text">This product is currently out of stock</span>
      </div>
    </div>

    <!-- Related Products Section -->
    <div v-if="relatedProducts.length > 0" class="dashboard-section related-section">
      <h3 class="section-title">Related Products</h3>
      <div class="related-products-grid">
        <div 
          v-for="relatedProduct in relatedProducts" 
          :key="relatedProduct.id" 
          class="related-product-card"
          @click="viewRelatedProduct(relatedProduct)"
        >
          <div class="related-image">
            <img :src="relatedProduct.imageUrl || getProductImageUrl(relatedProduct.image)" :alt="relatedProduct.title" />
          </div>
          <div class="related-info">
            <h4 class="related-name">{{ relatedProduct.title }}</h4>
            <div class="related-price">{{ relatedProduct.formattedPrice || formatPrice(relatedProduct.price) }}</div>
            <div class="related-coins">🪙 {{ relatedProduct.points }} coins</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Section -->
    <div v-if="error" class="dashboard-section error-section">
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error }}</span>
        <button class="retry-btn" @click="loadProductData">Retry</button>
      </div>
    </div>

    <!-- Share Modal -->
    <ShareModal 
      :isVisible="showShareModal" 
      :product="product"
      @close="closeShareModal"
      @shared="handleShareSuccess"
      @points-earned="handlePointsEarned"
    />

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import ShareModal from '../components/ShareModal.vue'
import { useAuthStore } from '../stores/auth'
import { useWishlist } from '../composables/useWishlist'
import apiService from '../services/api'
import cacheOptimization from '../utils/cacheOptimization'
import performanceService from '../services/performanceService'

export default {
  name: 'ProductDetailView',
  components: {
    BottomNavigation,
    HustlHeader,
    ShareModal
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    
    // State management
    const isLoading = ref(true)
    const error = ref('')
    const product = ref(null)
    const relatedProducts = ref([])
    const showShareModal = ref(false)
    
    // Use the wishlist composable
    const {
      isLoading: wishlistLoading,
      isInWishlist,
      toggleWishlist
    } = useWishlist()

    // Utility methods
    const getProductImageUrl = (imagePath) => {
      return apiService.constructor.getImageUrl(imagePath, 'products')
    }

    const formatPrice = (price) => {
      return apiService.constructor.formatPrice(price)
    }

    // FIXED: Enhanced product ID validation and extraction
    const getProductIdFromRoute = () => {
      const routeId = route.params.id
      console.log('Raw route ID:', routeId, 'Type:', typeof routeId)
      
      // Check if routeId exists and is not undefined
      if (!routeId || routeId === 'undefined') {
        console.error('Product ID is undefined or missing from route')
        return null
      }
      
      // Convert to number and validate
      const productId = parseInt(routeId, 10)
      
      if (isNaN(productId) || productId <= 0) {
        console.error('Invalid product ID:', routeId)
        return null
      }
      
      console.log('Valid product ID extracted:', productId)
      return productId
    }

    // FIXED: Enhanced product data loading with better error handling
    const loadProductData = async () => {
      isLoading.value = true
      error.value = ''
      
      try {
        const productId = getProductIdFromRoute()
        
        if (!productId) {
          error.value = 'Invalid product ID. Please check the URL and try again.'
          return
        }

        console.log('Loading product with ID:', productId)
        
        const startTime = Date.now()
        
        // FIXED: Use direct API call with proper caching
        const response = await cacheOptimization.getCachedApiCall(
          `product_${productId}`,
          () => apiService.getProductById(productId),
          { ttl: 20 * 60 * 1000 } // 20 minutes cache
        )
        
        const responseTime = Date.now() - startTime
        performanceService.notifyCacheOperation('api', `product_${productId}`, responseTime)
        
        if (response && response.success) {
          product.value = response.data
          console.log('Product loaded successfully:', product.value)
          
          // Load related products based on category
          if (product.value.categoryId) {
            await loadRelatedProducts(product.value.categoryId, product.value.id)
          }
          
        } else {
          const errorMsg = response?.message || 'Failed to load product details'
          console.error('API response error:', errorMsg)
          error.value = errorMsg
        }

      } catch (err) {
        console.error('Error loading product:', err)
        
        // Enhanced error message based on error type
        if (err.message.includes('404')) {
          error.value = 'Product not found. It may have been removed or the ID is incorrect.'
        } else if (err.message.includes('400')) {
          error.value = 'Invalid product request. Please check the product ID.'
        } else if (err.message.includes('Network')) {
          error.value = 'Network error. Please check your connection and try again.'
        } else if (err.message.includes('ID must be a positive integer')) {
          error.value = 'Invalid product ID format. Please check the URL.'
        } else {
          error.value = `Failed to load product details: ${err.message}`
        }
      } finally {
        isLoading.value = false
      }
    }

    // FIXED: Enhanced related products loading
    const loadRelatedProducts = async (categoryId, excludeProductId) => {
      try {
        console.log('Loading related products for category:', categoryId)
        
        const startTime = Date.now()
        
        const response = await cacheOptimization.getCachedApiCall(
          `related_products_${categoryId}`,
          () => apiService.getProducts({ 
            categoryId: categoryId,
            limit: 6 
          }),
          { ttl: 15 * 60 * 1000 } // 15 minutes cache
        )
        
        const responseTime = Date.now() - startTime
        performanceService.notifyCacheOperation('api', `related_products_${categoryId}`, responseTime)
        
        if (response && response.success) {
          relatedProducts.value = response.data
            .filter(p => p.id !== excludeProductId)
            .slice(0, 4)
          
          console.log('Related products loaded:', relatedProducts.value.length)
        }
      } catch (err) {
        console.warn('Failed to load related products:', err)
        relatedProducts.value = []
      }
    }

    // Handle favorite toggle with proper error handling
    const handleToggleFavorite = async () => {
      if (!product.value || wishlistLoading.value) {
        console.warn('Product not loaded or wishlist operation in progress')
        return
      }

      try {
        const success = toggleWishlist(product.value)
        
        if (success) {
          console.log('Wishlist toggled successfully for:', product.value.title)
        } else {
          console.error('Failed to toggle wishlist for:', product.value.title)
        }
      } catch (error) {
        console.error('Error toggling favorite:', error)
      }
    }

    // Navigation methods
    const goBack = () => {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        // Fallback to categories page
        router.push('/categories')
      }
    }

    const viewRelatedProduct = (relatedProduct) => {
      if (relatedProduct && relatedProduct.id) {
        router.push(`/product/${relatedProduct.id}`)
      }
    }

    // Share Modal Methods
    const openShareModal = () => {
      if (!product.value) {
        console.warn('No product data available for sharing')
        return
      }
      
      // Validate product has required URL for material ID extraction
      if (!product.value.url) {
        alert('This product cannot be shared as it does not have a valid product URL.')
        return
      }
      
      showShareModal.value = true
    }

    const closeShareModal = () => {
      showShareModal.value = false
    }

    const handleShareSuccess = (shareData) => {
      console.log('Product shared successfully:', shareData)
      
      if (shareData.pointsEarned > 0) {
        console.log(`Earned ${shareData.pointsEarned} points for sharing!`)
      }
    }

    const handlePointsEarned = (points) => {
      // Refresh user points in auth store
      authStore.refreshUserPoints()
      console.log(`Points earned: ${points}`)
    }

    // Purchase handling
    const handlePurchase = () => {
      if (!product.value) return
      
      if (product.value.url) {
        window.open(product.value.url, '_blank')
      } else {
        alert(`Redirecting to payment for ${product.value.title}`)
        console.log('Purchase initiated for:', product.value.title)
      }
    }

    // FIXED: Enhanced route watching with proper validation
    watch(() => route.params.id, (newId, oldId) => {
      console.log('Route ID changed:', { newId, oldId })
      
      if (newId && newId !== oldId && newId !== 'undefined') {
        console.log('Loading new product data for ID:', newId)
        loadProductData()
      }
    }, { immediate: false })

    // FIXED: Enhanced initialization with better debugging
    onMounted(() => {
      console.log('ProductDetailView mounted')
      console.log('Current route params:', route.params)
      console.log('Current route path:', route.path)
      
      // Check if we have session storage data first
      const sessionProduct = sessionStorage.getItem('selectedProduct')
      if (sessionProduct) {
        try {
          const parsedProduct = JSON.parse(sessionProduct)
          console.log('Found product in session storage:', parsedProduct)
          
          // Verify the product ID matches the route
          const routeId = getProductIdFromRoute()
          if (routeId && parsedProduct.id === routeId) {
            product.value = parsedProduct
            isLoading.value = false
            
            // Still load related products
            if (parsedProduct.categoryId) {
              loadRelatedProducts(parsedProduct.categoryId, parsedProduct.id)
            }
            
            return
          }
        } catch (err) {
          console.warn('Error parsing session product data:', err)
        }
      }
      
      // Load from API if no session data or ID mismatch
      loadProductData()
    })

    return {
      product,
      relatedProducts,
      isLoading,
      error,
      showShareModal,
      wishlistLoading,
      goBack,
      handleToggleFavorite,
      isInWishlist,
      openShareModal,
      closeShareModal,
      handleShareSuccess,
      handlePointsEarned,
      handlePurchase,
      viewRelatedProduct,
      loadProductData,
      getProductImageUrl,
      formatPrice
    }
  }
}
</script>

<style scoped>
/* All existing styles remain the same */
.product-detail-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 120px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.product-detail-view .page-container {
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

.product-detail-view .app-main {
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

/* Header Section */
.header-section {
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  color: #4FC3F7;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(79, 195, 247, 0.1);
  transform: translateX(-2px);
}

.back-icon {
  font-size: 1.25rem;
}

.back-text {
  font-size: 1rem;
}

.share-btn {
  background: #4FC3F7;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1rem;
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

/* Product Info Section */
.product-info-section {
  padding: 1.5rem 1.25rem;
}

.product-image-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.product-image {
  position: relative;
  width: 100%;
  max-width: 300px;
  height: 300px;
  border-radius: 16px;
  overflow: hidden;
  background: #E5E7EB;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #4FC3F7;
  color: white;
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

/* Product Details */
.product-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-title {
  font-size: 1.375rem;
  font-weight: 800;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.3;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.product-pricing {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.current-price {
  font-size: 1.5rem;
  color: #059669;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
}

.product-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #F8FAFC;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.info-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 0.875rem;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
}

.coins-earned {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 12px;
  border: 2px solid rgba(245, 158, 11, 0.2);
}

.coins-icon {
  font-size: 1.5rem;
}

.coins-text {
  font-size: 1rem;
  color: #F59E0B;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
}

/* Description Section */
.description-section {
  padding: 1.25rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin-bottom: 0.75rem;
}

.description-text {
  font-size: 0.875rem;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

/* Product Meta Information */
.product-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.meta-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.meta-value {
  font-size: 0.75rem;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
  word-wrap: break-word;
}

/* Actions Section */
.actions-section {
  padding: 1rem 1.25rem;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.favorite-btn,
.share-product-btn {
  background: white;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  padding: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  font-family: 'Baloo 2', sans-serif;
  min-height: 80px;
}

.favorite-btn:hover,
.share-product-btn:hover {
  border-color: #4FC3F7;
  background: rgba(79, 195, 247, 0.05);
  transform: translateY(-1px);
}

.favorite-btn.active {
  border-color: #EF4444;
  background: rgba(239, 68, 68, 0.05);
}

.favorite-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.favorite-btn:disabled:hover {
  border-color: #E2E8F0;
  background: white;
  transform: none;
}

.heart-icon,
.share-icon {
  font-size: 1.5rem;
}

.favorite-text,
.share-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
  line-height: 1.2;
}

.favorite-btn.active .favorite-text {
  color: #EF4444;
}

/* Purchase Section */
.purchase-section {
  padding: 1.25rem;
}

.buy-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1.25rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.25);
  margin-bottom: 1rem;
}

.buy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.buy-icon {
  font-size: 1.25rem;
}

/* Out of Stock Section */
.out-of-stock-section {
  padding: 1.25rem;
  background: #FEF2F2;
  border: 2px solid #FECACA;
}

.out-of-stock-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #DC2626;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 1rem;
}

.stock-icon {
  font-size: 1.5rem;
}

.purchase-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.info-text {
  font-size: 0.8rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

/* Related Products Section */
.related-section {
  padding: 1.25rem;
}

.related-products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.related-product-card {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #E2E8F0;
  cursor: pointer;
  transition: all 0.2s;
}

.related-product-card:hover {
  background: #F1F5F9;
  border-color: #4FC3F7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.15);
}

.related-image {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #E5E7EB;
  margin-bottom: 0.75rem;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.related-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.2;
  margin: 0;
}

.related-price {
  font-size: 0.8rem;
  color: #059669;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
}

.related-coins {
  font-size: 0.7rem;
  color: #F59E0B;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
}

/* Responsive Design */
@media (min-width: 768px) {
  .dashboard-section {
    margin: 0 2rem 1.5rem 2rem;
    padding: 1.5rem;
  }

  .product-image {
    max-width: 350px;
    height: 350px;
  }

  .product-title {
    font-size: 1.625rem;
  }

  .related-products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .product-detail-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: auto !important;
  }
  
  .product-detail-view .page-container {
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
  
  .product-detail-view .app-main {
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
    margin: 0 3rem 2rem 3rem;
    padding: 2rem;
  }

  .product-image {
    max-width: 400px;
    height: 400px;
  }

  .product-title {
    font-size: 1.75rem;
  }

  .related-products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1200px) {
  .dashboard-section {
    margin: 0 auto 2rem auto;
    max-width: 1000px;
    width: calc(100% - 4rem);
  }
}
</style>