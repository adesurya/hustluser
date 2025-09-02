<template>
  <div class="transactions-view dashboard-page">
    <HustlHeader :isDashboard="true" />

    <!-- Header with Back Button -->
    <div class="dashboard-section header-section">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import apiService from '../services/api'

export default {
  name: 'TransactionsView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    
    // State management
    const isLoading = ref(true)
    const error = ref('')
    const allTransactions = ref([])
    const activeFilter = ref('all')
    const currentPage = ref(1)
    const itemsPerPage = 10

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
        'ADJUSTMENT': 'Admin Adjustment'
      }
      return typeMap[activityType] || activityType.replace('_', ' ')
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

    // API methods
    const loadTransactions = async () => {
      isLoading.value = true
      error.value = ''

      try {
        const response = await apiService.getMyTransactions({ 
          limit: 100  // Load more transactions for filtering
        })

        if (response.success) {
          allTransactions.value = response.data.transactions || []
        } else {
          throw new Error(response.message || 'Failed to load transactions')
        }

      } catch (err) {
        console.error('Error loading transactions:', err)
        error.value = 'Failed to load transactions. Please try again.'
        allTransactions.value = []
      } finally {
        isLoading.value = false
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

    // Initialize on mount
    onMounted(() => {
      loadTransactions()
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
      formatNumber,
      formatDate,
      formatTransactionType,
      formatStatus,
      setActiveFilter,
      goToPage,
      goBack,
      loadTransactions
    }
  }
}
</script>

<style scoped>
.transactions-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
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

/* Header Section */
.header-section {
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.header-container {
  display: flex;
  align-items: center;
  gap: 1rem;
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

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
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
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.transaction-count {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Transactions List */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.transaction-item {
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

.transaction-item:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
  transform: translateY(-1px);
}

.transaction-icon {
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

.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.transaction-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
  line-height: 1.3;
}

.transaction-date {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  margin: 0;
}

.transaction-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.transaction-type {
  font-size: 0.7rem;
  color: #4FC3F7;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  background: rgba(79, 195, 247, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: 8px;
}

.transaction-status {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 8px;
  font-family: 'Baloo 2', sans-serif;
  text-transform: uppercase;
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
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
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
</style>