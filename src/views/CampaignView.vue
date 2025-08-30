<template>
  <div class="campaign-view dashboard-page">
    <!-- Main Campaign Banner Section -->
    <div class="dashboard-section banner-section">
      <div class="campaign-banner">
        <div class="banner-content">
          <div class="banner-header">
            <h2 class="banner-title">{{ mainCampaign.title }}</h2>
            <div class="campaign-status active">
              <span class="status-dot"></span>
              <span class="status-text">Active</span>
            </div>
          </div>
          <p class="banner-description">{{ mainCampaign.description }}</p>
          <div class="banner-details">
            <div class="detail-item">
              <span class="detail-icon">🎁</span>
              <span class="detail-text">{{ mainCampaign.reward }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">⏰</span>
              <span class="detail-text">{{ mainCampaign.timeLeft }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">👥</span>
              <span class="detail-text">{{ mainCampaign.participants }} participants</span>
            </div>
          </div>
          <div class="progress-section">
            <div class="progress-info">
              <span class="progress-label">Campaign Progress</span>
              <span class="progress-percentage">{{ mainCampaign.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: mainCampaign.progress + '%' }"></div>
            </div>
          </div>
          <button class="join-campaign-btn" @click="joinMainCampaign">
            <span class="btn-icon">🚀</span>
            <span class="btn-text">Join Campaign</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Available Campaigns Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h3 class="section-title">Available Campaigns</h3>
        <span class="campaigns-count">{{ availableCampaigns.length }} campaigns</span>
      </div>
      <div class="campaigns-list">
        <div 
          v-for="campaign in availableCampaigns" 
          :key="campaign.id" 
          class="campaign-card"
          @click="viewCampaignDetails(campaign)"
        >
          <div class="campaign-image">
            <img :src="campaign.image" :alt="campaign.title" />
            <div class="campaign-status" :class="campaign.status.toLowerCase().replace(' ', '-')">
              <span class="status-dot"></span>
              <span class="status-text">{{ campaign.status }}</span>
            </div>
          </div>
          <div class="campaign-info">
            <h4 class="campaign-title">{{ campaign.title }}</h4>
            <p class="campaign-desc">{{ campaign.shortDescription }}</p>
            <div class="campaign-details">
              <div class="detail-row">
                <span class="detail-label">Reward:</span>
                <span class="detail-value reward">{{ campaign.reward }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">{{ campaign.duration }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Participants:</span>
                <span class="detail-value">{{ campaign.participants }}</span>
              </div>
            </div>
            <button 
              class="campaign-action-btn" 
              :class="campaign.status.toLowerCase().replace(' ', '-')"
              @click.stop="handleCampaignAction(campaign)"
              :disabled="campaign.status === 'Ended'"
            >
              {{ getCampaignButtonText(campaign.status) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Campaign History Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h3 class="section-title">My Campaign History</h3>
        <button class="see-more-btn" @click="viewAllHistory">See All</button>
      </div>
      <div class="history-list">
        <div 
          v-for="history in campaignHistory" 
          :key="history.id" 
          class="history-item"
        >
          <div class="history-icon" :class="history.status.toLowerCase().replace(' ', '-')">
            <span>{{ getHistoryIcon(history.status) }}</span>
          </div>
          <div class="history-info">
            <h4 class="history-title">{{ history.campaignTitle }}</h4>
            <p class="history-date">{{ formatDate(history.completedDate) }}</p>
            <div class="history-reward">
              <span class="reward-icon">🪙</span>
              <span class="reward-text">{{ history.reward }}</span>
            </div>
          </div>
          <div class="history-status" :class="history.status.toLowerCase().replace(' ', '-')">
            <span class="status-dot"></span>
            <span class="status-text">{{ history.status }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State for History -->
      <div v-if="campaignHistory.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h4 class="empty-title">No Campaign History</h4>
        <p class="empty-message">Join your first campaign to see your history here!</p>
      </div>
    </div>

    <!-- Bottom Navigation Component -->
    <BottomNavigation />
  </div>
</template>

<script>
import { ref } from 'vue'
import BottomNavigation from '../components/BottomNavigation.vue'

export default {
  name: 'CampaignView',
  components: {
    BottomNavigation
  },
  setup() {

    // Main campaign banner data
    const mainCampaign = ref({
      id: 1,
      title: 'Summer Mega Sale 2024',
      description: 'Join our biggest campaign of the year! Earn double coins on all electronics purchases and get exclusive discounts up to 70% off.',
      reward: 'Up to 500 Coins + 70% Discount',
      timeLeft: '5 days left',
      participants: '12,847',
      progress: 73,
      image: '/api/placeholder/400/200'
    })

    // Available campaigns data
    const availableCampaigns = ref([
      {
        id: 2,
        title: 'Fashion Week Special',
        shortDescription: 'Get exclusive fashion deals and earn bonus coins',
        reward: '200 Coins + 40% Off',
        duration: '7 days',
        participants: '8,234',
        status: 'Active',
        image: '/api/placeholder/120/80',
        startDate: '2025-08-25',
        endDate: '2025-09-01'
      },
      {
        id: 3,
        title: 'Gaming Gear Bonanza',
        shortDescription: 'Special rewards for gaming equipment purchases',
        reward: '300 Coins + Free Shipping',
        duration: '10 days',
        participants: '5,678',
        status: 'Active',
        image: '/api/placeholder/120/80',
        startDate: '2025-08-20',
        endDate: '2025-08-30'
      },
      {
        id: 4,
        title: 'Back to School',
        shortDescription: 'Educational supplies with amazing rewards',
        reward: '150 Coins + 30% Off',
        duration: '14 days',
        participants: '3,456',
        status: 'Coming Soon',
        image: '/api/placeholder/120/80',
        startDate: '2025-09-05',
        endDate: '2025-09-19'
      },
      {
        id: 5,
        title: 'Sports Equipment Sale',
        shortDescription: 'Fitness and sports gear with bonus rewards',
        reward: '250 Coins + 35% Off',
        duration: '5 days',
        participants: '2,890',
        status: 'Coming Soon',
        image: '/api/placeholder/120/80',
        startDate: '2025-09-10',
        endDate: '2025-09-15'
      },
      {
        id: 6,
        title: 'Home Appliances Fest',
        shortDescription: 'Smart home devices with exclusive offers',
        reward: '400 Coins + 50% Off',
        duration: '7 days',
        participants: '9,123',
        status: 'Ended',
        image: '/api/placeholder/120/80',
        startDate: '2025-08-01',
        endDate: '2025-08-08'
      },
      {
        id: 7,
        title: 'Beauty & Wellness',
        shortDescription: 'Health and beauty products campaign',
        reward: '180 Coins + 25% Off',
        duration: '6 days',
        participants: '4,567',
        status: 'Ended',
        image: '/api/placeholder/120/80',
        startDate: '2025-07-15',
        endDate: '2025-07-21'
      }
    ])

    // User's campaign history
    const campaignHistory = ref([
      {
        id: 1,
        campaignTitle: 'Electronics Summer Sale',
        status: 'Completed',
        reward: '320 Coins + 45% Discount',
        completedDate: '2025-08-28T15:30:00Z',
        earnedCoins: 320
      },
      {
        id: 2,
        campaignTitle: 'Fashion Week Special',
        status: 'In Progress',
        reward: '200 Coins + 40% Off',
        completedDate: '2025-08-25T10:00:00Z',
        earnedCoins: 0
      },
      {
        id: 3,
        campaignTitle: 'Gaming Gear Bonanza',
        status: 'In Progress',
        reward: '300 Coins + Free Shipping',
        completedDate: '2025-08-20T14:20:00Z',
        earnedCoins: 150
      },
      {
        id: 4,
        campaignTitle: 'Home & Garden Sale',
        status: 'Completed',
        reward: '150 Coins + 30% Off',
        completedDate: '2025-08-15T16:45:00Z',
        earnedCoins: 150
      },
      {
        id: 5,
        campaignTitle: 'Tech Gadgets Promo',
        status: 'Failed',
        reward: '250 Coins + 35% Off',
        completedDate: '2025-08-10T12:15:00Z',
        earnedCoins: 0
      }
    ])

    // Methods
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return 'Today'
      if (diffDays === 2) return 'Yesterday'
      if (diffDays <= 7) return `${diffDays} days ago`
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    const getCampaignButtonText = (status) => {
      switch (status) {
        case 'Active': return 'Join Now'
        case 'Coming Soon': return 'Notify Me'
        case 'Ended': return 'View Results'
        default: return 'View Details'
      }
    }

    const getHistoryIcon = (status) => {
      switch (status) {
        case 'Completed': return '✅'
        case 'In Progress': return '⏳'
        case 'Failed': return '❌'
        default: return '📋'
      }
    }

    const joinMainCampaign = () => {
      console.log('Joining main campaign:', mainCampaign.value.title)
      // Implement join campaign logic
    }

    const handleCampaignAction = (campaign) => {
      console.log(`Campaign action for: ${campaign.title}, Status: ${campaign.status}`)
      
      switch (campaign.status) {
        case 'Active':
          // Join campaign logic
          console.log('Joining campaign...')
          break
        case 'Coming Soon':
          // Set notification logic
          console.log('Setting notification...')
          break
        case 'Ended':
          // View results logic
          console.log('Viewing results...')
          break
      }
    }

    const viewCampaignDetails = (campaign) => {
      console.log('Viewing campaign details:', campaign.title)
      // Navigate to campaign details page
    }

    const viewAllHistory = () => {
      console.log('Navigate to full campaign history')
      // router.push('/campaign-history')
    }

    return {
      mainCampaign,
      availableCampaigns,
      campaignHistory,
      formatDate,
      getCampaignButtonText,
      getHistoryIcon,
      joinMainCampaign,
      handleCampaignAction,
      viewCampaignDetails,
      viewAllHistory
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

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.banner-title {
  font-size: 1.375rem;
  font-weight: 800;
  margin: 0;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.2;
}

.campaign-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
}

.campaign-status.active {
  background: rgba(16, 185, 129, 0.2);
  color: #10B981;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.campaign-status.active .status-dot {
  background: #10B981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.banner-description {
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.25rem;
  opacity: 0.95;
  font-family: 'Baloo 2', sans-serif;
}

.banner-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.detail-icon {
  font-size: 0.875rem;
}

.progress-section {
  margin-bottom: 1.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.8rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  opacity: 0.9;
}

.progress-percentage {
  font-size: 0.8rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.join-campaign-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 16px;
  padding: 0.875rem 1.5rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.join-campaign-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 1.125rem;
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
  border: 1px solid #E2E8F0;
  transition: all 0.2s;
  cursor: pointer;
}

.campaign-card:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.campaign-image {
  position: relative;
  width: 80px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  background: #E5E7EB;
  flex-shrink: 0;
  margin-right: 1rem;
}

.campaign-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  margin-bottom: 0.75rem;
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

.detail-value.reward {
  color: #059669;
  font-weight: 700;
}

/* Campaign Status Badges */
.campaign-status.coming-soon {
  background: rgba(245, 158, 11, 0.2);
  color: #F59E0B;
}

.campaign-status.coming-soon .status-dot {
  background: #F59E0B;
}

.campaign-status.ended {
  background: rgba(156, 163, 175, 0.2);
  color: #6B7280;
}

.campaign-status.ended .status-dot {
  background: #6B7280;
}

/* Campaign Action Buttons */
.campaign-action-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}

.campaign-action-btn.active {
  background: #4FC3F7;
  color: white;
  box-shadow: 0 2px 6px rgba(79, 195, 247, 0.3);
}

.campaign-action-btn.active:hover {
  background: #29B6F6;
  transform: translateY(-1px);
}

.campaign-action-btn.coming-soon {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FCD34D;
}

.campaign-action-btn.coming-soon:hover {
  background: #FDE68A;
}

.campaign-action-btn.ended {
  background: #F3F4F6;
  color: #6B7280;
  cursor: not-allowed;
}

.campaign-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Campaign History */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F8FAFC;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  transition: all 0.2s;
}

.history-item:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
  transform: translateY(-1px);
}

.history-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.history-icon.completed {
  background: #D1FAE5;
  color: #065F46;
}

.history-icon.in-progress {
  background: #FEF3C7;
  color: #92400E;
}

.history-icon.failed {
  background: #FEE2E2;
  color: #991B1B;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.history-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.3;
}

.history-date {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.history-reward {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  color: #059669;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
}

.reward-icon {
  font-size: 0.75rem;
}

.history-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
  flex-shrink: 0;
}

.history-status.completed {
  background: #D1FAE5;
  color: #065F46;
}

.history-status.completed .status-dot {
  background: #10B981;
}

.history-status.in-progress {
  background: #FEF3C7;
  color: #92400E;
}

.history-status.in-progress .status-dot {
  background: #F59E0B;
  animation: pulse 2s infinite;
}

.history-status.failed {
  background: #FEE2E2;
  color: #991B1B;
}

.history-status.failed .status-dot {
  background: #EF4444;
}

/* Empty State */
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

  .banner-title {
    font-size: 1.5rem;
  }

  .banner-description {
    font-size: 1rem;
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

  .banner-title {
    font-size: 1.75rem;
  }

  .banner-description {
    font-size: 1.125rem;
  }
}
</style>