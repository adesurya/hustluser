<template>
  <div v-if="isVisible" class="mission-completed-overlay" @click="handleOverlayClick">
    <div class="mission-completed-popup" @click.stop>
      <!-- Success Animation -->
      <div class="success-animation">
        <div class="check-circle">
          <div class="check-mark">✓</div>
        </div>
        <div class="celebration-particles">
          <div v-for="i in 8" :key="i" class="particle" :style="getParticleStyle(i)"></div>
        </div>
      </div>

      <!-- Mission Complete Header -->
      <div class="popup-header">
        <h2 class="mission-title">MISSION COMPLETED!</h2>
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <span class="progress-text">{{ currentProgress }}/{{ targetProgress }}</span>
        </div>
      </div>

      <!-- Rewards Section -->
      <div class="rewards-section">
        <div class="reward-item main-reward">
          <div class="reward-icon">🪙</div>
          <div class="reward-details">
            <span class="reward-amount">+{{ sharePoints }}</span>
            <span class="reward-label">Share Points</span>
          </div>
        </div>

        <div class="plus-icon">+</div>

        <div class="reward-item bonus-reward">
          <div class="reward-icon">🎁</div>
          <div class="reward-details">
            <span class="reward-amount">+{{ bonusPoints }}</span>
            <span class="reward-label">Mission Bonus</span>
          </div>
        </div>
      </div>

      <!-- Total Points -->
      <div class="total-section">
        <div class="total-earned">
          <span class="total-label">Total Earned</span>
          <span class="total-amount">+{{ totalPoints }} Points</span>
        </div>
        <div class="new-balance">
          <span class="balance-label">New Balance:</span>
          <span class="balance-amount">{{ newBalance.toLocaleString('id-ID') }} Points</span>
        </div>
      </div>

      <!-- Mission Details -->
      <div class="mission-details">
        <div class="mission-info">
          <span class="mission-label">{{ activityName }}</span>
          <span class="mission-description">{{ bonusMessage }}</span>
        </div>
      </div>

      <!-- Action Button -->
      <div class="popup-actions">
        <button class="continue-btn" @click="closePopup">
          <span class="btn-text">Continue</span>
          <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'MissionCompletedPopup',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    sharePoints: {
      type: Number,
      default: 0
    },
    bonusPoints: {
      type: Number,
      default: 0
    },
    newBalance: {
      type: Number,
      default: 0
    },
    currentProgress: {
      type: Number,
      default: 0
    },
    targetProgress: {
      type: Number,
      default: 20
    },
    activityName: {
      type: String,
      default: 'Daily Mission'
    },
    bonusMessage: {
      type: String,
      default: 'Mission Complete! You earned bonus points!'
    },
    autoCloseDelay: {
      type: Number,
      default: 0 // 0 means no auto close
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    
    const totalPoints = computed(() => {
      return props.sharePoints + props.bonusPoints
    })

    const progressPercentage = computed(() => {
      return Math.min((props.currentProgress / props.targetProgress) * 100, 100)
    })

    const handleOverlayClick = () => {
      closePopup()
    }

    const closePopup = () => {
      emit('close')
    }

    const getParticleStyle = (index) => {
      const angle = (360 / 8) * index
      const distance = 60 + Math.random() * 40
      const delay = Math.random() * 0.5
      
      return {
        '--angle': `${angle}deg`,
        '--distance': `${distance}px`,
        '--delay': `${delay}s`
      }
    }

    // Auto close functionality
    if (props.autoCloseDelay > 0) {
      setTimeout(() => {
        if (props.isVisible) {
          closePopup()
        }
      }, props.autoCloseDelay)
    }

    return {
      totalPoints,
      progressPercentage,
      handleOverlayClick,
      closePopup,
      getParticleStyle
    }
  }
}
</script>

<style scoped>
.mission-completed-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 1rem;
  animation: overlayFadeIn 0.4s ease-out;
}

@keyframes overlayFadeIn {
  from { 
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to { 
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

.mission-completed-popup {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.3);
  animation: popupSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: white;
}

@keyframes popupSlideIn {
  from { 
    opacity: 0;
    transform: translateY(40px) scale(0.8);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Success Animation */
.success-animation {
  position: relative;
  margin-bottom: 1.5rem;
}

.check-circle {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border: 4px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  animation: checkBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  backdrop-filter: blur(10px);
}

@keyframes checkBounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.check-mark {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  animation: checkMarkDraw 0.5s ease-out 0.3s both;
}

@keyframes checkMarkDraw {
  from { 
    opacity: 0;
    transform: scale(0);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

.celebration-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #FFD700;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  animation: particleExplode 1.5s ease-out var(--delay, 0s) both;
}

.particle:nth-child(odd) {
  background: #FF6B9D;
}

.particle:nth-child(3n) {
  background: #4ECDC4;
}

@keyframes particleExplode {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateX(0) scale(0);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateX(var(--distance, 60px)) scale(1);
    opacity: 0;
  }
}

/* Header */
.popup-header {
  margin-bottom: 1.5rem;
}

.mission-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  font-family: 'Baloo 2', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD700, #FFA500);
  border-radius: 4px;
  animation: progressFill 1s ease-out 0.5s both;
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
  animation: progressShine 1.5s ease-in-out 1s infinite;
}

@keyframes progressFill {
  from { width: 0% !important; }
  to { width: var(--final-width, 100%); }
}

@keyframes progressShine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  font-family: 'Baloo 2', sans-serif;
  min-width: 50px;
}

/* Rewards Section */
.rewards-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.reward-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 1rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  min-width: 100px;
  animation: rewardPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.main-reward {
  animation-delay: 0.8s;
  animation-fill-mode: both;
}

.bonus-reward {
  animation-delay: 1.2s;
  animation-fill-mode: both;
}

@keyframes rewardPop {
  from { 
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.reward-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.reward-details {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reward-amount {
  font-size: 1.125rem;
  font-weight: 800;
  color: #FFD700;
  font-family: 'Baloo 2', sans-serif;
}

.reward-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.plus-icon {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  animation: plusPulse 1s ease-in-out 1s infinite;
}

@keyframes plusPulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
}

/* Total Section */
.total-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
  animation: totalSlideUp 0.6s ease-out 1.4s both;
}

@keyframes totalSlideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.total-earned {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.total-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.total-amount {
  font-size: 1.25rem;
  font-weight: 800;
  color: #FFD700;
  font-family: 'Baloo 2', sans-serif;
}

.new-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.balance-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.balance-amount {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  font-family: 'Baloo 2', sans-serif;
}

/* Mission Details */
.mission-details {
  margin-bottom: 1.5rem;
  animation: detailsFadeIn 0.6s ease-out 1.6s both;
}

@keyframes detailsFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.mission-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mission-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
}

.mission-description {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Baloo 2', sans-serif;
  font-weight: 400;
  line-height: 1.4;
}

/* Action Button */
.popup-actions {
  animation: actionSlideIn 0.6s ease-out 1.8s both;
}

@keyframes actionSlideIn {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.continue-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Baloo 2', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
  margin: 0 auto;
}

.continue-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.btn-arrow {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.continue-btn:hover .btn-arrow {
  transform: translateX(4px);
}

/* Responsive Design */
@media (max-width: 480px) {
  .mission-completed-popup {
    max-width: calc(100vw - 2rem);
    padding: 1.5rem;
  }
  
  .mission-title {
    font-size: 1.25rem;
  }
  
  .rewards-section {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .plus-icon {
    transform: rotate(90deg);
    font-size: 1rem;
  }
  
  .reward-item {
    min-width: 120px;
  }
  
  .check-circle {
    width: 64px;
    height: 64px;
  }
  
  .check-mark {
    font-size: 1.5rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .mission-completed-popup,
  .check-circle,
  .particle,
  .progress-fill,
  .reward-item,
  .total-section,
  .mission-details,
  .popup-actions {
    animation: none;
  }
  
  .progress-fill::after {
    animation: none;
  }
}
</style>