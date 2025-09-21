<template>
  <div class="wishlist-view">
    <HustlHeader :isDashboard="true" />

    <!-- Header with Back Button -->
    <div class="header-section">
      <div class="header-container">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span class="back-text">Back</span>
        </button>
        <h3 class="page-title">My Wishlist</h3>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="dashboard-section stats-section">
      <div class="stats-card">
        <div class="stat-item">
          <span class="stat-icon">💖</span>
          <div class="stat-info">
            <span class="stat-value">{{ wishlistItems.length }}</span>
            <span class="stat-label">Wishlist Items</span>
          </div>
        </div>
        <button v-if="wishlistItems.length > 0" class="clear-all-btn" @click="showClearConfirm = true">
          <span class="clear-icon">🗑️</span>
          <span class="clear-text">Clear All</span>
        </button>
      </div>
    </div>

    <!-- Wishlist Items -->
    <div v-if="wishlistItems.length > 0" class="dashboard-section wishlist-section">
      <div class="section-header">
        <h3 class="section-title">Your Favorite Products</h3>
        <div class="view-options">
          <button 
            class="view-toggle"
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            <span class="view-icon">⊞</span>
          </button>
          <button 
            class="view-toggle"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            <span class="view-icon">☰</span>
          </button>
        </div>
      </div>
      
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="wishlist-grid">
        <div 
          v-for="item in paginatedItems" 
          :key="item.id" 
          class="wishlist-item-grid"
        >
          <div class="product-image" @click="viewProductDetails(item)">
            <img :src="getProductImageUrl(item.image)" :alt="item.title" />
            <button class="remove-btn" @click.stop="removeFromWishlist(item.id)">
              <span class="remove-icon">❌</span>
            </button>
          </div>
          <div class="product-info">
            <h4 class="product-name" @click="viewProductDetails(item)">{{ item.title }}</h4>
            <div class="product-price">{{ item.price }}</div>
            <div class="product-actions">
              <span class="earn-coins">🪙 {{ item.points }} Coins</span>
              <button class="share-btn" @click="shareProduct(item)">
                <span class="share-icon">🔗</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="wishlist-list">
        <div 
          v-for="item in paginatedItems" 
          :key="item.id" 
          class="wishlist-item-list"
        >
          <div class="product-image-small" @click="viewProductDetails(item)">
            <img :src="getProductImageUrl(item.image)" :alt="item.title" />
          </div>
          <div class="product-info-list">
            <h4 class="product-name" @click="viewProductDetails(item)">{{ item.title }}</h4>
            <div class="product-price">{{ item.price }}</div>
            <div class="product-meta">
              <span class="added-date">Added {{ formatDate(item.dateAdded) }}</span>
              <span class="earn-coins">🪙 {{ item.points }} Coins</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="share-btn-small" @click="shareProduct(item)">
              <span class="share-icon">🔗</span>
            </button>
            <button class="remove-btn-small" @click="removeFromWishlist(item.id)">
              <span class="remove-icon">🗑️</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="page-btn prev-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <span class="page-icon">⬅️</span>
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            class="page-btn"
            :class="{ active: currentPage === page }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="page-btn next-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <span class="page-icon">➡️</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="dashboard-section empty-section">
      <div class="empty-state">
        <div class="empty-icon">💔</div>
        <h4 class="empty-title">Your wishlist is empty</h4>
        <p class="empty-message">Start adding products you love to see them here!</p>
        <button class="browse-btn" @click="goToBrowse">
          <span class="browse-icon">🛍️</span>
          <span class="browse-text">Browse Products</span>
        </button>
      </div>
    </div>

    <!-- Clear Confirmation Modal -->
    <div v-if="showClearConfirm" class="modal-overlay" @click="showClearConfirm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Clear Wishlist</h3>
          <button class="modal-close" @click="showClearConfirm = false">
            <span class="close-icon">✕</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-text">Are you sure you want to remove all items from your wishlist? This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showClearConfirm = false">Cancel</button>
          <button class="confirm-btn" @click="clearAllWishlist">Clear All</button>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import apiService from '../services/api'

export default {
  name: 'WishlistView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    
    // State management
    const wishlistItems = ref([])
    const viewMode = ref('grid') // 'grid' or 'list'
    const currentPage = ref(1)
    const itemsPerPage = 12
    const showClearConfirm = ref(false)

    // Computed properties
    const totalPages = computed(() => 
      Math.ceil(wishlistItems.value.length / itemsPerPage)
    )

    const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return wishlistItems.value.slice(start, end)
    })

    const visiblePages = computed(() => {
      const pages = []
      const maxVisible = 5
      const half = Math.floor(maxVisible / 2)
      
      let start = Math.max(1, currentPage.value - half)
      let end = Math.min(totalPages.value, start + maxVisible - 1)
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })

    // Helper methods
    const getProductImageUrl = (imagePath) => {
      return apiService.constructor.getImageUrl(imagePath, 'products')
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Recently'
      
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return 'Today'
      if (diffDays === 2) return 'Yesterday'
      if (diffDays <= 7) return `${diffDays} days ago`
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }

    // Wishlist management methods
    const loadWishlist = () => {
      try {
        const stored = localStorage.getItem('favoriteProducts')
        if (stored) {
          const parsedItems = JSON.parse(stored)
          // Add dateAdded if not present
          wishlistItems.value = parsedItems.map(item => ({
            ...item,
            dateAdded: item.dateAdded || new Date().toISOString()
          }))
        }
      } catch (error) {
        console.error('Error loading wishlist:', error)
        wishlistItems.value = []
      }
    }

    const removeFromWishlist = (productId) => {
      wishlistItems.value = wishlistItems.value.filter(item => item.id !== productId)
      localStorage.setItem('favoriteProducts', JSON.stringify(wishlistItems.value))
      
      // Adjust current page if needed
      if (paginatedItems.value.length === 0 && currentPage.value > 1) {
        currentPage.value = Math.max(1, currentPage.value - 1)
      }
    }

    const clearAllWishlist = () => {
      wishlistItems.value = []
      localStorage.removeItem('favoriteProducts')
      showClearConfirm.value = false
      currentPage.value = 1
    }

    // Navigation methods
    const viewProductDetails = (product) => {
      router.push(`/product/${product.id}`)
    }

    const shareProduct = (product) => {
      const shareData = {
        title: product.title,
        text: `Check out this product: ${product.title} - ${product.price}. Earn ${product.points} coins!`,
        url: `${window.location.origin}/product/${product.id}`
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

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const goBack = () => {
      router.go(-1)
    }

    const goToBrowse = () => {
      router.push('/category')
    }

    // Initialize on mount
    onMounted(() => {
      loadWishlist()
    })

    return {
      wishlistItems,
      viewMode,
      currentPage,
      totalPages,
      paginatedItems,
      visiblePages,
      showClearConfirm,
      getProductImageUrl,
      formatDate,
      removeFromWishlist,
      clearAllWishlist,
      viewProductDetails,
      shareProduct,
      goToPage,
      goBack,
      goToBrowse
    }
  }
}
</script>

<style scoped>
/* Reset and Base Styles - Following BankAccountView pattern */
* {
  box-sizing: border-box;
}

/* Wishlist View Main Container - Same pattern as BankAccountView */
.wishlist-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px;
  width: 100%;
  overflow-x: hidden;
  position: relative;
}

/* Dashboard sections - Same as BankAccountView with proper margins */
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

/* Header Section - Same as BankAccountView search container style */
.header-section {
  position: relative;
  padding: 1rem;
  background: transparent;
  margin: 1rem 1rem 1.5rem 1rem;
  box-shadow: none;
  border: none;
  width: auto;
  max-width: none;
  box-sizing: border-box;
}

.header-container {
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
  flex-shrink: 0;
}

.back-btn:hover {
  background: rgba(79, 195, 247, 0.1);
  transform: translateX(-2px);
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  flex: 1;
  margin: 0;
}

/* Stats Section */
.stats-section {
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.stats-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 1.25rem;
  color: white;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.25);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.clear-all-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
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

.view-options {
  display: flex;
  gap: 0.25rem;
  background: #F1F5F9;
  border-radius: 8px;
  padding: 0.25rem;
}

.view-toggle {
  background: transparent;
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.view-toggle.active {
  background: #4FC3F7;
  color: white;
}

/* Grid View - Mobile first 2 columns */
.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.wishlist-item-grid {
  display: flex;
  flex-direction: column;
  background: #F8FAFC;
  border-radius: 12px;
  padding: 0.75rem;
  border: 2px solid #E2E8F0;
  transition: all 0.2s;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.wishlist-item-grid:hover {
  transform: translateY(-2px);
  border-color: #4FC3F7;
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.15);
}

.product-image {
  position: relative;
  width: 100%;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  background: #E5E7EB;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.65rem;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.9);
  transform: scale(1.1);
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.product-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.2;
  margin: 0;
  cursor: pointer;
  transition: color 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-name:hover {
  color: #4FC3F7;
}

.product-price {
  font-size: 0.75rem;
  color: #059669;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  gap: 0.25rem;
}

.earn-coins {
  font-size: 0.6rem;
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
  width: 20px;
  height: 20px;
  font-size: 0.625rem;
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

/* List View - Similar to accounts list */
.wishlist-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.wishlist-item-list {
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

.wishlist-item-list:hover {
  transform: translateY(-2px);
  border-color: #4FC3F7;
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.15);
}

.product-image-small {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  background: #E5E7EB;
  flex-shrink: 0;
  cursor: pointer;
  margin-right: 0.5rem;
}

.product-image-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.25rem;
}

.added-date {
  font-size: 0.625rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-shrink: 0;
}

.share-btn-small,
.remove-btn-small {
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.625rem;
  transition: all 0.2s;
}

.share-btn-small:hover {
  border-color: #4FC3F7;
  background: rgba(79, 195, 247, 0.1);
}

.remove-btn-small:hover {
  border-color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
}

/* Empty State */
.empty-section {
  padding: 3rem 1.25rem;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6B7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
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
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.browse-btn {
  background: #4FC3F7;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.25);
  margin: 0 auto;
}

.browse-btn:hover {
  background: #29B6F6;
  transform: translateY(-1px);
}

/* Pagination */
.pagination {
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  border-color: #4FC3F7;
  color: #4FC3F7;
  transform: translateY(-1px);
}

.page-btn.active {
  background: #4FC3F7;
  border-color: #4FC3F7;
  color: white;
  box-shadow: 0 2px 6px rgba(79, 195, 247, 0.3);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.prev-btn,
.next-btn {
  padding: 0.5rem;
  min-width: 36px;
}

/* Modal Styles - Single container approach */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  padding: 2rem 1rem;
  box-sizing: border-box;
  backdrop-filter: blur(4px);
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  min-height: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  margin: auto 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #6B7280;
  padding: 0.25rem;
}

.modal-body {
  padding: 1.5rem;
  overflow: visible;
}

.modal-text {
  font-size: 0.875rem;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.5;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #E5E7EB;
  box-sizing: border-box;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
}

.cancel-btn {
  background: white;
  color: #374151;
  border: 2px solid #E5E7EB;
}

.cancel-btn:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.confirm-btn {
  background: #EF4444;
  color: white;
  border: 2px solid #EF4444;
}

.confirm-btn:hover {
  background: #DC2626;
  border-color: #DC2626;
}

/* Fixed Footer Styles - EXACT COPY from category and bank account view */
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
@media (max-width: 640px) {
  .dashboard-section {
    margin: 0 0.75rem 1rem 0.75rem;
    padding: 1rem;
  }

  .header-section {
    margin: 0.75rem 0.75rem 1rem 0.75rem;
    padding: 0.875rem 1rem;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .dashboard-section {
    margin: 0 1.5rem 1.5rem 1.5rem;
    padding: 1.125rem;
  }

  .header-section {
    margin: 1rem 1.5rem 1.5rem 1.5rem;
  }
}

@media (min-width: 769px) {
  .wishlist-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    padding-bottom: 100px;
  }
  
  .page-container,
  .app-main {
    background: transparent !important;
  }

  .dashboard-section {
    margin: 0 2rem 1.5rem 2rem;
    padding: 1.5rem;
  }

  .header-section {
    margin: 1rem 2rem 1.5rem 2rem;
  }

  .wishlist-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .product-image {
    height: 80px;
  }

  .product-name {
    font-size: 0.875rem;
  }

  .product-price {
    font-size: 0.8125rem;
  }
}

@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .wishlist-view {
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

  .dashboard-section {
    margin: 0 3rem 2rem 3rem;
    padding: 1.75rem;
  }

  .header-section {
    margin: 1rem 3rem 2rem 3rem;
  }

  .wishlist-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }

  .product-image {
    height: 85px;
  }

  .product-name {
    font-size: 0.9375rem;
  }

  .product-price {
    font-size: 0.875rem;
  }
}

@media (min-width: 1200px) {
  .dashboard-section {
    margin: 0 4rem 2.5rem 4rem;
    padding: 2rem;
  }

  .header-section {
    margin: 1rem 4rem 2.5rem 4rem;
  }

  .wishlist-view {
    padding-bottom: 100px;
  }

  .wishlist-grid {
    gap: 1.5rem;
  }

  .product-image {
    height: 90px;
  }

  .product-name {
    font-size: 1rem;
  }

  .product-price {
    font-size: 0.9375rem;
  }

  /* Desktop modal improvements */
  .modal-content {
    max-width: 600px;
  }

  .modal-body {
    padding: 2rem;
  }

  .modal-header {
    padding: 2rem 2rem 1rem 2rem;
  }
}

/* Prevent content overflow on all screen sizes */
.wishlist-view,
.wishlist-view * {
  max-width: 100%;
  box-sizing: border-box;
}

/* Last section margin fix */
.dashboard-section:last-of-type {
  margin-bottom: 2rem;
}
</style>