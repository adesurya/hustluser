<template>
  <div class="simple-mission-banner" v-if="gamificationData">
    <div class="mission-card">
      <!-- Header -->
      <div class="mission-header">
        <div class="mission-icon">
          <span class="target-emoji">🎯</span>
        </div>
        <h4 class="mission-title">Daily Missions</h4>
      </div>

      <!-- Status Display -->
      <div class="mission-status">
        <!-- Streak Info -->
        <div class="streak-info">
          <span class="flame-icon">🔥</span>
          <span class="streak-text">{{ streakCount }} day streak</span>
        </div>

        <!-- Check-in Status -->
        <div class="checkin-status">
          <div v-if="!hasCheckedInToday" class="checkin-available">
            <span class="star-icon">⭐</span>
            <span class="status-text">Check-in available</span>
          </div>
          <div v-else class="checkin-completed">
            <span class="check-icon">✅</span>
            <span class="status-text">Checked in today</span>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Weekly Progress</span>
          <span class="progress-value">{{ streakCount }}/7</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <div class="progress-dots">
          <div 
            v-for="day in 7" 
            :key="day"
            class="progress-dot"
            :class="{ 
              active: day <= streakCount,
              bonus: day === 7 && day <= streakCount
            }"
          >
            <span v-if="day === 7 && day <= streakCount" class="gift-icon">🎁</span>
          </div>
        </div>
        
        <!-- Next Bonus Indicator -->
        <div class="bonus-info" v-if="nextBonusIn > 0">
          <span class="bonus-text">{{ nextBonusIn }} days until bonus reward</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button 
          v-if="!hasCheckedInToday"
          class="checkin-button primary"
          @click="$emit('quickCheckin')"
          :disabled="isProcessing"
        >
          <span class="btn-spinner" v-if="isProcessing"></span>
          <span class="btn-icon" v-else>⭐</span>
          <span class="btn-text">Check In</span>
        </button>
        
        <button 
          class="view-button secondary"
          @click="$emit('openMissions')"
        >
          <span class="btn-icon">📋</span>
          <span class="btn-text">View All</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimpleMissionBanner',
  props: {
    gamificationData: {
      type: Object,
      default: null
    },
    isProcessing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['quickCheckin', 'openMissions'],
  computed: {
    hasCheckedInToday() {
      return this.gamificationData?.checkin?.hasCheckedInToday || false
    },
    
    streakCount() {
      // Use currentStreak from API response
      return this.gamificationData?.checkin?.currentStreak || 0
    },
    
    nextBonusIn() {
      // Use nextBonusIn from API response
      return this.gamificationData?.checkin?.nextBonusIn || 0
    },
    
    progressPercentage() {
      // Calculate progress based on current streak out of 7 days
      return Math.min((this.streakCount / 7) * 100, 100)
    }
  },
  watch: {
    // Enhanced debug watcher
    gamificationData: {
      handler(newData) {
        console.log('SimpleMissionBanner - Gamification data updated:', {
          hasCheckedInToday: newData?.checkin?.hasCheckedInToday,
          currentStreak: newData?.checkin?.currentStreak,
          nextBonusIn: newData?.checkin?.nextBonusIn,
          progressPercentage: this.progressPercentage,
          fullCheckinData: newData?.checkin
        })
      },
      deep: true,
      immediate: true
    },
    
    // Watch progress changes
    progressPercentage: {
      handler(newProgress, oldProgress) {
        console.log('Progress percentage changed:', {
          from: oldProgress,
          to: newProgress,
          streakCount: this.streakCount
        })
      }
    }
  }
}
</script>

<style scoped>
.simple-mission-banner {
  margin: 0 1rem 1.5rem 1rem;
}

.mission-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  transition: all 0.2s ease;
}

.mission-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Header */
.mission-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.mission-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4FC3F7, #29B6F6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(79, 195, 247, 0.3);
}

.target-emoji {
  font-size: 1.25rem;
}

.mission-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
  font-family: 'Baloo 2', sans-serif;
}

/* Status */
.mission-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.streak-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #FFF7ED, #FFEDD5);
  border: 1px solid #FED7AA;
  border-radius: 12px;
  padding: 0.5rem 0.75rem;
}

.flame-icon {
  font-size: 1rem;
  animation: flicker 2s ease-in-out infinite;
}

@keyframes flicker {
  0%, 100% { transform: scale(1) rotate(-1deg); }
  50% { transform: scale(1.1) rotate(1deg); }
}

.streak-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #EA580C;
  font-family: 'Baloo 2', sans-serif;
}

.checkin-status {
  display: flex;
  align-items: center;
}

.checkin-available {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1D4ED8;
}

.checkin-completed {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #059669;
}

.star-icon {
  font-size: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.check-icon {
  font-size: 1rem;
}

.status-text {
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
}

/* Progress Section */
.progress-section {
  margin-bottom: 1.25rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-label {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 500;
  font-family: 'Baloo 2', sans-serif;
}

.progress-value {
  font-size: 0.875rem;
  color: #4FC3F7;
  font-weight: 700;
  font-family: 'Baloo 2', sans-serif;
}

.progress-bar {
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4FC3F7, #29B6F6);
  border-radius: 4px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shine 2s ease-in-out infinite;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.progress-dots {
  display: flex;
  justify-content: space-between;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.progress-dot {
  width: 32px;
  height: 6px;
  background: #E5E7EB;
  border-radius: 3px;
  position: relative;
  transition: all 0.3s ease;
}

.progress-dot.active {
  background: linear-gradient(90deg, #4FC3F7, #29B6F6);
  animation: dotComplete 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.progress-dot.bonus {
  background: linear-gradient(90deg, #F59E0B, #D97706);
  animation: bonusPulse 2s ease-in-out infinite;
}

@keyframes dotComplete {
  0% { transform: scaleX(0); }
  50% { transform: scaleX(1.2); }
  100% { transform: scaleX(1); }
}

@keyframes bonusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.gift-icon {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-2px); }
}

/* Bonus Info */
.bonus-info {
  text-align: center;
  margin-top: 0.5rem;
}

.bonus-text {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-style: italic;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.checkin-button,
.view-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Baloo 2', sans-serif;
}

.checkin-button.primary {
  background: linear-gradient(135deg, #4FC3F7, #29B6F6);
  color: white;
  box-shadow: 0 2px 8px rgba(79, 195, 247, 0.3);
}

.checkin-button.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.4);
}

.checkin-button.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.view-button.secondary {
  background: transparent;
  color: #4FC3F7;
  border: 2px solid #4FC3F7;
}

.view-button.secondary:hover {
  background: #4FC3F7;
  color: white;
  transform: translateY(-1px);
}

.btn-spinner {
  width: 16px;
  height: 16px;
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
  font-size: 1rem;
}

.btn-text {
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 640px) {
  .simple-mission-banner {
    margin: 0 1rem 1.25rem 1rem;
  }
  
  .mission-card {
    padding: 1.25rem;
  }
  
  .mission-status {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .streak-info {
    justify-content: center;
  }
  
  .checkin-status {
    justify-content: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .progress-dots {
    gap: 0.125rem;
  }
  
  .progress-dot {
    width: 28px;
    height: 5px;
  }
}

@media (max-width: 480px) {
  .mission-card {
    padding: 1rem;
  }
  
  .mission-header {
    margin-bottom: 1rem;
  }
  
  .mission-status {
    margin-bottom: 1rem;
  }
  
  .progress-section {
    margin-bottom: 1rem;
  }
  
  .progress-dots {
    gap: 0.1rem;
  }
  
  .progress-dot {
    width: 24px;
    height: 4px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .mission-card {
    background: #1F2937;
    border-color: #374151;
  }
  
  .mission-title {
    color: #F9FAFB;
  }
  
  .progress-label {
    color: #D1D5DB;
  }
  
  .progress-dot {
    background: #374151;
  }
}
</style>