<template>
  <div class="category-view dashboard-page">
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
        <div v-for="product in displayedProducts" :key="product.id" class="product-card">
          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
            <div class="product-badge">{{ product.category }}</div>
            <button class="favorite-btn" @click="toggleFavorite(product)">
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
              <button class="share-btn" @click="shareProduct(product)">
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
import { ref, computed, watch } from 'vue'
import BottomNavigation from '../components/BottomNavigation.vue'

export default {
  name: 'CategoryView',
  components: {
    BottomNavigation
  },
  setup() {
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
      },
      { 
        id: 7, 
        name: 'Books & Media', 
        icon: '📚', 
        color: '#9966CC', 
        productCount: 419 
      },
      { 
        id: 8, 
        name: 'Food & Beverage', 
        icon: '🍔', 
        color: '#FFD700', 
        productCount: 765 
      },
      { 
        id: 9, 
        name: 'Baby & Kids', 
        icon: '🧸', 
        color: '#FFB6C1', 
        productCount: 398 
      },
      { 
        id: 10, 
        name: 'Pet Supplies', 
        icon: '🐕', 
        color: '#8FBC8F', 
        productCount: 234 
      },
      { 
        id: 11, 
        name: 'Travel & Luggage', 
        icon: '🧳', 
        color: '#20B2AA', 
        productCount: 156 
      },
      { 
        id: 12, 
        name: 'Office & Stationery', 
        icon: '📝', 
        color: '#708090', 
        productCount: 312 
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
        coins: 220,
        rating: 4.8,
        reviewCount: 3247,
        isFavorite: false,
        lastUpdated: '2025-08-30T10:00:00Z'
      },
      {
        id: 2,
        name: 'Samsung Smart TV 55"',
        category: 'Electronics',
        categoryId: 1,
        image: '/api/placeholder/120/120',
        price: 'Rp 7,500,000',
        coins: 75,
        rating: 4.6,
        reviewCount: 1890,
        isFavorite: true,
        lastUpdated: '2025-08-30T09:45:00Z'
      },
      {
        id: 3,
        name: 'MacBook Air M3 13"',
        category: 'Electronics',
        categoryId: 1,
        image: '/api/placeholder/120/120',
        price: 'Rp 15,999,000',
        coins: 160,
        rating: 4.9,
        reviewCount: 892,
        isFavorite: false,
        lastUpdated: '2025-08-30T09:30:00Z'
      },
      {
        id: 4,
        name: 'Nike Air Force 1 White',
        category: 'Fashion',
        categoryId: 2,
        image: '/api/placeholder/120/120',
        price: 'Rp 1,799,000',
        coins: 18,
        rating: 4.7,
        reviewCount: 2134,
        isFavorite: true,
        lastUpdated: '2025-08-30T09:15:00Z'
      },
      {
        id: 5,
        name: 'Levi\'s 501 Original Jeans',
        category: 'Fashion',
        categoryId: 2,
        image: '/api/placeholder/120/120',
        price: 'Rp 1,299,000',
        coins: 13,
        rating: 4.4,
        reviewCount: 1678,
        isFavorite: false,
        lastUpdated: '2025-08-30T09:00:00Z'
      },
      {
        id: 6,
        name: 'Zara Slim Fit Shirt',
        category: 'Fashion',
        categoryId: 2,
        image: '/api/placeholder/120/120',
        price: 'Rp 599,000',
        coins: 6,
        rating: 4.3,
        reviewCount: 756,
        isFavorite: false,
        lastUpdated: '2025-08-30T08:45:00Z'
      },
      {
        id: 7,
        name: 'Adidas Ultraboost 22',
        category: 'Sports & Outdoor',
        categoryId: 3,
        image: '/api/placeholder/120/120',
        price: 'Rp 2,799,000',
        coins: 28,
        rating: 4.6,
        reviewCount: 934,
        isFavorite: true,
        lastUpdated: '2025-08-30T08:30:00Z'
      },
      {
        id: 8,
        name: 'Wilson Tennis Racket Pro',
        category: 'Sports & Outdoor',
        categoryId: 3,
        image: '/api/placeholder/120/120',
        price: 'Rp 1,299,000',
        coins: 13,
        rating: 4.5,
        reviewCount: 445,
        isFavorite: false,
        lastUpdated: '2025-08-30T08:15:00Z'
      },
      {
        id: 9,
        name: 'IKEA HEMNES Bed Frame',
        category: 'Home & Living',
        categoryId: 4,
        image: '/api/placeholder/120/120',
        price: 'Rp 2,499,000',
        coins: 25,
        rating: 4.3,
        reviewCount: 1567,
        isFavorite: false,
        lastUpdated: '2025-08-30T08:00:00Z'
      },
      {
        id: 10,
        name: 'Philips Air Fryer XXL',
        category: 'Home & Living',
        categoryId: 4,
        image: '/api/placeholder/120/120',
        price: 'Rp 3,799,000',
        coins: 38,
        rating: 4.6,
        reviewCount: 2234,
        isFavorite: true,
        lastUpdated: '2025-08-30T07:45:00Z'
      },
      {
        id: 11,
        name: 'The Ordinary Niacinamide',
        category: 'Health & Beauty',
        categoryId: 5,
        image: '/api/placeholder/120/120',
        price: 'Rp 149,000',
        coins: 2,
        rating: 4.4,
        reviewCount: 3456,
        isFavorite: false,
        lastUpdated: '2025-08-30T07:30:00Z'
      },
      {
        id: 12,
        name: 'Cetaphil Gentle Cleanser',
        category: 'Health & Beauty',
        categoryId: 5,
        image: '/api/placeholder/120/120',
        price: 'Rp 179,000',
        coins: 2,
        rating: 4.3,
        reviewCount: 2789,
        isFavorite: true,
        lastUpdated: '2025-08-30T07:15:00Z'
      },
      {
        id: 13,
        name: 'Michelin Pilot Sport 4 Tire',
        category: 'Automotive',
        categoryId: 6,
        image: '/api/placeholder/120/120',
        price: 'Rp 2,899,000',
        coins: 29,
        rating: 4.7,
        reviewCount: 567,
        isFavorite: false,
        lastUpdated: '2025-08-30T07:00:00Z'
      },
      {
        id: 14,
        name: 'Bosch Car Battery 65Ah',
        category: 'Automotive',
        categoryId: 6,
        image: '/api/placeholder/120/120',
        price: 'Rp 1,299,000',
        coins: 13,
        rating: 4.5,
        reviewCount: 234,
        isFavorite: true,
        lastUpdated: '2025-08-30T06:45:00Z'
      },
      {
        id: 15,
        name: 'Atomic Habits - James Clear',
        category: 'Books & Media',
        categoryId: 7,
        image: '/api/placeholder/120/120',
        price: 'Rp 249,000',
        coins: 3,
        rating: 4.8,
        reviewCount: 4567,
        isFavorite: false,
        lastUpdated: '2025-08-30T06:30:00Z'
      },
      {
        id: 16,
        name: 'Blue Mountain Coffee 1kg',
        category: 'Food & Beverage',
        categoryId: 8,
        image: '/api/placeholder/120/120',
        price: 'Rp 899,000',
        coins: 9,
        rating: 4.5,
        reviewCount: 1234,
        isFavorite: false,
        lastUpdated: '2025-08-30T06:15:00Z'
      },
      {
        id: 17,
        name: 'Manuka Honey UMF 15+',
        category: 'Food & Beverage',
        categoryId: 8,
        image: '/api/placeholder/120/120',
        price: 'Rp 749,000',
        coins: 8,
        rating: 4.7,
        reviewCount: 567,
        isFavorite: true,
        lastUpdated: '2025-08-30T06:00:00Z'
      },
      {
        id: 18,
        name: 'Fisher-Price Baby Rocker',
        category: 'Baby & Kids',
        categoryId: 9,
        image: '/api/placeholder/120/120',
        price: 'Rp 1,999,000',
        coins: 20,
        rating: 4.4,
        reviewCount: 890,
        isFavorite: false,
        lastUpdated: '2025-08-30T05:45:00Z'
      },
      {
        id: 19,
        name: 'LEGO Classic Bricks Set',
        category: 'Baby & Kids',
        categoryId: 9,
        image: '/api/placeholder/120/120',
        price: 'Rp 599,000',
        coins: 6,
        rating: 4.6,
        reviewCount: 1456,
        isFavorite: true,
        lastUpdated: '2025-08-30T05:30:00Z'
      },
      {
        id: 20,
        name: 'Royal Canin Dog Food 15kg',
        category: 'Pet Supplies',
        categoryId: 10,
        image: '/api/placeholder/120/120',
        price: 'Rp 899,000',
        coins: 9,
        rating: 4.5,
        reviewCount: 678,
        isFavorite: false,
        lastUpdated: '2025-08-30T05:15:00Z'
      },
      {
        id: 21,
        name: 'Cat Tree Tower 6 Level',
        category: 'Pet Supplies',
        categoryId: 10,
        image: '/api/placeholder/120/120',
        price: 'Rp 1,299,000',
        coins: 13,
        rating: 4.3,
        reviewCount: 234,
        isFavorite: true,
        lastUpdated: '2025-08-30T05:00:00Z'
      },
      {
        id: 22,
        name: 'Samsonite Spinner 28"',
        category: 'Travel & Luggage',
        categoryId: 11,
        image: '/api/placeholder/120/120',
        price: 'Rp 3,499,000',
        coins: 35,
        rating: 4.6,
        reviewCount: 567,
        isFavorite: false,
        lastUpdated: '2025-08-30T04:45:00Z'
      },
      {
        id: 23,
        name: 'Osprey Hiking Backpack',
        category: 'Travel & Luggage',
        categoryId: 11,
        image: '/api/placeholder/120/120',
        price: 'Rp 2,299,000',
        coins: 23,
        rating: 4.8,
        reviewCount: 345,
        isFavorite: true,
        lastUpdated: '2025-08-30T04:30:00Z'
      },
      {
        id: 24,
        name: 'Herman Miller Aeron Chair',
        category: 'Office & Stationery',
        categoryId: 12,
        image: '/api/placeholder/120/120',
        price: 'Rp 24,999,000',
        coins: 250,
        rating: 4.9,
        reviewCount: 456,
        isFavorite: false,
        lastUpdated: '2025-08-30T04:15:00Z'
      },
      {
        id: 25,
        name: 'Moleskine Classic Notebook',
        category: 'Office & Stationery',
        categoryId: 12,
        image: '/api/placeholder/120/120',
        price: 'Rp 449,000',
        coins: 5,
        rating: 4.4,
        reviewCount: 789,
        isFavorite: true,
        lastUpdated: '2025-08-30T04:00:00Z'
      },
      {
        id: 26,
        name: 'Sony WH-1000XM5 Headphones',
        category: 'Electronics',
        categoryId: 1,
        image: '/api/placeholder/120/120',
        price: 'Rp 4,999,000',
        coins: 50,
        rating: 4.8,
        reviewCount: 1456,
        isFavorite: false,
        lastUpdated: '2025-08-30T03:45:00Z'
      },
      {
        id: 27,
        name: 'Dell XPS 13 Laptop',
        category: 'Electronics',
        categoryId: 1,
        image: '/api/placeholder/120/120',
        price: 'Rp 19,999,000',
        coins: 200,
        rating: 4.7,
        reviewCount: 678,
        isFavorite: true,
        lastUpdated: '2025-08-30T03:30:00Z'
      },
      {
        id: 28,
        name: 'Canon EOS R6 Mark II',
        category: 'Electronics',
        categoryId: 1,
        image: '/api/placeholder/120/120',
        price: 'Rp 35,999,000',
        coins: 360,
        rating: 4.8,
        reviewCount: 189,
        isFavorite: false,
        lastUpdated: '2025-08-30T03:15:00Z'
      },
      {
        id: 29,
        name: 'Nintendo Switch OLED',
        category: 'Electronics',
        categoryId: 1,
        image: '/api/placeholder/120/120',
        price: 'Rp 4,699,000',
        coins: 47,
        rating: 4.6,
        reviewCount: 2345,
        isFavorite: true,
        lastUpdated: '2025-08-30T03:00:00Z'
      },
      {
        id: 30,
        name: 'AirPods Pro 2nd Gen',
        category: 'Electronics',
        categoryId: 1,
        image: '/api/placeholder/120/120',
        price: 'Rp 3,799,000',
        coins: 38,
        rating: 4.7,
        reviewCount: 1890,
        isFavorite: false,
        lastUpdated: '2025-08-30T02:45:00Z'
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
      console.log(`${product.isFavorite ? 'Added to' : 'Removed from'} favorites: ${product.name}`)
    }

    const shareProduct = (product) => {
      console.log(`Sharing product: ${product.name}`)
      if (navigator.share) {
        navigator.share({
          title: product.name,
          text: `Check out this ${product.category.toLowerCase()} product: ${product.name} - ${product.price}`,
          url: window.location.href
        })
      } else {
        const shareText = `Check out this product: ${product.name} - ${product.price}`
        navigator.clipboard.writeText(shareText)
        alert('Product link copied to clipboard!')
      }
    }

    const goToPage = (page) => {
      currentPage.value = page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const loadMoreProducts = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    watch([selectedCategory, searchQuery], () => {
      currentPage.value = 1
    })

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
      goToPage,
      loadMoreProducts
    }
  }
}
</script>

<style>
/* Fixed CSS following ProfileView.vue pattern */

/* Override main.css container restrictions for CategoryView */
.category-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Force full width on all screen sizes */
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

html, body {
  overflow-y: auto !important;
  height: auto !important;
}

.page-container,
.app-main {
  overflow-y: visible !important;
  height: auto !important;
}

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

/* Categories Grid - Consistent Mobile Layout */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

/* Keep mobile layout consistent across all screen sizes */

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


.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 0.25rem;
  transition: all 0.2s;
  border-radius: 8px;
  min-width: 0;
  flex: 1;
}

.nav-item:hover {
  background: rgba(79, 195, 247, 0.1);
  transform: translateY(-1px);
}

.nav-item.active {
  background: rgba(79, 195, 247, 0.15);
}

.nav-item.active .nav-icon,
.nav-item.active .nav-label {
  color: #4FC3F7;
}

.nav-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
  color: #6B7280;
  transition: all 0.2s;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  text-align: center;
  transition: color 0.2s;
  white-space: nowrap;
}

/* Tablet Responsive - Keep Mobile Layout, Override main.css */
@media (min-width: 768px) {
  .category-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  /* Override main.css constraints completely */
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

  /* Keep mobile spacing and sizing */
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

  .search-container {
    padding: 1rem 1.25rem;
  }

  /* Keep exact mobile layout */
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .category-card {
    min-height: 110px;
    padding: 0.875rem 0.625rem;
  }

  .category-icon {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .category-name {
    font-size: 0.8rem;
  }

  .category-count-text {
    font-size: 0.7rem;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .product-card {
    padding: 1rem;
  }

  .product-image {
    height: 100px;
  }

  .product-name {
    font-size: 0.875rem;
  }

  .product-price {
    font-size: 0.875rem;
  }
}

/* Desktop Responsive - Keep Mobile Layout, Override main.css */
@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .category-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: auto !important;
  }
  
  /* Override main.css constraints completely */
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

  /* Use exact mobile spacing */
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

  .search-container {
    padding: 1rem 1.25rem;
  }

  /* Keep exact mobile 2-column layout */
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  /* Keep exact mobile category card sizing */
  .category-card {
    min-height: 110px;
    padding: 0.875rem 0.625rem;
  }

  .category-icon {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .category-name {
    font-size: 0.8rem;
  }

  .category-count-text {
    font-size: 0.7rem;
  }

  /* Keep exact mobile 2-column products layout */
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .product-card {
    padding: 1rem;
  }

  .product-image {
    height: 100px;
  }

  .product-name {
    font-size: 0.875rem;
  }

  .product-price {
    font-size: 0.875rem;
  }
}
</style>