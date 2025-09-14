<template>
  <div class="profile-view dashboard-page">
    <HustlHeader :isDashboard="true" />

    <!-- User Info Section -->
    <div class="dashboard-section profile-header-section">
      <div class="profile-header">
        <div class="profile-avatar">
          <span class="avatar-text">{{ getInitials(authStore.userName) }}</span>
        </div>
        <div class="profile-info">
          <h2 class="profile-name">{{ authStore.userName || 'User' }}</h2>
          <p class="profile-email">{{ authStore.userEmail || 'user@example.com' }}</p>
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-icon">🪙</span>
              <span class="stat-value">{{ authStore.userPoints || 0 }}</span>
              <span class="stat-label">Points</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💖</span>
              <span class="stat-value">{{ wishlistCount }}</span>
              <span class="stat-label">Wishlist</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Section -->
    <div class="dashboard-section quick-actions-section">
      <h3 class="section-title">Quick Actions</h3>
      <div class="quick-actions-grid">
        <button class="action-card" @click="navigateToWishlist">
          <div class="action-icon wishlist-icon">💖</div>
          <div class="action-info">
            <span class="action-title">My Wishlist</span>
            <span class="action-subtitle">{{ wishlistCount }} items</span>
          </div>
          <div class="action-arrow">→</div>
        </button>
        
        <button class="action-card" @click="navigateToTransactions">
          <div class="action-icon transactions-icon">💰</div>
          <div class="action-info">
            <span class="action-title">Transactions</span>
            <span class="action-subtitle">View history</span>
          </div>
          <div class="action-arrow">→</div>
        </button>
        
        <button class="action-card" @click="navigateToRedemptions">
          <div class="action-icon redemptions-icon">🎁</div>
          <div class="action-info">
            <span class="action-title">Redemptions</span>
            <span class="action-subtitle">Claim rewards</span>
          </div>
          <div class="action-arrow">→</div>
        </button>
        
        <button class="action-card" @click="showSettings = true">
          <div class="action-icon settings-icon">⚙️</div>
          <div class="action-info">
            <span class="action-title">Settings</span>
            <span class="action-subtitle">Preferences</span>
          </div>
          <div class="action-arrow">→</div>
        </button>
      </div>
    </div>

    <!-- Redemption Action Section -->
    <div class="dashboard-section redemption-action-section">
      <div class="redemption-card">
        <div class="redemption-header">
          <div class="redemption-icon">
            <span>🏦</span>
          </div>
          <div class="redemption-info">
            <h4 class="redemption-title">Request Withdrawal</h4>
            <p class="redemption-subtitle">Convert your points to cash</p>
          </div>
          <div class="redemption-balance">
            <span class="balance-amount">{{ formatNumber(authStore.userPoints || 0) }}</span>
            <span class="balance-label">Points</span>
          </div>
        </div>
        <div class="redemption-actions">
          <button class="redemption-btn" @click="navigateToRedeem" :disabled="(authStore.userPoints || 0) < 100">
            <span class="btn-icon">💸</span>
            <span class="btn-text">Redeem Points</span>
          </button>
          <div class="redemption-note">
            <span class="note-text">Minimum: 100 points (Rp 100)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Wishlist Items -->
    <div v-if="recentWishlistItems.length > 0" class="dashboard-section recent-wishlist-section">
      <div class="section-header">
        <h3 class="section-title">Recent Wishlist Items</h3>
        <button class="see-all-btn" @click="navigateToWishlist">
          <span class="see-all-text">See All</span>
          <span class="see-all-icon">→</span>
        </button>
      </div>
      
      <div class="recent-wishlist-grid">
        <div 
          v-for="item in recentWishlistItems" 
          :key="item.id" 
          class="wishlist-preview-card"
          @click="viewProductDetails(item)"
        >
          <div class="preview-image">
            <img :src="getProductImageUrl(item.image)" :alt="item.title" />
            <button class="remove-from-wishlist" @click.stop="removeFromWishlist(item.id)">
              <span class="remove-icon">❌</span>
            </button>
          </div>
          <div class="preview-info">
            <h4 class="preview-name">{{ item.title }}</h4>
            <div class="preview-price">{{ item.price }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Wishlist State -->
    <div v-else class="dashboard-section empty-wishlist-section">
      <div class="empty-wishlist-state">
        <div class="empty-icon">💔</div>
        <h4 class="empty-title">Your wishlist is empty</h4>
        <p class="empty-message">Start adding products you love!</p>
        <button class="browse-products-btn" @click="navigateToProducts">
          <span class="browse-icon">🛍️</span>
          <span class="browse-text">Browse Products</span>
        </button>
      </div>
    </div>

    <!-- Account Information -->
    <div class="dashboard-section account-info-section">
      <h3 class="section-title">Account Information</h3>
      <div class="account-details">
        <div class="detail-row">
          <span class="detail-label">Username:</span>
          <span class="detail-value">{{ authStore.userName || 'Not set' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">{{ authStore.userEmail || 'Not set' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Points:</span>
          <span class="detail-value points-value">🪙 {{ authStore.userPoints || 0 }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Member Since:</span>
          <span class="detail-value">{{ formatMemberSince(authStore.user?.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- Logout Section -->
    <div class="dashboard-section logout-section">
      <button class="logout-btn" @click="showLogoutConfirm = true">
        <span class="logout-icon">🚪</span>
        <span class="logout-text">Logout</span>
      </button>
    </div>

    <!-- Settings Modal -->
    <div v-if="showSettings" class="modal-overlay" @click="showSettings = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Settings</h3>
          <button class="modal-close" @click="showSettings = false">
            <span class="close-icon">✕</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="settings-options">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Notifications</span>
                <span class="setting-description">Receive push notifications</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications">
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Email Updates</span>
                <span class="setting-description">Receive email updates</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.emailUpdates">
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Dark Mode</span>
                <span class="setting-description">Use dark theme</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.darkMode">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="save-settings-btn" @click="saveSettings">Save Settings</button>
        </div>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutConfirm" class="modal-overlay" @click="showLogoutConfirm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Confirm Logout</h3>
          <button class="modal-close" @click="showLogoutConfirm = false">
            <span class="close-icon">✕</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-text">Are you sure you want to logout? You'll need to login again to access your account.</p>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showLogoutConfirm = false">Cancel</button>
          <button class="confirm-logout-btn" @click="handleLogout">Logout</button>
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
    const wishlistItems = ref([])
    const showSettings = ref(false)
    const showLogoutConfirm = ref(false)
    const settings = ref({
      notifications: true,
      emailUpdates: false,
      darkMode: false
    })

    // Computed properties
    const wishlistCount = computed(() => wishlistItems.value.length)
    
    const recentWishlistItems = computed(() => 
      wishlistItems.value.slice(0, 4) // Show only first 4 items
    )

    // Helper methods
    const getInitials = (username) => {
      if (!username) return '??'
      return username.substring(0, 2).toUpperCase()
    }

    const getProductImageUrl = (imagePath) => {
      return apiService.constructor.getImageUrl(imagePath, 'products')
    }

    const formatMemberSince = (dateString) => {
      if (!dateString) return 'Unknown'
      
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      })
    }

    const formatNumber = (num) => {
      if (!num) return '0'
      return num.toLocaleString('id-ID')
    }

    // Wishlist management
    const loadWishlist = () => {
      try {
        const stored = localStorage.getItem('favoriteProducts')
        if (stored) {
          wishlistItems.value = JSON.parse(stored)
        }
      } catch (error) {
        console.error('Error loading wishlist:', error)
        wishlistItems.value = []
      }
    }

    const removeFromWishlist = (productId) => {
      wishlistItems.value = wishlistItems.value.filter(item => item.id !== productId)
      localStorage.setItem('favoriteProducts', JSON.stringify(wishlistItems.value))
    }

    // Settings management
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem('userSettings')
        if (stored) {
          settings.value = { ...settings.value, ...JSON.parse(stored) }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }

    const saveSettings = () => {
      localStorage.setItem('userSettings', JSON.stringify(settings.value))
      showSettings.value = false
      
      // You can add more settings logic here
      console.log('Settings saved:', settings.value)
    }

    // Navigation methods
    const navigateToWishlist = () => {
      router.push('/profile/wishlist')
    }

    const navigateToTransactions = () => {
      router.push('/profile/transactions')
    }

    const navigateToRedemptions = () => {
      router.push('/profile/redemptions')
    }

    const navigateToRedeem = () => {
      router.push('/profile/redeem')
    }

    const navigateToProducts = () => {
      router.push('/category')
    }

    const viewProductDetails = (product) => {
      router.push(`/product/${product.id}`)
    }

    // Auth methods
    const handleLogout = async () => {
      try {
        authStore.logout()
        router.push('/login')
      } catch (error) {
        console.error('Error during logout:', error)
      }
    }

    // Initialize on mount
    onMounted(() => {
      loadWishlist()
      loadSettings()
    })

    return {
      authStore,
      wishlistItems,
      wishlistCount,
      recentWishlistItems,
      showSettings,
      showLogoutConfirm,
      settings,
      getInitials,
      getProductImageUrl,
      formatMemberSince,
      formatNumber,
      removeFromWishlist,
      saveSettings,
      navigateToWishlist,
      navigateToTransactions,
      navigateToRedemptions,
      navigateToRedeem,
      navigateToProducts,
      viewProductDetails,
      handleLogout
    }
  }
}
</script>

<style scoped>
/* Reset and Base Styles */
* {
  box-sizing: border-box;
}

/* Profile View Main Container - FIXED: Following CategoryView pattern exactly */
.profile-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px; /* Consistent with CategoryView */
  width: 100%;
  overflow-x: hidden;
  position: relative;
}

/* Dashboard sections - FIXED: Exact same pattern as CategoryView */
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
  max-width: calc(100% - 2rem);
  box-sizing: border-box;
}

.dashboard-section:first-child {
  margin-top: 1rem;
}

/* Profile Header - Enhanced styling */
.profile-header-section {
  padding: 1.5rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.25);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.avatar-text {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  font-family: 'Baloo 2', sans-serif;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  font-family: 'Baloo 2', sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-email {
  font-size: 0.875rem;
  opacity: 0.8;
  margin: 0;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-icon {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.8;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Section Titles */
.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0 0 1rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.see-all-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #4FC3F7;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.see-all-btn:hover {
  background: rgba(79, 195, 247, 0.1);
}

/* Quick Actions - FIXED: Improved responsive grid */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
  max-width: 100%;
}

.action-card {
  background: #F8FAFC;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  padding: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  font-family: 'Baloo 2', sans-serif;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.action-card:hover {
  background: #F1F5F9;
  border-color: #4FC3F7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.15);
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.action-icon.wishlist-icon {
  background: linear-gradient(135deg, #FF6B9D, #FF8E8E);
}

.action-icon.transactions-icon {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
}

.action-icon.redemptions-icon {
  background: linear-gradient(135deg, #FFE066, #FF9A56);
}

.action-icon.settings-icon {
  background: linear-gradient(135deg, #A8A8A8, #7F7F7F);
}

.action-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.action-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-subtitle {
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-arrow {
  font-size: 1rem;
  color: #9CA3AF;
  transition: all 0.2s;
  flex-shrink: 0;
}

.action-card:hover .action-arrow {
  color: #4FC3F7;
  transform: translateX(2px);
}

/* Redemption Action Section */
.redemption-action-section {
  padding: 1.25rem;
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  border: 2px solid #E2E8F0;
}

.redemption-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.redemption-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.redemption-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10B981, #059669);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  flex-shrink: 0;
}

.redemption-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.redemption-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.redemption-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.redemption-balance {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  flex-shrink: 0;
}

.balance-amount {
  font-size: 1.25rem;
  font-weight: 800;
  color: #10B981;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1;
}

.balance-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.redemption-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.redemption-btn {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.875rem 1rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  box-sizing: border-box;
  width: 100%;
}

.redemption-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
}

.redemption-btn:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 6px rgba(156, 163, 175, 0.15);
}

.btn-icon {
  font-size: 1rem;
}

.redemption-note {
  text-align: center;
}

.note-text {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  font-style: italic;
}

/* Recent Wishlist - FIXED: Consistent with CategoryView pattern */
.recent-wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
  max-width: 100%;
}

.wishlist-preview-card {
  display: flex;
  flex-direction: column;
  background: #F8FAFC;
  border-radius: 12px;
  padding: 0.875rem;
  border: 1px solid #E2E8F0;
  cursor: pointer;
  transition: all 0.2s;
  max-width: 100%;
  box-sizing: border-box;
}

.wishlist-preview-card:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
  transform: translateY(-2px);
}

.preview-image {
  position: relative;
  width: 100%;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #E5E7EB;
  margin-bottom: 0.625rem;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-from-wishlist {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s;
}

.remove-from-wishlist:hover {
  background: rgba(239, 68, 68, 0.9);
  transform: scale(1.1);
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 100%;
}

.preview-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.2;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-price {
  font-size: 0.75rem;
  color: #059669;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
}

/* Empty Wishlist */
.empty-wishlist-state {
  display: flex;
  flex-direction: column;
  align-items: center;
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
  margin-bottom: 1.5rem;
}

.browse-products-btn {
  background: #4FC3F7;
  color: white;
  border: none;
  border-radius: 10px;
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
}

.browse-products-btn:hover {
  background: #29B6F6;
  transform: translateY(-2px);
}

/* Account Information */
.account-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #F3F4F6;
  gap: 1rem;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  flex-shrink: 0;
}

.detail-value {
  font-size: 0.875rem;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-value.points-value {
  color: #F59E0B;
  font-weight: 700;
}

/* Logout */
.logout-section {
  padding: 1rem 1.25rem;
}

.logout-btn {
  width: 100%;
  background: linear-gradient(135deg, #EF4444, #DC2626);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
  box-sizing: border-box;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #DC2626, #B91C1C);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
}

.logout-icon {
  font-size: 1.25rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  box-sizing: border-box;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
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
.confirm-logout-btn,
.save-settings-btn {
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

.confirm-logout-btn {
  background: #EF4444;
  color: white;
  border: 2px solid #EF4444;
}

.confirm-logout-btn:hover {
  background: #DC2626;
  border-color: #DC2626;
}

.save-settings-btn {
  background: #4FC3F7;
  color: white;
  border: 2px solid #4FC3F7;
  width: 100%;
}

.save-settings-btn:hover {
  background: #29B6F6;
  border-color: #29B6F6;
}

/* Settings */
.settings-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #F3F4F6;
  gap: 1rem;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.setting-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.setting-description {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #E5E7EB;
  transition: all 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: all 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input:checked + .toggle-slider {
  background-color: #4FC3F7;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* FIXED FOOTER STYLES - Following CategoryView exact pattern */
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

/* Responsive Design - FIXED: Matching CategoryView exactly */
@media (min-width: 640px) {
  .quick-actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
  
  .recent-wishlist-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }

  .profile-view {
    padding-bottom: 100px;
  }
}

@media (min-width: 768px) {
  .profile-view {
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
    max-width: calc(100% - 4rem);
  }

  .quick-actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .recent-wishlist-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }
}

@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .profile-view {
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
    padding: 2rem;
    max-width: calc(100% - 6rem);
  }

  .quick-actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.25rem;
  }

  .recent-wishlist-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.25rem;
  }
}

@media (min-width: 1200px) {
  .dashboard-section {
    margin: 0 4rem 2rem 4rem;
    padding: 2.5rem;
    max-width: calc(100% - 8rem);
  }

  .profile-view {
    padding-bottom: 100px;
  }
}

/* Prevent content overflow on all screen sizes */
.profile-view,
.profile-view * {
  max-width: 100%;
  box-sizing: border-box;
}

/* Last section margin fix */
.dashboard-section:last-of-type {
  margin-bottom: 2rem;
}
</style>