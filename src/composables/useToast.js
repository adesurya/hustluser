// src/composables/useToast.js - Enhanced version
import { ref } from 'vue'

const toasts = ref([])
let nextId = 1

export function useToast() {
  const showToast = (options) => {
    const toast = {
      id: nextId++,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      duration: options.duration || 4000,
      timestamp: Date.now(),
      isVisible: true
    }

    toasts.value.push(toast)

    // Auto remove after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration)
    }

    return toast.id
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      // Mark as removing for animation
      toasts.value[index].isVisible = false
      
      // Actually remove after animation
      setTimeout(() => {
        const currentIndex = toasts.value.findIndex(toast => toast.id === id)
        if (currentIndex > -1) {
          toasts.value.splice(currentIndex, 1)
        }
      }, 300)
    }
  }

  const clearAllToasts = () => {
    toasts.value = []
  }

  // Enhanced show methods with better logging
  const showCheckinSuccess = (streakCount, bonusInfo = null) => {
    let message = `Your streak is now ${streakCount} days!`
    
    if (bonusInfo && bonusInfo.bonusAwarded) {
      message += ` You earned a bonus of ${bonusInfo.bonusPoints} points!`
    }
    
    return showToast({
      type: 'success',
      title: 'Check-in Successful! 🎉',
      message: message,
      duration: 5000
    })
  }

  const showCheckinError = (error) => {
    let title = 'Check-in Failed'
    let message = 'Please try again later'
    
    if (error?.message) {
      if (error.message.includes('already checked in') || 
          error.message.includes('already completed')) {
        title = 'Already Checked In'
        message = 'You have already completed today\'s check-in!'
      } else if (error.message.includes('Network') || 
                 error.message.includes('network')) {
        message = 'Network error. Please check your connection.'
      } else {
        message = error.message
      }
    }
    
    return showToast({
      type: error.message?.includes('already') ? 'info' : 'error',
      title: title,
      message: message,
      duration: 4000
    })
  }

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    showCheckinSuccess,
    showCheckinError
  }
}

// Enhanced shortcuts with better error handling
export const showSuccess = (title, message, duration = 4000) => {
  const { showToast } = useToast()
  return showToast({ type: 'success', title, message, duration })
}

export const showError = (title, message, duration = 5000) => {
  const { showToast } = useToast()
  return showToast({ type: 'error', title, message, duration })
}

export const showInfo = (title, message, duration = 4000) => {
  const { showToast } = useToast()
  return showToast({ type: 'info', title, message, duration })
}

export const showWarning = (title, message, duration = 4000) => {
  const { showToast } = useToast()
  return showToast({ type: 'warning', title, message, duration })
}

// Specific checkin helpers
export const showCheckinSuccess = (streakCount, bonusInfo = null) => {
  const { showCheckinSuccess } = useToast()
  return showCheckinSuccess(streakCount, bonusInfo)
}

export const showCheckinError = (error) => {
  const { showCheckinError } = useToast()
  return showCheckinError(error)
}