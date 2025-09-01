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
        <button class="share-btn" @click="shareProduct">
          <span class="share-icon">📤</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="dashboard-section loading-section">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading product details...</p>
    </div>

    <!-- Product Information Section - Mobile-First Layout -->
    <div v-else-if="product" class="dashboard-section product-info-section">
      <!-- Product Image -->
      <div class="product-image-container">
        <div class="product-image">
          <img :src="getProductImageUrl(product.image)" :alt="product.title" />
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
        <button class="favorite-btn" @click="toggleFavorite" :class="{ active: isFavorite }">
          <span class="heart-icon">{{ isFavorite ? '❤️' : '🤍' }}</span>
          <span class="favorite-text">{{ isFavorite ? 'Favorited' : 'Add to Favorites' }}</span>
        </button>
        
        <button class="share-product-btn" @click="shareProduct">
          <span class="share-icon">📤</span>
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
            <img :src="getProductImageUrl(relatedProduct.image)" :alt="relatedProduct.title" />
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

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import apiService from '../services/api'

export default {
  name: 'ProductDetailView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const product = ref(null)
    const relatedProducts = ref([])
    const isFavorite = ref(false)
    const isLoading = ref(true)
    const error = ref('')

    // Methods
    const getProductImageUrl = (imagePath) => {
      return apiService.constructor.getImageUrl(imagePath, 'products')
    }

    const formatPrice = (price) => {
      return apiService.constructor.formatPrice(price)
    }

    // Load product data
    const loadProductData = async () => {
      isLoading.value = true
      error.value = ''

      try {
        // First check if we have product data in sessionStorage
        const storedProduct = sessionStorage.getItem('selectedProduct')
        if (storedProduct) {
          try {
            const parsedProduct = JSON.parse(storedProduct)
            product.value = parsedProduct
            
            // Check if product is in favorites
            const favorites = JSON.parse(localStorage.getItem('favoriteProducts') || '[]')
            isFavorite.value = favorites.some(fav => fav.id === parsedProduct.id)
            
            // Load related products based on category
            if (parsedProduct.categoryId) {
              await loadRelatedProducts(parsedProduct.categoryId, parsedProduct.id)
            }
            
            isLoading.value = false
            return
          } catch (parseError) {
            console.warn('Error parsing stored product data:', parseError)
          }
        }

        // If no stored data, try to load from API using route parameter
        const productId = route.params.id
        if (productId) {
          // Note: You may need to implement getProductById in your API service
          // For now, we'll redirect back if no stored data
          error.value = 'Product data not found. Please select a product from the categories.'
        } else {
          error.value = 'Product ID not provided'
        }

      } catch (err) {
        console.error('Error loading product:', err)
        error.value = 'Failed to load product details. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    // Load related products from same category
    const loadRelatedProducts = async (categoryId, excludeProductId) => {
      try {
        const response = await apiService.getProducts({ 
          categoryId: categoryId,
          limit: 6 
        })
        
        if (response.success) {
          // Filter out current product and limit to 3-4 related products
          relatedProducts.value = response.data
            .filter(p => p.id !== excludeProductId)
            .slice(0, 4)
        }
      } catch (err) {
        console.warn('Failed to load related products:', err)
      }
    }

    const goBack = () => {
      router.go(-1)
    }

    const toggleFavorite = () => {
      if (!product.value) return
      
      const favorites = JSON.parse(localStorage.getItem('favoriteProducts') || '[]')
      const productIndex = favorites.findIndex(fav => fav.id === product.value.id)
      
      if (productIndex > -1) {
        // Remove from favorites
        favorites.splice(productIndex, 1)
        isFavorite.value = false
        console.log('Removed from favorites:', product.value.title)
      } else {
        // Add to favorites
        favorites.push({
          id: product.value.id,
          title: product.value.title,
          price: product.value.formattedPrice || formatPrice(product.value.price),
          image: product.value.image,
          points: product.value.points
        })
        isFavorite.value = true
        console.log('Added to favorites:', product.value.title)
      }
      
      localStorage.setItem('favoriteProducts', JSON.stringify(favorites))
    }

    const shareProduct = () => {
      if (!product.value) return
      
      const shareData = {
        title: product.value.title,
        text: `Check out this product: ${product.value.title} - ${product.value.formattedPrice || formatPrice(product.value.price)}. Earn ${product.value.points} coins!`,
        url: window.location.href
      }
      
      if (navigator.share && navigator.canShare(shareData)) {
        navigator.share(shareData)
          .then(() => console.log('Product shared successfully'))
          .catch((error) => console.log('Error sharing product:', error))
      } else {
        // Fallback: copy to clipboard
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

    const handlePurchase = () => {
      if (!product.value) return
      
      // Check if product URL is available for external purchase
      if (product.value.url) {
        window.open(product.value.url, '_blank')
      } else {
        // Simulate purchase process
        alert(`Redirecting to payment for ${product.value.title}`)
        console.log('Purchase initiated for:', product.value.title)
      }
    }

    const viewRelatedProduct = (relatedProduct) => {
      // Store in sessionStorage and navigate
      sessionStorage.setItem('selectedProduct', JSON.stringify(relatedProduct))
      // Force page reload to show new product
      router.push(`/product/${relatedProduct.id}`)
      // Reload the page to show new product data
      window.location.reload()
    }

    // Initialize on mount
    onMounted(() => {
      loadProductData()
    })

    return {
      product,
      relatedProducts,
      isFavorite,
      isLoading,
      error,
      goBack,
      toggleFavorite,
      shareProduct,
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
/* Mobile-First Product Detail View */
.product-detail-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 120px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Force full width on all screen sizes - maintain mobile layout */
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

/* Product Info Section - Mobile-First Layout */
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

/* Product Details - Mobile-First Layout */
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

/* Responsive Design - MAINTAIN MOBILE LAYOUT */
@media (min-width: 768px) {
  .product-detail-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }

  /* Keep mobile layout structure - DO NOT change to row layout */
  .product-image {
    max-width: 350px;
    height: 350px;
  }

  .product-title {
    font-size: 1.5rem;
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

  /* MAINTAIN mobile-first layout even on desktop */
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
</style>