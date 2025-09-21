<template>
  <div class="mission-history-overlay" v-if="isVisible" @click="handleOverlayClick">
    <div class="mission-history-modal" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <span class="history-emoji">📋</span>
          </div>
          <h3 class="modal-title">Mission History</h3>
        </div>
        <button class="close-btn" @click="$emit('close')" :disabled="isLoading">
          <span class="close-icon">✕</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-section">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading mission history...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-section">
        <div class="error-icon">⚠️</div>
        <h4 class="error-title">Failed to Load</h4>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="loadMissionHistory">
          Try Again
        </button>
      </div>

      <!-- Mission History Content -->
      <div v-else class="modal-content">
        <!-- Summary Stats -->
        <div class="stats-section" v-if="missionData.length > 0">
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <span class="stat-number">{{ completedMissions }}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-info">
              <span class="stat-number">{{ totalPoints }}</span>
              <span class="stat-label">Total XP</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-info">
              <span class="stat-number">{{ activeDays }}</span>
              <span class="stat-label">Active Days</span>
            </div>
          </div>
        </div>

        <!-- Mission List -->
        <div class="missions-section">
          <h4 class="section-title" v-if="missionData.length > 0">Recent Missions</h4>
          
          <div class="mission-list" v-if="missionData.length > 0">
            <div 
              v-for="mission in missionData" 
              :key="mission.id"
              class="mission-history-item"
              :class="{ completed: mission.isCompleted }"
            >
              <div class="mission-date-badge">
                <span class="date-text">{{ formatDate(mission.missionDate) }}</span>
              </div>
              
              <div class="mission-content">
                <div class="mission-header">
                  <div class="mission-type-icon">
                    <span v-if="mission.missionType === 'PRODUCT_SHARE'">📤</span>
                    <span v-else-if="mission.missionType === 'DAILY_LOGIN'">🔑</span>
                    <span v-else>🎯</span>
                  </div>
                  <div class="mission-info">
                    <h5 class="mission-name">{{ getMissionName(mission.missionType) }}</h5>
                    <p class="mission-description">{{ getMissionDescription(mission.missionType) }}</p>
                  </div>
                  <div class="mission-status">
                    <div class="status-badge" :class="{ completed: mission.isCompleted }">
                      <span v-if="mission.isCompleted">✓</span>
                      <span v-else>⏳</span>
                    </div>
                  </div>
                </div>
                
                <div class="mission-progress-section">
                  <div class="progress-info">
                    <span class="progress-text">
                      {{ mission.currentProgress }}/{{ mission.targetProgress }}
                    </span>
                    <span class="progress-percentage">
                      {{ Math.round((mission.currentProgress / mission.targetProgress) * 100) }}%
                    </span>
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill"
                      :style="{ width: `${Math.min((mission.currentProgress / mission.targetProgress) * 100, 100)}%` }"
                    ></div>
                  </div>
                </div>
                
                <div class="mission-rewards">
                  <div class="reward-item">
                    <span class="reward-icon">🏆</span>
                    <span class="reward-text">+{{ mission.bonusPoints }} XP</span>
                  </div>
                  <div class="bonus-status" v-if="mission.isCompleted">
                    <span class="bonus-claimed" v-if="mission.bonusClaimed">
                      <span class="claimed-icon">✓</span>
                      <span class="claimed-text">Claimed</span>
                    </span>
                    <span class="bonus-pending" v-else>
                      <span class="pending-icon">⏳</span>
                      <span class="pending-text">Pending</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon">📋</div>
            <h4 class="empty-title">No Mission History</h4>
            <p class="empty-message">Complete your first mission to see it here!</p>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.totalPages > 1" class="pagination-section">
          <button 
            class="page-btn"
            :disabled="pagination.currentPage === 1 || isLoading"
            @click="goToPage(pagination.currentPage - 1)"
          >
            ← Previous
          </button>
          
          <span class="page-info">
            Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
          </span>
          
          <button 
            class="page-btn"
            :disabled="pagination.currentPage === pagination.totalPages || isLoading"
            @click="goToPage(pagination.currentPage + 1)"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useCachedApi } from '../composables/useCachedApi'

export default {
  name: 'MissionHistory',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { getMissionHistory } = useCachedApi()
    
    const isLoading = ref(false)
    const error = ref('')
    const missionData = ref([])
    const pagination = ref(null)
    const currentPage = ref(1)

    // Computed properties
    const completedMissions = computed(() => {
      return missionData.value.filter(mission => mission.isCompleted).length
    })

    const totalPoints = computed(() => {
      return missionData.value
        .filter(mission => mission.isCompleted && mission.bonusClaimed)
        .reduce((total, mission) => total + mission.bonusPoints, 0)
    })

    const activeDays = computed(() => {
      const uniqueDates = new Set(
        missionData.value.map(mission => mission.missionDate)
      )
      return uniqueDates.size
    })

    // Methods
    const handleOverlayClick = () => {
      if (!isLoading.value) {
        emit('close')
      }
    }

    const loadMissionHistory = async (page = 1) => {
      isLoading.value = true
      error.value = ''
      
      try {
        const response = await getMissionHistory({ 
          page, 
          limit: 10 
        })
        
        if (response.success) {
          missionData.value = response.data.missions || []
          pagination.value = response.data.pagination || null
          currentPage.value = page
        } else {
          throw new Error(response.message || 'Failed to load mission history')
        }
      } catch (err) {
        console.error('Failed to load mission history:', err)
        error.value = err.message || 'Unable to load mission history'
        missionData.value = []
        pagination.value = null
      } finally {
        isLoading.value = false
      }
    }

    const goToPage = (page) => {
      if (page >= 1 && pagination.value && page <= pagination.value.totalPages) {
        loadMissionHistory(page)
      }
    }

    const getMissionName = (missionType) => {
      const names = {
        'PRODUCT_SHARE': 'Share Products',
        'DAILY_LOGIN': 'Daily Login',
        'COMPLETE_PROFILE': 'Complete Profile',
        'INVITE_FRIENDS': 'Invite Friends',
        'MAKE_PURCHASE': 'Make Purchase'
      }
      return names[missionType] || 'Mission'
    }

    const getMissionDescription = (missionType) => {
      const descriptions = {
        'PRODUCT_SHARE': 'Share products with your network',
        'DAILY_LOGIN': 'Login to your account daily',
        'COMPLETE_PROFILE': 'Complete your profile information',
        'INVITE_FRIENDS': 'Invite friends to join Hustl',
        'MAKE_PURCHASE': 'Make a purchase through affiliate links'
      }
      return descriptions[missionType] || 'Complete this mission to earn rewards'
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown'
      
      const date = new Date(dateString)
      const now = new Date()
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // Watch for visibility changes
    watch(() => props.isVisible, (newVisible) => {
      if (newVisible) {
        currentPage.value = 1
        loadMissionHistory(1)
      }
    })

    return {
      isLoading,
      error,
      missionData,
      pagination,
      currentPage,
      completedMissions,
      totalPoints,
      activeDays,
      handleOverlayClick,
      loadMissionHistory,
      goToPage,
      getMissionName,
      getMissionDescription,
      formatDate
    }
  }
}
</script>

<style scoped>
.mission-history-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  animation: overlayFadeIn 0.3s ease-out;
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.mission-history-modal {
  background: white;
  border-radius: 24px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideIn {
  from { 
    opacity: 0;
    transform: translateY(40px) scale(0.9);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.history-emoji {
  font-size: 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  font-family: 'Baloo 2', sans-serif;
}

.close-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.close-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.close-icon {
  font-size: 1rem;
  font-weight: 600;
}

/* Loading and Error States */
.loading-section,
.error-section {
  padding: 3rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E5E7EB;
  border-top: 4px solid #4FC3F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #DC2626;
  margin: 0 0 0.5rem 0;
  font-family: 'Baloo 2', sans-serif;
}

.error-message {
  color: #6B7280;
  margin-bottom: 1.5rem;
  font-family: 'Baloo 2', sans-serif;
}

.retry-btn {
  background: #4FC3F7;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Baloo 2', sans-serif;
}

.retry-btn:hover {
  background: #29B6F6;
  transform: translateY(-1px);
}

/* Content */
.modal-content {
  max-height: calc(90vh - 100px);
  overflow-y: auto;
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: #F8FAFC;
  border-bottom: 1px solid #E5E7EB;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.stat-label {
  font-size: 0.8rem;
  color: #6B7280;
  font-weight: 500;
  font-family: 'Baloo 2', sans-serif;
}

/* Missions Section */
.missions-section {
  padding: 1.5rem 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 1.5rem 0;
  font-family: 'Baloo 2', sans-serif;
}

.mission-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mission-history-item {
  background: #F8FAFC;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s;
}

.mission-history-item:hover {
  border-color: #CBD5E1;
  transform: translateY(-1px);
}

.mission-history-item.completed {
  background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
  border-color: #A7F3D0;
}

.mission-date-badge {
  background: #E5E7EB;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #D1D5DB;
}

.mission-history-item.completed .mission-date-badge {
  background: #A7F3D0;
  color: #065F46;
}

.date-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4B5563;
  font-family: 'Baloo 2', sans-serif;
}

.mission-content {
  padding: 1.25rem;
}

.mission-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.mission-type-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.mission-history-item.completed .mission-type-icon {
  background: linear-gradient(135deg, #10B981, #059669);
}

.mission-info {
  flex: 1;
}

.mission-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
  font-family: 'Baloo 2', sans-serif;
}

.mission-description {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
  font-family: 'Baloo 2', sans-serif;
}

.mission-status {
  flex-shrink: 0;
}

.status-badge {
  width: 32px;
  height: 32px;
  background: #E5E7EB;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  font-size: 0.875rem;
}

.status-badge.completed {
  background: #10B981;
  color: white;
}

.mission-progress-section {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-text {
  font-size: 0.875rem;
  color: #4B5563;
  font-weight: 500;
  font-family: 'Baloo 2', sans-serif;
}

.progress-percentage {
  font-size: 0.875rem;
  color: #4FC3F7;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
}

.mission-history-item.completed .progress-percentage {
  color: #10B981;
}

.progress-bar {
  height: 6px;
  background: #E5E7EB;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4FC3F7, #29B6F6);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.mission-history-item.completed .progress-fill {
  background: linear-gradient(90deg, #10B981, #059669);
}

.mission-rewards {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.reward-icon {
  font-size: 0.875rem;
}

.reward-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4FC3F7;
  font-family: 'Baloo 2', sans-serif;
}

.mission-history-item.completed .reward-text {
  color: #10B981;
}

.bonus-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.bonus-claimed {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #059669;
}

.bonus-pending {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #D97706;
}

.claimed-icon,
.pending-icon {
  font-size: 0.75rem;
}

.claimed-text,
.pending-text {
  font-size: 0.75rem;
  font-weight: 500;
  font-family: 'Baloo 2', sans-serif;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
  font-family: 'Baloo 2', sans-serif;
}

.empty-message {
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-top: 1px solid #E5E7EB;
  background: #F8FAFC;
}

.page-btn {
  background: #4FC3F7;
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

.page-btn:hover:not(:disabled) {
  background: #29B6F6;
  transform: translateY(-1px);
}

.page-btn:disabled {
  background: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
  transform: none;
}

.page-info {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 500;
  font-family: 'Baloo 2', sans-serif;
}

/* Responsive */
@media (max-width: 640px) {
  .mission-history-modal {
    max-width: calc(100vw - 2rem);
    border-radius: 20px;
  }
  
  .modal-header {
    padding: 1.25rem 1.5rem;
  }
  
  .missions-section {
    padding: 1.25rem 1.5rem;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
    padding: 1.25rem 1.5rem;
    gap: 0.75rem;
  }
  
  .mission-content {
    padding: 1rem;
  }
  
  .pagination-section {
    padding: 1rem 1.5rem;
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>