<template>
  <div v-if="isVisible" class="share-modal-overlay" @click="closeModal">
    <div class="share-modal" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <h3 class="modal-title">Share Product</h3>
        <button class="close-btn" @click="closeModal">
          <span class="close-icon">✕</span>
        </button>
      </div>

      <!-- Product Preview -->
      <div v-if="product" class="product-preview">
        <div class="product-image">
          <img :src="product.imageUrl || product.image" :alt="product.title" />
        </div>
        <div class="product-info">
          <h4 class="product-name">{{ product.title }}</h4>
          <div class="product-price">{{ product.formattedPrice }}</div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-section">
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ loadingMessage }}</p>
      </div>

      <!-- Share Options -->
      <div v-else class="share-options">
        <h4 class="options-title">Choose sharing method:</h4>
        <div class="share-buttons">
          <button 
            v-for="option in shareOptions" 
            :key="option.platform"
            class="share-option-btn"
            :class="option.platform"
            @click="handleShare(option.platform)"
            :disabled="isLoading"
          >
            <div class="option-icon">
              <component :is="option.icon" v-if="typeof option.icon === 'object'" />
              <span v-else>{{ option.icon }}</span>
            </div>
            <span class="option-label">{{ option.label }}</span>
            <span v-if="isMobileDevice() && ['whatsapp', 'facebook', 'twitter', 'telegram', 'instagram'].includes(option.platform)" 
                  class="mobile-indicator">📱</span>
          </button>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-section">
        <div class="success-message">
          <span class="success-icon">🎉</span>
          <div class="success-content">
            <p class="success-text">{{ successMessage }}</p>
            <p v-if="pointsEarned" class="points-earned">
              <span class="coin-icon">🪙</span>
              <span>+{{ pointsEarned }} points earned!</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-section">
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ errorMessage }}</span>
          <button class="retry-btn" @click="clearError">Try Again</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Mission Completed Popup -->
  <MissionCompletedPopup 
    :isVisible="showMissionCompletedPopup"
    :sharePoints="missionData.sharePoints"
    :bonusPoints="missionData.bonusPoints"
    :newBalance="missionData.newBalance"
    :currentProgress="missionData.currentProgress"
    :targetProgress="missionData.targetProgress"
    :activityName="missionData.activityName"
    :bonusMessage="missionData.bonusMessage"
    @close="closeMissionCompletedPopup"
  />
</template>

<script>
import { ref } from 'vue'
import apiService from '../services/api'
import { useAuthStore } from '../stores/auth'
import MissionCompletedPopup from './MissionCompletedPopup.vue'

export default {
  name: 'ShareModal',
  components: {
    MissionCompletedPopup
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'shared', 'points-earned', 'mission-completed'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    
    // State
    const isLoading = ref(false)
    const loadingMessage = ref('')
    const successMessage = ref('')
    const errorMessage = ref('')
    const pointsEarned = ref(0)
    const generatedAffiliateLink = ref(null)

    // Mission Completed State
    const showMissionCompletedPopup = ref(false)
    const missionData = ref({
      sharePoints: 0,
      bonusPoints: 0,
      newBalance: 0,
      currentProgress: 0,
      targetProgress: 20,
      activityName: '',
      bonusMessage: ''
    })

    // Mobile detection for UI indicators
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }

    const isIOS = () => {
      return /iPhone|iPad|iPod/i.test(navigator.userAgent)
    }

    // Share options configuration
    const shareOptions = ref([
      {
        platform: 'copyurl',
        label: 'Copy Link',
        icon: '🔗',
        color: '#6B7280'
      },
      {
        platform: 'whatsapp',
        label: 'WhatsApp',
        icon: '💬',
        color: '#25D366'
      },
      {
        platform: 'facebook',
        label: 'Facebook',
        icon: '👥',
        color: '#1877F2'
      },
      {
        platform: 'twitter',
        label: 'Twitter',
        icon: '🐦',
        color: '#1DA1F2'
      },
      {
        platform: 'instagram',
        label: 'Instagram',
        icon: '📸',
        color: '#E4405F'
      },
      {
        platform: 'telegram',
        label: 'Telegram',
        icon: '✈️',
        color: '#0088CC'
      }
    ])

    // Methods
    const closeModal = () => {
      // Reset state when closing
      isLoading.value = false
      successMessage.value = ''
      errorMessage.value = ''
      pointsEarned.value = 0
      generatedAffiliateLink.value = null
      loadingMessage.value = ''
      
      emit('close')
    }

    const clearError = () => {
      errorMessage.value = ''
    }

    const extractMaterialId = (productUrl) => {
      if (!productUrl) return null
      
      // Extract material ID from URLs like:
      // https://shop-id.tokopedia.com/view/product/1730865346384987673
      const regex = /product\/(\d+)/i
      const match = productUrl.match(regex)
      
      return match ? match[1] : null
    }

    const generateAffiliateLink = async () => {
      if (!props.product) {
        throw new Error('Product data is required')
      }

      const materialId = extractMaterialId(props.product.url)
      if (!materialId) {
        throw new Error('Could not extract material ID from product URL')
      }

      const affiliateData = {
        productId: props.product.id,
        materialId: materialId,
        channel: 'hazel',
        tags: [
          authStore.userName || 'user_share',
          `product_${props.product.id}`,
          'mobile_app'
        ],
        materialType: 1
      }

      console.log('Generating affiliate link with data:', affiliateData)
      
      const response = await apiService.generateAffiliateLink(affiliateData)
      
      if (response.success) {
        generatedAffiliateLink.value = response.data
        return response.data
      } else {
        throw new Error(response.message || 'Failed to generate affiliate link')
      }
    }

    // UPDATED: Enhanced trackShare method to handle new response structure
    const trackShare = async (platform, affiliateLinkId) => {
      const shareData = {
        affiliateLinkId: affiliateLinkId,
        platform: platform,
        metadata: {
          productId: props.product.id,
          productTitle: props.product.title,
          sharedFrom: 'product_detail',
          deviceType: isMobileDevice() ? 'mobile' : 'desktop',
          userAgent: navigator.userAgent
        }
      }

      console.log('Tracking share with data:', shareData)
      
      const response = await apiService.shareAffiliateLink(shareData)
      
      if (response.success) {
        console.log('Share tracking response:', response.data)
        
        // NEW: Handle mission completion logic
        if (response.data.missionCompleted === true && response.data.gamification?.mission?.bonusAwarded) {
          console.log('Mission completed! Preparing popup data...')
          
          // Prepare mission data for popup
          missionData.value = {
            sharePoints: response.data.pointsEarned || 0,
            bonusPoints: response.data.gamification.mission.bonus?.points || 0,
            newBalance: response.data.gamification.mission.bonus?.newBalance || response.data.newBalance || 0,
            currentProgress: response.data.gamification.mission.progress?.current || 0,
            targetProgress: response.data.gamification.mission.progress?.target || 20,
            activityName: response.data.activityName || 'Daily Mission',
            bonusMessage: response.data.bonusMessage || response.data.gamification.mission.bonus?.message || 'Mission Complete!'
          }
          
          console.log('Mission data prepared:', missionData.value)
          
          // Show mission completed popup after a short delay
          setTimeout(() => {
            showMissionCompletedPopup.value = true
          }, 1500)
          
          // Emit mission completed event
          emit('mission-completed', {
            sharePoints: missionData.value.sharePoints,
            bonusPoints: missionData.value.bonusPoints,
            totalPoints: missionData.value.sharePoints + missionData.value.bonusPoints,
            newBalance: missionData.value.newBalance,
            progress: {
              current: missionData.value.currentProgress,
              target: missionData.value.targetProgress,
              percentage: (missionData.value.currentProgress / missionData.value.targetProgress) * 100
            }
          })
        }
        
        return response.data
      } else {
        throw new Error(response.message || 'Failed to track share')
      }
    }

    // Enhanced deep linking for mobile apps
    const openAppWithFallback = async (platform, message, options = {}) => {
      const { timeout = 2500 } = options

      // App deep links and store URLs
      const appLinks = {
        whatsapp: {
          deepLink: `whatsapp://send?text=${encodeURIComponent(message)}`,
          webLink: `https://wa.me/?text=${encodeURIComponent(message)}`,
          androidStore: 'https://play.google.com/store/apps/details?id=com.whatsapp',
          iosStore: 'https://apps.apple.com/app/whatsapp-messenger/id310633997'
        },
        facebook: {
          deepLink: `fb://facewebmodal/f?href=${encodeURIComponent(message.url)}`,
          webLink: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(message.url)}&quote=${encodeURIComponent(message.text)}`,
          androidStore: 'https://play.google.com/store/apps/details?id=com.facebook.katana',
          iosStore: 'https://apps.apple.com/app/facebook/id284882215'
        },
        twitter: {
          deepLink: `twitter://post?message=${encodeURIComponent(message)}`,
          webLink: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
          androidStore: 'https://play.google.com/store/apps/details?id=com.twitter.android',
          iosStore: 'https://apps.apple.com/app/twitter/id333903271'
        },
        telegram: {
          deepLink: `tg://msg?text=${encodeURIComponent(message)}`,
          webLink: `https://t.me/share/url?text=${encodeURIComponent(message)}`,
          androidStore: 'https://play.google.com/store/apps/details?id=org.telegram.messenger',
          iosStore: 'https://apps.apple.com/app/telegram-messenger/id686449807'
        },
        instagram: {
          deepLink: 'instagram://camera',
          webLink: 'https://www.instagram.com',
          androidStore: 'https://play.google.com/store/apps/details?id=com.instagram.android',
          iosStore: 'https://apps.apple.com/app/instagram/id389801252'
        }
      }

      const links = appLinks[platform]
      if (!links) {
        throw new Error(`Unsupported platform: ${platform}`)
      }

      // Desktop handling
      if (!isMobileDevice()) {
        window.open(links.webLink, '_blank')
        return { success: true, method: 'web', platform }
      }

      // Mobile handling with enhanced detection
      return new Promise((resolve) => {
        let resolved = false

        // Set up visibility change handler
        const handleVisibilityChange = () => {
          if (document.hidden && !resolved) {
            resolved = true
            cleanup()
            resolve({ success: true, method: 'app', platform })
          }
        }

        // Fallback timer
        const fallbackTimer = setTimeout(() => {
          if (!resolved) {
            resolved = true
            cleanup()
            
            const storeUrl = isIOS() ? links.iosStore : links.androidStore
            const appName = platform.charAt(0).toUpperCase() + platform.slice(1)
            
            if (confirm(`${appName} app is not installed. Would you like to install it?`)) {
              window.open(storeUrl, '_blank')
              resolve({ success: true, method: 'store', platform, storeUrl })
            } else {
              window.open(links.webLink, '_blank')
              resolve({ success: true, method: 'web_fallback', platform })
            }
          }
        }, timeout)

        // Cleanup function
        const cleanup = () => {
          clearTimeout(fallbackTimer)
          document.removeEventListener('visibilitychange', handleVisibilityChange)
        }

        // Set up event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Attempt to open the app
        try {
          window.location.href = links.deepLink
        } catch (error) {
          setTimeout(() => {
            if (!resolved) {
              resolved = true
              cleanup()
              resolve({ success: false, error: 'Failed to open app' })
            }
          }, 100)
        }
      })
    }

    const performShare = async (platform, shareUrl, shareText) => {
      const fullMessage = `${shareText}\n\n${shareUrl}`
      
      switch (platform) {
        case 'copyurl': {
          try {
            await navigator.clipboard.writeText(shareUrl)
            return { success: true, method: 'clipboard' }
          } catch (err) {
            const textArea = document.createElement('textarea')
            textArea.value = shareUrl
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            return { success: true, method: 'fallback' }
          }
        }
          
        case 'whatsapp':
          return await openAppWithFallback('whatsapp', fullMessage)
          
        case 'facebook': {
          const facebookMessage = { text: shareText, url: shareUrl }
          return await openAppWithFallback('facebook', facebookMessage)
        }
          
        case 'twitter': {
          const twitterMessage = shareText.length > 200 ? shareText.substring(0, 200) + '... ' + shareUrl : fullMessage
          return await openAppWithFallback('twitter', twitterMessage)
        }
          
        case 'telegram':
          return await openAppWithFallback('telegram', fullMessage)
          
        case 'instagram': {
          try {
            const instagramText = `${shareText}\n\n${shareUrl}\n\n#hazel #shopping #deals`
            await navigator.clipboard.writeText(instagramText)
            
            if (isMobileDevice()) {
              const appResult = await openAppWithFallback('instagram', instagramText, { timeout: 2000 })
              return {
                success: true,
                method: 'clipboard_and_app',
                message: 'Content copied to clipboard! Instagram app is opening...',
                appResult
              }
            } else {
              return {
                success: true,
                method: 'clipboard',
                message: 'Content copied to clipboard! Open Instagram to paste and share.'
              }
            }
          } catch (err) {
            return { success: false, error: 'Failed to copy to clipboard' }
          }
        }
          
        default:
          throw new Error('Unsupported sharing platform')
      }
    }

    // UPDATED: Enhanced handleShare method
    const handleShare = async (platform) => {
      isLoading.value = true
      loadingMessage.value = 'Generating share link...'
      errorMessage.value = ''
      successMessage.value = ''

      try {
        // Step 1: Generate affiliate link
        const affiliateData = await generateAffiliateLink()
        
        loadingMessage.value = 'Preparing share options...'
        
        // Step 2: Track the share and handle mission completion
        const shareResult = await trackShare(platform, affiliateData.id)
        
        // Prepare share content
        const shareUrl = affiliateData.affiliateUrl || affiliateData.allAffiliateUrls?.[0]?.url
        const shareText = `Coba produk ini sekarang juga ! : ${props.product.title} - ${props.product.formattedPrice}.`
        
        loadingMessage.value = 'Opening share options...'
        
        // Step 3: Perform the actual sharing with enhanced mobile support
        const shareAction = await performShare(platform, shareUrl, shareText)
        
        // Handle different share results
        let displayMessage = shareResult.message || 'Product shared successfully!'
        
        if (shareAction.success) {
          switch (shareAction.method) {
            case 'app':
              displayMessage = `${platform.charAt(0).toUpperCase() + platform.slice(1)} app opened successfully! ${shareResult.message || ''}`
              break
            case 'store':
              displayMessage = `${platform.charAt(0).toUpperCase() + platform.slice(1)} app is not installed. Redirecting to app store...`
              break
            case 'web':
            case 'web_fallback':
              displayMessage = `Opened ${platform.charAt(0).toUpperCase() + platform.slice(1)} in browser. ${shareResult.message || ''}`
              break
            case 'clipboard':
            case 'clipboard_and_app':
              displayMessage = shareAction.message || displayMessage
              break
            default:
              displayMessage = shareAction.message || displayMessage
          }
        }
        
        // Show success message
        successMessage.value = displayMessage
        pointsEarned.value = shareResult.pointsEarned || 0
        
        // Update user points in auth store if available
        if (shareResult.newBalance) {
          authStore.refreshUserPoints()
        }
        
        // Emit events for parent components
        emit('shared', {
          platform,
          pointsEarned: pointsEarned.value,
          shareUrl,
          affiliateData,
          shareMethod: shareAction.method,
          missionCompleted: shareResult.missionCompleted || false
        })
        
        if (pointsEarned.value > 0) {
          emit('points-earned', pointsEarned.value)
        }
        
        console.log('Share completed successfully:', {
          platform,
          method: shareAction.method,
          pointsEarned: pointsEarned.value,
          shareUrl,
          missionCompleted: shareResult.missionCompleted
        })

        // NEW: Auto-close share modal if mission completed (to show mission popup)
        if (shareResult.missionCompleted) {
          setTimeout(() => {
            closeModal()
          }, 2000) // Give user time to see success message first
        }

      } catch (error) {
        console.error('Share error:', error)
        errorMessage.value = error.message || 'Failed to share product. Please try again.'
      } finally {
        isLoading.value = false
        loadingMessage.value = ''
      }
    }

    // NEW: Mission completed popup handlers
    const closeMissionCompletedPopup = () => {
      showMissionCompletedPopup.value = false
      
      // Refresh gamification data after mission completion
      setTimeout(() => {
        // Emit event to parent to refresh gamification data
        emit('mission-completed-closed')
      }, 500)
    }

    return {
      isLoading,
      loadingMessage,
      successMessage,
      errorMessage,
      pointsEarned,
      shareOptions,
      showMissionCompletedPopup,
      missionData,
      isMobileDevice,
      closeModal,
      clearError,
      handleShare,
      closeMissionCompletedPopup
    }
  }
}
</script>

<!-- Update bagian style di ShareModal.vue -->

<style scoped>
/* Modal Overlay - FIXED for desktop */
.share-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000; /* Increased z-index */
  padding: 1rem;
  backdrop-filter: blur(4px);
}

/* Modal Container - FIXED sizing and positioning */
.share-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 420px; /* Increased max-width for desktop */
  max-height: 85vh; /* Reduced from 90vh to prevent cut-off */
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalSlideUp 0.3s ease-out;
  position: relative; /* Added for proper positioning */
  margin: auto; /* Center the modal */
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #E5E7EB;
  position: sticky; /* Make header sticky */
  top: 0;
  background: white;
  z-index: 10;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
}

.close-btn {
  background: #F3F4F6;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #6B7280;
  flex-shrink: 0; /* Prevent shrinking */
}

.close-btn:hover {
  background: #E5E7EB;
  color: #374151;
  transform: scale(1.1);
}

.close-icon {
  font-size: 1rem;
  font-weight: 600;
}

/* Product Preview */
.product-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #F8FAFC;
  border-bottom: 1px solid #E5E7EB;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  background: #E5E7EB;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  min-width: 0; /* Allow text to truncate */
}

.product-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 0.875rem;
  color: #059669;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
}

/* Loading Section */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  text-align: center;
  min-height: 120px; /* Minimum height to prevent jumping */
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(79, 195, 247, 0.3);
  border-top: 3px solid #4FC3F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Share Options */
.share-options {
  padding: 1.5rem;
  flex: 1; /* Allow to take remaining space */
}

.options-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  margin: 0 0 1rem 0;
}

.share-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.share-option-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Baloo 2', sans-serif;
  position: relative;
  min-height: 80px; /* Consistent height */
}

.share-option-btn:hover:not(:disabled) {
  border-color: #4FC3F7;
  background: rgba(79, 195, 247, 0.05);
  transform: translateY(-2px);
}

.share-option-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.option-icon {
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
}

/* Mobile indicator for app-enabled platforms */
.mobile-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 0.625rem;
  opacity: 0.7;
}

/* Platform-specific styling */
.share-option-btn.whatsapp:hover {
  border-color: #25D366;
  background: rgba(37, 211, 102, 0.05);
}

.share-option-btn.facebook:hover {
  border-color: #1877F2;
  background: rgba(24, 119, 242, 0.05);
}

.share-option-btn.twitter:hover {
  border-color: #1DA1F2;
  background: rgba(29, 161, 242, 0.05);
}

.share-option-btn.instagram:hover {
  border-color: #E4405F;
  background: rgba(228, 64, 95, 0.05);
}

.share-option-btn.telegram:hover {
  border-color: #0088CC;
  background: rgba(0, 136, 204, 0.05);
}

.share-option-btn.copyurl:hover {
  border-color: #6B7280;
  background: rgba(107, 114, 128, 0.05);
}

/* Success Section */
.success-section {
  padding: 1.5rem;
  background: #F0FDF4;
  border-top: 1px solid #BBF7D0;
}

.success-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.success-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.success-content {
  flex: 1;
}

.success-text {
  color: #166534;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.points-earned {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #F59E0B;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  font-size: 0.875rem;
  margin: 0;
}

.coin-icon {
  font-size: 1rem;
}

/* Error Section */
.error-section {
  padding: 1.5rem;
  background: #FEF2F2;
  border-top: 1px solid #FECACA;
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
  font-size: 0.875rem;
}

.retry-btn {
  background: #DC2626;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Baloo 2', sans-serif;
  flex-shrink: 0;
}

.retry-btn:hover {
  background: #B91C1C;
  transform: translateY(-1px);
}

/* DESKTOP RESPONSIVENESS - FIXED */
@media (min-width: 768px) {
  .share-modal-overlay {
    padding: 2rem; /* More padding on desktop */
  }
  
  .share-modal {
    max-width: 480px; /* Larger on tablet */
    max-height: 80vh; /* More conservative height */
  }
  
  .share-buttons {
    grid-template-columns: repeat(3, 1fr); /* 3 columns on tablet */
    gap: 1.25rem;
  }
  
  .share-option-btn {
    padding: 1.25rem;
    min-height: 90px;
  }
  
  .option-icon {
    font-size: 1.75rem;
    width: 36px;
    height: 36px;
  }
  
  .option-label {
    font-size: 0.8rem;
  }
}

@media (min-width: 1024px) {
  .share-modal-overlay {
    padding: 3rem; /* Even more padding on desktop */
    align-items: center; /* Ensure vertical centering */
    justify-content: center; /* Ensure horizontal centering */
  }
  
  .share-modal {
    max-width: 520px; /* Larger on desktop */
    max-height: 75vh; /* Conservative height for desktop */
    min-height: auto;
    position: relative;
    margin: 0; /* Reset margin */
  }
  
  .modal-header {
    padding: 2rem 2rem 1.5rem;
  }
  
  .modal-title {
    font-size: 1.375rem;
  }
  
  .close-btn {
    width: 36px;
    height: 36px;
  }
  
  .product-preview {
    padding: 1.5rem 2rem;
  }
  
  .product-image {
    width: 70px;
    height: 70px;
  }
  
  .product-name {
    font-size: 1rem;
  }
  
  .product-price {
    font-size: 1rem;
  }
  
  .share-options {
    padding: 2rem;
  }
  
  .options-title {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .share-buttons {
    grid-template-columns: repeat(3, 1fr); /* 3 columns on desktop */
    gap: 1.5rem;
  }
  
  .share-option-btn {
    padding: 1.5rem 1rem;
    min-height: 100px;
    border-radius: 16px;
  }
  
  .option-icon {
    font-size: 2rem;
    width: 40px;
    height: 40px;
  }
  
  .option-label {
    font-size: 0.875rem;
  }
  
  .loading-section {
    padding: 3rem 2rem;
    min-height: 150px;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border-width: 4px;
  }
  
  .loading-text {
    font-size: 1rem;
  }
  
  .success-section,
  .error-section {
    padding: 2rem;
  }
  
  .success-text,
  .error-text {
    font-size: 1rem;
  }
  
  .points-earned {
    font-size: 1rem;
  }
}

@media (min-width: 1200px) {
  .share-modal {
    max-width: 560px; /* Even larger on large desktop */
    max-height: 70vh; /* More conservative height */
  }
  
  .share-buttons {
    gap: 2rem;
  }
  
  .share-option-btn {
    padding: 2rem 1.25rem;
    min-height: 110px;
  }
}

/* Ensure modal doesn't get cut off on very tall screens */
@media (min-height: 800px) {
  .share-modal {
    max-height: 600px; /* Fixed max height on tall screens */
  }
}

@media (min-height: 1000px) {
  .share-modal {
    max-height: 650px; /* Slightly larger on very tall screens */
  }
}

/* Mobile Responsiveness - Keep existing */
@media (max-width: 480px) {
  .share-modal {
    margin: 0.5rem;
    max-width: none;
    border-radius: 16px;
    max-height: 90vh;
  }
  
  .modal-header {
    padding: 1.25rem 1.25rem 0.75rem;
  }
  
  .product-preview {
    padding: 0.75rem 1.25rem;
  }
  
  .share-options {
    padding: 1.25rem;
  }
  
  .share-buttons {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  
  .share-option-btn {
    padding: 0.75rem;
    min-height: 70px;
  }
  
  .option-icon {
    font-size: 1.25rem;
    width: 28px;
    height: 28px;
  }
  
  .option-label {
    font-size: 0.6875rem;
  }
}

/* Fix z-index conflicts */
.share-modal-overlay {
  z-index: 2000 !important;
}

/* Ensure proper stacking context */
.share-modal {
  z-index: 2001;
  isolation: isolate;
}
</style>