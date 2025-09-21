<template>
  <div class="redemptions-view">
    <HustlHeader :isDashboard="true" />

    <!-- Header with Back Button -->
    <div class="header-section">
      <div class="header-container">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span class="back-text">Back</span>
        </button>
        <h3 class="page-title">Redemption History</h3>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="dashboard-section filter-section">
      <div class="filter-tabs">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          class="filter-tab"
          :class="{ active: activeFilter === filter.value }"
          @click="setActiveFilter(filter.value)"
          :disabled="isLoading"
        >
          <span class="filter-icon">{{ filter.icon }}</span>
          <span class="filter-label">{{ filter.label }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="dashboard-section loading-section">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading redemptions...</p>
    </div>

    <!-- Redemptions List -->
    <div v-else-if="filteredRedemptions.length > 0" class="dashboard-section redemptions-section">
      <div class="section-header">
        <h3 class="section-title">Redemptions</h3>
        <span class="redemption-count">{{ filteredRedemptions.length }} redemptions</span>
      </div>
      
      <div class="redemptions-list">
        <div 
          v-for="redemption in paginatedRedemptions" 
          :key="redemption.id" 
          class="redemption-item"
          @click="viewRedemptionDetails(redemption)"
        >
          <div class="redemption-icon">
            <span>📜</span>
          </div>
          <div class="redemption-info">
            <h4 class="redemption-title">{{ formatRedemptionTitle(redemption) }}</h4>
            <p class="redemption-date">{{ formatDate(redemption.created_at) }}</p>
            <div class="redemption-meta">
              <span class="redemption-type">{{ formatRedemptionType(redemption.redemptionType) }}</span>
              <span class="redemption-value">{{ formatCurrency(redemption.redemptionValue) }}</span>
            </div>
            <div v-if="redemption.redemptionDetails" class="redemption-details">
              <span class="detail-text">{{ formatBankDetails(redemption.redemptionDetails) }}</span>
            </div>
          </div>
          <div class="redemption-status" :class="redemption.status.toLowerCase()">
            {{ formatStatus(redemption.status) }}
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
    <div v-else-if="!isLoading" class="dashboard-section empty-section">
      <div class="empty-state">
        <div class="empty-icon">📜</div>
        <h4 class="empty-title">No redemptions found</h4>
        <p class="empty-message">
          {{ activeFilter === 'all' ? 'You haven\'t made any redemptions yet.' : `No ${activeFilter} redemptions found.` }}
        </p>
        <button class="new-redemption-btn" @click="navigateToRedeem">
          <span class="btn-icon">➕</span>
          <span class="btn-text">Make First Redemption</span>
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="dashboard-section error-section">
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error }}</span>
        <button class="retry-btn" @click="loadRedemptions">Retry</button>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script>
// RedemptionsView.vue <script> section with caching implementation
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
// import apiService from '../services/api'
import { useCachedApi } from '../composables/useCachedApi'

export default {
  name: 'RedemptionsView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    
    // Use cached API composable for redemptions data
    const { getRedemptions } = useCachedApi()
    
    // State management
    const isLoading = ref(true)
    const error = ref('')
    const allRedemptions = ref([])
    const activeFilter = ref('all')
    const currentPage = ref(1)
    const itemsPerPage = 8
    const lastRefreshTime = ref(null)
    const cacheStatus = ref({
      isFromCache: false,
      source: 'network'
    })

    // Filter options
    const filters = ref([
      { value: 'all', label: 'All', icon: '📊' },
      { value: 'pending', label: 'Pending', icon: '⏳' },
      { value: 'approved', label: 'Completed', icon: '✅' },
      { value: 'rejected', label: 'Failed', icon: '❌' }
    ])

    // Computed properties
    const filteredRedemptions = computed(() => {
      if (activeFilter.value === 'all') {
        return allRedemptions.value
      }
      return allRedemptions.value.filter(r => r.status === activeFilter.value)
    })

    const totalPages = computed(() => 
      Math.ceil(filteredRedemptions.value.length / itemsPerPage)
    )

    const paginatedRedemptions = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredRedemptions.value.slice(start, end)
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
    const formatNumber = (num) => {
      if (!num) return '0'
      return num.toLocaleString('id-ID')
    }

    const formatCurrency = (value) => {
      if (!value) return 'Rp 0'
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(numValue)
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

    const formatRedemptionType = (type) => {
      const typeMap = {
        'cash': 'Cash Transfer',
        'voucher': 'Gift Voucher',
        'crypto': 'Cryptocurrency',
        'product': 'Product Exchange'
      }
      return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1)
    }

    const formatBankDetails = (details) => {
      if (!details) return ''
      
      if (details.bankName && details.bankAccount) {
        const maskedAccount = details.bankAccount.replace(/(\d{4})\d*(\d{4})/, '$1****$2')
        return `${details.bankName} - ${maskedAccount}`
      }
      
      return JSON.stringify(details).substring(0, 50) + '...'
    }

    const formatStatus = (status) => {
      const statusMap = {
        'pending': 'Pending',
        'processing': 'Processing',
        'approved': 'Completed',
        'rejected': 'Failed',
        'cancelled': 'Cancelled'
      }
      return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
    }

    // API methods with caching
    const loadRedemptions = async (forceRefresh = false) => {
      isLoading.value = true
      error.value = ''
      
      const startTime = Date.now()

      try {
        // Use cached API call with configurable refresh
        const response = await getRedemptions(
          { limit: 100 }, // Load more redemptions for filtering
          { 
            ttl: 15 * 60 * 1000, // 15 minutes cache
            forceRefresh: forceRefresh 
          }
        )

        const responseTime = Date.now() - startTime
        
        if (response.success) {
          allRedemptions.value = response.data.redemptions || []
          lastRefreshTime.value = new Date()
          
          // Update cache status based on response time
          cacheStatus.value = {
            isFromCache: responseTime < 100, // Likely from cache if very fast
            source: responseTime < 100 ? 'cache' : 'network',
            responseTime: responseTime
          }
          
          console.log(`Redemptions loaded from ${cacheStatus.value.source} in ${responseTime}ms`)
        } else {
          throw new Error(response.message || 'Failed to load redemptions')
        }

      } catch (err) {
        console.error('Error loading redemptions:', err)
        error.value = 'Failed to load redemptions. Please try again.'
        allRedemptions.value = []
        
        // Update cache status for error case
        cacheStatus.value = {
          isFromCache: false,
          source: 'error',
          responseTime: Date.now() - startTime
        }
      } finally {
        isLoading.value = false
      }
    }

    // Force refresh redemptions data
    const refreshRedemptions = async () => {
      console.log('Force refreshing redemptions data...')
      await loadRedemptions(true)
    }

    // Event handlers
    const setActiveFilter = (filterValue) => {
      if (activeFilter.value !== filterValue) {
        activeFilter.value = filterValue
        currentPage.value = 1 // Reset to first page when filter changes
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

    const navigateToRedeem = () => {
      router.push('/profile/redeem')
    }

    const viewRedemptionDetails = (redemption) => {
      // For now, just show alert with details
      // In future, you can navigate to detailed redemption view
      const details = [
        `Redemption ID: ${redemption.id}`,
        `Points: ${formatNumber(redemption.pointsRedeemed)}`,
        `Value: ${formatCurrency(redemption.redemptionValue)}`,
        `Status: ${formatStatus(redemption.status)}`,
        `Requested: ${formatDate(redemption.created_at)}`
      ]
      
      if (redemption.processedAt) {
        details.push(`Processed: ${formatDate(redemption.processedAt)}`)
      }
      
      if (cacheStatus.value.isFromCache) {
        details.push(`Data from: ${cacheStatus.value.source} (${cacheStatus.value.responseTime}ms)`)
      }
      
      alert(details.join('\n'))
    }

    // Initialize on mount
    onMounted(() => {
      loadRedemptions()
    })

    return {
      isLoading,
      error,
      allRedemptions,
      filteredRedemptions,
      paginatedRedemptions,
      activeFilter,
      currentPage,
      totalPages,
      visiblePages,
      filters,
      lastRefreshTime,
      cacheStatus,
      formatNumber,
      formatCurrency,
      formatDate,
      formatRedemptionTitle,
      formatRedemptionType,
      formatBankDetails,
      formatStatus,
      setActiveFilter,
      goToPage,
      goBack,
      navigateToRedeem,
      viewRedemptionDetails,
      loadRedemptions,
      refreshRedemptions
    }
  }
}
</script>

<style scoped>
/* Reset and Base Styles - Following BankAccountView pattern */
* {
  box-sizing: border-box;
}

/* Redemptions View Main Container - Same pattern as BankAccountView */
.redemptions-view {
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
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Filter Section */
.filter-section {
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  background: #F1F5F9;
  border-radius: 12px;
  padding: 0.375rem;
}

.filter-tab {
  flex: 1;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-family: 'Baloo 2', sans-serif;
}

.filter-tab:hover:not(:disabled) {
  background: rgba(79, 195, 247, 0.1);
}

.filter-tab.active {
  background: #4FC3F7;
  color: white;
  box-shadow: 0 2px 6px rgba(79, 195, 247, 0.3);
}

.filter-tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-icon {
  font-size: 1.125rem;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
}

.redemption-count {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Redemptions List - Similar to accounts list */
.redemptions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.redemption-item {
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

.redemption-item:hover {
  transform: translateY(-2px);
  border-color: #4FC3F7;
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.15);
}

.redemption-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #F59E0B, #D97706);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  color: white;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  margin-right: 0.5rem;
}

.redemption-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

.redemption-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.redemption-date {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.redemption-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.125rem;
  flex-wrap: wrap;
}

.redemption-type {
  font-size: 0.625rem;
  color: #4FC3F7;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  background: rgba(79, 195, 247, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 6px;
}

.redemption-value {
  font-size: 0.75rem;
  color: #059669;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
}

.redemption-details {
  margin-top: 0.125rem;
}

.detail-text {
  font-size: 0.625rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 400;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.redemption-status {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-family: 'Baloo 2', sans-serif;
  text-transform: uppercase;
  flex-shrink: 0;
  text-align: center;
  min-width: 60px;
  letter-spacing: 0.025em;
}

.redemption-status.pending {
  background: #FEF3C7;
  color: #92400E;
}

.redemption-status.processing {
  background: #DBEAFE;
  color: #1E40AF;
}

.redemption-status.completed {
  background: #D1FAE5;
  color: #065F46;
}

.redemption-status.failed {
  background: #FEE2E2;
  color: #991B1B;
}

.redemption-status.cancelled {
  background: #F3F4F6;
  color: #374151;
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

.new-redemption-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.new-redemption-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

.btn-icon {
  font-size: 1rem;
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

.page-icon {
  font-size: 0.875rem;
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

  .redemption-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    padding: 1rem;
  }

  .redemption-icon {
    align-self: flex-start;
    margin-right: 0;
    margin-bottom: 0.5rem;
  }

  .redemption-status {
    align-self: flex-start;
    margin-top: 0.5rem;
  }

  .redemption-meta {
    gap: 0.375rem;
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
  .redemptions-view {
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

  .redemption-title {
    font-size: 0.9375rem;
  }

  .redemption-date {
    font-size: 0.8125rem;
  }

  .redemption-value {
    font-size: 0.8125rem;
  }
}

@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .redemptions-view {
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

  .redemption-title {
    font-size: 1rem;
  }

  .redemption-date {
    font-size: 0.875rem;
  }

  .redemption-value {
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

  .redemptions-view {
    padding-bottom: 100px;
  }

  .redemption-title {
    font-size: 1.0625rem;
  }

  .redemption-date {
    font-size: 0.9375rem;
  }

  .redemption-value {
    font-size: 0.9375rem;
  }
}

/* Prevent content overflow on all screen sizes */
.redemptions-view,
.redemptions-view * {
  max-width: 100%;
  box-sizing: border-box;
}

/* Last section margin fix */
.dashboard-section:last-of-type {
  margin-bottom: 2rem;
}
</style>