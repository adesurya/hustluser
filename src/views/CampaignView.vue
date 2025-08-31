<template>
  <div class="campaign-view dashboard-page">
    <!-- Coin Points Section -->
    <div class="dashboard-section points-section">
      <div class="points-card">
        <div class="coin-icon">🪙</div>
        <div class="points-info">
          <span class="points-value">{{ userPoints }}</span>
          <span class="points-label">Coin Points</span>
        </div>
      </div>
    </div>

    <!-- Search Section -->
    <div class="dashboard-section search-section">
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          class="search-input"
          placeholder="Search campaigns..."
          v-model="searchQuery"
          @input="handleSearch"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn">
          <span class="clear-icon">✕</span>
        </button>
      </div>
    </div>

    <!-- Active Campaigns Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h3 class="section-title">Active Campaigns</h3>
        <span class="campaigns-count">{{ filteredCampaigns.length }} campaigns</span>
      </div>
      <div class="campaigns-list">
        <div 
          v-for="campaign in filteredCampaigns" 
          :key="campaign.id" 
          class="campaign-card"
          @click="viewCampaignDetails(campaign)"
        >
          <div class="campaign-image">
            <img :src="campaign.image" :alt="campaign.title" />
            <div class="campaign-status active">
              <span class="status-dot"></span>
              <span class="status-text">Active</span>
            </div>
          </div>
          <div class="campaign-info">
            <h4 class="campaign-title">{{ campaign.title }}</h4>
            <p class="campaign-desc">{{ campaign.shortDescription }}</p>
            <div class="campaign-details">
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">{{ formatDateRange(campaign.startDate, campaign.endDate) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Products:</span>
                <span class="detail-value">{{ campaign.productCount }} items</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Reward:</span>
                <span class="detail-value reward">{{ campaign.reward }}</span>
              </div>
            </div>
          </div>
          <div class="campaign-arrow">
            <span>→</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredCampaigns.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h4 class="empty-title">No campaigns found</h4>
        <p class="empty-message">
          {{ searchQuery ? 'Try different keywords' : 'No active campaigns available' }}
        </p>
      </div>
    </div>

    <!-- Bottom Navigation Component -->
    <BottomNavigation />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BottomNavigation from '../components/BottomNavigation.vue'

export default {
  name: 'CampaignView',
  components: {
    BottomNavigation
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const searchQuery = ref('')

    // User points from auth store
    const userPoints = computed(() => authStore.userPoints || 1250)

    // Dummy active campaigns data
    const activeCampaigns = ref([
      {
        id: 1,
        title: 'Hari Kemerdekaan - 80 Tahun',
        shortDescription: 'Celebrate Indonesia\'s independence with special discounts and rewards',
        description: 'Join our special Independence Day campaign celebrating 80 years of Indonesia\'s freedom. Get exclusive discounts on electronics, fashion, and home appliances while earning bonus coins.',
        image: '/api/placeholder/400/200',
        startDate: '2025-08-01',
        endDate: '2025-08-31',
        reward: 'Up to 50% Off + Double Coins',
        productCount: 150,
        products: [
          {
            id: 101,
            name: 'Samsung Smart TV G6080',
            category: 'Electronic',
            image: '/api/placeholder/120/120',
            price: 'Rp 1.999.000',
            originalPrice: 'Rp 3.999.000',
            discount: '50%',
            coins: 200,
            rating: 4.8,
            reviewCount: 3247,
            description: 'Experience stunning 4K resolution with Samsung\'s latest Smart TV technology. Features HDR support, built-in streaming apps, and voice control.',
            specifications: [
              'Screen Size: 55 inches',
              'Resolution: 4K UHD (3840x2160)',
              'HDR: HDR10, HDR10+',
              'Smart Platform: Tizen OS',
              'Connectivity: 3 HDMI, 2 USB, WiFi',
              'Audio: Dolby Digital Plus'
            ]
          },
          {
            id: 102,
            name: 'iPhone 15 Pro Max 256GB',
            category: 'Electronic',
            image: '/api/placeholder/120/120',
            price: 'Rp 18.999.000',
            originalPrice: 'Rp 21.999.000',
            discount: '13%',
            coins: 190,
            rating: 4.9,
            reviewCount: 1890,
            description: 'The most advanced iPhone ever with titanium design, A17 Pro chip, and revolutionary camera system.',
            specifications: [
              'Display: 6.7-inch Super Retina XDR',
              'Chip: A17 Pro',
              'Camera: 48MP Main, 12MP Ultra Wide',
              'Storage: 256GB',
              'Battery: All-day battery life',
              'Material: Titanium'
            ]
          },
          {
            id: 103,
            name: 'MacBook Air M3 13"',
            category: 'Electronic',
            image: '/api/placeholder/120/120',
            price: 'Rp 14.999.000',
            originalPrice: 'Rp 17.999.000',
            discount: '16%',
            coins: 150,
            rating: 4.7,
            reviewCount: 567,
            description: 'Supercharged by M3 chip, the new MacBook Air is incredibly fast and powerful laptop that gets things done.',
            specifications: [
              'Chip: Apple M3 8-core CPU',
              'Memory: 8GB unified memory',
              'Storage: 256GB SSD',
              'Display: 13.6-inch Liquid Retina',
              'Battery: Up to 18 hours',
              'Weight: 1.24 kg'
            ]
          }
        ]
      },
      {
        id: 2,
        title: 'Back to School Sale',
        shortDescription: 'Get ready for the new semester with amazing deals on electronics and books',
        description: 'Prepare for the academic year with our comprehensive back-to-school campaign. Special prices on laptops, tablets, books, and study accessories.',
        image: '/api/placeholder/400/200',
        startDate: '2025-07-15',
        endDate: '2025-09-15',
        reward: 'Up to 40% Off + Study Bonus',
        productCount: 89,
        products: [
          {
            id: 201,
            name: 'iPad Pro 12.9" M2',
            category: 'Electronic',
            image: '/api/placeholder/120/120',
            price: 'Rp 12.999.000',
            originalPrice: 'Rp 15.999.000',
            discount: '18%',
            coins: 130,
            rating: 4.8,
            reviewCount: 890,
            description: 'The ultimate iPad experience with M2 chip, Liquid Retina XDR display, and all-day battery life.',
            specifications: [
              'Display: 12.9-inch Liquid Retina XDR',
              'Chip: Apple M2',
              'Storage: 128GB',
              'Camera: 12MP Wide, 10MP Ultra Wide',
              'Battery: All-day battery life',
              'Apple Pencil: 2nd generation compatible'
            ]
          }
        ]
      },
      {
        id: 3,
        title: 'Fashion Week Special',
        shortDescription: 'Discover the latest fashion trends with exclusive designer collections',
        description: 'Step into style with our Fashion Week campaign featuring the latest collections from top designers and brands.',
        image: '/api/placeholder/400/200',
        startDate: '2025-08-10',
        endDate: '2025-09-10',
        reward: 'Up to 60% Off + Style Points',
        productCount: 234,
        products: [
          {
            id: 301,
            name: 'Nike Air Force 1 White',
            category: 'Fashion',
            image: '/api/placeholder/120/120',
            price: 'Rp 1.299.000',
            originalPrice: 'Rp 1.799.000',
            discount: '27%',
            coins: 13,
            rating: 4.7,
            reviewCount: 2134,
            description: 'The iconic basketball shoe that changed the game. Classic white leather upper with signature Air cushioning.',
            specifications: [
              'Material: Premium leather upper',
              'Sole: Rubber outsole',
              'Cushioning: Nike Air technology',
              'Style: Low-top basketball shoe',
              'Color: White/White',
              'Gender: Unisex'
            ]
          }
        ]
      }
    ])

    const filteredCampaigns = computed(() => {
      if (!searchQuery.value) return activeCampaigns.value
      
      const query = searchQuery.value.toLowerCase()
      return activeCampaigns.value.filter(campaign =>
        campaign.title.toLowerCase().includes(query) ||
        campaign.shortDescription.toLowerCase().includes(query)
      )
    })

    const handleSearch = () => {
      // Search is reactive through computed property
      console.log('Searching for:', searchQuery.value)
    }

    const clearSearch = () => {
      searchQuery.value = ''
    }

    const formatDateRange = (startDate, endDate) => {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const options = { day: 'numeric', month: 'short' }
      
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`
    }

    const viewCampaignDetails = (campaign) => {
      // Store campaign details in sessionStorage for next view
      sessionStorage.setItem('selectedCampaign', JSON.stringify(campaign))
      router.push(`/campaign/${campaign.id}`)
    }

    return {
      userPoints,
      searchQuery,
      activeCampaigns,
      filteredCampaigns,
      handleSearch,
      clearSearch,
      formatDateRange,
      viewCampaignDetails
    }
  }
}
</script>

<style scoped>
/* Override main.css container restrictions for CampaignView */
.campaign-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Force full width on all screen sizes */
.campaign-view .page-container {
  max-width: none !important;
  width: 100% !important;
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.campaign-view .app-main {
  max-width: none !important;
  width: 100% !important;
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  min-height: auto !important;
  height: auto !important;
  overflow: visible !important;
}

.dashboard-section {
  background: white;
  margin: 0 1rem 1.5rem 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.9);
}

.dashboard-section:first-child {
  margin-top: 1rem;
}

/* Points Section */
.points-section {
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.points-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.25);
  color: white;
}

.coin-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.points-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.points-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1;
}

.points-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Search Section */
.search-section {
  padding: 1rem 1.25rem;
  background: transparent;
  margin: 0 0 1.5rem 0;
  box-shadow: none;
  border: none;
}

.search-container {
  background: white;
  border-radius: 24px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.9);
  position: relative;
}

.search-icon {
  font-size: 1.125rem;
  color: #6B7280;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.search-input::placeholder {
  color: #9CA3AF;
  font-weight: 400;
}

.clear-search-btn {
  background: #EF4444;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.clear-search-btn:hover {
  background: #DC2626;
  transform: scale(1.1);
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.campaigns-count {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Campaigns List */
.campaigns-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.campaign-card {
  display: flex;
  background: #F8FAFC;
  border-radius: 16px;
  padding: 1rem;
  border: 2px solid #E2E8F0;
  transition: all 0.2s;
  cursor: pointer;
  align-items: center;
  gap: 1rem;
}

.campaign-card:hover {
  background: #F1F5F9;
  border-color: #4FC3F7;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.15);
}

.campaign-image {
  position: relative;
  width: 80px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  background: #E5E7EB;
  flex-shrink: 0;
}

.campaign-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.campaign-status {
  position: absolute;
  top: 4px;
  left: 4px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: 8px;
  font-size: 0.625rem;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
}

.campaign-status.active {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.campaign-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.campaign-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin-bottom: 0.375rem;
  line-height: 1.3;
}

.campaign-desc {
  font-size: 0.8rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.campaign-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.detail-value {
  font-size: 0.75rem;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
}

.detail-value.reward {
  color: #059669;
  font-weight: 700;
}

.campaign-arrow {
  color: #6B7280;
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: all 0.2s;
}

.campaign-card:hover .campaign-arrow {
  color: #4FC3F7;
  transform: translateX(4px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6B7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-family: 'Baloo 2', sans-serif;
}

.empty-message {
  font-size: 0.875rem;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.5;
}

/* Responsive Design */
@media (min-width: 768px) {
  .campaign-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .campaign-view .page-container {
    max-width: none !important;
    width: 100% !important;
    background: transparent !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    justify-content: flex-start !important;
    align-items: stretch !important;
  }

  .campaign-view .app-main {
    max-width: none !important;
    width: 100% !important;
    background: transparent !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: auto !important;
    height: auto !important;
    overflow: visible !important;
  }

  .campaign-image {
    width: 100px;
    height: 75px;
  }

  .campaign-title {
    font-size: 1rem;
  }

  .campaign-desc {
    font-size: 0.875rem;
  }
}

@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .campaign-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: auto !important;
  }
  
  .campaign-view .page-container {
    max-width: none !important;
    width: 100% !important;
    background: transparent !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    justify-content: flex-start !important;
    align-items: stretch !important;
    min-height: 100vh !important;
    height: auto !important;
  }
  
  .campaign-view .app-main {
    max-width: none !important;
    width: 100% !important;
    background: transparent !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: auto !important;
    height: auto !important;
    overflow: visible !important;
  }
}
</style>