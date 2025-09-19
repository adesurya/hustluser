<template>
  <div class="profile-view">
    <HustlHeader :isDashboard="true" />

    <div class="profile-content">
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
                <span class="stat-value">{{ formatNumber(authStore.userPoints || 0) }}</span>
                <span class="stat-label">Points</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💖</span>
                <span class="stat-value">{{ wishlistCount }}</span>
                <span class="stat-label">Wishlist</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🏦</span>
                <span class="stat-value">{{ bankAccountsCount }}</span>
                <span class="stat-label">Banks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Section - ENHANCED -->
      <div class="dashboard-section quick-actions-section">
        <h3 class="section-title">Quick Actions</h3>
        <div class="quick-actions-grid">
          <button class="action-card" @click="navigateToWishlist">
            <div class="action-icon wishlist-icon">💖</div>
            <div class="action-info">
              <span class="action-title">My Wishlist</span>
              <span class="action-subtitle">{{ wishlistCount }} saved items</span>
              <span class="action-description">Manage your favorite products</span>
            </div>
            <div class="action-arrow">→</div>
          </button>
          
          <button class="action-card" @click="navigateToAffiliateLinks">
            <div class="action-icon affiliate-icon">🔗</div>
            <div class="action-info">
              <span class="action-title">Affiliate Links</span>
              <span class="action-subtitle">Generate & share</span>
              <span class="action-description">Earn money from referrals</span>
            </div>
            <div class="action-arrow">→</div>
          </button>
          
          <button class="action-card" @click="navigateToBankAccounts">
            <div class="action-icon bank-icon">🏦</div>
            <div class="action-info">
              <span class="action-title">Bank Accounts</span>
              <span class="action-subtitle">{{ bankAccountsCount }} account{{ bankAccountsCount !== 1 ? 's' : '' }}</span>
              <span class="action-description">Setup withdrawal methods</span>
            </div>
            <div class="action-arrow">→</div>
          </button>
          
          <button class="action-card" @click="navigateToTransactions">
            <div class="action-icon transactions-icon">💰</div>
            <div class="action-info">
              <span class="action-title">Transactions</span>
              <span class="action-subtitle">View activity</span>
              <span class="action-description">Track your earnings</span>
            </div>
            <div class="action-arrow">→</div>
          </button>
          
          <button class="action-card" @click="navigateToRedemptions">
            <div class="action-icon redemptions-icon">🎁</div>
            <div class="action-info">
              <span class="action-title">Redemptions</span>
              <span class="action-subtitle">Claim rewards</span>
              <span class="action-description">Convert points to cash</span>
            </div>
            <div class="action-arrow">→</div>
          </button>
          
          <button class="action-card" @click="showSettings = true">
            <div class="action-icon settings-icon">⚙️</div>
            <div class="action-info">
              <span class="action-title">Settings</span>
              <span class="action-subtitle">Preferences</span>
              <span class="action-description">Customize your experience</span>
            </div>
            <div class="action-arrow">→</div>
          </button>
        </div>
      </div>

      <!-- Bank Account Summary Section -->
      <div v-if="primaryBankAccount || bankAccountsCount > 0" class="dashboard-section bank-summary-section">
        <div class="section-header">
          <h3 class="section-title">Primary Bank Account</h3>
          <button class="manage-banks-btn" @click="navigateToBankAccounts">
            <span class="manage-text">Manage</span>
            <span class="manage-icon">→</span>
          </button>
        </div>
        
        <div v-if="primaryBankAccount" class="primary-bank-card">
          <div class="bank-icon">🏦</div>
          <div class="bank-info">
            <h4 class="bank-name">{{ formatBankName(primaryBankAccount.bankName) }}</h4>
            <p class="account-name">{{ primaryBankAccount.accountName }}</p>
            <p class="account-number">{{ primaryBankAccount.maskedAccountNumber || formatAccountNumber(primaryBankAccount.accountNumber) }}</p>
            <div class="bank-badges">
              <span class="badge primary-badge">Primary</span>
              <span v-if="primaryBankAccount.isVerified" class="badge verified-badge">Verified</span>
              <span v-else class="badge unverified-badge">Unverified</span>
            </div>
          </div>
        </div>
        
        <div v-else-if="bankAccountsCount > 0" class="no-primary-bank">
          <div class="warning-icon">⚠️</div>
          <div class="warning-info">
            <p class="warning-title">No primary bank account set</p>
            <p class="warning-message">Please set a primary account for easier redemptions</p>
          </div>
          <button class="set-primary-btn" @click="navigateToBankAccounts">Set Primary</button>
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
              <span v-if="!primaryBankAccount && bankAccountsCount === 0" class="note-warning">
                • Add a bank account first
              </span>
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
            <span class="detail-value points-value">🪙 {{ formatNumber(authStore.userPoints || 0) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Bank Accounts:</span>
            <span class="detail-value">{{ bankAccountsCount }} account{{ bankAccountsCount !== 1 ? 's' : '' }}</span>
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
import { useWishlist } from '../composables/useWishlist'
import { useCachedApi } from '../composables/useCachedApi'

export default {
  name: 'ProfileView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const { getBankAccounts } = useCachedApi()
    
    const { 
      wishlistItems, 
      wishlistCount, 
      loadWishlist,
      removeFromWishlist,
      migrateLocalStorageToAPI 
    } = useWishlist()
    
    const showSettings = ref(false)
    const showLogoutConfirm = ref(false)
    const bankAccounts = ref([])
    const bankAccountsCount = ref(0)
    const primaryBankAccount = ref(null)
    const isBankAccountsLoading = ref(false)
    
    const settings = ref({
      notifications: true,
      emailUpdates: false,
      darkMode: false
    })

    const recentWishlistItems = computed(() => 
      wishlistItems.value.slice(0, 4)
    )

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

    const formatBankName = (bankName) => {
      return apiService.constructor.formatBankName(bankName)
    }

    const formatAccountNumber = (accountNumber) => {
      return apiService.constructor.formatBankAccountNumber(accountNumber)
    }

    const loadBankAccounts = async () => {
      if (!authStore.isAuthenticated) return
      
      isBankAccountsLoading.value = true
      
      try {
        const response = await getBankAccounts(
          { limit: 50 },
          { 
            ttl: 10 * 60 * 1000,
            forceRefresh: false 
          }
        )
        
        if (response.success && response.data) {
          bankAccounts.value = response.data
          bankAccountsCount.value = response.data.length
          
          primaryBankAccount.value = response.data.find(account => account.isPrimary) || null
        } else {
          bankAccounts.value = []
          bankAccountsCount.value = 0
          primaryBankAccount.value = null
        }
      } catch (error) {
        console.warn('Failed to load bank accounts:', error)
        bankAccounts.value = []
        bankAccountsCount.value = 0
        primaryBankAccount.value = null
      } finally {
        isBankAccountsLoading.value = false
      }
    }

    const removeWishlistItem = async (productId) => {
      const success = await removeFromWishlist(productId)
      if (!success) {
        console.error('Failed to remove item from wishlist')
      }
    }

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
      console.log('Settings saved:', settings.value)
    }

    const navigateToWishlist = () => {
      router.push('/profile/wishlist')
    }

    const navigateToAffiliateLinks = () => {
      router.push('/profile/affiliate-links')
    }

    const navigateToBankAccounts = () => {
      router.push('/profile/bank-accounts')
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
      router.push('/product/' + product.id)
    }

    const handleLogout = async () => {
      try {
        authStore.logout()
        router.push('/login')
      } catch (error) {
        console.error('Error during logout:', error)
      }
    }

    const syncLocalWishlist = async () => {
      if (authStore.isAuthenticated) {
        try {
          const result = await migrateLocalStorageToAPI()
          if (result.success && result.migrated > 0) {
            alert('Synced ' + result.migrated + ' items to your account!')
            await loadWishlist()
          } else if (result.migrated === 0) {
            alert('No items to sync')
          }
        } catch (error) {
          console.error('Sync failed:', error)
          alert('Sync failed: ' + error.message)
        }
      }
    }

    const localItemsCount = computed(() => {
      if (!authStore.isAuthenticated) return 0
      
      try {
        const stored = localStorage.getItem('favoriteProducts')
        if (stored) {
          const items = JSON.parse(stored)
          return items.filter(item => !item.wishlistItemId).length
        }
      } catch {
        return 0
      }
      return 0
    })

    onMounted(async () => {
      await Promise.all([
        loadWishlist(),
        loadBankAccounts()
      ])
      loadSettings()
    })

    return {
      authStore,
      wishlistItems,
      wishlistCount,
      bankAccounts,
      bankAccountsCount,
      primaryBankAccount,
      isBankAccountsLoading,
      recentWishlistItems,
      showSettings,
      showLogoutConfirm,
      settings,
      getInitials,
      getProductImageUrl,
      formatMemberSince,
      formatNumber,
      formatBankName,
      formatAccountNumber,
      removeFromWishlist: removeWishlistItem,
      saveSettings,
      navigateToWishlist,
      navigateToAffiliateLinks,
      navigateToBankAccounts,
      navigateToTransactions,
      navigateToRedemptions,
      navigateToRedeem,
      navigateToProducts,
      viewProductDetails,
      handleLogout,
      syncLocalWishlist,
      localItemsCount
    }
  }
}
</script>

<style scoped>
/* ProfileView.vue Styles - Fixed for Single Scroll Container */
* {
  box-sizing: border-box;
}

.profile-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1; /* Ambil ruang yang tersisa */
}


.profile-content {
  flex: 1;
  padding-bottom: 100px; /* HANYA SATU padding-bottom yang konsisten */
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto; /* Pastikan konten bisa di-scroll */
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
  max-width: calc(100% - 2rem);
  box-sizing: border-box;
}

.dashboard-section:first-child {
  margin-top: 1rem;
}

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
  gap: 1rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 50px;
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

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  max-width: 100%;
}

.action-card {
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  border: 2px solid #E2E8F0;
  border-radius: 16px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
  font-family: 'Baloo 2', sans-serif;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
  border-color: #4FC3F7;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(79, 195, 247, 0.25);
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4FC3F7, #29B6F6);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-card:hover::before {
  opacity: 1;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.action-card:hover .action-icon {
  transform: scale(1.1);
}

.action-icon.wishlist-icon {
  background: linear-gradient(135deg, #FF6B9D, #FF8E8E);
}

.action-icon.affiliate-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.action-icon.bank-icon {
  background: linear-gradient(135deg, #10B981, #059669);
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
  gap: 0.25rem;
  min-width: 0;
}

.action-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1F2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0.125rem;
}

.action-subtitle {
  font-size: 0.875rem;
  color: #4FC3F7;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-description {
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 500;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
}

.action-arrow {
  font-size: 1.125rem;
  color: #9CA3AF;
  transition: all 0.3s ease;
  flex-shrink: 0;
  font-weight: bold;
}

.action-card:hover .action-arrow {
  color: #4FC3F7;
  transform: translateX(4px);
}

.see-all-btn, .manage-banks-btn {
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

.see-all-btn:hover, .manage-banks-btn:hover {
  background: rgba(79, 195, 247, 0.1);
}

.manage-banks-btn {
  color: #10B981;
}

.manage-banks-btn:hover {
  background: rgba(16, 185, 129, 0.1);
}

.bank-summary-section {
  padding: 1.25rem;
  background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%);
  border: 2px solid #BBF7D0;
}

.primary-bank-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #10B981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.bank-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #10B981, #059669);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.bank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.bank-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-name {
  font-size: 0.875rem;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-number {
  font-size: 0.8rem;
  color: #6B7280;
  font-family: 'Courier New', monospace;
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.5px;
}

.bank-badges {
  display: flex;
  gap: 0.375rem;
  margin-top: 0.375rem;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-family: 'Baloo 2', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.primary-badge {
  background: #FEF3C7;
  color: #92400E;
}

.verified-badge {
  background: #D1FAE5;
  color: #065F46;
}

.unverified-badge {
  background: #FEE2E2;
  color: #991B1B;
}

.no-primary-bank {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #FEF3C7;
  border-radius: 12px;
  border: 1px solid #FDE68A;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-info {
  flex: 1;
  min-width: 0;
}

.warning-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #92400E;
  font-family: 'Baloo 2', sans-serif;
  margin: 0 0 0.25rem 0;
}

.warning-message {
  font-size: 0.8rem;
  color: #A16207;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  margin: 0;
}

.set-primary-btn {
  background: #F59E0B;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.set-primary-btn:hover {
  background: #D97706;
  transform: translateY(-1px);
}

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
  display: block;
}

.note-warning {
  color: #DC2626;
  font-weight: 600;
  display: block;
  margin-top: 0.25rem;
}

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

.modal-overlay {
  z-index: 1000 !important; /* Lebih rendah dari footer */
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

body {
  margin: 0 !important;
  padding: 0 !important;
  position: relative !important;
}

html {
  scroll-behavior: smooth !important;
}

html, body {
  margin: 0 !important;
  padding: 0 !important;
  height: 100% !important;
  overflow-x: hidden !important;
}

#app {
  min-height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
  position: relative !important;
}


.router-view,
.page-container,
.app-container {
  position: relative !important;
  z-index: 1 !important;
}

footer,
[role="navigation"],
.app-footer,
.page-footer {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 1001 !important;
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

.cancel-btn, .confirm-logout-btn, .save-settings-btn {
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

/* Responsive Design */
@media (max-width: 480px) {
  .profile-content {
    padding-bottom: 85px !important; /* Lebih kecil untuk mobile */
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .action-card {
    padding: 1rem;
  }
  
  .action-icon {
    width: 40px;
    height: 40px;
  }
  
  .recent-wishlist-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .primary-bank-card, .no-primary-bank {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .profile-stats {
    gap: 0.75rem;
  }

  .redemption-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .redemption-balance {
    align-items: flex-start;
    text-align: left;
  }

  .profile-content {
    padding-bottom: 100px;
  }
  
  .bottom-navigation,
  .bottom-nav,
  .footer-nav,
  .navigation-footer,
  [class*="bottom"][class*="nav"],
  [class*="footer"][class*="nav"] {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    z-index: 1001 !important; /* Lebih tinggi dari modal (1000) */
    background: white !important;
    border-top: 1px solid #E5E7EB !important;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1) !important;
    padding: 0.75rem 0 !important;
    box-sizing: border-box !important;
    
    /* Reset properties yang bisa mengganggu */
    transform: none !important;
    margin: 0 !important;
    position: fixed !important; /* Pastikan tetap fixed */
  }
  
  .bottom-navigation .nav-item,
  .bottom-nav .nav-item,
  .footer-nav .nav-item {
    font-size: 0.7rem !important;
    padding: 0.375rem !important;
    min-height: 45px !important;
  }
  
  .bottom-navigation .nav-item .nav-icon,
  .bottom-nav .nav-item .nav-icon,
  .footer-nav .nav-item .nav-icon {
    font-size: 1.125rem !important;
    width: 20px !important;
    height: 20px !important;
  }
}

@media (min-width: 481px) and (max-width: 640px) {
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recent-wishlist-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recent-wishlist-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 769px) {
  .dashboard-section {
    margin: 0 2rem 1.5rem 2rem;
    padding: 1.5rem;
    max-width: calc(100% - 4rem);
  }

  .quick-actions-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .recent-wishlist-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }
  
  .profile-content {
    padding-bottom: 140px;
  }

  .profile-content {
    padding-bottom: 140px !important;
  }
  
  .bottom-navigation,
  .bottom-nav,
  .footer-nav {
    padding: 1rem 0 !important;
  }
}

@media (min-width: 1024px) {
  .dashboard-section {
    margin: 0 3rem 2rem 3rem;
    padding: 2rem;
    max-width: calc(100% - 6rem);
  }

  .quick-actions-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  .recent-wishlist-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.25rem;
  }
}

/* Pastikan bottom navigation selalu sticky */
.bottom-navigation, 
.bottom-nav,
.footer-nav,
.navigation-footer,
[class*="bottom"][class*="nav"],
[class*="footer"][class*="nav"],
[class*="nav"][class*="bottom"] {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  z-index: 1001 !important; /* Lebih tinggi dari modal */
  background: white !important;
  border-top: 1px solid #E5E7EB !important;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1) !important;
  padding: 0.75rem 0 !important;
  box-sizing: border-box !important;
  /* Pastikan tidak ada transform atau positioning lain */
  transform: none !important;
  margin: 0 !important;
}

/* Alternatif jika menggunakan class yang berbeda */
[class*="bottom"][class*="nav"],
[class*="footer"][class*="nav"],
[class*="nav"][class*="bottom"] {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  z-index: 999 !important;
}


/* Jika navigation menggunakan flexbox layout */
.bottom-navigation .nav-items,
.bottom-nav .nav-items,
.footer-nav .nav-items,
.bottom-navigation > div,
.bottom-nav > div,
.footer-nav > div {
  display: flex !important;
  justify-content: space-around !important;
  align-items: center !important;
  max-width: 100% !important;
  margin: 0 auto !important;
  padding: 0 1rem !important;
  height: auto !important;
}

.bottom-navigation .nav-item,
.bottom-nav .nav-item,
.footer-nav .nav-item,
.bottom-navigation a,
.bottom-nav a,
.footer-nav a {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  text-align: center !important;
  flex: 1 !important;
  padding: 0.5rem !important;
  color: #6B7280 !important;
  text-decoration: none !important;
  transition: color 0.2s !important;
  font-size: 0.75rem !important;
  font-family: 'Baloo 2', sans-serif !important;
  font-weight: 500 !important;
  min-height: 50px !important;
  justify-content: center !important;
}

.bottom-navigation .nav-item.active,
.bottom-nav .nav-item.active,
.footer-nav .nav-item.active,
.bottom-navigation a.active,
.bottom-nav a.active,
.footer-nav a.active {
  color: #4FC3F7 !important;
  font-weight: 600 !important;
}

.bottom-navigation .nav-item .nav-icon,
.bottom-nav .nav-item .nav-icon,
.footer-nav .nav-item .nav-icon,
.bottom-navigation .nav-item img,
.bottom-nav .nav-item img,
.footer-nav .nav-item img {
  font-size: 1.25rem !important;
  margin-bottom: 0.25rem !important;
  width: 24px !important;
  height: 24px !important;
}



</style>