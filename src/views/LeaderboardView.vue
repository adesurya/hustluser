<template>
  <div class="leaderboard-view dashboard-page">
    <HustlHeader :isDashboard="true" />

    <!-- Mission Popup -->
    <MissionPopup 
      :isVisible="showMissionPopup"
      @close="showMissionPopup = false"
      @viewMissions="handleViewMissions"
      @checkinComplete="handleCheckinComplete"
    />

    <!-- Mission History Modal -->
    <MissionHistory
      :isVisible="showMissionHistory"
      @close="showMissionHistory = false"
    />

    <!-- Mission Banner -->
    <SimpleMissionBanner 
      :key="gamificationData?.checkin?.lastCheckinDate || 'default'"
      :gamificationData="gamificationData"
      :isProcessing="isProcessingCheckin"
      @quickCheckin="performQuickCheckin"
      @openMissions="showMissionPopup = true"
    />



    <!-- Filter Section -->
    <div class="dashboard-section filter-section">
      <div class="section-header">
        <h3 class="section-title">Leaderboard</h3>
      </div>
      <div class="filter-tabs">
        <button 
          v-for="filter in filters" 
          :key="filter.id"
          class="filter-tab"
          :class="{ active: activeFilter === filter.id }"
          @click="setActiveFilter(filter.id)"
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
      <p class="loading-text">Loading leaderboard...</p>
    </div>

    <!-- Top 3 Winners Section -->
    <div v-else-if="topUsers.length > 0" class="dashboard-section winners-section">
      <div class="section-header">
        <h3 class="section-title">Top Champions</h3>
        <span class="period-label">{{ getCurrentPeriodLabel() }}</span>
      </div>
      <div class="winners-podium">
        <!-- 2nd Place -->
        <div v-if="topUsers[1]" class="winner-card second-place">
          <div class="winner-rank">
            <span class="rank-number">2</span>
          </div>
          <div class="winner-avatar silver">
            <span class="avatar-text">{{ getInitials(topUsers[1].user.username) }}</span>
          </div>
          <div class="winner-info">
            <h4 class="winner-name">{{ maskUsername(topUsers[1].user.username) }}</h4>
            <div class="winner-coins">
              <span class="coin-icon">🪙</span>
              <span class="coin-amount">{{ formatNumber(topUsers[1].points) }}</span>
            </div>
            <div class="winner-badge">{{ topUsers[1].badge }}</div>
          </div>
        </div>

        <!-- 1st Place -->
        <div v-if="topUsers[0]" class="winner-card first-place">
          <div class="winner-crown">👑</div>
          <div class="winner-rank">
            <span class="rank-number">1</span>
          </div>
          <div class="winner-avatar gold">
            <span class="avatar-text">{{ getInitials(topUsers[0].user.username) }}</span>
          </div>
          <div class="winner-info">
            <h4 class="winner-name">{{ topUsers[0].user.username }}</h4>
            <div class="winner-coins">
              <span class="coin-icon">🪙</span>
              <span class="coin-amount">{{ formatNumber(topUsers[0].points) }}</span>
            </div>
            <div class="winner-badge">{{ topUsers[0].badge }}</div>
          </div>
        </div>

        <!-- 3rd Place -->
        <div v-if="topUsers[2]" class="winner-card third-place">
          <div class="winner-rank">
            <span class="rank-number">3</span>
          </div>
          <div class="winner-avatar bronze">
            <span class="avatar-text">{{ getInitials(topUsers[2].user.username) }}</span>
          </div>
          <div class="winner-info">
            <h4 class="winner-name">{{ maskUsername(topUsers[2].user.username) }}</h4>
            <div class="winner-coins">
              <span class="coin-icon">🪙</span>
              <span class="coin-amount">{{ formatNumber(topUsers[2].points) }}</span>
            </div>
            <div class="winner-badge">{{ topUsers[2].badge }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Other Users Section -->
    <div v-if="!isLoading && otherUsers.length > 0" class="dashboard-section users-section">
      <div class="section-header">
        <h3 class="section-title">Juara Lainnya</h3>
        <span class="users-count">{{ totalParticipants }} participants</span>
      </div>
      
      <div class="users-list">
        <div 
          v-for="user in paginatedUsers" 
          :key="user.user.id" 
          class="user-item"
        >
          <div class="user-rank">
            <span class="rank-text">#{{ user.rank }}</span>
          </div>
          <div class="user-avatar">
            <span class="avatar-text">{{ getInitials(user.user.username) }}</span>
          </div>
          <div class="user-info">
            <h4 class="user-name">{{ user.rank === 1 ? user.user.username : maskUsername(user.user.username) }}</h4>
            <div class="user-coins">
              <span class="coin-icon">🪙</span>
              <span class="coin-amount">{{ formatNumber(user.points) }}</span>
            </div>
          </div>
          <div class="user-badge">
            <span class="badge-text">{{ user.badge }}</span>
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
    <div v-if="!isLoading && allUsers.length === 0" class="dashboard-section empty-section">
      <div class="empty-state">
        <div class="empty-icon">🏆</div>
        <h4 class="empty-title">No participants yet</h4>
        <p class="empty-message">Be the first to earn points and appear on the leaderboard!</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="dashboard-section error-section">
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error }}</span>
        <button class="retry-btn" @click="loadLeaderboard">Retry</button>
      </div>
    </div>

    <BottomNavigation />
  </div>
</template>

<script>
// Enhanced LeaderboardView.vue - Script section LENGKAP dengan perbaikan ESLint
import { ref, computed, onMounted, nextTick } from 'vue'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import MissionPopup from '../components/MissionPopup.vue'
import MissionHistory from '../components/MissionHistory.vue'
import SimpleMissionBanner from '../components/SimpleMissionBanner.vue'
import { useCachedApi } from '../composables/useCachedApi'
import { useToast } from '../composables/useToast'

export default {
  name: 'LeaderboardView',
  components: {
    BottomNavigation,
    HustlHeader,
    MissionPopup,
    MissionHistory,
    SimpleMissionBanner
  },
  // LeaderboardView.vue - setup() method yang sudah diperbaiki
setup() {
  const { showToast } = useToast()
  
  // Use cached API composable - ONLY required APIs
  const { 
    loading: isLoading, 
    error, 
    getLeaderboard,           // ✅ Required for leaderboard
    performCheckin,           // ✅ Required for check-in
    getGamificationStatus,    // ✅ Required for mission data
    getMissionHistory,        // ✅ Required for mission history
    invalidateCache
  } = useCachedApi()
  
  const activeFilter = ref('daily')
  const currentPage = ref(1)
  const usersPerPage = 7
  
  // Mission-related state
  const showMissionPopup = ref(false)
  const showMissionHistory = ref(false)
  const gamificationData = ref(null)
  const isProcessingCheckin = ref(false)
  
  // API response data
  const leaderboardData = ref(null)
  const allUsers = ref([])
  const totalParticipants = ref(0)

  // Filter options
  const filters = ref([
    { id: 'daily', label: 'Daily', icon: '📅' },
    { id: 'monthly', label: 'Monthly', icon: '📈' }
  ])

  // Computed properties remain the same...
  const topUsers = computed(() => {
    return allUsers.value.slice(0, 3)
  })
  
  const otherUsers = computed(() => {
    return allUsers.value.slice(3)
  })

  const totalPages = computed(() => Math.ceil(otherUsers.value.length / usersPerPage))

  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * usersPerPage
    const end = start + usersPerPage
    return otherUsers.value.slice(start, end)
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

  // Helper methods remain the same...
  const maskUsername = (username) => {
    if (!username || username.length <= 3) return username
    const firstTwo = username.substring(0, 2)
    const lastOne = username.substring(username.length - 1)
    const masked = '*'.repeat(Math.max(1, username.length - 3))
    return firstTwo + masked + lastOne
  }

  const getInitials = (username) => {
    if (!username) return '??'
    return username.substring(0, 2).toUpperCase()
  }

  const formatNumber = (num) => {
    return num.toLocaleString('id-ID')
  }

  const getCurrentPeriodLabel = () => {
    const labels = {
      daily: 'Today',
      monthly: 'This Month'
    }
    return labels[activeFilter.value] || 'This Period'
  }

  // FIXED: loadGamificationData - ensure proper API call
  const loadGamificationData = async (forceRefresh = false) => {
    try {
      console.log('=== LOADING GAMIFICATION DATA ===')
      console.log('Force refresh:', forceRefresh)
      
      if (forceRefresh) {
        await invalidateCache('gamificationStatus')
        console.log('Cache invalidated')
      }
      
      // Call the correct gamification API
      const timestamp = Date.now()
      const response = await getGamificationStatus({ 
        forceRefresh: true,
        _t: timestamp
      })
      
      console.log('Gamification API Response:', response)
      
      if (response && response.success) {
        let validData = response.data
        
        // Handle unexpected array response
        if (Array.isArray(response.data)) {
          console.error('❌ Received array data - this should not happen with gamification API!')
          validData = {
            checkin: {
              hasCheckedInToday: false,
              currentStreak: 0,
              nextBonusIn: 7,
              lastCheckinDate: null,
              todayCheckinId: null,
              streakHistory: {
                streakCount: 0,
                isBonusDay: false,
                bonusPoints: 0
              }
            },
            missions: [],
            configs: {
              checkin: {
                streak_days: 7,
                bonus_points: 100,
                reset_on_miss: true
              }
            },
            totalPoints: 0
          }
        }
        
        // Ensure checkin structure
        if (!validData.checkin) {
          validData.checkin = {
            hasCheckedInToday: false,
            currentStreak: 0,
            nextBonusIn: 7,
            lastCheckinDate: null,
            todayCheckinId: null,
            streakHistory: {
              streakCount: 0,
              isBonusDay: false,
              bonusPoints: 0
            }
          }
        }
        
        // Validate critical fields
        if (typeof validData.checkin.hasCheckedInToday !== 'boolean') {
          validData.checkin.hasCheckedInToday = false
        }
        
        if (typeof validData.checkin.currentStreak !== 'number') {
          validData.checkin.currentStreak = 0
        }
        
        if (typeof validData.checkin.nextBonusIn !== 'number') {
          const streakDays = validData.configs?.checkin?.streak_days || 7
          validData.checkin.nextBonusIn = streakDays - (validData.checkin.currentStreak % streakDays)
          if (validData.checkin.nextBonusIn === 0) {
            validData.checkin.nextBonusIn = 7
          }
        }
        
        // Force reactivity update
        gamificationData.value = null
        await nextTick()
        gamificationData.value = validData
        
        console.log('✅ Gamification data updated:', {
          hasCheckedInToday: validData.checkin?.hasCheckedInToday,
          currentStreak: validData.checkin?.currentStreak,
          nextBonusIn: validData.checkin?.nextBonusIn,
          progressPercentage: Math.min((validData.checkin?.currentStreak / 7) * 100, 100),
          fullData: validData
        })
      } else {
        throw new Error(response?.message || 'Invalid response structure')
      }
    } catch (error) {
      console.error('Failed to load gamification data:', error)
      
      // Set safe default structure on error
      gamificationData.value = {
        checkin: {
          hasCheckedInToday: false,
          currentStreak: 0,
          nextBonusIn: 7,
          lastCheckinDate: null,
          todayCheckinId: null,
          streakHistory: {
            streakCount: 0,
            isBonusDay: false,
            bonusPoints: 0
          }
        },
        missions: [],
        configs: {
          checkin: {
            streak_days: 7,
            bonus_points: 100,
            reset_on_miss: true
          }
        },
        totalPoints: 0
      }
    }
  }

  const performQuickCheckin = async () => {
    if (isProcessingCheckin.value) return

    isProcessingCheckin.value = true
    
    console.log('=== BEFORE CHECK-IN ===')
    console.log('Current gamification data:', gamificationData.value?.checkin)
    
    try {
      // 1. Check current status first
      try {
        await loadGamificationData(true)
        console.log('=== AFTER STATUS CHECK ===')
        console.log('Updated gamification data:', gamificationData.value?.checkin)
      } catch (statusError) {
        console.warn('Status check failed, continuing with current data:', statusError)
      }
      
      // 2. Validate check-in status
      const hasCheckedIn = gamificationData.value?.checkin?.hasCheckedInToday
      if (hasCheckedIn === true) {
        showToast({
          type: 'info',
          title: 'Already Checked In',
          message: 'You have already completed today\'s check-in!',
          duration: 3000
        })
        return
      }

      // 3. Perform check-in
      console.log('=== ATTEMPTING CHECK-IN ===')
      const response = await performCheckin()
      
      if (response && response.success) {
        console.log('=== CHECK-IN SUCCESS ===')
        console.log('Check-in response:', response.data)
        
        // Extract streak data from response
        const newStreak = response.data?.streak || 
          response.data?.currentStreak || 
          response.data?.streakHistory?.streakCount || 
          (gamificationData.value?.checkin?.currentStreak || 0) + 1
        
        // Update local data immediately for UI responsiveness
        if (gamificationData.value?.checkin) {
          gamificationData.value.checkin.hasCheckedInToday = true
          gamificationData.value.checkin.currentStreak = newStreak
          gamificationData.value.checkin.lastCheckinDate = new Date().toISOString().split('T')[0]
          
          // Calculate nextBonusIn (days until next bonus)
          const streakDays = gamificationData.value.configs?.checkin?.streak_days || 7
          gamificationData.value.checkin.nextBonusIn = streakDays - (newStreak % streakDays)
          
          // If completed full cycle, nextBonusIn should be 7
          if (gamificationData.value.checkin.nextBonusIn === 0) {
            gamificationData.value.checkin.nextBonusIn = 7
          }
        }
        
        // Force Vue reactivity update
        const tempData = { ...gamificationData.value }
        gamificationData.value = null
        await nextTick()
        gamificationData.value = tempData
        
        // Show success message with bonus info
        const bonusMessage = response.data?.bonusAwarded ? 
          ` | Bonus: +${response.data.bonusPoints} pts!` : ''
        
        showToast({
          type: 'success',
          title: 'Check-in Successful!',
          message: `Streak: ${newStreak} days${bonusMessage}`,
          duration: 5000
        })

        // 4. Refresh data after a short delay for backend sync
        setTimeout(async () => {
          try {
            await Promise.all([
              loadGamificationData(true),
              loadLeaderboard() // Also refresh leaderboard
            ])
            console.log('=== FINAL SYNC DATA ===')
            console.log('Final gamification data:', gamificationData.value?.checkin)
          } catch (syncError) {
            console.warn('Final sync failed:', syncError)
          }
        }, 1500)
        
      } else {
        throw new Error(response?.message || 'Check-in failed - invalid response')
      }
    } catch (error) {
      console.error('Check-in error:', error)
      
      // Enhanced error handling
      const errorMessage = error.message || error.toString()
      
      if (errorMessage.includes('Already checked in') || 
          errorMessage.includes('already completed') ||
          error.response?.status === 400) {
        
        // Update local state if server says already checked in
        if (gamificationData.value?.checkin) {
          gamificationData.value.checkin.hasCheckedInToday = true
        }
        
        showToast({
          type: 'info',
          title: 'Already Checked In',
          message: 'You have already completed today\'s check-in!',
          duration: 3000
        })
      } else {
        showToast({
          type: 'error',
          title: 'Check-in Failed',
          message: errorMessage.includes('Network') ? 
            'Network error. Please check your connection.' : 
            'Please try again later',
          duration: 3000
        })
      }
      
      // Always refresh to sync data
      try {
        await loadGamificationData(true)
      } catch (refreshError) {
        console.warn('Refresh after error failed:', refreshError)
      }
    } finally {
      isProcessingCheckin.value = false
    }
  }

  const handleViewMissions = () => {
    showMissionPopup.value = false
    showMissionHistory.value = true
  }

  const handleCheckinComplete = async (checkinData) => {
    console.log('Handle checkin complete:', checkinData)
    
    try {
      // Refresh both gamification and leaderboard data
      await Promise.all([
        loadGamificationData(true),
        loadLeaderboard()
      ])
      
      console.log('Data refreshed after checkin complete')
    } catch (error) {
      console.error('Failed to refresh data after checkin:', error)
    }
  }

  // FIXED: loadLeaderboard - only call leaderboard API
  const loadLeaderboard = async () => {
    try {
      console.log('🏆 Loading leaderboard data...')
      
      let params = {}
      
      switch (activeFilter.value) {
        case 'daily': {
          params = { date: new Date().toISOString().split('T')[0] }
          break
        }
        case 'monthly': {
          const now = new Date()
          params = { year: now.getFullYear(), month: now.getMonth() + 1 }
          break
        }
      }

      console.log(`Calling leaderboard API - type: ${activeFilter.value}, params:`, params)
      
      const response = await getLeaderboard(activeFilter.value, params)

      console.log('Leaderboard API response:', response)

      if (response.success) {
        leaderboardData.value = response.data
        allUsers.value = response.data.leaderboard || []
        totalParticipants.value = response.data.total_participants || 0
        currentPage.value = 1
        
        console.log('✅ Leaderboard loaded:', {
          totalUsers: allUsers.value.length,
          totalParticipants: totalParticipants.value
        })
      } else {
        throw new Error(response.message || 'Failed to load leaderboard')
      }
      
    } catch (err) {
      console.error('Error loading leaderboard:', err)
      allUsers.value = []
      totalParticipants.value = 0
    }
  }

  // Event handlers
  const setActiveFilter = async (filterId) => {
    if (activeFilter.value !== filterId) {
      activeFilter.value = filterId
      currentPage.value = 1
      await loadLeaderboard()
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  // Debug method untuk troubleshooting
  const debugGamificationAPI = async () => {
    console.log('=== GAMIFICATION API DEBUG ===')
    
    try {
      // Debug API call
      const response = await getGamificationStatus({ forceRefresh: true })
      console.log('Debug gamification response:', response)
      
      return response
    } catch (error) {
      console.error('Debug failed:', error)
      return null
    }
  }

  // FIXED: Initialize on mount - only call required APIs
  onMounted(async () => {
    console.log('=== LEADERBOARD VIEW MOUNTED ===')
    
    // Debug untuk memastikan API methods tersedia
    console.log('Available cached API methods:', {
      hasGetGamificationStatus: typeof getGamificationStatus === 'function',
      hasPerformCheckin: typeof performCheckin === 'function',
      hasGetLeaderboard: typeof getLeaderboard === 'function',
      hasGetMissionHistory: typeof getMissionHistory === 'function',
      hasInvalidateCache: typeof invalidateCache === 'function'
    })

    // Load only required data for leaderboard page
    try {
      await Promise.all([
        loadLeaderboard(),        // ✅ Required - leaderboard data
        loadGamificationData()    // ✅ Required - mission banner data
      ])
      
      console.log('✅ Leaderboard page initialization complete')
    } catch (error) {
      console.error('❌ Failed to initialize leaderboard page:', error)
    }
  })

  return {
    // Leaderboard state
    activeFilter,
    currentPage,
    filters,
    isLoading,
    error,
    topUsers,
    otherUsers,
    paginatedUsers,
    totalPages,
    totalParticipants,
    visiblePages,
    allUsers,
    
    // Mission state
    showMissionPopup,
    showMissionHistory,
    gamificationData,
    isProcessingCheckin,
    
    // Methods
    maskUsername,
    getInitials,
    formatNumber,
    setActiveFilter,
    getCurrentPeriodLabel,
    goToPage,
    loadLeaderboard,
    performQuickCheckin,
    handleViewMissions,
    handleCheckinComplete,
    debugGamificationAPI
  }
}
}
</script>

<style scoped>
/* Override main.css container restrictions for LeaderboardView - Fixed for all screen sizes */
.leaderboard-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  width: 100%;
  overflow-x: hidden;
  position: relative;
}

/* Force full width and transparent background on ALL screen sizes */
.leaderboard-view .page-container {
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

.leaderboard-view .app-main {
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

/* Dashboard sections - Updated to match CategoryView margin system */
.dashboard-section {
  background: white;
  margin: 0 1rem 1.5rem 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.9);
  width: calc(100% - 2rem);
  max-width: calc(100% - 2rem);
  box-sizing: border-box;
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

.period-label,
.users-count {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Filter Section */
.filter-section {
  padding: 1.25rem;
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

/* Winners Section */
.winners-section {
  padding: 1.5rem 1.25rem;
}

.winners-podium {
  display: flex;
  justify-content: center;
  align-items: end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.winner-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  padding: 1rem 0.75rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid transparent;
  transition: all 0.2s;
  flex: 1;
  max-width: 110px;
}

.winner-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.first-place {
  transform: scale(1.1);
  border-color: #FFD700;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
  z-index: 3;
}

.second-place {
  border-color: #C0C0C0;
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(192, 192, 192, 0.05));
  z-index: 2;
}

.third-place {
  border-color: #CD7F32;
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.1), rgba(205, 127, 50, 0.05));
  z-index: 1;
}

.winner-crown {
  position: absolute;
  top: -8px;
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.winner-rank {
  background: #4FC3F7;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 6px rgba(79, 195, 247, 0.3);
}

.first-place .winner-rank {
  background: #FFD700;
  color: #1F2937;
}

.second-place .winner-rank {
  background: #C0C0C0;
  color: #1F2937;
}

.third-place .winner-rank {
  background: #CD7F32;
  color: white;
}

.winner-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.winner-avatar.gold {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.winner-avatar.silver {
  background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
}

.winner-avatar.bronze {
  background: linear-gradient(135deg, #CD7F32, #A0522D);
}

.winner-avatar .avatar-text {
  color: white;
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Baloo 2', sans-serif;
}

.winner-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
}

.winner-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.2;
  text-align: center;
}

.winner-coins {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(79, 195, 247, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
}

.coin-icon {
  font-size: 0.875rem;
}

.coin-amount {
  font-size: 0.8rem;
  font-weight: 700;
  color: #4FC3F7;
  font-family: 'Baloo 2', sans-serif;
}

.winner-badge {
  font-size: 0.7rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  text-align: center;
}

/* Users List */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.user-item {
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

.user-item:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
  transform: translateY(-1px);
}

.user-rank {
  width: 32px;
  text-align: center;
  flex-shrink: 0;
}

.rank-text {
  font-size: 0.875rem;
  font-weight: 700;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.25);
  flex-shrink: 0;
}

.user-avatar .avatar-text {
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Baloo 2', sans-serif;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.2;
}

.user-coins {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.user-coins .coin-icon {
  font-size: 0.75rem;
}

.user-coins .coin-amount {
  font-size: 0.8rem;
  font-weight: 700;
  color: #4FC3F7;
  font-family: 'Baloo 2', sans-serif;
}

.user-badge {
  flex-shrink: 0;
}

.badge-text {
  font-size: 0.7rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
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

/* Fixed Footer Styles */
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

/* Responsive Design - Updated to match CategoryView margin system */
@media (min-width: 640px) {
  .dashboard-section {
    margin: 0 1.5rem 1.5rem 1.5rem;
    width: calc(100% - 3rem);
    max-width: calc(100% - 3rem);
    padding: 1.25rem;
  }
}

@media (min-width: 768px) {
  .leaderboard-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  /* Force overrides for tablet range */
  .leaderboard-view .page-container {
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

  .leaderboard-view .app-main {
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
    margin: 0 2rem 1.5rem 2rem;
    width: calc(100% - 4rem);
    max-width: calc(100% - 4rem);
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .leaderboard-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: auto !important;
  }
  
  .leaderboard-view .page-container {
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
  
  .leaderboard-view .app-main {
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
    margin: 0 3rem 2rem 3rem;
    width: calc(100% - 6rem);
    max-width: calc(100% - 6rem);
    padding: 2rem;
  }
}

@media (min-width: 1200px) {
  .dashboard-section {
    margin: 0 4rem 2rem 4rem;
    width: calc(100% - 8rem);
    max-width: calc(100% - 8rem);
    padding: 2.5rem;
  }

  .leaderboard-view {
    padding-bottom: 100px;
  }
}

@media (min-width: 1400px) {
  .dashboard-section {
    margin: 0 6rem 2.5rem 6rem;
    width: calc(100% - 12rem);
    max-width: calc(100% - 12rem);
    padding: 2.5rem;
  }
}

/* Prevent content overflow on all screen sizes */
.leaderboard-view,
.leaderboard-view * {
  max-width: 100%;
  box-sizing: border-box;
}

/* Last section margin fix */
.dashboard-section:last-of-type {
  margin-bottom: 2rem;
}

</style>