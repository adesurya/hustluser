<template>
  <div class="transactions-view">
    <HustlHeader :isDashboard="true" />

    <!-- Header with Back Button -->
    <div class="header-section">
      <div class="header-container">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span class="back-text">Back</span>
        </button>
        <h3 class="page-title">Transaction History</h3>
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
      <p class="loading-text">Loading transactions...</p>
    </div>

    <!-- Transactions List -->
    <div v-else-if="filteredTransactions.length > 0" class="dashboard-section transactions-section">
      <div class="section-header">
        <h3 class="section-title">Transactions</h3>
        <span class="transaction-count">{{ filteredTransactions.length }} transactions</span>
      </div>
      
      <div class="transactions-list">
        <div 
          v-for="transaction in paginatedTransactions" 
          :key="transaction.id" 
          class="transaction-item"
        >
          <div class="transaction-icon" :style="{ background: transaction.transactionType === 'credit' ? '#10B981' : '#EF4444' }">
            <span>{{ transaction.transactionType === 'credit' ? '+' : '-' }}</span>
          </div>
          <div class="transaction-info">
            <h4 class="transaction-title">{{ transaction.activityDescription }}</h4>
            <p class="transaction-date">{{ formatDate(transaction.created_at) }}</p>
            <div class="transaction-meta">
              <span class="transaction-type">{{ formatTransactionType(transaction.activityType) }}</span>
              <span class="transaction-status" :class="transaction.status">{{ formatStatus(transaction.status) }}</span>
            </div>
          </div>
          <div class="transaction-amount" :class="transaction.transactionType">
            {{ transaction.transactionType === 'credit' ? '+' : '-' }}{{ formatNumber(transaction.amount) }}
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
        <div class="empty-icon">💰</div>
        <h4 class="empty-title">No transactions found</h4>
        <p class="empty-message">
          {{ activeFilter === 'all' ? 'You haven\'t made any transactions yet.' : `No ${activeFilter} transactions found.` }}
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="dashboard-section error-section">
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error }}</span>
        <button class="retry-btn" @click="loadTransactions">Retry</button>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script>
// TransactionsView.vue <script> section with enhanced caching implementation
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import { useCachedApi } from '../composables/useCachedApi'

export default {
  name: 'TransactionsView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    
    // Use cached API composable with enhanced error handling
    const { getTransactions } = useCachedApi()
    
    // State management
    const isLoading = ref(true)
    const error = ref('')
    const allTransactions = ref([])
    const activeFilter = ref('all')
    const currentPage = ref(1)
    const itemsPerPage = 10
    const lastRefreshTime = ref(null)
    const cacheStatus = ref({
      isFromCache: false,
      source: 'network',
      responseTime: 0
    })

    // Filter options
    const filters = ref([
      { value: 'all', label: 'All', icon: '📊' },
      { value: 'credit', label: 'Credit', icon: '⬆️' },
      { value: 'debit', label: 'Debit', icon: '⬇️' }
    ])

    // Computed properties
    const filteredTransactions = computed(() => {
      if (activeFilter.value === 'all') {
        return allTransactions.value
      }
      return allTransactions.value.filter(t => t.transactionType === activeFilter.value)
    })

    const totalPages = computed(() => 
      Math.ceil(filteredTransactions.value.length / itemsPerPage)
    )

    const paginatedTransactions = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredTransactions.value.slice(start, end)
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

    const formatTransactionType = (activityType) => {
      const typeMap = {
        'DAILY_LOGIN': 'Daily Login',
        'PRODUCT_PURCHASE': 'Product Purchase', 
        'REFERRAL_BONUS': 'Referral Bonus',
        'CAMPAIGN_REWARD': 'Campaign Reward',
        'REDEMPTION': 'Redemption',
        'ADJUSTMENT': 'Admin Adjustment',
        'AFFILIATE_COMMISSION': 'Affiliate Commission',
        'SHARE_BONUS': 'Share Bonus'
      }
      return typeMap[activityType] || activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    const formatStatus = (status) => {
      const statusMap = {
        'completed': 'Completed',
        'pending': 'Pending',
        'processing': 'Processing',
        'failed': 'Failed',
        'cancelled': 'Cancelled'
      }
      return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
    }

    // Enhanced load transactions with caching metrics
    const loadTransactions = async (forceRefresh = false) => {
      isLoading.value = true
      error.value = ''
      
      const startTime = Date.now()

      try {
        // Use cached API call with enhanced options
        const response = await getTransactions(
          { limit: 100 }, // Load more transactions for filtering
          { 
            ttl: 15 * 60 * 1000, // 15 minutes cache for transaction history
            forceRefresh: forceRefresh 
          }
        )

        const responseTime = Date.now() - startTime

        if (response.success) {
          allTransactions.value = response.data.transactions || []
          lastRefreshTime.value = new Date()
          
          // Update cache status based on response time and patterns
          cacheStatus.value = {
            isFromCache: responseTime < 100, // Likely from cache if very fast
            source: responseTime < 100 ? 'cache' : 'network',
            responseTime: responseTime,
            dataFreshness: forceRefresh ? 'fresh' : 'cached'
          }
          
          console.log(`Transactions loaded from ${cacheStatus.value.source} in ${responseTime}ms`)
          
          if (cacheStatus.value.isFromCache) {
            console.log('✅ Cache hit - Fast load from cached transactions')
          } else {
            console.log('🌐 Network call - Fresh transaction data loaded')
          }
        } else {
          throw new Error(response.message || 'Failed to load transactions')
        }

      } catch (err) {
        console.error('Error loading transactions:', err)
        error.value = 'Failed to load transactions. Please try again.'
        allTransactions.value = []
        
        // Update cache status for error case
        cacheStatus.value = {
          isFromCache: false,
          source: 'error',
          responseTime: Date.now() - startTime,
          dataFreshness: 'error'
        }
      } finally {
        isLoading.value = false
      }
    }

    // Force refresh transactions data
    const refreshTransactions = async () => {
      console.log('🔄 Force refreshing transactions data...')
      await loadTransactions(true)
    }

    // Smart refresh based on data age
    const smartRefresh = async () => {
      if (lastRefreshTime.value) {
        const timeSinceLastRefresh = Date.now() - lastRefreshTime.value.getTime()
        const refreshThreshold = 10 * 60 * 1000 // 10 minutes
        
        if (timeSinceLastRefresh > refreshThreshold) {
          console.log('⏰ Data is stale, refreshing transactions...')
          await refreshTransactions()
        } else {
          console.log('✨ Data is fresh, using cached transactions')
        }
      } else {
        await loadTransactions()
      }
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

    // Enhanced transaction item click with cache info
    const viewTransactionDetails = (transaction) => {
      const details = [
        `Transaction ID: ${transaction.id}`,
        `Type: ${formatTransactionType(transaction.activityType)}`,
        `Amount: ${transaction.transactionType === 'credit' ? '+' : '-'}${formatNumber(transaction.amount)}`,
        `Status: ${formatStatus(transaction.status)}`,
        `Date: ${formatDate(transaction.created_at)}`,
        `Description: ${transaction.activityDescription}`
      ]
      
      // Add cache information for debugging
      if (cacheStatus.value.isFromCache) {
        details.push(``)
        details.push(`🔧 Debug Info:`)
        details.push(`Data source: ${cacheStatus.value.source}`)
        details.push(`Response time: ${cacheStatus.value.responseTime}ms`)
        details.push(`Data freshness: ${cacheStatus.value.dataFreshness}`)
        if (lastRefreshTime.value) {
          details.push(`Last refresh: ${lastRefreshTime.value.toLocaleTimeString()}`)
        }
      }
      
      alert(details.join('\n'))
    }

    // Initialize on mount with smart refresh
    onMounted(() => {
      smartRefresh()
    })

    return {
      isLoading,
      error,
      allTransactions,
      filteredTransactions,
      paginatedTransactions,
      activeFilter,
      currentPage,
      totalPages,
      visiblePages,
      filters,
      lastRefreshTime,
      cacheStatus,
      formatNumber,
      formatDate,
      formatTransactionType,
      formatStatus,
      setActiveFilter,
      goToPage,
      goBack,
      loadTransactions,
      refreshTransactions,
      smartRefresh,
      viewTransactionDetails
    }
  }
}
</script>

<style scoped>
/* Reset and Base Styles - Following BankAccountView pattern */
* {
  box-sizing: border-box;
}

/* Transactions View Main Container - Same pattern as BankAccountView */
.transactions-view {
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

.transaction-count {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Transactions List - Similar to accounts list */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.transaction-item {
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

.transaction-item:hover {
  transform: translateY(-2px);
  border-color: #4FC3F7;
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.15);
}

.transaction-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  margin-right: 0.5rem;
}

.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

.transaction-title {
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

.transaction-date {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.125rem;
  flex-wrap: wrap;
}

.transaction-type {
  font-size: 0.625rem;
  color: #4FC3F7;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  background: rgba(79, 195, 247, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 6px;
}

.transaction-status {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 6px;
  font-family: 'Baloo 2', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.transaction-status.completed {
  background: #D1FAE5;
  color: #065F46;
}

.transaction-status.pending {
  background: #FEF3C7;
  color: #92400E;
}

.transaction-status.processing {
  background: #DBEAFE;
  color: #1E40AF;
}

.transaction-status.failed {
  background: #FEE2E2;
  color: #991B1B;
}

.transaction-amount {
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Baloo 2', sans-serif;
  flex-shrink: 0;
  text-align: right;
  min-width: 60px;
}

.transaction-amount.credit {
  color: #10B981;
}

.transaction-amount.debit {
  color: #EF4444;
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

  .transaction-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    padding: 1rem;
  }

  .transaction-icon {
    align-self: flex-start;
    margin-right: 0;
    margin-bottom: 0.5rem;
  }

  .transaction-amount {
    text-align: left;
    margin-top: 0.5rem;
    font-size: 1rem;
  }

  .transaction-meta {
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
  .transactions-view {
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

  .transaction-title {
    font-size: 0.9375rem;
  }

  .transaction-date {
    font-size: 0.8125rem;
  }

  .transaction-amount {
    font-size: 0.9375rem;
  }
}

@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .transactions-view {
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

  .transaction-title {
    font-size: 1rem;
  }

  .transaction-date {
    font-size: 0.875rem;
  }

  .transaction-amount {
    font-size: 1rem;
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

  .transactions-view {
    padding-bottom: 100px;
  }

  .transaction-title {
    font-size: 1.0625rem;
  }

  .transaction-date {
    font-size: 0.9375rem;
  }

  .transaction-amount {
    font-size: 1.0625rem;
  }
}

/* Prevent content overflow on all screen sizes */
.transactions-view,
.transactions-view * {
  max-width: 100%;
  box-sizing: border-box;
}

/* Last section margin fix */
.dashboard-section:last-of-type {
  margin-bottom: 2rem;
}
</style>