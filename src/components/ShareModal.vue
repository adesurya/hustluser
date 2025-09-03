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
</template>

<script>
import { ref } from 'vue'
import apiService from '../services/api'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'ShareModal',
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
  emits: ['close', 'shared', 'points-earned'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    
    // State
    const isLoading = ref(false)
    const loadingMessage = ref('')
    const successMessage = ref('')
    const errorMessage = ref('')
    const pointsEarned = ref(0)
    const generatedAffiliateLink = ref(null)

    // Mobile detection for UI indicators
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }

    const isAndroid = () => {
      return /Android/i.test(navigator.userAgent)
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
        const startTime = Date.now()
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
        case 'copyurl':
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
          
        case 'whatsapp':
          return await openAppWithFallback('whatsapp', fullMessage)
          
        case 'facebook':
          return await openAppWithFallback('facebook', { text: shareText, url: shareUrl })
          
        case 'twitter':
          const twitterMessage = shareText.length > 200 ? shareText.substring(0, 200) + '... ' + shareUrl : fullMessage
          return await openAppWithFallback('twitter', twitterMessage)
          
        case 'telegram':
          return await openAppWithFallback('telegram', fullMessage)
          
        case 'instagram':
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
          
        default:
          throw new Error('Unsupported sharing platform')
      }
    }

    const handleShare = async (platform) => {
      isLoading.value = true
      loadingMessage.value = 'Generating share link...'
      errorMessage.value = ''
      successMessage.value = ''

      try {
        // Step 1: Generate affiliate link
        const affiliateData = await generateAffiliateLink()
        
        loadingMessage.value = 'Preparing share options...'
        
        // Step 2: Track the share
        const shareResult = await trackShare(platform, affiliateData.id)
        
        // Prepare share content
        const shareUrl = affiliateData.affiliateUrl || affiliateData.allAffiliateUrls?.[0]?.url
        const shareText = `Check out this amazing product: ${props.product.title} - ${props.product.formattedPrice}. Get it now and earn coins!`
        
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
          shareMethod: shareAction.method
        })
        
        if (pointsEarned.value > 0) {
          emit('points-earned', pointsEarned.value)
        }
        
        console.log('Share completed successfully:', {
          platform,
          method: shareAction.method,
          pointsEarned: pointsEarned.value,
          shareUrl
        })

      } catch (error) {
        console.error('Share error:', error)
        errorMessage.value = error.message || 'Failed to share product. Please try again.'
      } finally {
        isLoading.value = false
        loadingMessage.value = ''
      }
    }

    return {
      isLoading,
      loadingMessage,
      successMessage,
      errorMessage,
      pointsEarned,
      shareOptions,
      isMobileDevice,
      closeModal,
      clearError,
      handleShare
    }
  }
}
</script>

<style scoped>
/* Modal Overlay */
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
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

/* Modal Container */
.share-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalSlideUp 0.3s ease-out;
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
  min-width: 0;
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
}

.retry-btn:hover {
  background: #B91C1C;
  transform: translateY(-1px);
}

/* Mobile Responsiveness */
@media (max-width: 480px) {
  .share-modal {
    margin: 0.5rem;
    max-width: none;
    border-radius: 16px;
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
</style>