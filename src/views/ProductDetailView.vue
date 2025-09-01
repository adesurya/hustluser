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

    <!-- Product Information Section - Mobile-First Layout -->
    <div class="dashboard-section product-info-section" v-if="product">
      <!-- Product Image -->
      <div class="product-image-container">
        <div class="product-image">
          <img :src="product.image" :alt="product.name" />
          <div class="product-badge">{{ product.category }}</div>
          <div v-if="product.discount" class="discount-badge">{{ product.discount }} OFF</div>
        </div>
      </div>
      
      <!-- Product Details -->
      <div class="product-details">
        <h1 class="product-title">{{ product.name }}</h1>
        
        <div class="product-pricing">
          <div class="current-price">{{ product.price }}</div>
          <div v-if="product.originalPrice" class="original-price">{{ product.originalPrice }}</div>
        </div>
        
        <div class="product-rating">
          <div class="rating-display">
            <span class="rating-stars">{{ getStarRating(product.rating) }}</span>
            <span class="rating-value">{{ product.rating }}</span>
          </div>
          <span class="rating-count">({{ product.reviewCount }} reviews)</span>
        </div>

        <div class="coins-earned">
          <span class="coins-icon">🪙</span>
          <span class="coins-text">Earn {{ product.coins }} Coins from this purchase</span>
        </div>
      </div>
    </div>

    <!-- Product Description Section -->
    <div class="dashboard-section description-section" v-if="product">
      <h3 class="section-title">Product Description</h3>
      <p class="description-text">{{ product.description }}</p>
    </div>

    <!-- Product Specifications Section -->
    <div class="dashboard-section specs-section" v-if="product && product.specifications">
      <h3 class="section-title">Specifications</h3>
      <div class="specs-list">
        <div 
          v-for="(spec, index) in product.specifications" 
          :key="index" 
          class="spec-item"
        >
          <span class="spec-text">{{ spec }}</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons Section -->
    <div class="dashboard-section actions-section">
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
    <div class="dashboard-section purchase-section" v-if="product">
      <button class="buy-btn" @click="handlePurchase">
        <span class="buy-icon">🛒</span>
        <span class="buy-text">Buy Now - {{ product.price }}</span>
      </button>
      <div class="purchase-info">
        <p class="info-text">🚚 Free shipping for orders above Rp 500.000</p>
        <p class="info-text">🔒 Secure payment guaranteed</p>
      </div>
    </div>

    <!-- Related Products Section -->
    <div class="dashboard-section related-section" v-if="relatedProducts.length > 0">
      <h3 class="section-title">Related Products</h3>
      <div class="related-products-grid">
        <div 
          v-for="relatedProduct in relatedProducts" 
          :key="relatedProduct.id" 
          class="related-product-card"
          @click="viewRelatedProduct(relatedProduct)"
        >
          <div class="related-image">
            <img :src="relatedProduct.image" :alt="relatedProduct.name" />
          </div>
          <div class="related-info">
            <h4 class="related-name">{{ relatedProduct.name }}</h4>
            <div class="related-price">{{ relatedProduct.price }}</div>
            <div class="related-coins">🪙 {{ relatedProduct.coins }} coins</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'

export default {
  name: 'ProductDetailView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    const product = ref(null)
    const isFavorite = ref(false)
    
    // Dummy related products data
    const relatedProducts = ref([
      {
        id: 104,
        name: 'LG Smart TV 50"',
        image: '/api/placeholder/80/80',
        price: 'Rp 6.999.000',
        coins: 70
      },
      {
        id: 105,
        name: 'Sony Smart TV 65"',
        image: '/api/placeholder/80/80',
        price: 'Rp 12.999.000',
        coins: 130
      },
      {
        id: 106,
        name: 'TCL Smart TV 43"',
        image: '/api/placeholder/80/80',
        price: 'Rp 4.299.000',
        coins: 43
      }
    ])

    onMounted(() => {
      // Get product data from sessionStorage
      const storedProduct = sessionStorage.getItem('selectedProduct')
      if (storedProduct) {
        try {
          product.value = JSON.parse(storedProduct)
          // Check if product is in favorites
          const favorites = JSON.parse(localStorage.getItem('favoriteProducts') || '[]')
          isFavorite.value = favorites.some(fav => fav.id === product.value.id)
        } catch (err) {
          console.error('Error parsing product data:', err)
          router.push('/campaign')
        }
      } else {
        // If no product data, redirect back
        router.go(-1)
      }
    })

    const goBack = () => {
      router.go(-1)
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

    const toggleFavorite = () => {
      if (!product.value) return
      
      const favorites = JSON.parse(localStorage.getItem('favoriteProducts') || '[]')
      const productIndex = favorites.findIndex(fav => fav.id === product.value.id)
      
      if (productIndex > -1) {
        // Remove from favorites
        favorites.splice(productIndex, 1)
        isFavorite.value = false
        console.log('Removed from favorites:', product.value.name)
      } else {
        // Add to favorites
        favorites.push({
          id: product.value.id,
          name: product.value.name,
          price: product.value.price,
          image: product.value.image,
          coins: product.value.coins
        })
        isFavorite.value = true
        console.log('Added to favorites:', product.value.name)
      }
      
      localStorage.setItem('favoriteProducts', JSON.stringify(favorites))
    }

    const shareProduct = () => {
      if (!product.value) return
      
      const shareData = {
        title: product.value.name,
        text: `Check out this ${product.value.category.toLowerCase()}: ${product.value.name} - ${product.value.price}. Earn ${product.value.coins} coins!`,
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
            // Manual fallback
            prompt('Copy this link to share:', `${product.value.name} - ${product.value.price} - Earn ${product.value.coins} coins! ${window.location.href}`)
          })
      }
    }

    const handlePurchase = () => {
      if (!product.value) return
      
      // Simulate purchase process
      alert(`Redirecting to payment for ${product.value.name}`)
      console.log('Purchase initiated for:', product.value.name)
    }

    const viewRelatedProduct = (relatedProduct) => {
      // Create full product object for related product (with mock data)
      const fullProduct = {
        ...relatedProduct,
        category: 'Electronic',
        rating: 4.5,
        reviewCount: 892,
        description: `High-quality ${relatedProduct.name} with advanced features and reliable performance.`,
        specifications: [
          'Premium build quality',
          'Energy efficient',
          '2 year warranty',
          'Free installation'
        ]
      }
      
      // Store in sessionStorage and navigate
      sessionStorage.setItem('selectedProduct', JSON.stringify(fullProduct))
      // Force page reload to show new product
      window.location.reload()
    }

    return {
      product,
      isFavorite,
      relatedProducts,
      goBack,
      getStarRating,
      toggleFavorite,
      shareProduct,
      handlePurchase,
      viewRelatedProduct
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

.discount-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #EF4444;
  color: white;
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
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

.original-price {
  font-size: 1.125rem;
  color: #9CA3AF;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  text-decoration: line-through;
}

.product-rating {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-stars {
  color: #FFA500;
  font-size: 1.125rem;
  line-height: 1;
}

.rating-value {
  font-size: 1rem;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
}

.rating-count {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
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
.description-section,
.specs-section {
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
  margin: 0;
}

/* Specifications Section */
.specs-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #F8FAFC;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
}

.spec-item::before {
  content: '•';
  color: #4FC3F7;
  font-size: 1.25rem;
  font-weight: bold;
  flex-shrink: 0;
}

.spec-text {
  font-size: 0.875rem;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
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