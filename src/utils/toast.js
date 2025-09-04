// src/utils/toast.js - Utility functions untuk menampilkan toast notifications

/**
 * Show a toast notification
 * @param {Object} options - Toast configuration
 * @param {string} options.type - Toast type: 'success', 'error', 'warning', 'info', 'wishlist'
 * @param {string} options.title - Toast title (optional)
 * @param {string} options.message - Toast message
 * @param {number} options.duration - Duration in milliseconds (default: 3000, 0 = persistent)
 * @param {boolean} options.dismissible - Whether toast can be dismissed (default: true)
 */
export function showToast(options) {
  if (typeof options === 'string') {
    // Simple string message
    options = {
      type: 'info',
      message: options,
      duration: 3000,
      dismissible: true
    }
  }

  // Validate options
  const toast = {
    type: options.type || 'info',
    title: options.title,
    message: options.message || 'Notification',
    duration: options.duration !== undefined ? options.duration : 3000,
    dismissible: options.dismissible !== false
  }

  // Dispatch custom event for ToastNotification component to listen to
  const event = new CustomEvent('show-toast', {
    detail: toast
  })
  
  window.dispatchEvent(event)
  
  return toast
}

/**
 * Show success toast
 * @param {string|Object} message - Message string or toast options
 */
export function showSuccessToast(message) {
  if (typeof message === 'string') {
    return showToast({
      type: 'success',
      message,
      duration: 3000
    })
  }
  
  return showToast({
    ...message,
    type: 'success'
  })
}

/**
 * Show error toast
 * @param {string|Object} message - Message string or toast options
 */
export function showErrorToast(message) {
  if (typeof message === 'string') {
    return showToast({
      type: 'error',
      message,
      duration: 4000
    })
  }
  
  return showToast({
    ...message,
    type: 'error'
  })
}

/**
 * Show warning toast
 * @param {string|Object} message - Message string or toast options
 */
export function showWarningToast(message) {
  if (typeof message === 'string') {
    return showToast({
      type: 'warning',
      message,
      duration: 3500
    })
  }
  
  return showToast({
    ...message,
    type: 'warning'
  })
}

/**
 * Show info toast
 * @param {string|Object} message - Message string or toast options
 */
export function showInfoToast(message) {
  if (typeof message === 'string') {
    return showToast({
      type: 'info',
      message,
      duration: 3000
    })
  }
  
  return showToast({
    ...message,
    type: 'info'
  })
}

/**
 * Show wishlist-specific toast
 * @param {string|Object} message - Message string or toast options
 */
export function showWishlistToast(message) {
  if (typeof message === 'string') {
    return showToast({
      type: 'wishlist',
      message,
      duration: 2500
    })
  }
  
  return showToast({
    ...message,
    type: 'wishlist'
  })
}

/**
 * Show wishlist add toast
 * @param {string} productName - Name of the product added
 */
export function showWishlistAddToast(productName) {
  return showToast({
    type: 'wishlist',
    title: 'Added to Wishlist!',
    message: `${productName} has been added to your wishlist`,
    duration: 2500
  })
}

/**
 * Show wishlist remove toast
 * @param {string} productName - Name of the product removed
 */
export function showWishlistRemoveToast(productName) {
  return showToast({
    type: 'info',
    title: 'Removed from Wishlist',
    message: `${productName} has been removed from your wishlist`,
    duration: 2000
  })
}

/**
 * Show network error toast
 */
export function showNetworkErrorToast() {
  return showToast({
    type: 'error',
    title: 'Network Error',
    message: 'Please check your internet connection and try again',
    duration: 4000
  })
}

/**
 * Show loading toast (persistent until manually dismissed)
 * @param {string} message - Loading message
 */
export function showLoadingToast(message = 'Loading...') {
  return showToast({
    type: 'info',
    message,
    duration: 0, // Persistent
    dismissible: false
  })
}

/**
 * Clear all toasts (useful for cleaning up loading toasts)
 */
export function clearAllToasts() {
  const event = new CustomEvent('clear-all-toasts')
  window.dispatchEvent(event)
}

/**
 * Toast presets for common scenarios
 */
export const ToastPresets = {
  // Wishlist operations
  wishlistAdded: (productName) => showWishlistAddToast(productName),
  wishlistRemoved: (productName) => showWishlistRemoveToast(productName),
  wishlistAlreadyExists: (productName) => showWarningToast({
    title: 'Already in Wishlist',
    message: `${productName} is already in your wishlist`
  }),
  wishlistCleared: () => showInfoToast({
    title: 'Wishlist Cleared',
    message: 'All items have been removed from your wishlist'
  }),
  
  // Authentication
  loginSuccess: () => showSuccessToast({
    title: 'Welcome Back!',
    message: 'You have successfully logged in'
  }),
  logoutSuccess: () => showInfoToast({
    title: 'Logged Out',
    message: 'You have been logged out successfully'
  }),
  
  // Network & API
  networkError: () => showNetworkErrorToast(),
  apiError: (message) => showErrorToast({
    title: 'API Error',
    message: message || 'Something went wrong. Please try again.'
  }),
  
  // File operations
  exportSuccess: () => showSuccessToast({
    title: 'Export Successful',
    message: 'Your data has been exported successfully'
  }),
  importSuccess: (count) => showSuccessToast({
    title: 'Import Successful',
    message: `Successfully imported ${count} items`
  }),
  
  // Generic operations
  saveSuccess: () => showSuccessToast('Changes saved successfully'),
  deleteSuccess: () => showInfoToast('Item deleted successfully'),
  copySuccess: () => showSuccessToast('Copied to clipboard'),
  
  // Loading states
  loading: (message) => showLoadingToast(message),
  stopLoading: () => clearAllToasts()
}

/**
 * Composable-style toast hook for Vue 3
 * @returns {Object} Toast functions
 */
export function useToast() {
  return {
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showWishlistToast,
    clearAllToasts,
    presets: ToastPresets
  }
}

// Default export for convenience
export default {
  show: showToast,
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  info: showInfoToast,
  wishlist: showWishlistToast,
  clear: clearAllToasts,
  presets: ToastPresets,
  useToast
}