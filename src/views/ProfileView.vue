<template>
  <div class="profile-view profile-page">
    <HustlHeader :isDashboard="true" />
    <!-- User Info Section -->
    <div class="dashboard-section profile-header">
      <div class="user-avatar">
        <span class="avatar-text">{{ userInitials }}</span>
      </div>
      <div class="user-info">
        <h2 class="username">{{ userData.username }}</h2>
        <p class="user-email">{{ userData.email }}</p>
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
            <span class="balance-amount">{{ userCoins }}</span>
            <span class="balance-label">Coins Available</span>
          </div>
        </div>
        <button class="redeem-btn" @click="handleRedeem">
          <span class="redeem-text">Redeem</span>
          <span class="redeem-icon">🎁</span>
        </button>
      </div>
    </div>

    <!-- Recent Coins Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h3 class="section-title">Recent Coins</h3>
        <button class="see-more-btn" @click="viewAllCoins">See More</button>
      </div>
      <div class="coins-list">
        <div v-for="coin in recentCoins" :key="coin.id" class="coin-item">
          <div class="coin-item-icon" :style="{ background: coin.type === 'earned' ? '#10B981' : '#EF4444' }">
            <span>{{ coin.type === 'earned' ? '+' : '-' }}</span>
          </div>
          <div class="coin-item-info">
            <h4 class="coin-item-title">{{ coin.description }}</h4>
            <p class="coin-item-date">{{ formatDate(coin.date) }}</p>
          </div>
          <div class="coin-item-amount" :class="coin.type === 'earned' ? 'earned' : 'spent'">
            {{ coin.type === 'earned' ? '+' : '-' }}{{ coin.amount }}
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Redeems Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h3 class="section-title">Recent Redeems</h3>
        <button class="see-more-btn" @click="viewAllRedeems">See More</button>
      </div>
      <div class="redeems-list">
        <div v-for="redeem in recentRedeems" :key="redeem.id" class="redeem-item">
          <div class="redeem-item-icon">
            <span>🎁</span>
          </div>
          <div class="redeem-item-info">
            <h4 class="redeem-item-title">{{ redeem.item }}</h4>
            <p class="redeem-item-date">{{ formatDate(redeem.date) }}</p>
          </div>
          <div class="redeem-item-status" :class="redeem.status.toLowerCase()">
            {{ redeem.status }}
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Section -->
    <div class="dashboard-section logout-section">
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'

export default {
  name: 'ProfileView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    // User data from auth store
    const userData = computed(() => ({
      username: authStore.userName || 'User',
      email: authStore.userEmail || 'user@example.com'
    }))

    const userInitials = computed(() => {
      const username = userData.value.username
      return username.substring(0, 2).toUpperCase()
    })

    const userCoins = computed(() => authStore.userPoints || 1250)

    // Dummy data for recent coins (top 5)
    const recentCoins = ref([
      {
        id: 1,
        description: 'Samsung Smart TV 55" Purchase',
        amount: 75,
        type: 'earned',
        date: '2025-08-30T10:00:00Z'
      },
      {
        id: 2,
        description: 'iPhone 15 Pro Max Purchase',
        amount: 180,
        type: 'earned',
        date: '2025-08-30T09:45:00Z'
      },
      {
        id: 3,
        description: 'MacBook Air M3 Purchase',
        amount: 150,
        type: 'earned',
        date: '2025-08-30T09:30:00Z'
      },
      {
        id: 4,
        description: 'Nike Air Max 270 Purchase',
        amount: 18,
        type: 'earned',
        date: '2025-08-30T09:15:00Z'
      },
      {
        id: 5,
        description: 'Redeem Gift Card',
        amount: 100,
        type: 'spent',
        date: '2025-08-30T09:00:00Z'
      }
    ])

    // Dummy data for recent redeems (last 5)
    const recentRedeems = ref([
      {
        id: 1,
        item: 'Amazon Gift Card $10',
        status: 'Completed',
        date: '2025-08-29T15:30:00Z'
      },
      {
        id: 2,
        item: 'Starbucks Voucher $5',
        status: 'Processing',
        date: '2025-08-29T14:20:00Z'
      },
      {
        id: 3,
        item: 'Google Play Gift Card $15',
        status: 'Completed',
        date: '2025-08-28T16:45:00Z'
      },
      {
        id: 4,
        item: 'Netflix Subscription 1 Month',
        status: 'Completed',
        date: '2025-08-28T10:30:00Z'
      },
      {
        id: 5,
        item: 'Spotify Premium 1 Month',
        status: 'Failed',
        date: '2025-08-27T12:15:00Z'
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

    const handleRedeem = () => {
      console.log('Navigate to redeem page')
    }

    const viewAllCoins = () => {
      console.log('Navigate to all coins history')
    }

    const viewAllRedeems = () => {
      console.log('Navigate to all redeems history')
    }

    const handleLogout = () => {
      if (confirm('Are you sure you want to logout?')) {
        authStore.logout()
        router.push('/login')
      }
    }

    return {
      userData,
      userInitials,
      userCoins,
      recentCoins,
      recentRedeems,
      formatDate,
      handleRedeem,
      viewAllCoins,
      viewAllRedeems,
      handleLogout
    }
  }
}
</script>

<style scoped>
/* Add to existing styles */
.header-settings-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  color: #1F2937;
  font-size: 1rem;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.header-settings-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}
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
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
  flex-shrink: 0;
}

.avatar-text {
  color: white;
  font-size: 1.5rem;
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

.coin-item-amount.earned {
  color: #10B981;
}

.coin-item-amount.spent {
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

.redeem-item-status.completed {
  background: #D1FAE5;
  color: #065F46;
}

.redeem-item-status.processing {
  background: #FEF3C7;
  color: #92400E;
}

.redeem-item-status.failed {
  background: #FEE2E2;
  color: #991B1B;
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
    width: 80px;
    height: 80px;
  }

  .avatar-text {
    font-size: 1.75rem;
  }

  .username {
    font-size: 1.5rem;
  }

  .user-email {
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
    width: 96px;
    height: 96px;
  }

  .avatar-text {
    font-size: 2rem;
  }

  .username {
    font-size: 1.75rem;
  }

  .coin-balance-card {
    padding: 1.75rem;
  }
}
</style>