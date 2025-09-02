<template>
  <div class="profile-view profile-page">
    <HustlHeader :isDashboard="true" />

    <!-- Loading State -->
    <div v-if="isLoading" class="dashboard-section loading-section">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading profile...</p>
    </div>

    <template v-else>
      <!-- User Info Section -->
      <div class="dashboard-section profile-header">
        <div class="user-avatar">
          <img 
            v-if="profileData.profilePicture" 
            :src="profileData.profilePicture" 
            :alt="profileData.username"
            class="avatar-image"
          />
          <span v-else class="avatar-text">{{ userInitials }}</span>
        </div>
        <div class="user-info">
          <h2 class="username">{{ profileData.username }}</h2>
          <p class="user-email">{{ profileData.email }}</p>
          <p class="user-phone">{{ profileData.phoneNumber }}</p>
          <div class="user-status">
            <span class="status-badge verified" v-if="profileData.isVerified">
              <span class="status-icon">✅</span>
              <span class="status-text">Verified</span>
            </span>
            <span class="status-badge active" v-if="profileData.isActive">
              <span class="status-icon">🟢</span>
              <span class="status-text">Active</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Coin Balance Section -->
      <div class="dashboard-section coin-section">
        <div class="section-header">
          <h3 class="section-title">Your Balance</h3>
        </div>
        <div class="coin-balance-card">
          <div class="coin-info">
            <div class="coin-icon">🪙</div>
            <div class="balance-details">
              <span class="balance-amount">{{ formatNumber(profileData.currentPoints) }}</span>
              <span class="balance-label">Coins Available</span>
            </div>
          </div>
          <button class="redeem-btn" @click="navigateToRedeem">
            <span class="redeem-text">Redeem</span>
            <span class="redeem-icon">🎁</span>
          </button>
        </div>
      </div>

      <!-- Recent Coins Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h3 class="section-title">Recent Coins</h3>
          <button class="see-more-btn" @click="navigateToTransactions">See More</button>
        </div>
        <div v-if="recentTransactions.length > 0" class="coins-list">
          <div v-for="transaction in recentTransactions.slice(0, 5)" :key="transaction.id" class="coin-item">
            <div class="coin-item-icon" :style="{ background: transaction.transactionType === 'credit' ? '#10B981' : '#EF4444' }">
              <span>{{ transaction.transactionType === 'credit' ? '+' : '-' }}</span>
            </div>
            <div class="coin-item-info">
              <h4 class="coin-item-title">{{ transaction.activityDescription }}</h4>
              <p class="coin-item-date">{{ formatDate(transaction.created_at) }}</p>
            </div>
            <div class="coin-item-amount" :class="transaction.transactionType">
              {{ transaction.transactionType === 'credit' ? '+' : '-' }}{{ formatNumber(transaction.amount) }}
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p class="empty-text">No recent transactions</p>
        </div>
      </div>

      <!-- Recent Redeems Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h3 class="section-title">Recent Redeems</h3>
          <button class="see-more-btn" @click="navigateToRedemptions">See More</button>
        </div>
        <div v-if="recentRedemptions.length > 0" class="redeems-list">
          <div v-for="redemption in recentRedemptions.slice(0, 5)" :key="redemption.id" class="redeem-item">
            <div class="redeem-item-icon">
              <span>🎁</span>
            </div>
            <div class="redeem-item-info">
              <h4 class="redeem-item-title">{{ formatRedemptionTitle(redemption) }}</h4>
              <p class="redeem-item-date">{{ formatDate(redemption.created_at) }}</p>
            </div>
            <div class="redeem-item-status" :class="redemption.status.toLowerCase()">
              {{ formatStatus(redemption.status) }}
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p class="empty-text">No recent redemptions</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="dashboard-section error-section">
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ error }}</span>
          <button class="retry-btn" @click="loadProfileData">Retry</button>
        </div>
      </div>
    </template>

    <!-- Logout Section -->
    <div v-if="!isLoading" class="dashboard-section logout-section">
      <button class="logout-btn" @click="handleLogout">
        <span class="logout-icon">🚪</span>
        <span class="logout-text">Logout</span>
      </button>
    </div>

    <!-- Bottom Navigation -->
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
  name: 'ProfileView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    // State management
    const isLoading = ref(true)
    const error = ref('')
    const profileData = ref({})
    const recentTransactions = ref([])
    const recentRedemptions = ref([])

    // Computed properties
    const userInitials = computed(() => {
      const username = profileData.value.username || 'User'
      return username.substring(0, 2).toUpperCase()
    })

    // Helper methods
    const formatNumber = (num) => {
      if (!num) return '0'
      return num.toLocaleString('id-ID')
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown date'
      
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

    const formatRedemptionTitle = (redemption) => {
      const points = formatNumber(redemption.pointsRedeemed)
      const type = redemption.redemptionType.charAt(0).toUpperCase() + redemption.redemptionType.slice(1)
      return `${type} Redemption - ${points} points`
    }

    const formatStatus = (status) => {
      const statusMap = {
        'pending': 'Pending',
        'processing': 'Processing', 
        'completed': 'Completed',
        'failed': 'Failed',
        'cancelled': 'Cancelled'
      }
      return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
    }

    // API integration methods
    const loadProfileData = async () => {
      isLoading.value = true
      error.value = ''

      try {
        // Get user ID from auth store
        const userId = authStore.user?.id
        if (!userId) {
          throw new Error('User ID not found. Please login again.')
        }

        // Load profile data, transactions, and redemptions in parallel
        const [profileResult, transactionsResult, redemptionsResult] = await Promise.allSettled([
          apiService.getUserProfileById(userId),
          apiService.getMyTransactions({ limit: 10 }), // Get 10 latest transactions
          apiService.getMyRedemptions({ limit: 10 })   // Get 10 latest redemptions
        ])

        // Handle profile data
        if (profileResult.status === 'fulfilled' && profileResult.value.success) {
          profileData.value = profileResult.value.data.user
        } else {
          console.warn('Failed to load profile:', profileResult.reason)
          // Fallback to auth store data
          profileData.value = {
            username: authStore.userName || 'User',
            email: authStore.userEmail || 'user@example.com',
            phoneNumber: 'Not provided',
            currentPoints: authStore.userPoints || 0,
            isVerified: false,
            isActive: true,
            profilePicture: null
          }
        }

        // Handle transactions data
        if (transactionsResult.status === 'fulfilled' && transactionsResult.value.success) {
          recentTransactions.value = transactionsResult.value.data.transactions || []
        } else {
          console.warn('Failed to load transactions:', transactionsResult.reason)
          recentTransactions.value = []
        }

        // Handle redemptions data
        if (redemptionsResult.status === 'fulfilled' && redemptionsResult.value.success) {
          recentRedemptions.value = redemptionsResult.value.data.redemptions || []
        } else {
          console.warn('Failed to load redemptions:', redemptionsResult.reason)
          recentRedemptions.value = []
        }

      } catch (err) {
        console.error('Error loading profile data:', err)
        error.value = 'Failed to load profile data. Please try again.'
        
        // Fallback data from auth store
        profileData.value = {
          username: authStore.userName || 'User',
          email: authStore.userEmail || 'user@example.com',
          phoneNumber: 'Not provided',
          currentPoints: authStore.userPoints || 0,
          isVerified: false,
          isActive: true,
          profilePicture: null
        }
      } finally {
        isLoading.value = false
      }
    }

    // Navigation methods
    const navigateToRedeem = () => {
      router.push('/profile/redeem')
    }

    const navigateToTransactions = () => {
      router.push('/profile/transactions')
    }

    const navigateToRedemptions = () => {
      router.push('/profile/redemptions')
    }

    const handleLogout = () => {
      if (confirm('Are you sure you want to logout?')) {
        authStore.logout()
        router.push('/login')
      }
    }

    // Initialize on mount
    onMounted(() => {
      loadProfileData()
    })

    return {
      isLoading,
      error,
      profileData,
      recentTransactions,
      recentRedemptions,
      userInitials,
      formatNumber,
      formatDate,
      formatRedemptionTitle,
      formatStatus,
      navigateToRedeem,
      navigateToTransactions,
      navigateToRedemptions,
      handleLogout,
      loadProfileData
    }
  }
}
</script>

<style scoped>
/* Override main.css container restrictions for ProfileView - Fixed for all screen sizes */
.profile-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Force full width and transparent background on ALL screen sizes */
.profile-view .page-container {
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

.profile-view .app-main {
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

/* Dashboard Section - Clean containers */
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

/* Profile Header Section */
.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.user-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
  flex-shrink: 0;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
  font-family: 'Baloo 2', sans-serif;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 0.25rem;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.2;
}

.user-email {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.user-phone {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.user-status {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
}

.status-badge.verified {
  background: #D1FAE5;
  color: #065F46;
}

.status-badge.active {
  background: #FEF3C7;
  color: #92400E;
}

.status-icon {
  font-size: 0.75rem;
}

/* Coin Section */
.coin-section {
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.coin-balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.25);
  color: white;
}

.coin-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.coin-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.balance-details {
  display: flex;
  flex-direction: column;
}

.balance-amount {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1;
}

.balance-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.redeem-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
}

.redeem-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #6B7280;
}

.empty-text {
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Coins List */
.coins-list, .redeems-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.coin-item, .redeem-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F8FAFC;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  transition: all 0.2s;
  cursor: pointer;
}

.coin-item:hover, .redeem-item:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
  transform: translateY(-1px);
}

.coin-item-icon, .redeem-item-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.redeem-item-icon {
  background: #F59E0B;
  font-size: 1.25rem;
}

.coin-item-info, .redeem-item-info {
  flex: 1;
}

.coin-item-title, .redeem-item-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.coin-item-date, .redeem-item-date {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.coin-item-amount {
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Baloo 2', sans-serif;
}

.coin-item-amount.credit {
  color: #10B981;
}

.coin-item-amount.debit {
  color: #EF4444;
}

.redeem-item-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-family: 'Baloo 2', sans-serif;
  text-transform: uppercase;
}

.redeem-item-status.pending {
  background: #FEF3C7;
  color: #92400E;
}

.redeem-item-status.processing {
  background: #DBEAFE;
  color: #1E40AF;
}

.redeem-item-status.completed {
  background: #D1FAE5;
  color: #065F46;
}

.redeem-item-status.failed {
  background: #FEE2E2;
  color: #991B1B;
}

.redeem-item-status.cancelled {
  background: #F3F4F6;
  color: #374151;
}

/* Logout Section */
.logout-section {
  padding: 1rem 1.25rem;
}

.logout-btn {
  width: 100%;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.logout-btn:hover {
  background: #DC2626;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
}

/* Responsive Design - FIXED for 770px - 1023px range */
@media (min-width: 768px) {
  .profile-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  /* Force overrides for tablet range */
  .profile-view .page-container {
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

  .profile-view .app-main {
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

  .profile-header {
    padding: 1.75rem 1.5rem;
  }

  .user-avatar {
    width: 96px;
    height: 96px;
  }

  .avatar-text {
    font-size: 2rem;
  }

  .username {
    font-size: 1.5rem;
  }

  .user-email, .user-phone {
    font-size: 1rem;
  }

  .coin-balance-card {
    padding: 1.5rem;
  }

  .balance-amount {
    font-size: 2rem;
  }

  .coin-item, .redeem-item {
    padding: 1.25rem;
  }

  .coin-item-icon, .redeem-item-icon {
    width: 48px;
    height: 48px;
  }
}

@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .profile-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: auto !important;
  }
  
  .profile-view .page-container {
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
  
  .profile-view .app-main {
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

  .profile-header {
    padding: 2rem;
  }

  .user-avatar {
    width: 112px;
    height: 112px;
  }

  .avatar-text {
    font-size: 2.25rem;
  }

  .username {
    font-size: 1.75rem;
  }

  .coin-balance-card {
    padding: 1.75rem;
  }
}
</style>