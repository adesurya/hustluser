<template>
  <div class="affiliate-links-view">
    <!-- Main Content Container -->
    <div class="main-content">
      <HustlHeader :isDashboard="true" />

      <!-- Loading State -->
      <div v-if="loading && affiliateLinks.length === 0" class="dashboard-section loading-section">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading affiliate links...</p>
      </div>

      <template v-else>
        <!-- Page Header -->
        <div class="dashboard-section page-header-section">
          <div class="page-header">
            <div class="back-button" @click="goBack">
              <span class="back-icon">←</span>
            </div>
            <div class="page-info">
              <h2 class="page-title">
                <span class="title-highlight">Affiliate</span> Links
              </h2>
              <p class="page-subtitle">Your History Link to Share</p>
              <div class="page-badge">
                <span class="badge-icon">📊</span>
                <span class="badge-text">Analytics Dashboard</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Section -->
        <!-- <div class="dashboard-section filter-section">
          <div class="section-header">
            <h3 class="section-title">Filter Links</h3>
            <button class="refresh-btn" @click="refreshLinks" :disabled="loading">
              <span class="refresh-icon">🔄</span>
              <span class="refresh-text">Refresh</span>
            </button>
          </div>
          <div class="filter-controls">
            <select v-model="selectedStatus" @change="loadAffiliateLinks" class="filter-select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
            
            <select v-model="sortBy" @change="loadAffiliateLinks" class="filter-select">
              <option value="createdAt">Sort by Date</option>
              <option value="earnings">Sort by Earnings</option>
              <option value="clicksCount">Sort by Clicks</option>
              <option value="conversionsCount">Sort by Conversions</option>
            </select>

            
            <select v-model="sortOrder" @change="loadAffiliateLinks" class="filter-select">
              <option value="DESC">Newest First</option>
              <option value="ASC">Oldest First</option>
            </select>
          </div>
        </div> -->

        <!-- Affiliate Links List -->
        <div v-if="affiliateLinks.length > 0" class="dashboard-section links-section">
          <div class="section-header">
            <h3 class="section-title">Your Affiliate Links</h3>
            <span class="items-count">{{ affiliateLinks.length }} links</span>
          </div>
          
          <div class="affiliate-links-list">
            <div 
              v-for="link in affiliateLinks" 
              :key="link.id" 
              class="affiliate-link-card"
              :class="{ 'high-earner': parseFloat(link.earnings) > 1000 }"
            >
              <div class="link-header">
                <div class="link-info">
                  <div class="link-id">
                    <span class="id-label">Link #{{ link.id }}</span>
                    <span class="status-badge" :class="link.status">{{ link.status }}</span>
                  </div>
                  <div class="link-date">{{ formatDate(link.created_at) }}</div>
                </div>
                <div class="link-actions">
                  <button 
                    class="share-btn" 
                    @click="showShareModal(link)"
                    :disabled="link.status !== 'active'"
                  >
                    <span class="share-icon">📤</span>
                  </button>
                  <button class="details-btn" @click="viewLinkDetails(link)">
                    <span class="details-icon">ℹ️</span>
                  </button>
                </div>
              </div>

              <div class="link-content">
                <div class="link-url-section">
                  <div class="url-info">
                    <span class="url-label">Affiliate URL:</span>
                    <div class="url-container">
                      <span class="affiliate-url">{{ truncateUrl(link.affiliateUrl) }}</span>
                      <button class="copy-url-btn" @click="copyUrl(link.affiliateUrl)">
                        <span class="copy-icon">📋</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="link-metrics">
                  <div class="metric-item">
                    <span class="metric-icon">👆</span>
                    <div class="metric-details">
                      <span class="metric-value">{{ link.clicksCount || 0 }}</span>
                      <span class="metric-label">Clicks</span>
                    </div>
                  </div>
                  
                  <div class="metric-item">
                    <span class="metric-icon">🎯</span>
                    <div class="metric-details">
                      <span class="metric-value">{{ link.conversionsCount || 0 }}</span>
                      <span class="metric-label">Conversions</span>
                    </div>
                  </div>
                </div>

                <div class="link-tags" v-if="link.tags && link.tags.length > 0">
                  <span class="tags-label">Tags:</span>
                  <div class="tags-list">
                    <span 
                      v-for="tag in link.tags" 
                      :key="tag" 
                      class="tag-item"
                    >{{ tag }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More Button -->
          <div v-if="hasMoreLinks" class="load-more-section">
            <button class="load-more-btn" @click="loadMoreLinks" :disabled="loading">
              <span class="load-more-icon" :class="{ spinning: loading }">🔄</span>
              <span class="load-more-text">{{ loading ? 'Loading...' : 'Load More Links' }}</span>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="dashboard-section empty-state-section">
          <div class="empty-state">
            <div class="empty-icon">🔗</div>
            <h4 class="empty-title">No affiliate links yet</h4>
            <p class="empty-message">Start generating affiliate links from products to track your earnings!</p>
            <button class="browse-products-btn" @click="navigateToProducts">
              <span class="browse-icon">🛍️</span>
              <span class="browse-text">Browse Products</span>
            </button>
          </div>
        </div>

        <!-- Error Messages -->
        <div v-if="error" class="dashboard-section error-section">
          <div class="error-message">
            <span class="error-icon">⚠️</span>
            <span class="error-text">{{ error }}</span>
            <button class="retry-btn" @click="loadAffiliateLinks">Retry</button>
          </div>
        </div>
      </template>
    </div>

    <!-- Fixed Bottom Navigation -->
    <BottomNavigation />

    <!-- Share Modal -->
    <div v-if="showShare" class="modal-overlay" @click="closeShareModal">
      <div class="modal-content share-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Share Affiliate Link</h3>
          <button class="modal-close" @click="closeShareModal">
            <span class="close-icon">✕</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="share-url-section">
            <label class="share-label">Affiliate URL:</label>
            <div class="share-url-container">
              <input 
                type="text" 
                :value="selectedLink?.affiliateUrl" 
                readonly 
                class="share-url-input"
              >
              <button class="copy-btn" @click="copyUrl(selectedLink?.affiliateUrl)">
                <span class="copy-icon">📋</span>
              </button>
            </div>
          </div>
          
          <div class="share-platforms">
            <h4 class="platforms-title">Share on:</h4>
            <div class="platforms-grid">
              <button 
                v-for="platform in sharePlatforms" 
                :key="platform.id"
                class="platform-btn"
                @click="shareOnPlatform(platform.id)"
              >
                <span class="platform-icon">{{ platform.icon }}</span>
                <span class="platform-name">{{ platform.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Link Details Modal -->
    <div v-if="showDetails" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content details-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Link Details #{{ selectedLink?.id }}</h3>
          <button class="modal-close" @click="closeDetailsModal">
            <span class="close-icon">✕</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="details-content">
            <div class="detail-section">
              <h4 class="detail-title">Basic Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Link ID:</span>
                  <span class="detail-value">#{{ selectedLink?.id }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">
                    <span class="status-badge" :class="selectedLink?.status">{{ selectedLink?.status }}</span>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Created:</span>
                  <span class="detail-value">{{ formatDate(selectedLink?.created_at) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Last Sync:</span>
                  <span class="detail-value">{{ formatDate(selectedLink?.lastSyncedAt) }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4 class="detail-title">Performance Metrics</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Total Clicks:</span>
                  <span class="detail-value">{{ selectedLink?.clicksCount || 0 }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Conversions:</span>
                  <span class="detail-value">{{ selectedLink?.conversionsCount || 0 }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Conversion Rate:</span>
                  <span class="detail-value">{{ selectedLink?.conversionRate || '0' }}%</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Total Earnings:</span>
                  <span class="detail-value earnings-highlight">{{ formatEarnings(selectedLink?.earnings) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Avg Earnings/Click:</span>
                  <span class="detail-value">{{ formatEarnings(selectedLink?.avgEarningsPerClick) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Commission Rate:</span>
                  <span class="detail-value">{{ selectedLink?.commissionRate || '0' }}%</span>
                </div>
              </div>
            </div>

            <div class="detail-section" v-if="selectedLink?.tags && selectedLink.tags.length > 0">
              <h4 class="detail-title">Tags</h4>
              <div class="tags-container">
                <span 
                  v-for="tag in selectedLink.tags" 
                  :key="tag" 
                  class="tag-item large"
                >{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCachedApi } from '../composables/useCachedApi'
import { DeepLinkUtils } from '../utils/deepLinkUtils'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import apiService from '../services/api'

export default {
  name: 'AffiliateLinksView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    const { getAffiliateLinks, loading, error } = useCachedApi()

    // State management
    const affiliateLinks = ref([])
    const showShare = ref(false)
    const showDetails = ref(false)
    const selectedLink = ref(null)
    const currentPage = ref(1)
    const hasMoreLinks = ref(true)
    
    // Filter states
    const selectedStatus = ref('')
    const sortBy = ref('createdAt')
    const sortOrder = ref('DESC')

    // Share platforms configuration
    const sharePlatforms = ref([
      { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
      { id: 'facebook', name: 'Facebook', icon: '📘' },
      { id: 'twitter', name: 'Twitter', icon: '🐦' },
      { id: 'telegram', name: 'Telegram', icon: '✈️' },
      { id: 'instagram', name: 'Instagram', icon: '📷' },
      { id: 'copyurl', name: 'Copy Link', icon: '📋' }
    ])

    // Computed properties for stats
    const totalLinks = computed(() => affiliateLinks.value.length)
    
    const totalEarnings = computed(() => {
      return affiliateLinks.value.reduce((sum, link) => {
        return sum + parseFloat(link.earnings || 0)
      }, 0)
    })
    
    const totalClicks = computed(() => {
      return affiliateLinks.value.reduce((sum, link) => {
        return sum + parseInt(link.clicksCount || 0)
      }, 0)
    })
    
    const totalConversions = computed(() => {
      return affiliateLinks.value.reduce((sum, link) => {
        return sum + parseInt(link.conversionsCount || 0)
      }, 0)
    })
    
    const averageConversionRate = computed(() => {
      if (totalClicks.value === 0) return '0.00'
      return ((totalConversions.value / totalClicks.value) * 100).toFixed(2)
    })

    // Helper methods
    const formatEarnings = (earnings) => {
      return apiService.constructor.formatEarnings(earnings)
    }

    const formatDate = (dateString) => {
      return apiService.constructor.formatDate(dateString)
    }

    const truncateUrl = (url) => {
      if (!url) return ''
      return url.length > 40 ? url.substring(0, 40) + '...' : url
    }

    // Load affiliate links
    const loadAffiliateLinks = async (page = 1, append = false) => {
      try {
        console.log('Loading affiliate links - page:', page, 'append:', append)
        
        const params = {
          page,
          limit: 20
        }
        
        // Only add status if it's selected and not empty
        if (selectedStatus.value && selectedStatus.value.trim() !== '') {
          params.status = selectedStatus.value
        }
        
        // Add sorting parameters for client-side processing
        if (sortBy.value) {
          params.sortBy = sortBy.value
        }
        
        if (sortOrder.value) {
          params.sortOrder = sortOrder.value
        }

        console.log('Loading affiliate links with params:', params)
        
        const response = await getAffiliateLinks(params, { 
          forceRefresh: false // Try cache first
        })
        
        console.log('Affiliate links response:', response)
        
        if (response && response.success) {
          const newLinks = response.data || []
          
          if (append) {
            affiliateLinks.value = [...affiliateLinks.value, ...newLinks]
          } else {
            affiliateLinks.value = newLinks
            currentPage.value = 1
          }
          
          // Update pagination info
          const pagination = response.meta?.pagination
          if (pagination) {
            hasMoreLinks.value = pagination.hasNextPage
            console.log('Pagination info:', pagination)
          } else {
            hasMoreLinks.value = newLinks.length === 20
          }
          
          console.log('Successfully loaded affiliate links:', {
            count: newLinks.length,
            total: affiliateLinks.value.length,
            hasMore: hasMoreLinks.value
          })
          
          // Clear any previous errors
          error.value = ''
          
        } else {
          console.warn('Unexpected response format:', response)
          affiliateLinks.value = []
          error.value = 'Unexpected response format from server'
        }
        
      } catch (err) {
        console.error('Failed to load affiliate links:', err)
        
        // Enhanced error handling based on error type
        if (err.message.includes('Server is currently unavailable')) {
          error.value = 'Server is temporarily unavailable. Please try again in a few moments.'
        } else if (err.message.includes('Network error')) {
          error.value = 'Network connection error. Please check your internet connection.'
        } else if (err.message.includes('500')) {
          error.value = 'Server error occurred. Our team has been notified.'
        } else if (err.message.includes('401') || err.message.includes('403')) {
          error.value = 'Authentication error. Please try logging in again.'
        } else {
          error.value = 'Failed to load affiliate links. Please try again.'
        }
        
        // Don't clear existing data on error unless it's the first load
        if (!append && affiliateLinks.value.length === 0) {
          affiliateLinks.value = []
        }
        
        // Try a fallback request with minimal parameters
        if (!append && affiliateLinks.value.length === 0) {
          try {
            console.log('Attempting fallback request...')
            const fallbackResponse = await getAffiliateLinks({ 
              page: 1, 
              limit: 20 
            }, { 
              forceRefresh: true 
            })
            
            if (fallbackResponse && fallbackResponse.success) {
              affiliateLinks.value = fallbackResponse.data || []
              error.value = 'Loaded with limited functionality. Some features may be unavailable.'
              console.log('Fallback request succeeded')
            }
          } catch (fallbackError) {
            console.error('Fallback request also failed:', fallbackError)
          }
        }
      }
    }

    const loadMoreLinks = async () => {
      if (!hasMoreLinks.value || loading.value) return
      
      currentPage.value += 1
      await loadAffiliateLinks(currentPage.value, true)
    }

    const refreshLinks = async () => {
      currentPage.value = 1
      await loadAffiliateLinks(1, false)
    }

    // Share functionality
    const showShareModal = (link) => {
      selectedLink.value = link
      showShare.value = true
    }

    const closeShareModal = () => {
      showShare.value = false
      selectedLink.value = null
    }

    const shareOnPlatform = async (platformId) => {
      if (!selectedLink.value?.affiliateUrl) return

      const shareText = `Check out this amazing product! Get it through my affiliate link and help me earn some commission. 🛍️✨`
      const shareUrl = selectedLink.value.affiliateUrl

      try {
        const result = await DeepLinkUtils.shareContent(
          platformId,
          shareText,
          shareUrl,
          { category: 'affiliate' }
        )

        if (result.success) {
          // Track the share action
          await trackShare(selectedLink.value.id, platformId)
          
          // Show success feedback
          console.log(`Successfully shared on ${platformId}`)
        }
      } catch (error) {
        console.error('Share failed:', error)
      }
    }

    const trackShare = async (linkId, platform) => {
      try {
        // You can implement share tracking here if needed
        console.log(`Tracked share: Link ${linkId} shared on ${platform}`)
      } catch (error) {
        console.warn('Failed to track share:', error)
      }
    }

    const copyUrl = async (url) => {
      if (!url) return

      try {
        const result = await DeepLinkUtils.copyToClipboard(url)
        if (result.success) {
          // Show success feedback (you might want to add a toast notification)
          console.log('URL copied to clipboard')
        }
      } catch (error) {
        console.error('Failed to copy URL:', error)
      }
    }

    // Details modal
    const viewLinkDetails = (link) => {
      selectedLink.value = link
      showDetails.value = true
    }

    const closeDetailsModal = () => {
      showDetails.value = false
      selectedLink.value = null
    }

    // Navigation
    const goBack = () => {
      router.go(-1)
    }

    const navigateToProducts = () => {
      router.push('/category')
    }

    // Initialize on mount
    onMounted(async () => {
      await loadAffiliateLinks()
    })

    return {
      // State
      affiliateLinks,
      loading,
      error,
      showShare,
      showDetails,
      selectedLink,
      hasMoreLinks,
      
      // Filter states
      selectedStatus,
      sortBy,
      sortOrder,
      
      // Computed stats
      totalLinks,
      totalEarnings,
      totalClicks,
      totalConversions,
      averageConversionRate,
      
      // Share platforms
      sharePlatforms,
      
      // Methods
      formatEarnings,
      formatDate,
      truncateUrl,
      loadAffiliateLinks,
      loadMoreLinks,
      refreshLinks,
      showShareModal,
      closeShareModal,
      shareOnPlatform,
      copyUrl,
      viewLinkDetails,
      closeDetailsModal,
      goBack,
      navigateToProducts
    }
  }
}
</script>

<style scoped>
/* Fixed Layout Structure */
.affiliate-links-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px; /* Space for sticky footer */
}

/* Global Styling */
.affiliate-links-view * {
  box-sizing: border-box;
}

/* Loading Section */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  background: transparent;
  margin: 0;
  border: none;
  box-shadow: none;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(79, 195, 247, 0.3);
  border-top: 4px solid #4FC3F7;
  border-radius: 50%;
  animation: affiliateSpinAnimation 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: white;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
}

@keyframes affiliateSpinAnimation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Dashboard Sections */
.dashboard-section {
  background: white;
  margin: 0 1rem 1.5rem 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.9);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.dashboard-section:first-child {
  margin-top: 1rem;
}

/* Page Header Section */
.page-header-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1.5rem 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.page-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.back-button {
  background: rgba(79, 195, 247, 0.1);
  border: 2px solid #4FC3F7;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.back-button:hover {
  background: #4FC3F7;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.4);
}

.back-button:hover .back-icon {
  color: white;
}

.back-icon {
  font-size: 1.25rem;
  color: #4FC3F7;
  font-weight: bold;
  transition: color 0.2s;
}

.page-info {
  flex: 1;
  min-width: 200px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.title-highlight {
  color: #4FC3F7;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.page-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Filter Section */
.filter-section {
  padding: 1.25rem;
  background: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #4FC3F7;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Baloo 2', sans-serif;
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.3);
}

.refresh-btn:hover:not(:disabled) {
  background: #29B6F6;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filter-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select {
  flex: 1;
  min-width: 140px;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  color: #1F2937;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #4FC3F7;
  box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.1);
}

/* Empty State */
.empty-state-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  text-align: center;
  padding: 4rem 2rem;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 350px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.6;
  color: #6B7280;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
}

.empty-message {
  font-size: 1rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  line-height: 1.6;
  text-align: center;
}

.browse-products-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Baloo 2', sans-serif;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.browse-products-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

/* Links Section */
.links-section {
  padding: 1.25rem;
  background: white;
}

.items-count {
  font-size: 0.9rem;
  color: #6B7280;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
  background: #F3F4F6;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
}

.affiliate-links-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1rem;
}

.affiliate-link-card {
  background: #F8FAFC;
  border: 2px solid #E2E8F0;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.affiliate-link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: #CBD5E1;
}

.affiliate-link-card.high-earner {
  border-color: #F59E0B;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.25);
}

.link-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.link-info {
  flex: 1;
}

.link-id {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.id-label {
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #DCFCE7;
  color: #166534;
}

.status-badge.inactive {
  background: #FEF3C7;
  color: #92400E;
}

.status-badge.expired {
  background: #FEE2E2;
  color: #991B1B;
}

.link-date {
  font-size: 0.85rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
}

.link-actions {
  display: flex;
  gap: 0.5rem;
}

.share-btn, .details-btn {
  background: #F3F4F6;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.share-btn:hover:not(:disabled), .details-btn:hover {
  background: #E5E7EB;
  transform: scale(1.05);
}

.share-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.link-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.url-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.url-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
}

.url-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  padding: 0.75rem;
}

.affiliate-url {
  flex: 1;
  font-size: 0.85rem;
  color: #6B7280;
  word-break: break-all;
}

.copy-url-btn {
  background: #4FC3F7;
  color: white;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-url-btn:hover {
  background: #29B6F6;
  transform: scale(1.05);
}

.link-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.metric-item:hover {
  border-color: #CBD5E1;
  transform: translateY(-1px);
}

.metric-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.metric-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.metric-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 500;
  text-transform: uppercase;
}

.link-tags {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tags-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background: #E0F2FE;
  color: #0369A1;
  padding: 0.375rem 0.75rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: 'Baloo 2', sans-serif;
}

.tag-item.large {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

/* Load More Section */
.load-more-section {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.load-more-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #4FC3F7;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Baloo 2', sans-serif;
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.3);
}

.load-more-btn:hover:not(:disabled) {
  background: #29B6F6;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.4);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.load-more-icon.spinning {
  animation: affiliateSpinAnimation 1s linear infinite;
}

/* Error Section */
.error-section {
  background: #FEF2F2;
  border: 2px solid #FECACA;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #DC2626;
  font-family: 'Baloo 2', sans-serif;
}

.error-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-weight: 500;
  font-size: 1rem;
}

.retry-btn {
  background: #DC2626;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Baloo 2', sans-serif;
}

.retry-btn:hover {
  background: #B91C1C;
  transform: translateY(-1px);
}

/* Sticky Bottom Navigation */
.affiliate-links-view > :last-child {
  position: sticky;
  bottom: 0;
  z-index: 100;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.modal-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
}

.modal-close {
  background: #F3F4F6;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6B7280;
}

.modal-close:hover {
  background: #E5E7EB;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

/* Share Modal Specific */
.share-url-section {
  margin-bottom: 2rem;
}

.share-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-family: 'Baloo 2', sans-serif;
}

.share-url-container {
  display: flex;
  gap: 0.5rem;
}

.share-url-input {
  flex: 1;
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
}

.copy-btn {
  background: #4FC3F7;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: #29B6F6;
}

.share-platforms {
  margin-top: 1.5rem;
}

.platforms-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 1rem;
  font-family: 'Baloo 2', sans-serif;
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.platform-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #F8FAFC;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.platform-btn:hover {
  background: #E2E8F0;
  border-color: #CBD5E1;
  transform: translateY(-1px);
}

.platform-icon {
  font-size: 1.25rem;
}

.platform-name {
  color: #374151;
  font-size: 0.9rem;
}

/* Details Modal Specific */
.details-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-section {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 1.5rem;
}

.detail-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 1rem 0;
  font-family: 'Baloo 2', sans-serif;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.detail-label {
  font-size: 0.9rem;
  color: #6B7280;
  font-weight: 500;
  font-family: 'Baloo 2', sans-serif;
}

.detail-value {
  font-size: 0.9rem;
  color: #1F2937;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
}

.earnings-highlight {
  color: #059669;
  font-weight: 700;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Responsive Design */
@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .link-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .platforms-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) {
  .dashboard-section {
    margin: 0 2rem 1.5rem 2rem;
  }
  
  .dashboard-section:first-child {
    margin-top: 1rem;
  }
}

@media (min-width: 1024px) {
  .dashboard-section {
    margin: 0 3rem 2rem 3rem;
  }
  
  .dashboard-section:first-child {
    margin-top: 1.5rem;
  }
}
</style>