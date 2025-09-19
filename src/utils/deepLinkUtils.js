// src/utils/deepLinkUtils.js - Fixed ESLint errors

export class DeepLinkUtils {
  
  // Device detection
  static isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  static isAndroid() {
    return /Android/i.test(navigator.userAgent)
  }

  static isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent)
  }

  // App deep links and store URLs
  static getAppLinks(platform) {
    const links = {
      whatsapp: {
        deepLink: 'whatsapp://send?text=',
        webLink: 'https://wa.me/?text=',
        androidStore: 'https://play.google.com/store/apps/details?id=com.whatsapp',
        iosStore: 'https://apps.apple.com/app/whatsapp-messenger/id310633997',
        webFallback: 'https://web.whatsapp.com'
      },
      facebook: {
        deepLink: 'fb://facewebmodal/f?href=',
        webLink: 'https://www.facebook.com/sharer/sharer.php?u=',
        androidStore: 'https://play.google.com/store/apps/details?id=com.facebook.katana',
        iosStore: 'https://apps.apple.com/app/facebook/id284882215',
        webFallback: 'https://www.facebook.com'
      },
      twitter: {
        deepLink: 'twitter://post?message=',
        webLink: 'https://twitter.com/intent/tweet?text=',
        androidStore: 'https://play.google.com/store/apps/details?id=com.twitter.android',
        iosStore: 'https://apps.apple.com/app/twitter/id333903271',
        webFallback: 'https://twitter.com'
      },
      telegram: {
        deepLink: 'tg://msg?text=',
        webLink: 'https://t.me/share/url?text=',
        androidStore: 'https://play.google.com/store/apps/details?id=org.telegram.messenger',
        iosStore: 'https://apps.apple.com/app/telegram-messenger/id686449807',
        webFallback: 'https://web.telegram.org'
      },
      instagram: {
        deepLink: 'instagram://camera',
        webLink: 'https://www.instagram.com',
        androidStore: 'https://play.google.com/store/apps/details?id=com.instagram.android',
        iosStore: 'https://apps.apple.com/app/instagram/id389801252',
        webFallback: 'https://www.instagram.com'
      }
    }
    
    return links[platform] || null
  }

  // Enhanced app opening with proper fallbacks
  static async openAppWithFallback(platform, message, options = {}) {
    const {
      timeout = 2500,
      showStorePrompt = true,
      onAppOpened = null,
      onStoreFallback = null,
      onWebFallback = null
    } = options

    const appLinks = this.getAppLinks(platform)
    if (!appLinks) {
      throw new Error(`Unsupported platform: ${platform}`)
    }

    // Desktop handling
    if (!this.isMobile()) {
      const webUrl = platform === 'facebook' 
        ? `${appLinks.webLink}${encodeURIComponent(message.url)}&quote=${encodeURIComponent(message.text)}`
        : `${appLinks.webLink}${encodeURIComponent(message.fullText || message.text)}`
      
      window.open(webUrl, '_blank')
      
      if (onWebFallback) onWebFallback()
      return { success: true, method: 'web', platform }
    }

    // Mobile handling with enhanced detection
    return new Promise((resolve) => {
      const startTime = Date.now()
      let resolved = false

      // Construct deep link URL based on platform
      let deepLinkUrl
      switch (platform) {
        case 'whatsapp': {
          deepLinkUrl = `${appLinks.deepLink}${encodeURIComponent(message.fullText)}`
          break
        }
        case 'facebook': {
          deepLinkUrl = `${appLinks.deepLink}${encodeURIComponent(message.url)}`
          break
        }
        case 'twitter': {
          deepLinkUrl = `${appLinks.deepLink}${encodeURIComponent(message.fullText)}`
          break
        }
        case 'telegram': {
          deepLinkUrl = `${appLinks.deepLink}${encodeURIComponent(message.fullText)}`
          break
        }
        case 'instagram': {
          deepLinkUrl = appLinks.deepLink // Instagram opens to camera
          break
        }
        default: {
          deepLinkUrl = `${appLinks.deepLink}${encodeURIComponent(message.fullText)}`
        }
      }

      // Create invisible iframe for iOS (better app detection)
      let iframe
      if (this.isIOS()) {
        iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = deepLinkUrl
        document.body.appendChild(iframe)
      }

      // Set up visibility change handler for better app detection
      const handleVisibilityChange = () => {
        if (document.hidden && !resolved) {
          // App likely opened
          resolved = true
          cleanup()
          if (onAppOpened) onAppOpened()
          resolve({ success: true, method: 'app', platform })
        }
      }

      // Set up page focus handler
      const handleFocus = () => {
        // User returned to browser, app might not have opened
        const timeElapsed = Date.now() - startTime
        if (timeElapsed > 1000 && !resolved) {
          // Give some time for app to open, then assume it didn't work
          setTimeout(() => {
            if (!resolved) {
              handleFallback()
            }
          }, 1000)
        }
      }

      // Fallback timer
      const fallbackTimer = setTimeout(() => {
        if (!resolved) {
          handleFallback()
        }
      }, timeout)

      // Cleanup function
      const cleanup = () => {
        clearTimeout(fallbackTimer)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('focus', handleFocus)
        window.removeEventListener('blur', handleVisibilityChange)
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe)
        }
      }

      // Fallback handler
      const handleFallback = () => {
        if (resolved) return
        resolved = true
        cleanup()

        const storeUrl = this.isIOS() ? appLinks.iosStore : appLinks.androidStore
        
        if (showStorePrompt) {
          const appName = platform.charAt(0).toUpperCase() + platform.slice(1)
          const confirmMessage = `${appName} app is not installed. Would you like to install it?`
          
          if (confirm(confirmMessage)) {
            window.open(storeUrl, '_blank')
            if (onStoreFallback) onStoreFallback('store')
            resolve({ success: true, method: 'store', platform, storeUrl })
          } else {
            // User declined, open web version
            window.open(appLinks.webFallback, '_blank')
            if (onWebFallback) onWebFallback()
            resolve({ success: true, method: 'web_fallback', platform })
          }
        } else {
          // Direct redirect to store
          window.open(storeUrl, '_blank')
          if (onStoreFallback) onStoreFallback('store')
          resolve({ success: true, method: 'store', platform, storeUrl })
        }
      }

      // Set up event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('focus', handleFocus)
      window.addEventListener('blur', handleVisibilityChange)

      // Attempt to open the app
      if (this.isIOS() && iframe) {
        // iOS uses iframe method
        // iframe already created and added above
      } else {
        // Android and other mobile platforms
        try {
          window.location.href = deepLinkUrl
        } catch (error) {
          // If direct navigation fails, try with setTimeout
          setTimeout(() => {
            try {
              window.open(deepLinkUrl, '_self')
            } catch (secondError) {
              handleFallback()
            }
          }, 100)
        }
      }

      // Additional safety timeout for edge cases
      setTimeout(() => {
        if (!resolved) {
          handleFallback()
        }
      }, timeout + 1000)
    })
  }

  // Copy to clipboard with enhanced error handling
  static async copyToClipboard(text) {
    try {
      // Modern browsers
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return { success: true, method: 'modern' }
      }
      
      // Fallback for older browsers or non-HTTPS
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        return { success: true, method: 'fallback' }
      } else {
        throw new Error('Copy command failed')
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return { success: false, error: error.message }
    }
  }

  // Format message for different platforms
  static formatMessage(platform, shareText, shareUrl, productData = {}) {
    const baseText = shareText
    const url = shareUrl
    
    switch (platform) {
      case 'whatsapp': {
        return {
          text: baseText,
          url: url,
          fullText: `${baseText}\n\n${url}`
        }
      }
      case 'facebook': {
        return {
          text: baseText,
          url: url,
          fullText: `${baseText}\n\n${url}`
        }
      }
      case 'twitter': {
        // Twitter has character limit, so optimize
        const twitterText = baseText.length > 200 ? baseText.substring(0, 200) + '...' : baseText
        return {
          text: twitterText,
          url: url,
          fullText: `${twitterText} ${url}`
        }
      }
      case 'telegram': {
        return {
          text: baseText,
          url: url,
          fullText: `${baseText}\n\n${url}`
        }
      }
      case 'instagram': {
        return {
          text: baseText,
          url: url,
          fullText: `${baseText}\n\n${url}\n\n#hazel #shopping #deals ${productData.category ? `#${productData.category.toLowerCase()}` : ''}`
        }
      }
      default: {
        return {
          text: baseText,
          url: url,
          fullText: `${baseText}\n\n${url}`
        }
      }
    }
  }

  // Enhanced Instagram handling
  static async handleInstagramShare(message, options = {}) {
    const { autoOpenApp = true } = options
    
    try {
      // Copy formatted text to clipboard
      const clipboardResult = await this.copyToClipboard(message.fullText)
      
      if (!clipboardResult.success) {
        throw new Error('Failed to copy to clipboard')
      }

      if (this.isMobile() && autoOpenApp) {
        // Try to open Instagram app
        const appResult = await this.openAppWithFallback('instagram', message, {
          showStorePrompt: true,
          timeout: 2000
        })
        
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
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Unified sharing method
  static async shareContent(platform, shareText, shareUrl, productData = {}, options = {}) {
    try {
      const message = this.formatMessage(platform, shareText, shareUrl, productData)
      
      switch (platform) {
        case 'copyurl': {
          const clipboardResult = await this.copyToClipboard(shareUrl)
          return {
            ...clipboardResult,
            platform: 'copyurl',
            message: clipboardResult.success ? 'Link copied to clipboard!' : 'Failed to copy link'
          }
        }
        case 'instagram': {
          return await this.handleInstagramShare(message, options)
        }
        case 'whatsapp':
        case 'facebook':
        case 'twitter':
        case 'telegram': {
          const appResult = await this.openAppWithFallback(platform, message, options)
          return {
            ...appResult,
            message: appResult.method === 'app' 
              ? `${platform.charAt(0).toUpperCase() + platform.slice(1)} opened successfully!`
              : `Redirected to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`
          }
        }
        default: {
          throw new Error(`Unsupported platform: ${platform}`)
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        platform
      }
    }
  }
}