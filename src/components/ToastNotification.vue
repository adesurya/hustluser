<template>
  <div class="toast-container">
    <Transition
      v-for="toast in toasts"
      :key="toast.id"
      name="toast"
      appear
    >
      <div 
        class="toast-notification"
        :class="[`toast-${toast.type}`, { 'toast-dismissing': toast.dismissing }]"
        @click="handleToastClick(toast)"
      >
        <div class="toast-content">
          <div class="toast-icon-container">
            <div class="toast-icon" :class="`icon-${toast.type}`">
              <span class="icon-emoji">{{ getToastIcon(toast.type) }}</span>
            </div>
          </div>
          
          <div class="toast-text">
            <h4 class="toast-title" v-if="toast.title">{{ toast.title }}</h4>
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          
          <button 
            class="toast-close"
            @click.stop="dismissToast(toast.id)"
            aria-label="Close notification"
          >
            <span class="close-icon">✕</span>
          </button>
        </div>
        
        <!-- Progress bar for auto-dismiss -->
        <div 
          v-if="toast.duration > 0" 
          class="toast-progress"
          :style="{ 
            animationDuration: `${toast.duration}ms`,
            animationPlayState: toast.paused ? 'paused' : 'running'
          }"
        ></div>
      </div>
    </Transition>
  </div>
</template>

<script>
// import { computed } from 'vue'
import { useToast } from '../composables/useToast'

export default {
  name: 'ToastNotification',
  setup() {
    const { toasts, removeToast } = useToast()

    const dismissToast = (id) => {
      const toast = toasts.value.find(t => t.id === id)
      if (toast) {
        toast.dismissing = true
        setTimeout(() => {
          removeToast(id)
        }, 300) // Match the exit animation duration
      }
    }

    const handleToastClick = (toast) => {
      if (toast.clickable !== false) {
        dismissToast(toast.id)
      }
    }

    const getToastIcon = (type) => {
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
        loading: '⏳'
      }
      return icons[type] || 'ℹ'
    }

    // Auto-dismiss functionality with pause on hover
    const handleMouseEnter = (toast) => {
      toast.paused = true
    }

    const handleMouseLeave = (toast) => {
      toast.paused = false
    }

    return {
      toasts,
      dismissToast,
      handleToastClick,
      getToastIcon,
      handleMouseEnter,
      handleMouseLeave
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
  width: 100%;
  pointer-events: none;
}

.toast-notification {
  background: white;
  border-radius: 16px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
  position: relative;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toast-notification:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 25px 35px -5px rgba(0, 0, 0, 0.15),
    0 15px 15px -5px rgba(0, 0, 0, 0.06);
}

.toast-notification.toast-dismissing {
  animation: toastDismiss 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
}

/* Toast Type Styling */
.toast-success {
  border-left: 4px solid #10B981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(236, 253, 245, 0.8));
}

.toast-error {
  border-left: 4px solid #EF4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(254, 242, 242, 0.8));
}

.toast-warning {
  border-left: 4px solid #F59E0B;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(255, 251, 235, 0.8));
}

.toast-info {
  border-left: 4px solid #4FC3F7;
  background: linear-gradient(135deg, rgba(79, 195, 247, 0.05), rgba(240, 249, 255, 0.8));
}

.toast-loading {
  border-left: 4px solid #6B7280;
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.05), rgba(249, 250, 251, 0.8));
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1.25rem;
  position: relative;
}

.toast-icon-container {
  flex-shrink: 0;
  position: relative;
}

.toast-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  position: relative;
  overflow: hidden;
}

.icon-success {
  background: linear-gradient(135deg, #10B981, #059669);
  animation: successPulse 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.icon-error {
  background: linear-gradient(135deg, #EF4444, #DC2626);
  animation: errorShake 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.icon-warning {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  animation: warningBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.icon-info {
  background: linear-gradient(135deg, #4FC3F7, #29B6F6);
  animation: infoPulse 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.icon-loading {
  background: linear-gradient(135deg, #6B7280, #4B5563);
}

.icon-loading .icon-emoji {
  animation: loadingSpin 2s linear infinite;
}

.icon-emoji {
  position: relative;
  z-index: 1;
}

/* Icon Animations */
@keyframes successPulse {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@keyframes warningBounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
  60% { transform: translateY(-4px); }
}

@keyframes infoPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes loadingSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.3;
}

.toast-message {
  font-size: 0.875rem;
  color: #4B5563;
  margin: 0;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.4;
  font-weight: 500;
}

.toast-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  background: rgba(107, 114, 128, 0.1);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #6B7280;
  margin-top: -2px;
}

.toast-close:hover {
  background: rgba(107, 114, 128, 0.2);
  color: #374151;
  transform: scale(1.1);
}

.close-icon {
  font-size: 0.75rem;
  font-weight: 600;
}

/* Progress Bar */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: currentColor;
  transform-origin: left;
  animation: progressShrink linear forwards;
}

.toast-success .toast-progress {
  color: #10B981;
}

.toast-error .toast-progress {
  color: #EF4444;
}

.toast-warning .toast-progress {
  color: #F59E0B;
}

.toast-info .toast-progress {
  color: #4FC3F7;
}

.toast-loading .toast-progress {
  color: #6B7280;
}

@keyframes progressShrink {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

/* Toast Transitions */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

@keyframes toastDismiss {
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
}

/* Responsive Design */
@media (max-width: 640px) {
  .toast-container {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
  }
  
  .toast-notification {
    border-radius: 12px;
  }
  
  .toast-content {
    padding: 1rem;
    gap: 0.75rem;
  }
  
  .toast-icon {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
  
  .toast-title {
    font-size: 0.875rem;
  }
  
  .toast-message {
    font-size: 0.8rem;
  }
  
  .toast-close {
    width: 24px;
    height: 24px;
  }
  
  .close-icon {
    font-size: 0.7rem;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .toast-notification {
    border: 2px solid currentColor;
  }
  
  .toast-title,
  .toast-message {
    color: #000000;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .toast-notification,
  .toast-icon,
  .toast-close,
  .toast-progress {
    animation: none !important;
    transition: none !important;
  }
  
  .toast-enter-active,
  .toast-leave-active {
    transition: opacity 0.2s ease !important;
  }
  
  .toast-enter-from,
  .toast-leave-to {
    transform: none !important;
  }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .toast-notification {
    background: rgba(31, 41, 55, 0.95);
    border: 1px solid rgba(75, 85, 99, 0.3);
  }
  
  .toast-success {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(31, 41, 55, 0.95));
  }
  
  .toast-error {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(31, 41, 55, 0.95));
  }
  
  .toast-warning {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(31, 41, 55, 0.95));
  }
  
  .toast-info {
    background: linear-gradient(135deg, rgba(79, 195, 247, 0.1), rgba(31, 41, 55, 0.95));
  }
  
  .toast-loading {
    background: linear-gradient(135deg, rgba(107, 114, 128, 0.1), rgba(31, 41, 55, 0.95));
  }
  
  .toast-title {
    color: #F9FAFB;
  }
  
  .toast-message {
    color: #D1D5DB;
  }
  
  .toast-close {
    background: rgba(156, 163, 175, 0.1);
    color: #9CA3AF;
  }
  
  .toast-close:hover {
    background: rgba(156, 163, 175, 0.2);
    color: #F3F4F6;
  }
}

/* Focus styles for accessibility */
.toast-notification:focus {
  outline: 2px solid #4FC3F7;
  outline-offset: 2px;
}

.toast-close:focus {
  outline: 2px solid #4FC3F7;
  outline-offset: 2px;
}
</style>