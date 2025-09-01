<template>
  <div class="campaign-view dashboard-page">
    <HustlHeader :isDashboard="true" />

    <!-- Coin Points Section -->
    <div class="dashboard-section points-section">
      <div class="points-card">
        <div class="coin-icon">🪙</div>
        <div class="points-info">
          <span class="points-value">{{ userPoints }}</span>
          <span class="points-label">Coin Points</span>
        </div>
      </div>
    </div>

    <!-- Search Section -->
    <div class="dashboard-section search-section">
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          class="search-input"
          placeholder="Search campaigns..."
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
      <p class="loading-text">Loading campaigns...</p>
    </div>

    <!-- Active Campaigns Section -->
    <div v-else class="dashboard-section">
      <div class="section-header">
        <h3 class="section-title">Active Campaigns</h3>
        <span class="campaigns-count">{{ filteredCampaigns.length }} campaigns</span>
      </div>
      <div v-if="filteredCampaigns.length > 0" class="campaigns-list">
        <div 
          v-for="campaign in filteredCampaigns" 
          :key="campaign.id" 
          class="campaign-card"
          @click="viewCampaignDetails(campaign)"
        >
          <div class="campaign-image">
            <img :src="getCampaignImageUrl(campaign.image)" :alt="campaign.name" />
            <div class="campaign-status" :class="campaign.status">
              <span class="status-dot"></span>
              <span class="status-text">{{ formatStatus(campaign.status) }}</span>
            </div>
          </div>
          <div class="campaign-info">
            <h4 class="campaign-title">{{ campaign.name }}</h4>
            <p class="campaign-desc">{{ campaign.description }}</p>
            <div class="campaign-details">
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">{{ formatDateRange(campaign.startDate, campaign.endDate) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Products:</span>
                <span class="detail-value">{{ campaign.productCount || 0 }} items</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value status" :class="campaign.status">{{ formatStatus(campaign.status) }}</span>
              </div>
            </div>
          </div>
          <div class="campaign-arrow">
            <span>→</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📋</div>
        <h4 class="empty-title">No campaigns found</h4>
        <p class="empty-message">
          {{ searchQuery ? 'Try different keywords' : 'No active campaigns available' }}
        </p>
      </div>

      <!-- Error Messages -->
      <div v-if="error" class="error-section">
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ error }}</span>
          <button class="retry-btn" @click="loadCampaigns">Retry</button>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation Component -->
    <BottomNavigation />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import apiService from '../services/api'

export default {
  name: 'CampaignView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const searchQuery = ref('')
    
    // State management
    const isLoading = ref(true)
    const error = ref('')
    const campaigns = ref([])
    const userPointsData = ref(null)

    // User points from API or store
    const userPoints = computed(() => 
      userPointsData.value?.currentBalance || authStore.userPoints || 0
    )

    const filteredCampaigns = computed(() => {
      if (!searchQuery.value) return campaigns.value
      
      const query = searchQuery.value.toLowerCase()
      return campaigns.value.filter(campaign =>
        campaign.name.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query)
      )
    })

    // Utility methods
    const getCampaignImageUrl = (imagePath) => {
      return apiService.constructor.getImageUrl(imagePath, 'campaigns')
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

    const formatDateRange = (startDate, endDate) => {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const options = { day: 'numeric', month: 'short' }
      
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`
    }

    // API loading methods
    const loadCampaigns = async () => {
      isLoading.value = true
      error.value = ''

      try {
        // Load campaigns and user points in parallel
        const [campaignsResult, pointsResult] = await Promise.allSettled([
          apiService.getActiveCampaigns(),
          apiService.getMyPoints()
        ])

        // Handle campaigns data
        if (campaignsResult.status === 'fulfilled' && campaignsResult.value.success) {
          campaigns.value = campaignsResult.value.data
        } else {
          console.warn('Failed to load campaigns:', campaignsResult.reason)
          error.value = 'Failed to load campaigns'
          campaigns.value = []
        }

        // Handle points data
        if (pointsResult.status === 'fulfilled' && pointsResult.value.success) {
          userPointsData.value = pointsResult.value.data
        }

      } catch (err) {
        console.error('Error loading campaigns:', err)
        error.value = 'Failed to load campaigns. Please try again.'
        campaigns.value = []
      } finally {
        isLoading.value = false
      }
    }

    // Event handlers
    const handleSearch = () => {
      console.log('Searching for:', searchQuery.value)
    }

    const clearSearch = () => {
      searchQuery.value = ''
    }

    const viewCampaignDetails = async (campaign) => {
      try {
        isLoading.value = true
        const response = await apiService.getCampaignById(campaign.id)
        
        if (response.success) {
          sessionStorage.setItem('selectedCampaign', JSON.stringify(response.data))
          router.push(`/campaign/${campaign.id}`)
        } else {
          error.value = 'Failed to load campaign details'
        }
      } catch (err) {
        console.error('Error loading campaign details:', err)
        error.value = 'Failed to load campaign details'
      } finally {
        isLoading.value = false
      }
    }

    // Initialize data on mount
    onMounted(() => {
      loadCampaigns()
    })

    return {
      userPoints,
      searchQuery,
      isLoading,
      error,
      campaigns,
      filteredCampaigns,
      handleSearch,
      clearSearch,
      formatDateRange,
      formatStatus,
      viewCampaignDetails,
      loadCampaigns,
      getCampaignImageUrl
    }
  }
}
</script>

<style scoped>
/* Override main.css container restrictions for CampaignView */
.campaign-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Force full width on all screen sizes */
.campaign-view .page-container {
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

.campaign-view .app-main {
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
  margin-top: 1rem;
  border-radius: 12px;
  padding: 1rem;
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

/* Points Section */
.points-section {
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.points-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.25);
  color: white;
}

.coin-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.points-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.points-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1;
}

.points-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
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

.campaigns-count {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Campaigns List */
.campaigns-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.campaign-card {
  display: flex;
  background: #F8FAFC;
  border-radius: 16px;
  padding: 1rem;
  border: 2px solid #E2E8F0;
  transition: all 0.2s;
  cursor: pointer;
  align-items: center;
  gap: 1rem;
}

.campaign-card:hover {
  background: #F1F5F9;
  border-color: #4FC3F7;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.15);
}

.campaign-image {
  position: relative;
  width: 80px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  background: #E5E7EB;
  flex-shrink: 0;
}

.campaign-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.campaign-status {
  position: absolute;
  top: 4px;
  left: 4px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: 8px;
  font-size: 0.625rem;
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
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.campaign-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.campaign-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin-bottom: 0.375rem;
  line-height: 1.3;
}

.campaign-desc {
  font-size: 0.8rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.campaign-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.detail-value {
  font-size: 0.75rem;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
}

.detail-value.status.active {
  color: #059669;
}

.detail-value.status.upcoming {
  color: #D97706;
}

.detail-value.status.ended {
  color: #DC2626;
}

.campaign-arrow {
  color: #6B7280;
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: all 0.2s;
}

.campaign-card:hover .campaign-arrow {
  color: #4FC3F7;
  transform: translateX(4px);
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

/* Responsive Design */
@media (min-width: 768px) {
  .campaign-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .campaign-view .page-container {
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

  .campaign-view .app-main {
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

  .campaign-image {
    width: 100px;
    height: 75px;
  }

  .campaign-title {
    font-size: 1rem;
  }

  .campaign-desc {
    font-size: 0.875rem;
  }
}

@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .campaign-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: auto !important;
  }
  
  .campaign-view .page-container {
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
  
  .campaign-view .app-main {
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