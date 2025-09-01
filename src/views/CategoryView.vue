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
          <div class="category-icon" :style="{ background: category.color }">
            <span>{{ category.icon }}</span>
          </div>
          <div class="category-info">
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count-text">{{ category.productCount }} products</span>
          </div>
          <div v-if="category.badge" class="category-badge">{{ category.badge }}</div>
        </div>
      </div>
    </div>

    <!-- Featured Products Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h3 class="section-title">
          {{ selectedCategory ? `${selectedCategory.name} Products` : 'Featured Products' }}
        </h3>
        <div class="products-info">
          <span class="products-count">{{ filteredProducts.length }} products</span>
          <button v-if="filteredProducts.length > productsPerPage" class="see-more-btn" @click="loadMoreProducts">
            Load More
          </button>
        </div>
      </div>
      
      <div v-if="displayedProducts.length > 0" class="products-grid">
        <div 
          v-for="product in displayedProducts" 
          :key="product.id" 
          class="product-card"
          @click="viewProductDetails(product)"
        >
          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
            <div class="product-badge">{{ product.category }}</div>
            <button class="favorite-btn" @click.stop="toggleFavorite(product)">
              <span class="heart-icon">{{ product.isFavorite ? '❤️' : '🤍' }}</span>
            </button>
          </div>
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-price">{{ product.price }}</div>
            <div class="product-rating">
              <span class="rating-stars">{{ getStarRating(product.rating) }}</span>
              <span class="rating-count">({{ product.reviewCount }})</span>
            </div>
            <div class="product-actions">
              <span class="earn-coins">🪙 Earn {{ product.coins }} Coins</span>
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
          {{ searchQuery ? 'Try different keywords' : 'Select a category to view products' }}
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

    <!-- Bottom Navigation -->
    <BottomNavigation />

  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'


export default {
  name: 'CategoryView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const selectedCategory = ref(null)
    const currentPage = ref(1)
    const productsPerPage = 10

    
    const categories = ref([
      { 
        id: 1, 
        name: 'Electronics', 
        icon: '📱', 
        color: '#4FC3F7', 
        productCount: 1247,
        badge: 'Hot' 
      },
      { 
        id: 2, 
        name: 'Fashion', 
        icon: '👗', 
        color: '#FF69B4', 
        productCount: 856 
      },
      { 
        id: 3, 
        name: 'Sports & Outdoor', 
        icon: '⚽', 
        color: '#FF6B35', 
        productCount: 634 
      },
      { 
        id: 4, 
        name: 'Home & Living', 
        icon: '🏠', 
        color: '#4ECDC4', 
        productCount: 892 
      },
      { 
        id: 5, 
        name: 'Health & Beauty', 
        icon: '💄', 
        color: '#FF1493', 
        productCount: 543
      },
      { 
        id: 6, 
        name: 'Automotive', 
        icon: '🚗', 
        color: '#32CD32', 
        productCount: 287,
        badge: 'New'
      }
    ])

    const allProducts = ref([
      {
        id: 1,
        name: 'iPhone 15 Pro Max 256GB',
        category: 'Electronics',
        categoryId: 1,
        image: '/api/placeholder/120/120',
        price: 'Rp 21,999,000',
        originalPrice: 'Rp 25,999,000',
        discount: '15%',
        coins: 220,
        rating: 4.8,
        reviewCount: 3247,
        isFavorite: false,
        lastUpdated: '2025-08-30T10:00:00Z',
        description: 'The most advanced iPhone ever with titanium design, A17 Pro chip, and revolutionary camera system. Professional-grade photography and videography capabilities.',
        specifications: [
          'Display: 6.7-inch Super Retina XDR',
          'Chip: A17 Pro',
          'Camera: 48MP Main, 12MP Ultra Wide', 
          'Storage: 256GB',
          'Battery: All-day battery life',
          'Material: Titanium'
        ]
      },
      {
        id: 2,
        name: 'Samsung Smart TV 55"',
        category: 'Electronics',
        categoryId: 1,
        image: '/api/placeholder/120/120',
        price: 'Rp 7,500,000',
        originalPrice: 'Rp 9,999,000',
        discount: '25%',
        coins: 75,
        rating: 4.6,
        reviewCount: 1890,
        isFavorite: true,
        lastUpdated: '2025-08-30T09:45:00Z',
        description: 'Experience stunning 4K resolution with Samsung\'s latest Smart TV technology. Features HDR support, built-in streaming apps, and voice control.',
        specifications: [
          'Screen Size: 55 inches',
          'Resolution: 4K UHD (3840x2160)', 
          'HDR: HDR10, HDR10+',
          'Smart Platform: Tizen OS',
          'Connectivity: 3 HDMI, 2 USB, WiFi',
          'Audio: Dolby Digital Plus'
        ]
      },
      {
        id: 3,
        name: 'Nike Air Force 1 White',
        category: 'Fashion',
        categoryId: 2,
        image: '/api/placeholder/120/120',
        price: 'Rp 1,299,000',
        originalPrice: 'Rp 1,799,000',
        discount: '27%',
        coins: 13,
        rating: 4.7,
        reviewCount: 2134,
        isFavorite: false,
        lastUpdated: '2025-08-30T09:30:00Z',
        description: 'The iconic basketball shoe that changed the game. Classic white leather upper with signature Air cushioning.',
        specifications: [
          'Material: Premium leather upper',
          'Sole: Rubber outsole',
          'Cushioning: Nike Air technology',
          'Style: Low-top basketball shoe',
          'Color: White/White',
          'Gender: Unisex'
        ]
      },
      {
        id: 4,
        name: 'Adidas Ultraboost 22',
        category: 'Sports',
        categoryId: 3,
        image: '/api/placeholder/120/120',
        price: 'Rp 2,200,000',
        originalPrice: 'Rp 3,000,000',
        discount: '26%',
        coins: 22,
        rating: 4.6,
        reviewCount: 743,
        isFavorite: false,
        lastUpdated: '2025-08-30T09:15:00Z',
        description: 'Premium running shoes with responsive BOOST midsole and supportive Primeknit upper for ultimate performance.',
        specifications: [
          'Upper: Primeknit textile',
          'Midsole: BOOST technology',
          'Outsole: Continental rubber',
          'Support: Torsion system',
          'Fit: Snug, supportive',
          'Use: Running, training'
        ]
      },
      {
        id: 5,
        name: 'MacBook Air M3 13"',
        category: 'Electronics',
        categoryId: 1,
        image: '/api/placeholder/120/120',
        price: 'Rp 14,999,000',
        originalPrice: 'Rp 17,999,000',
        discount: '16%',
        coins: 150,
        rating: 4.7,
        reviewCount: 567,
        isFavorite: true,
        lastUpdated: '2025-08-30T09:00:00Z',
        description: 'Supercharged by M3 chip, the new MacBook Air is incredibly fast and powerful laptop that gets things done.',
        specifications: [
          'Chip: Apple M3 8-core CPU',
          'Memory: 8GB unified memory',
          'Storage: 256GB SSD',
          'Display: 13.6-inch Liquid Retina', 
          'Battery: Up to 18 hours',
          'Weight: 1.24 kg'
        ]
      },
      {
        id: 6,
        name: 'IKEA Sofa Modern',
        category: 'Home & Living',
        categoryId: 4,
        image: '/api/placeholder/120/120',
        price: 'Rp 3,499,000',
        originalPrice: 'Rp 4,999,000',
        discount: '30%',
        coins: 35,
        rating: 4.4,
        reviewCount: 892,
        isFavorite: false,
        lastUpdated: '2025-08-30T08:45:00Z',
        description: 'Comfortable and stylish modern sofa perfect for any living room. High-quality materials and contemporary design.',
        specifications: [
          'Material: Premium fabric upholstery',
          'Frame: Solid wood construction',
          'Seating: 3-seater capacity',
          'Color: Multiple options available',
          'Warranty: 10 year limited',
          'Assembly: Required'
        ]
      }
    ])

    const filteredProducts = computed(() => {
      let products = allProducts.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        products = products.filter(product =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        )
      }

      if (selectedCategory.value) {
        products = products.filter(product => 
          product.categoryId === selectedCategory.value.id
        )
      }

      return products.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    })

    const totalPages = computed(() => Math.ceil(filteredProducts.value.length / productsPerPage))

    const displayedProducts = computed(() => {
      const start = (currentPage.value - 1) * productsPerPage
      const end = start + productsPerPage
      return filteredProducts.value.slice(start, end)
    })

    const handleSearch = () => {
      currentPage.value = 1
      selectedCategory.value = null
    }

    const clearSearch = () => {
      searchQuery.value = ''
      currentPage.value = 1
    }

    const selectCategory = (category) => {
      if (selectedCategory.value?.id === category.id) {
        selectedCategory.value = null
      } else {
        selectedCategory.value = category
        searchQuery.value = ''
        currentPage.value = 1
      }
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

    const toggleFavorite = (product) => {
      product.isFavorite = !product.isFavorite
    }

    const shareProduct = (product) => {
      console.log(`Sharing product: ${product.name}`)
    }

    const viewProductDetails = (product) => {
      // Store product details for ProductDetailView
      sessionStorage.setItem('selectedProduct', JSON.stringify(product))
      router.push(`/product/${product.id}`)
    }

    const goToPage = (page) => {
      currentPage.value = page
    }

    const loadMoreProducts = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    return {
      searchQuery,
      selectedCategory,
      currentPage,
      productsPerPage,
      categories,
      filteredProducts,
      displayedProducts,
      totalPages,
      handleSearch,
      clearSearch,
      selectCategory,
      getStarRating,
      toggleFavorite,
      shareProduct,
      viewProductDetails,
      goToPage,
      loadMoreProducts
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

.category-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #EF4444;
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 6px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
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

  /* Keep mobile layout styling */
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

  /* Keep 2-column layout */
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