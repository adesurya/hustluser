<template>
  <div class="floating-action-container" :class="{ 'expanded': isExpanded }">
    <!-- Copy Actions Menu -->
    <div class="action-menu" v-show="isExpanded">
      <button class="action-item copy-url" @click="copyURL" :disabled="isLoading">
        <span class="action-icon">🔗</span>
        <span class="action-label">Copy URL</span>
        <div v-if="isLoading && lastAction === 'url'" class="loading-spinner"></div>
      </button>
      <button class="action-item copy-content" @click="copyContent" :disabled="isLoading">
        <span class="action-icon">📋</span>
        <span class="action-label">Copy Content</span>
        <div v-if="isLoading && lastAction === 'content'" class="loading-spinner"></div>
      </button>
    </div>

    <!-- Main FAB Button -->
    <button 
      class="fab-main" 
      @click="toggleMenu" 
      :class="{ 'rotated': isExpanded }"
      :title="isExpanded ? 'Close menu' : 'Copy options'"
    >
      <span class="fab-icon">{{ isExpanded ? '✕' : '📄' }}</span>
    </button>

    <!-- Success/Error Toast -->
    <div 
      v-if="showToast" 
      class="toast" 
      :class="toastType"
    >
      <span class="toast-icon">{{ toastType === 'success' ? '✅' : '❌' }}</span>
      <span class="toast-message">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'FloatingActionButton',
  setup() {
    const isExpanded = ref(false)
    const isLoading = ref(false)
    const lastAction = ref('')
    const showToast = ref(false)
    const toastType = ref('success')
    const toastMessage = ref('')

    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      const container = document.querySelector('.floating-action-container')
      if (container && !container.contains(event.target)) {
        isExpanded.value = false
      }
    }

    // Close menu on escape key
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        isExpanded.value = false
      }
    }

    const toggleMenu = () => {
      isExpanded.value = !isExpanded.value
    }

    const showToastMessage = (message, type = 'success') => {
      toastMessage.value = message
      toastType.value = type
      showToast.value = true
      
      setTimeout(() => {
        showToast.value = false
      }, 3000)
    }

    const copyURL = async () => {
      if (isLoading.value) return
      
      isLoading.value = true
      lastAction.value = 'url'
      
      try {
        const currentURL = window.location.href
        await navigator.clipboard.writeText(currentURL)
        
        showToastMessage('URL copied to clipboard!')
        isExpanded.value = false
      } catch (error) {
        console.error('Failed to copy URL:', error)
        
        // Fallback for older browsers
        try {
          const textArea = document.createElement('textarea')
          textArea.value = window.location.href
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          
          showToastMessage('URL copied to clipboard!')
          isExpanded.value = false
        } catch (fallbackError) {
          console.error('Fallback copy failed:', fallbackError)
          showToastMessage('Failed to copy URL', 'error')
        }
      } finally {
        isLoading.value = false
        lastAction.value = ''
      }
    }

    const extractTextContent = (element) => {
      let text = ''
      
      // Skip navigation and unwanted elements
      const skipSelectors = [
        '.bottom-nav',
        '.floating-action-container',
        'script',
        'style',
        'noscript'
      ]
      
      if (element.nodeType === Node.TEXT_NODE) {
        return element.textContent.trim()
      }
      
      if (element.nodeType === Node.ELEMENT_NODE) {
        // Skip unwanted elements
        const tagName = element.tagName.toLowerCase()
        const className = element.className || ''
        
        const shouldSkip = skipSelectors.some(selector => {
          if (selector.startsWith('.')) {
            return className.includes(selector.substring(1))
          }
          return tagName === selector
        })
        
        if (shouldSkip) {
          return ''
        }
        
        for (const child of element.childNodes) {
          const childText = extractTextContent(child)
          if (childText) {
            text += childText + ' '
          }
        }
      }
      
      return text.trim()
    }

    const copyContent = async () => {
      if (isLoading.value) return
      
      isLoading.value = true
      lastAction.value = 'content'
      
      try {
        // Get the main content container
        const mainContent = document.querySelector('.dashboard-view, .category-view, .leaderboard-view, .campaign-view, .profile-view') || document.body
        
        const textContent = extractTextContent(mainContent)
        
        if (textContent.trim()) {
          await navigator.clipboard.writeText(textContent)
          showToastMessage('Page content copied to clipboard!')
          isExpanded.value = false
        } else {
          throw new Error('No content found to copy')
        }
      } catch (error) {
        console.error('Failed to copy content:', error)
        
        // Fallback for older browsers
        try {
          const mainContent = document.querySelector('.dashboard-view, .category-view, .leaderboard-view, .campaign-view, .profile-view') || document.body
          const textContent = extractTextContent(mainContent)
          
          const textArea = document.createElement('textarea')
          textArea.value = textContent
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          
          showToastMessage('Page content copied to clipboard!')
          isExpanded.value = false
        } catch (fallbackError) {
          console.error('Fallback copy failed:', fallbackError)
          showToastMessage('Failed to copy content', 'error')
        }
      } finally {
        isLoading.value = false
        lastAction.value = ''
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    })

    return {
      isExpanded,
      isLoading,
      lastAction,
      showToast,
      toastType,
      toastMessage,
      toggleMenu,
      copyURL,
      copyContent
    }
  }
}
</script>

<style scoped>
.floating-action-container {
  position: fixed;
  bottom: 110px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  transition: all 0.3s ease;
}

/* Action Menu */
.action-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  transform: translateY(10px) scale(0.95);
  transition: all 0.3s ease;
  pointer-events: none;
}

.floating-action-container.expanded .action-menu {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border: none;
  border-radius: 12px;
  padding: 0.875rem 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
  min-width: 140px;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.action-item:hover:not(:disabled) {
  background: #F8FAFC;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.action-item:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.copy-url {
  border-left: 3px solid #4FC3F7;
}

.copy-content {
  border-left: 3px solid #10B981;
}

.action-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.action-label {
  flex: 1;
  text-align: left;
}

.loading-spinner {
  position: absolute;
  right: 0.875rem;
  width: 16px;
  height: 16px;
  border: 2px solid #E5E7EB;
  border-top: 2px solid #4FC3F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Main FAB Button */
.fab-main {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.4);
  transition: all 0.3s ease;
  color: white;
  font-size: 1.25rem;
  backdrop-filter: blur(10px);
}

.fab-main:hover {
  background: linear-gradient(135deg, #29B6F6 0%, #1976D2 100%);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(79, 195, 247, 0.5);
}

.fab-main.rotated {
  transform: rotate(45deg);
}

.fab-main.rotated:hover {
  transform: rotate(45deg) translateY(-2px) scale(1.05);
}

.fab-icon {
  transition: all 0.3s ease;
  font-weight: bold;
}

/* Toast Notification */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  z-index: 1002;
  animation: slideInRight 0.3s ease;
  max-width: 280px;
  backdrop-filter: blur(10px);
}

.toast.success {
  background: #D1FAE5;
  color: #065F46;
  border: 1px solid #10B981;
}

.toast.error {
  background: #FEE2E2;
  color: #991B1B;
  border: 1px solid #EF4444;
}

.toast-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideInRight {
  0% {
    opacity: 0;
    transform: translateX(100%);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .floating-action-container {
    bottom: 90px;
    right: 16px;
  }

  .action-item {
    min-width: 120px;
    padding: 0.75rem 0.875rem;
    font-size: 0.8rem;
  }

  .fab-main {
    width: 50px;
    height: 50px;
    font-size: 1.125rem;
  }

  .toast {
    top: 16px;
    right: 16px;
    max-width: calc(100vw - 32px);
    font-size: 0.8rem;
    padding: 0.875rem 1rem;
  }
}

/* Desktop Responsive */
@media (min-width: 1024px) {
  .floating-action-container {
    bottom: 120px;
    right: 24px;
  }

  .action-item {
    min-width: 150px;
    padding: 1rem 1.25rem;
    font-size: 0.9rem;
  }

  .fab-main {
    width: 60px;
    height: 60px;
    font-size: 1.375rem;
  }

  .toast {
    top: 24px;
    right: 24px;
    max-width: 320px;
  }
}
</style>