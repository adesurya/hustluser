<template>
  <div class="mission-popup-overlay" v-if="isVisible" @click="handleOverlayClick">
    <div class="mission-popup" @click.stop>
      <!-- Header -->
      <div class="popup-header">
        <div class="header-icon-container">
          <div class="header-icon">
            <div class="icon-circle">
              <span class="mission-emoji">🎯</span>
            </div>
          </div>
        </div>
        <h3 class="popup-title">Daily Mission</h3>
        <button class="close-btn" @click="$emit('close')" :disabled="isProcessing">
          <span class="close-icon">✕</span>
        </button>
      </div>

      <!-- Check-in Section -->
      <div class="checkin-section">
        <div class="checkin-header">
          <h4 class="checkin-title">Daily Check-in</h4>
          <div class="streak-badge" v-if="streakData && streakData.currentStreak > 0">
            <div class="flame-icon">🔥</div>
            <span class="streak-text">{{ streakData.currentStreak }} day streak</span>
          </div>
        </div>

        <!-- Check-in Status -->
        <div class="checkin-status" v-if="!hasCheckedInToday">
          <div class="checkin-illustration">
            <div class="checkin-circle">
              <div class="star-icon">⭐</div>
            </div>
          </div>
          <p class="status-text">Complete your daily check-in to earn points!</p>
          <button 
            class="checkin-btn primary-btn" 
            @click="performCheckin"
            :disabled="isProcessing"
          >
            <div class="btn-content">
              <span class="btn-spinner" v-if="isProcessing"></span>
              <span class="btn-icon" v-else>⭐</span>
              <span class="btn-text">
                {{ isProcessing ? 'Checking in...' : 'Check In Now' }}
              </span>
            </div>
          </button>
        </div>

        <div class="checkin-completed" v-else>
          <div class="completed-illustration">
            <div class="completed-circle">
              <div class="check-icon">✓</div>
            </div>
          </div>
          <h5 class="completed-title">Well done!</h5>
          <p class="completed-text">Today's check-in completed</p>
          <div class="completed-details" v-if="streakData">
            <div class="next-bonus-card">
              <span class="bonus-icon">🎁</span>
              <span class="bonus-text">
                Next bonus in {{ streakData.nextBonusIn }} days
              </span>
            </div>
          </div>
        </div>

        <!-- Streak Progress -->
        <div class="streak-progress" v-if="streakData">
          <div class="progress-header">
            <span class="progress-label">Weekly Challenge</span>
            <span class="progress-value">{{ streakData.currentStreak }}/7 days</span>
          </div>
          
          <!-- Progress Path -->
          <div class="progress-path">
            <div class="path-line"></div>
            <div 
              v-for="day in 7" 
              :key="day"
              class="progress-node"
              :class="{ 
                completed: day <= streakData.currentStreak,
                current: day === streakData.currentStreak + 1 && streakData.currentStreak < 7,
                bonus: day === 7
              }"
            >
              <div class="node-circle">
                <span v-if="day === 7" class="node-icon">🎁</span>
                <span v-else-if="day <= streakData.currentStreak" class="node-icon">✓</span>
                <span v-else class="node-number">{{ day }}</span>
              </div>
              <span class="node-label">Day {{ day }}</span>
            </div>
          </div>
          
          <div class="bonus-description">
            <div class="bonus-card">
              <span class="bonus-emoji">🎁</span>
              <div class="bonus-info">
                <span class="bonus-title">Bonus Reward</span>
                <span class="bonus-subtitle">Complete 7 days for +100 points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mission Section -->
      <div class="mission-section" v-if="missions && missions.length > 0">
        <div class="section-divider"></div>
        <h4 class="mission-title">Today's Missions</h4>
        <div class="mission-list">
          <div 
            v-for="mission in missions" 
            :key="mission.id" 
            class="mission-card"
            :class="{ completed: mission.isCompleted }"
          >
            <div class="mission-icon-container">
              <div class="mission-icon">
                <span v-if="mission.missionType === 'PRODUCT_SHARE'">📤</span>
                <span v-else>🎯</span>
              </div>
            </div>
            <div class="mission-content">
              <div class="mission-header">
                <h5 class="mission-name">{{ getMissionName(mission.missionType) }}</h5>
                <div class="mission-reward">
                  <span class="reward-points">+{{ mission.bonusPoints }}</span>
                  <span class="reward-label">XP</span>
                </div>
              </div>
              <div class="mission-progress">
                <div class="progress-bar-container">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: `${Math.min((mission.currentProgress / mission.targetProgress) * 100, 100)}%` }"
                    ></div>
                  </div>
                  <span class="progress-text">
                    {{ mission.currentProgress }}/{{ mission.targetProgress }}
                  </span>
                </div>
              </div>
            </div>
            <div class="mission-status" v-if="mission.isCompleted">
              <div class="status-check">✓</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="popup-footer">
        <button class="view-more-btn secondary-btn" @click="$emit('viewMissions')">
          <span class="btn-text">View All Missions</span>
          <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useCachedApi } from '../composables/useCachedApi'
import { useToast } from '../composables/useToast'

export default {
  name: 'MissionPopup',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    autoShow: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'viewMissions', 'checkinComplete'],
  setup(props, { emit }) {
    const { showToast } = useToast()
    const { performCheckin, getGamificationStatus } = useCachedApi()
    
    const isProcessing = ref(false)
    const gamificationData = ref(null)
    const lastCheckinResult = ref(null)

    // Computed properties
    const hasCheckedInToday = computed(() => {
      return gamificationData.value?.checkin?.hasCheckedInToday || false
    })

    const streakData = computed(() => {
      return gamificationData.value?.checkin || null
    })

    const missions = computed(() => {
      return gamificationData.value?.missions || []
    })

    // Methods
    const handleOverlayClick = () => {
      if (!isProcessing.value) {
        emit('close')
      }
    }

    const loadGamificationData = async () => {
      try {
        const response = await getGamificationStatus()
        if (response.success) {
          gamificationData.value = response.data
        }
      } catch (error) {
        console.error('Failed to load gamification data:', error)
      }
    }

    const performCheckinAction = async () => {
      if (isProcessing.value || hasCheckedInToday.value) return

      isProcessing.value = true
      try {
        const response = await performCheckin()
        
        if (response.success) {
          lastCheckinResult.value = response.data
          
          // Show success message
          showToast({
            type: 'success',
            title: 'Check-in Successful!',
            message: `Streak: ${response.data.streak} days${response.data.bonusAwarded ? ` | Bonus: +${response.data.bonusPoints} pts!` : ''}`,
            duration: 5000
          })

          // Refresh data
          await loadGamificationData()
          
          // Emit completion event
          emit('checkinComplete', response.data)

          // Auto close after successful check-in
          setTimeout(() => {
            emit('close')
          }, 2500)
        }
      } catch (error) {
        console.error('Check-in failed:', error)
        showToast({
          type: 'error',
          title: 'Check-in Failed',
          message: error.message || 'Unable to complete check-in. Please try again.',
          duration: 5000
        })
      } finally {
        isProcessing.value = false
      }
    }

    const getMissionName = (missionType) => {
      const names = {
        'PRODUCT_SHARE': 'Share Products',
        'DAILY_LOGIN': 'Daily Login',
        'COMPLETE_PROFILE': 'Complete Profile'
      }
      return names[missionType] || 'Mission'
    }

    // Watch for visibility changes
    watch(() => props.isVisible, (newVisible) => {
      if (newVisible) {
        loadGamificationData()
      }
    })

    // Load data on mount if visible
    onMounted(() => {
      if (props.isVisible) {
        loadGamificationData()
      }
    })

    return {
      isProcessing,
      hasCheckedInToday,
      streakData,
      missions,
      lastCheckinResult,
      handleOverlayClick,
      performCheckin: performCheckinAction,
      getMissionName
    }
  }
}
</script>

<style scoped>
.mission-popup-overlay {
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
  animation: overlayFadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes overlayFadeIn {
  from { 
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to { 
    opacity: 1;
    backdrop-filter: blur(12px);
  }
}

.mission-popup {
  background: white;
  border-radius: 24px;
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  max-width: 440px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: popupSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popupSlideIn {
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
.popup-header {
  position: relative;
  padding: 2rem 2rem 1rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%);
  border-radius: 24px 24px 0 0;
  color: white;
}

.header-icon-container {
  margin-bottom: 1rem;
}

.header-icon {
  display: inline-block;
}

.icon-circle {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.mission-emoji {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.popup-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  margin: 0;
  font-family: 'Baloo 2', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
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
  backdrop-filter: blur(10px);
}

.close-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.close-icon {
  font-size: 1rem;
  font-weight: 600;
}

/* Check-in Section */
.checkin-section {
  padding: 2rem;
}

.checkin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkin-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
}

.streak-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #FFF7ED, #FFEDD5);
  border: 2px solid #FED7AA;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  animation: badgeGlow 2s ease-in-out infinite;
}

@keyframes badgeGlow {
  0%, 100% { box-shadow: 0 2px 8px rgba(251, 146, 60, 0.2); }
  50% { box-shadow: 0 4px 16px rgba(251, 146, 60, 0.4); }
}

.flame-icon {
  font-size: 1rem;
  animation: flameFlicker 1.5s ease-in-out infinite;
}

@keyframes flameFlicker {
  0%, 100% { transform: scale(1) rotate(-2deg); }
  50% { transform: scale(1.1) rotate(2deg); }
}

.streak-text {
  font-size: 0.875rem;
  font-weight: 700;
  color: #EA580C;
  font-family: 'Baloo 2', sans-serif;
}

/* Check-in Status */
.checkin-status {
  text-align: center;
  margin-bottom: 2rem;
}

.checkin-illustration {
  margin-bottom: 1.5rem;
}

.checkin-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4FC3F7, #29B6F6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 24px rgba(79, 195, 247, 0.3);
  animation: checkinPulse 2s ease-in-out infinite;
}

@keyframes checkinPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.star-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.status-text {
  color: #6B7280;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Buttons */
.primary-btn {
  background: linear-gradient(135deg, #4FC3F7, #29B6F6);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Baloo 2', sans-serif;
  box-shadow: 0 8px 24px rgba(79, 195, 247, 0.3);
  position: relative;
  overflow: hidden;
}

.primary-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.primary-btn:hover:not(:disabled)::before {
  left: 100%;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(79, 195, 247, 0.4);
}

.primary-btn:active {
  transform: translateY(0);
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-icon {
  font-size: 1.125rem;
}

.btn-text {
  font-size: 1rem;
  font-weight: 700;
}

/* Check-in Completed */
.checkin-completed {
  text-align: center;
  margin-bottom: 2rem;
}

.completed-illustration {
  margin-bottom: 1rem;
}

.completed-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10B981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
  animation: completedBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes completedBounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.check-icon {
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.completed-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #065F46;
  margin: 0 0 0.5rem 0;
  font-family: 'Baloo 2', sans-serif;
}

.completed-text {
  color: #047857;
  font-weight: 600;
  margin-bottom: 1rem;
  font-family: 'Baloo 2', sans-serif;
}

.next-bonus-card {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border: 2px solid #F59E0B;
  border-radius: 12px;
  padding: 0.75rem 1rem;
}

.bonus-icon {
  font-size: 1.125rem;
}

.bonus-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #92400E;
  font-family: 'Baloo 2', sans-serif;
}

/* Streak Progress */
.streak-progress {
  background: #F8FAFC;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #E2E8F0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.progress-label {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
}

.progress-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #4FC3F7;
  font-family: 'Baloo 2', sans-serif;
}

.progress-path {
  position: relative;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1rem 0;
}

.path-line {
  position: absolute;
  top: 50%;
  left: 5%;
  right: 5%;
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  transform: translateY(-50%);
}

.progress-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.node-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.progress-node.completed .node-circle {
  background: linear-gradient(135deg, #4FC3F7, #29B6F6);
  animation: nodeComplete 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.progress-node.current .node-circle {
  background: #FED7AA;
  border-color: #F59E0B;
  animation: nodePulse 2s ease-in-out infinite;
}

.progress-node.bonus .node-circle {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}

@keyframes nodeComplete {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes nodePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.node-icon {
  font-size: 1rem;
  color: white;
  font-weight: 700;
}

.node-number {
  font-size: 0.875rem;
  font-weight: 700;
  color: #9CA3AF;
}

.progress-node.completed .node-number,
.progress-node.current .node-number {
  color: white;
}

.node-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 500;
  font-family: 'Baloo 2', sans-serif;
}

.bonus-description {
  margin-top: 1rem;
}

.bonus-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border: 2px solid #F59E0B;
  border-radius: 12px;
  padding: 1rem;
}

.bonus-emoji {
  font-size: 1.5rem;
}

.bonus-info {
  display: flex;
  flex-direction: column;
}

.bonus-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #92400E;
  font-family: 'Baloo 2', sans-serif;
}

.bonus-subtitle {
  font-size: 0.75rem;
  color: #A16207;
  font-family: 'Baloo 2', sans-serif;
}

/* Mission Section */
.mission-section {
  padding: 0 2rem 1rem 2rem;
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #E5E7EB, transparent);
  margin: 0 -2rem 1.5rem -2rem;
}

.mission-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 1rem;
  font-family: 'Baloo 2', sans-serif;
}

.mission-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mission-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #F8FAFC;
  border: 2px solid #E2E8F0;
  border-radius: 16px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.mission-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent, rgba(79, 195, 247, 0.05));
  opacity: 0;
  transition: opacity 0.3s;
}

.mission-card:hover::before {
  opacity: 1;
}

.mission-card.completed {
  background: linear-gradient(135deg, #D1FAE5, #ECFDF5);
  border-color: #A7F3D0;
}

.mission-icon-container {
  flex-shrink: 0;
}

.mission-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.mission-card.completed .mission-icon {
  background: linear-gradient(135deg, #10B981, #059669);
}

.mission-content {
  flex: 1;
}

.mission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.mission-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
  font-family: 'Baloo 2', sans-serif;
}

.mission-reward {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.reward-points {
  font-size: 0.875rem;
  font-weight: 700;
  color: #4FC3F7;
  font-family: 'Baloo 2', sans-serif;
}

.mission-card.completed .reward-points {
  color: #059669;
}

.reward-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 500;
}

.mission-progress {
  margin-top: 0.5rem;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4FC3F7, #29B6F6);
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: progressShine 2s ease-in-out infinite;
}

@keyframes progressShine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.mission-card.completed .progress-fill {
  background: linear-gradient(90deg, #10B981, #059669);
}

.progress-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  min-width: 50px;
  text-align: right;
}

.mission-status {
  flex-shrink: 0;
}

.status-check {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #10B981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  animation: statusBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes statusBounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Footer */
.popup-footer {
  padding: 1rem 2rem 2rem 2rem;
}

.secondary-btn {
  width: 100%;
  background: transparent;
  color: #4FC3F7;
  border: 2px solid #4FC3F7;
  border-radius: 12px;
  padding: 0.875rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Baloo 2', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.secondary-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: #4FC3F7;
  transition: left 0.3s;
  z-index: -1;
}

.secondary-btn:hover::before {
  left: 0;
}

.secondary-btn:hover {
  color: white;
  transform: translateY(-1px);
}

.btn-arrow {
  font-size: 1rem;
  transition: transform 0.3s;
}

.secondary-btn:hover .btn-arrow {
  transform: translateX(4px);
}

/* Responsive Design */
@media (max-width: 480px) {
  .mission-popup {
    max-width: calc(100vw - 2rem);
    margin: 1rem;
    border-radius: 20px;
  }
  
  .popup-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    border-radius: 20px 20px 0 0;
  }
  
  .icon-circle {
    width: 56px;
    height: 56px;
  }
  
  .mission-emoji {
    font-size: 1.75rem;
  }
  
  .popup-title {
    font-size: 1.25rem;
  }
  
  .checkin-section,
  .mission-section {
    padding: 1.5rem;
  }
  
  .popup-footer {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
  }
  
  .progress-path {
    padding: 0.5rem 0;
  }
  
  .node-circle {
    width: 32px;
    height: 32px;
  }
  
  .node-icon,
  .node-number {
    font-size: 0.75rem;
  }
  
  .mission-card {
    padding: 1rem;
  }
  
  .mission-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .checkin-circle,
  .completed-circle {
    width: 64px;
    height: 64px;
  }
  
  .star-icon,
  .check-icon {
    font-size: 1.5rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .mission-popup {
    background: #1F2937;
    color: #F9FAFB;
  }
  
  .checkin-title,
  .mission-title,
  .mission-name {
    color: #F9FAFB;
  }
  
  .status-text {
    color: #D1D5DB;
  }
  
  .streak-progress {
    background: #374151;
    border-color: #4B5563;
  }
  
  .mission-card {
    background: #374151;
    border-color: #4B5563;
  }
  
  .mission-card.completed {
    background: rgba(16, 185, 129, 0.1);
    border-color: #10B981;
  }
}

/* Accessibility improvements */
.mission-popup {
  scroll-behavior: smooth;
}

.mission-popup:focus-within {
  outline: 2px solid #4FC3F7;
  outline-offset: 2px;
}

.primary-btn:focus,
.secondary-btn:focus,
.close-btn:focus {
  outline: 2px solid #4FC3F7;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .mission-popup-overlay {
    position: static;
    background: transparent;
    backdrop-filter: none;
  }
  
  .mission-popup {
    box-shadow: none;
    max-width: none;
    max-height: none;
  }
  
  .close-btn {
    display: none;
  }
}
</style>