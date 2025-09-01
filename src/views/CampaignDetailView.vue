<template>
  <div class="campaign-detail-view dashboard-page">
    <HustlHeader :isDashboard="true" />
    <!-- Header with Back Button -->
    <div class="dashboard-section header-section">
      <div class="header-container">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span class="back-text">Back</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="dashboard-section loading-section">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading campaign details...</p>
    </div>

    <!-- Campaign Information Section - Mobile-First Layout -->
    <div v-else-if="campaign" class="dashboard-section campaign-info-section">
      <!-- Campaign Image -->
      <div class="campaign-image-container">
        <div class="campaign-image">
          <img :src="getCampaignImageUrl(campaign.image)" :alt="campaign.name" />
          <div class="campaign-status" :class="campaign.status">
            <span class="status-dot"></span>
            <span class="status-text">{{ formatStatus(campaign.status) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Campaign Details -->
      <div class="campaign-details">
        <h1 class="campaign-title">{{ campaign.name }}</h1>
        
        <div class="campaign-dates">
          <div class="date-item">
            <span class="date-label">Start Date:</span>
            <span class="date-value">{{ formatDate(campaign.startDate) }}</span>
          </div>
          <div class="date-item">
            <span class="date-label">End Date:</span>
            <span class="date-value">{{ formatDate(campaign.endDate) }}</span>
          </div>
        </div>
        
        <div class="campaign-reward">
          <span class="reward-icon">🎁</span>
          <span class="reward-text">{{ getStatusMessage(campaign.status) }}</span>
        </div>
      </div>
      
      <!-- Campaign Description -->
      <div class="campaign-description">
        <h3 class="description-title">Campaign Description</h3>
        <p class="description-text">{{ campaign.description }}</p>
      </div>
    </div>

    <!-- Product List Section - Mobile-First Grid -->
    <div v-if="campaign && campaign.products && campaign.products.length > 0" class="dashboard-section product-list-section">
      <div class="section-header">
        <h3 class="section-title">Product List</h3>
        <span class="product-count">{{ campaign.products.length }} products</span>
      </div>
      
      <div class="products-grid">
        <div 
          v-for="product in campaign.products" 
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
            <div class="product-pricing">
              <div class="current-price">{{ product.formattedPrice || formatPrice(product.price) }}</div>
            </div>
            <div class="product-rating">
              <span class="rating-stars">{{ getStarRating(4.5) }}</span>
              <span class="rating-count">({{ product.viewCount || 0 }})</span>
            </div>
            <div class="product-actions">
              <span class="earn-coins">🪙 Earn {{ product.points }} Coins</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Products Message -->
    <div v-else-if="campaign && campaign.productCount === 0" class="dashboard-section no-products-section">
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h4 class="empty-title">No products yet</h4>
        <p class="empty-message">This campaign doesn't have any products added yet.</p>
      </div>
    </div>

    <!-- Join Campaign Button -->
    <div v-if="campaign && campaign.status === 'active'" class="dashboard-section join-section">
      <button class="join-campaign-btn" @click="joinCampaign">
        <span class="join-icon">🚀</span>
        <span class="join-text">Join Campaign</span>
      </button>
    </div>

    <!-- Error Section -->
    <div v-if="error" class="dashboard-section error-section">
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error }}</span>
        <button class="retry-btn" @click="loadCampaignData">Retry</button>
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
import apiService from '../services/api'
import HustlHeader from '../components/HustlHeader.vue'

export default {
  name: 'CampaignDetailView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const campaign = ref(null)
    const isLoading = ref(true)
    const error = ref('')

    // Methods
    const getCampaignImageUrl = (imagePath) => {
      return apiService.constructor.getImageUrl(imagePath, 'campaigns')
    }

    const getProductImageUrl = (imagePath) => {
      return apiService.constructor.getImageUrl(imagePath, 'products')
    }

    const formatPrice = (price) => {
      return apiService.constructor.formatPrice(price)
    }

    const formatStatus = (status) => {
      const statusMap = {
        'active': 'Active',
        'upcoming': 'Upcoming',
        'ended': 'Ended',
        'draft': 'Draft'
      }
      return statusMap[status] || status
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const getStatusMessage = (status) => {
      const messages = {
        'active': 'Campaign is currently active - Join now!',
        'upcoming': 'Campaign starting soon - Stay tuned!',
        'ended': 'Campaign has ended',
        'draft': 'Campaign in preparation'
      }
      return messages[status] || 'Campaign available'
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

    // Load campaign data
    const loadCampaignData = async () => {
      isLoading.value = true
      error.value = ''

      try {
        // First check if we have campaign data in sessionStorage
        const storedCampaign = sessionStorage.getItem('selectedCampaign')
        if (storedCampaign) {
          try {
            campaign.value = JSON.parse(storedCampaign)
            isLoading.value = false
            return
          } catch (parseError) {
            console.warn('Error parsing stored campaign data:', parseError)
          }
        }

        // If no stored data, load from API using route parameter
        const campaignId = route.params.id
        if (campaignId) {
          const response = await apiService.getCampaignById(campaignId)
          
          if (response.success) {
            campaign.value = response.data
          } else {
            error.value = response.message || 'Failed to load campaign details'
          }
        } else {
          error.value = 'Campaign ID not provided'
        }

      } catch (err) {
        console.error('Error loading campaign:', err)
        error.value = 'Failed to load campaign details. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    const goBack = () => {
      router.go(-1)
    }

    const viewProductDetails = (product) => {
      // Store product details for next view
      sessionStorage.setItem('selectedProduct', JSON.stringify(product))
      router.push(`/product/${product.id}`)
    }

    const joinCampaign = () => {
      // Show success message or navigate to join confirmation
      if (campaign.value) {
        alert(`Successfully joined "${campaign.value.name}" campaign!`)
        console.log('Joined campaign:', campaign.value.name)
      }
    }

    // Initialize on mount
    onMounted(() => {
      loadCampaignData()
    })

    return {
      campaign,
      isLoading,
      error,
      goBack,
      formatDate,
      formatStatus,
      getStatusMessage,
      getStarRating,
      viewProductDetails,
      joinCampaign,
      loadCampaignData,
      getCampaignImageUrl,
      getProductImageUrl,
      formatPrice
    }
  }
}
</script>

<style scoped>
/* Mobile-First Campaign Detail View */
.campaign-detail-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 120px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Force full width on all screen sizes - maintain mobile layout */
.campaign-detail-view .page-container {
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

.campaign-detail-view .app-main {
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

/* Campaign Info Section - Mobile-First Layout */
.campaign-info-section {
  padding: 1.5rem 1.25rem;
}

.campaign-image-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.campaign-image {
  position: relative;
  width: 100%;
  max-width: 350px;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  background: #E5E7EB;
}

.campaign-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.campaign-status {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
  backdrop-filter: blur(10px);
}

.campaign-status.active {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.campaign-status.upcoming {
  background: rgba(245, 158, 11, 0.9);
  color: white;
}

.campaign-status.ended {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

/* Campaign Details - Mobile-First Layout */
.campaign-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.campaign-title {
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

.campaign-dates {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.date-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-label {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.date-value {
  font-size: 0.875rem;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
}

.campaign-reward {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(79, 195, 247, 0.1);
  border-radius: 12px;
  border: 2px solid rgba(79, 195, 247, 0.2);
}

.reward-icon {
  font-size: 1.5rem;
}

.reward-text {
  font-size: 1rem;
  color: #4FC3F7;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Campaign Description */
.campaign-description {
  border-top: 1px solid #E5E7EB;
  padding-top: 1.5rem;
}

.description-title {
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
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

/* Product List Section - Mobile-First Grid */
.product-list-section {
  padding: 1.25rem;
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

.product-count {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Products Grid - Mobile-First 2-Column Layout */
.products-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.product-card:hover {
  background: #F1F5F9;
  border-color: #4FC3F7;
  transform: translateY(-2px);
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
  top: 4px;
  left: 4px;
  background: #4FC3F7;
  color: white;
  font-size: 0.625rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 600;
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
  flex-direction: column;
  gap: 0.25rem;
}

.current-price {
  font-size: 0.875rem;
  color: #059669;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
}

.product-rating {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rating-stars {
  color: #FFA500;
  font-size: 0.75rem;
  line-height: 1;
}

.rating-count {
  font-size: 0.7rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.product-actions {
  margin-top: auto;
}

.earn-coins {
  font-size: 0.75rem;
  color: #F59E0B;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
}

/* Empty State for No Products */
.no-products-section {
  padding: 2rem 1.25rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
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
}

/* Join Section */
.join-section {
  padding: 1rem 1.25rem;
}

.join-campaign-btn {
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
}

.join-campaign-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.join-icon {
  font-size: 1.25rem;
}

/* Responsive Design - MAINTAIN MOBILE LAYOUT */
@media (min-width: 768px) {
  .campaign-detail-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }

  /* Keep mobile layout structure - DO NOT change to row layout */
  .campaign-image {
    max-width: 400px;
    height: 250px;
  }

  .campaign-title {
    font-size: 1.5rem;
  }

  /* Keep mobile grid layout */
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .product-card {
    padding: 1.25rem;
  }

  .product-image {
    height: 120px;
  }
}

@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .campaign-detail-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: auto !important;
  }
  
  .campaign-detail-view .page-container {
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
  
  .campaign-detail-view .app-main {
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
  .campaign-image {
    max-width: 450px;
    height: 280px;
  }

  .campaign-title {
    font-size: 1.75rem;
  }

  /* Keep mobile grid for consistency */
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>