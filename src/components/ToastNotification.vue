<!-- src/components/ToastNotification.vue -->
<template>
  <Teleport to="body">
    <div class="toast-container">
      <Transition
        v-for="toast in toasts"
        :key="toast.id"
        name="toast"
        appear
      >
        <div 
          class="toast-item"
          :class="[`toast-${toast.type}`, { 'toast-dismissible': toast.dismissible }]"
          @click="toast.dismissible && removeToast(toast.id)"
        >
          <div class="toast-icon">
            <span>{{ getToastIcon(toast.type) }}</span>
          </div>
          <div class="toast-content">
            <div class="toast-title" v-if="toast.title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button 
            v-if="toast.dismissible"
            class="toast-close"
            @click.stop="removeToast(toast.id)"
          >
            <span class="close-icon">✕</span>
          </button>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ToastNotification',
  setup() {
    const toasts = ref([])
    let toastId = 0

    const getToastIcon = (type) => {
      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        wishlist: '💖'
      }
      return icons[type] || 'ℹ️'
    }

    const addToast = (toast) => {
      const id = ++toastId
      const newToast = {
        id,
        type: toast.type || 'info',
        title: toast.title,
        message: toast.message,
        duration: toast.duration || 3000,
        dismissible: toast.dismissible !== false
      }

      toasts.value.push(newToast)

      // Auto remove toast after duration
      if (newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, newToast.duration)
      }

      return id
    }

    const removeToast = (id) => {
      const index = toasts.value.findIndex(toast => toast.id === id)
      if (index > -1) {
        toasts.value.splice(index, 1)
      }
    }

    const clearAllToasts = () => {
      toasts.value = []
    }

    // Global toast event listener
    const handleToastEvent = (event) => {
      addToast(event.detail)
    }

    onMounted(() => {
      window.addEventListener('show-toast', handleToastEvent)
    })

    onUnmounted(() => {
      window.removeEventListener('show-toast', handleToastEvent)
    })

    return {
      toasts,
      getToastIcon,
      addToast,
      removeToast,
      clearAllToasts
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
  max-width: 400px;
}

.toast-item {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #E5E7EB;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  pointer-events: auto;
  min-width: 300px;
  max-width: 100%;
  transition: all 0.3s ease;
}

.toast-item.toast-dismissible {
  cursor: pointer;
}

.toast-item.toast-dismissible:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.toast-success {
  border-left: 4px solid #10B981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.02));
}

.toast-error {
  border-left: 4px solid #EF4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.02));
}

.toast-warning {
  border-left: 4px solid #F59E0B;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(245, 158, 11, 0.02));
}

.toast-info {
  border-left: 4px solid #3B82F6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.02));
}

.toast-wishlist {
  border-left: 4px solid #EC4899;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(236, 72, 153, 0.02));
}

.toast-icon {
  flex-shrink: 0;
  font-size: 1.25rem;
  margin-top: 0.125rem;
}

.toast-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.toast-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.3;
}

.toast-message {
  font-size: 0.8rem;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #9CA3AF;
  font-size: 0.875rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  background: #F3F4F6;
  color: #6B7280;
}

/* Toast Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .toast-container {
    top: auto;
    bottom: 6rem;
    left: 1rem;
    right: 1rem;
    max-width: none;
  }

  .toast-item {
    min-width: auto;
  }
}
</style>