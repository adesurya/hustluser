<template>
  <div class="leaderboard-view dashboard-page">
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
        >
          <span class="filter-icon">{{ filter.icon }}</span>
          <span class="filter-label">{{ filter.label }}</span>
        </button>
      </div>
    </div>

    <!-- Top 3 Winners Section -->
    <div class="dashboard-section winners-section">
      <div class="section-header">
        <h3 class="section-title">Top Champions</h3>
        <span class="period-label">{{ getCurrentPeriodLabel() }}</span>
      </div>
      <div class="winners-podium">
        <!-- 2nd Place -->
        <div class="winner-card second-place">
          <div class="winner-rank">
            <span class="rank-number">2</span>
          </div>
          <div class="winner-avatar silver">
            <span class="avatar-text">{{ getInitials(topUsers[1].username) }}</span>
          </div>
          <div class="winner-info">
            <h4 class="winner-name">{{ maskUsername(topUsers[1].username) }}</h4>
            <div class="winner-coins">
              <span class="coin-icon">🪙</span>
              <span class="coin-amount">{{ formatNumber(topUsers[1].coins) }}</span>
            </div>
          </div>
        </div>

        <!-- 1st Place -->
        <div class="winner-card first-place">
          <div class="winner-crown">👑</div>
          <div class="winner-rank">
            <span class="rank-number">1</span>
          </div>
          <div class="winner-avatar gold">
            <span class="avatar-text">{{ getInitials(topUsers[0].username) }}</span>
          </div>
          <div class="winner-info">
            <h4 class="winner-name">{{ maskUsername(topUsers[0].username) }}</h4>
            <div class="winner-coins">
              <span class="coin-icon">🪙</span>
              <span class="coin-amount">{{ formatNumber(topUsers[0].coins) }}</span>
            </div>
          </div>
        </div>

        <!-- 3rd Place -->
        <div class="winner-card third-place">
          <div class="winner-rank">
            <span class="rank-number">3</span>
          </div>
          <div class="winner-avatar bronze">
            <span class="avatar-text">{{ getInitials(topUsers[2].username) }}</span>
          </div>
          <div class="winner-info">
            <h4 class="winner-name">{{ maskUsername(topUsers[2].username) }}</h4>
            <div class="winner-coins">
              <span class="coin-icon">🪙</span>
              <span class="coin-amount">{{ formatNumber(topUsers[2].coins) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Other Users Section -->
    <div class="dashboard-section users-section">
      <div class="section-header">
        <h3 class="section-title">Other Users</h3>
        <span class="users-count">{{ otherUsers.length }} users</span>
      </div>
      
      <div class="users-list">
        <div 
          v-for="user in paginatedUsers" 
          :key="user.id" 
          class="user-item"
        >
          <div class="user-rank">
            <span class="rank-text">#{{ user.rank }}</span>
          </div>
          <div class="user-avatar">
            <span class="avatar-text">{{ getInitials(user.username) }}</span>
          </div>
          <div class="user-info">
            <h4 class="user-name">{{ maskUsername(user.username) }}</h4>
            <div class="user-coins">
              <span class="coin-icon">🪙</span>
              <span class="coin-amount">{{ formatNumber(user.coins) }}</span>
            </div>
          </div>
          <div class="user-trend">
            <span class="trend-icon" :class="user.trend">
              {{ user.trend === 'up' ? '📈' : user.trend === 'down' ? '📉' : '➡️' }}
            </span>
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
    <BottomNavigation />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import BottomNavigation from '../components/BottomNavigation.vue'

export default {
  name: 'LeaderboardView',
  components: {
    BottomNavigation
  },
  setup() {
    const activeFilter = ref('weekly')
    const currentPage = ref(1)
    const usersPerPage = 10

    // Filter options
    const filters = ref([
      { id: 'daily', label: 'Daily', icon: '📅' },
      { id: 'weekly', label: 'Weekly', icon: '📊' },
      { id: 'monthly', label: 'Monthly', icon: '📈' }
    ])

    // Dummy leaderboard data - sorted by coins (highest to lowest)
    const allUsers = ref([
      { id: 1, username: 'AlexanderSmith', coins: 15240, trend: 'up', period: 'weekly' },
      { id: 2, username: 'MariaGonzalez', coins: 14890, trend: 'up', period: 'weekly' },
      { id: 3, username: 'JohnDavidson', coins: 14320, trend: 'down', period: 'weekly' },
      { id: 4, username: 'SarahWilliams', coins: 13750, trend: 'up', period: 'weekly' },
      { id: 5, username: 'MichaelBrown', coins: 13210, trend: 'same', period: 'weekly' },
      { id: 6, username: 'EmilyJohnson', coins: 12890, trend: 'up', period: 'weekly' },
      { id: 7, username: 'DanielMiller', coins: 12650, trend: 'down', period: 'weekly' },
      { id: 8, username: 'JessicaDavis', coins: 12340, trend: 'up', period: 'weekly' },
      { id: 9, username: 'ChristopherWilson', coins: 11980, trend: 'same', period: 'weekly' },
      { id: 10, username: 'AmandaLee', coins: 11720, trend: 'up', period: 'weekly' },
      { id: 11, username: 'RobertJones', coins: 11450, trend: 'down', period: 'weekly' },
      { id: 12, username: 'LisaAnderson', coins: 11200, trend: 'up', period: 'weekly' },
      { id: 13, username: 'DavidThomas', coins: 10980, trend: 'same', period: 'weekly' },
      { id: 14, username: 'JenniferWhite', coins: 10750, trend: 'down', period: 'weekly' },
      { id: 15, username: 'MatthewHarris', coins: 10520, trend: 'up', period: 'weekly' },
      { id: 16, username: 'KimberlyClark', coins: 10290, trend: 'up', period: 'weekly' },
      { id: 17, username: 'JamesRodriguez', coins: 10080, trend: 'down', period: 'weekly' },
      { id: 18, username: 'BrittanyLewis', coins: 9850, trend: 'same', period: 'weekly' },
      { id: 19, username: 'AnthonyWalker', coins: 9630, trend: 'up', period: 'weekly' },
      { id: 20, username: 'StephanieHall', coins: 9420, trend: 'down', period: 'weekly' },
      { id: 21, username: 'JoshuaAllen', coins: 9210, trend: 'up', period: 'weekly' },
      { id: 22, username: 'RachelYoung', coins: 9050, trend: 'same', period: 'weekly' },
      { id: 23, username: 'KevinKing', coins: 8890, trend: 'down', period: 'weekly' },
      { id: 24, username: 'MeganWright', coins: 8720, trend: 'up', period: 'weekly' },
      { id: 25, username: 'BrandonLopez', coins: 8560, trend: 'up', period: 'weekly' }
    ])

    // Computed properties
    const topUsers = computed(() => allUsers.value.slice(0, 3))
    
    const otherUsers = computed(() => {
      return allUsers.value.slice(3).map((user, idx) => ({
        ...user,
        rank: idx + 4
      }))
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

    // Methods
    const maskUsername = (username) => {
      if (username.length <= 3) return username
      const firstTwo = username.substring(0, 2)
      const lastOne = username.substring(username.length - 1)
      const masked = '*'.repeat(Math.max(1, username.length - 3))
      return firstTwo + masked + lastOne
    }

    const getInitials = (username) => {
      return username.substring(0, 2).toUpperCase()
    }

    const formatNumber = (num) => {
      return num.toLocaleString('id-ID')
    }

    const setActiveFilter = (filterId) => {
      activeFilter.value = filterId
      currentPage.value = 1
      console.log(`Filter changed to: ${filterId}`)
    }

    const getCurrentPeriodLabel = () => {
      const labels = {
        daily: 'Today',
        weekly: 'This Week',
        monthly: 'This Month'
      }
      return labels[activeFilter.value] || 'This Week'
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        document.querySelector('.users-section')?.scrollIntoView({ behavior: 'smooth' })
      }
    }

    return {
      activeFilter,
      currentPage,
      filters,
      topUsers,
      otherUsers,
      paginatedUsers,
      totalPages,
      visiblePages,
      maskUsername,
      getInitials,
      formatNumber,
      setActiveFilter,
      getCurrentPeriodLabel,
      goToPage
    }
  }
}
</script>

<style scoped>
/* Override main.css container restrictions for LeaderboardView */
.leaderboard-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
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

.filter-tab:hover {
  background: rgba(79, 195, 247, 0.1);
}

.filter-tab.active {
  background: #4FC3F7;
  color: white;
  box-shadow: 0 2px 6px rgba(79, 195, 247, 0.3);
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

.user-trend {
  flex-shrink: 0;
}

.trend-icon {
  font-size: 1rem;
  transition: transform 0.2s;
}

.trend-icon.up {
  animation: trendUp 2s infinite;
}

.trend-icon.down {
  animation: trendDown 2s infinite;
}

@keyframes trendUp {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes trendDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(2px); }
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

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 0.25rem;
  transition: all 0.2s;
  border-radius: 8px;
  min-width: 0;
  flex: 1;
}

.nav-item:hover {
  background: rgba(79, 195, 247, 0.1);
  transform: translateY(-1px);
}

.nav-item.active {
  background: rgba(79, 195, 247, 0.15);
}

.nav-item.active .nav-icon,
.nav-item.active .nav-label {
  color: #4FC3F7;
}

.nav-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
  color: #6B7280;
  transition: all 0.2s;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  text-align: center;
  transition: color 0.2s;
  white-space: nowrap;
}

/* Tablet Responsive */
@media (min-width: 768px) {
  .leaderboard-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
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
}

/* Desktop Responsive */
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
}
</style>