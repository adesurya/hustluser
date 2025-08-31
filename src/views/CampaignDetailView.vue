<template>
  <div class="campaign-detail-view dashboard-page">
    <!-- Header with Back Button -->
    <div class="dashboard-section header-section">
      <div class="header-container">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span class="back-text">Back</span>
        </button>
      </div>
    </div>

    <!-- Campaign Information Section -->
    <div class="dashboard-section campaign-info-section" v-if="campaign">
      <div class="campaign-header">
        <div class="campaign-image">
          <img :src="campaign.image" :alt="campaign.title" />
          <div class="campaign-status active">
            <span class="status-dot"></span>
            <span class="status-text">Active</span>
          </div>
        </div>
        <div class="campaign-meta">
          <h1 class="campaign-title">{{ campaign.title }}</h1>
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
            <span class="reward-text">{{ campaign.reward }}</span>
          </div>
        </div>
      </div>
      
      <div class="campaign-description">
        <h3 class="description-title">Campaign Description</h3>
        <p class="description-text">{{ campaign.description }}</p>
      </div>
    </div>

    <!-- Product List Section -->
    <div class="dashboard-section product-list-section" v-if="campaign">
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
            <img :src="product.image" :alt="product.name" />
            <div class="product-badge">{{ product.category }}</div>
            <div v-if="product.discount" class="discount-badge">{{ product.discount }} OFF</div>
          </div>
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-pricing">
              <div class="current-price">{{ product.price }}</div>
              <div v-if="product.originalPrice" class="original-price">{{ product.originalPrice }}</div>
            </div>
            <div class="product-rating">
              <span class="rating-stars">{{ getStarRating(product.rating) }}</span>
              <span class="rating-count">({{ product.reviewCount }})</span>
            </div>
            <div class="product-actions">
              <span class="earn-coins">🪙 Earn {{ product.coins }} Coins</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Join Campaign Button -->
    <div class="dashboard-section join-section" v-if="campaign">
      <button class="join-campaign-btn" @click="joinCampaign">
        <span class="join-icon">🚀</span>
        <span class="join-text">Join Campaign</span>
      </button>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '../components/BottomNavigation.vue'

export default {
  name: 'CampaignDetailView',
  components: {
    BottomNavigation
  },
  setup() {
    const router = useRouter()
    const campaign = ref(null)

    onMounted(() => {
      // Get campaign data from sessionStorage
      const storedCampaign = sessionStorage.getItem('selectedCampaign')
      if (storedCampaign) {
        try {
          campaign.value = JSON.parse(storedCampaign)
        } catch (err) {
          console.error('Error parsing campaign data:', err)
          router.push('/campaign')
        }
      } else {
        // If no campaign data, redirect back
        router.push('/campaign')
      }
    })

    const goBack = () => {
      router.go(-1)
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
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

    const viewProductDetails = (product) => {
      // Store product details for next view
      sessionStorage.setItem('selectedProduct', JSON.stringify(product))
      router.push(`/product/${product.id}`)
    }

    const joinCampaign = () => {
      // Show success message or navigate to join confirmation
      alert('Successfully joined the campaign!')
      console.log('Joined campaign:', campaign.value.title)
    }

    return {
      campaign,
      goBack,
      formatDate,
      getStarRating,
      viewProductDetails,
      joinCampaign
    }
  }
}
</script>

<style scoped>
/* Campaign Detail View */
.campaign-detail-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Force full width on all screen sizes */
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
  width: calc(100% - 2rem);
  max-width: calc(100% - 2rem);
  box-sizing: border-box;
  overflow: hidden;
  word-wrap: break-word;
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

/* Campaign Info Section */
.campaign-info-section {
  padding: 1.5rem 1.25rem;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.campaign-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
  overflow: hidden;
}

.campaign-image {
  position: relative;
  width: 100%;
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

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

.campaign-meta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  overflow: hidden;
}

.campaign-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.2;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
}

.campaign-dates {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
}

.campaign-description {
  border-top: 1px solid #E5E7EB;
  padding-top: 1.5rem;
  width: 100%;
  overflow: hidden;
}

.description-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin-bottom: 0.75rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
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
  white-space: normal;
  max-width: 100%;
}

/* Product List Section */
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

.products-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.product-card {
  display: flex;
  background: #F8FAFC;
  border-radius: 16px;
  padding: 1rem;
  border: 2px solid #E2E8F0;
  cursor: pointer;
  transition: all 0.2s;
  align-items: center;
  gap: 1rem;
}

.product-card:hover {
  background: #F1F5F9;
  border-color: #4FC3F7;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.15);
}

.product-image {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  background: #E5E7EB;
  flex-shrink: 0;
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

.discount-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #EF4444;
  color: white;
  font-size: 0.625rem;
  padding: 0.25rem 0.375rem;
  border-radius: 6px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
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
  margin: 0;
}

.product-pricing {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-price {
  font-size: 0.875rem;
  color: #059669;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
}

.original-price {
  font-size: 0.75rem;
  color: #9CA3AF;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  text-decoration: line-through;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.375rem;
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
  display: flex;
  justify-content: flex-start;
}

.earn-coins {
  font-size: 0.75rem;
  color: #F59E0B;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
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

/* Responsive Design */
@media (min-width: 768px) {
  .campaign-detail-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }

  .campaign-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.25rem;
  }

  .campaign-image {
    width: 100%;
    max-width: 100%;
    height: 250px;
    flex-shrink: 0;
  }

  .campaign-meta {
    flex: 1;
    width: 100%;
    max-width: 100%;
  }

  .campaign-title {
    font-size: 1.5rem;
  }

  .reward-text {
    font-size: 1rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .product-card {
    padding: 1.25rem;
  }

  .product-image {
    width: 100px;
    height: 100px;
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

  .campaign-header {
    flex-direction: row;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .campaign-image {
    width: 300px;
    max-width: 300px;
    height: 200px;
    flex-shrink: 0;
  }

  .campaign-meta {
    flex: 1;
    min-width: 0; /* Important for flex text wrapping */
  }

  .campaign-title {
    font-size: 1.75rem;
  }

  .reward-text {
    font-size: 1rem;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>