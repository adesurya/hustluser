<template>
  <div class="dashboard-view">
    <HustlHeader :isDashboard="true" />

    <!-- Points Section -->
    <div class="dashboard-section points-section">
      <div class="points-card">
        <div class="coin-icon">🪙</div>
        <div class="points-info">
          <span class="points-value">{{ userPoints }}</span>
          <span class="points-label">Points</span>
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
          placeholder="Search products..."
          v-model="searchQuery"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- Categories Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h3 class="section-title">Today's Hot Picks!</h3>
        <button class="see-more-btn">See More</button>
      </div>
      <div class="categories-scroll-container">
        <div class="categories-grid">
          <div v-for="category in categories" :key="category.id" class="category-card">
            <div class="category-icon" :style="{ background: category.color }">
              <span>{{ category.icon }}</span>
            </div>
            <span class="category-name">{{ category.name }}</span>
            <div v-if="category.badge" class="category-badge">{{ category.badge }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Products Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h3 class="section-title">Featured Products</h3>
        <button class="see-more-btn">See More</button>
      </div>
      <div class="products-grid">
        <div 
          v-for="product in featuredProducts" 
          :key="product.id" 
          class="product-card"
          @click="viewProductDetails(product)"
        >
          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
            <div class="product-badge">{{ product.category }}</div>
          </div>
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-price">{{ product.price }}</div>
            <div class="product-actions">
              <span class="earn-coins">🪙 Earn {{ product.coins }} Coins</span>
              <button class="share-btn" @click.stop="shareProduct(product)">
                <span class="share-icon">📤</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Campaign Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h3 class="section-title">Active Campaign</h3>
        <button class="see-more-btn">See More</button>
      </div>
      <div v-if="activeCampaign" class="campaign-card">
        <div class="campaign-image">
          <img :src="activeCampaign.image" :alt="activeCampaign.title" />
          <div class="campaign-overlay">
            <h4 class="campaign-title">{{ activeCampaign.title }}</h4>
            <p class="campaign-description">{{ activeCampaign.description }}</p>
            <div class="campaign-details">
              <span class="campaign-discount">{{ activeCampaign.discount }}</span>
              <span class="campaign-validity">{{ activeCampaign.validity }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation Component -->
    <BottomNavigation />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'

export default {
  name: 'DashboardView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const searchQuery = ref('')

    // User points from auth store
    const userPoints = computed(() => authStore.userPoints || 1250)

    // 5 Categories with scrollable functionality
    const categories = ref([
      { id: 1, name: 'Popular T-Shirts', icon: '👕', color: '#FF1493', badge: '3 days left' },
      { id: 2, name: 'Sport', icon: '⚽', color: '#FFA500' },
      { id: 3, name: 'Gaming', icon: '🎮', color: '#9932CC' },
      { id: 4, name: 'Electronics', icon: '📱', color: '#00CED1' },
      { id: 5, name: 'Fashion', icon: '👗', color: '#FFB6C1' }
    ])

    // 10 Featured products sorted by last update, displayed 2 per row with full details
    const featuredProducts = ref([
      {
        id: 1,
        name: 'Samsung Smart TV 55"',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        price: 'Rp 7,500,000',
        originalPrice: 'Rp 9,999,000',
        discount: '25%',
        coins: 75,
        rating: 4.6,
        reviewCount: 1890,
        lastUpdated: '2025-08-30T10:00:00Z',
        description: 'Experience stunning 4K resolution with Samsung\'s latest Smart TV technology. Features HDR support, built-in streaming apps, and voice control for the ultimate entertainment experience.',
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
        id: 2,
        name: 'iPhone 15 Pro Max',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        price: 'Rp 18,000,000',
        originalPrice: 'Rp 21,999,000',
        discount: '18%',
        coins: 180,
        rating: 4.9,
        reviewCount: 3247,
        lastUpdated: '2025-08-30T09:45:00Z',
        description: 'The most advanced iPhone ever with titanium design, A17 Pro chip, and revolutionary camera system. Professional-grade photography and videography capabilities.',
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
        id: 3,
        name: 'MacBook Air M3',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        price: 'Rp 15,000,000',
        originalPrice: 'Rp 17,999,000',
        discount: '16%',
        coins: 150,
        rating: 4.7,
        reviewCount: 567,
        lastUpdated: '2025-08-30T09:30:00Z',
        description: 'Supercharged by M3 chip, the new MacBook Air is incredibly fast and powerful laptop that gets things done anywhere you go.',
        specifications: [
          'Chip: Apple M3 8-core CPU',
          'Memory: 8GB unified memory',
          'Storage: 256GB SSD',
          'Display: 13.6-inch Liquid Retina', 
          'Battery: Up to 18 hours',
          'Weight: 1.24 kg'
        ]
      },
      {
        id: 4,
        name: 'Nike Air Max 270',
        category: 'Fashion',
        image: '/api/placeholder/80/80',
        price: 'Rp 1,800,000',
        originalPrice: 'Rp 2,499,000',
        discount: '28%',
        coins: 18,
        rating: 4.5,
        reviewCount: 892,
        lastUpdated: '2025-08-30T09:15:00Z',
        description: 'Nike\'s biggest heel Air unit yet delivers exceptional all-day comfort. Inspired by the Air Max legacy with modern style.',
        specifications: [
          'Upper: Mesh and synthetic materials',
          'Midsole: Air Max heel unit',
          'Outsole: Rubber with traction pattern',
          'Style: Lifestyle sneaker',
          'Fit: True to size',
          'Gender: Unisex'
        ]
      },
      {
        id: 5,
        name: 'Sony WH-1000XM5',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        price: 'Rp 4,500,000',
        originalPrice: 'Rp 5,999,000',
        discount: '25%',
        coins: 45,
        rating: 4.8,
        reviewCount: 1234,
        lastUpdated: '2025-08-30T09:00:00Z',
        description: 'Industry-leading noise canceling with premium sound quality. Perfect for music lovers and frequent travelers.',
        specifications: [
          'Driver: 30mm dynamic',
          'Noise Canceling: Industry-leading',
          'Battery: Up to 30 hours',
          'Connectivity: Bluetooth 5.2, NFC',
          'Features: Touch controls, voice assistant',
          'Weight: 250g'
        ]
      },
      {
        id: 6,
        name: 'Adidas Ultraboost 22',
        category: 'Sport',
        image: '/api/placeholder/80/80',
        price: 'Rp 2,200,000',
        originalPrice: 'Rp 3,000,000',
        discount: '26%',
        coins: 22,
        rating: 4.6,
        reviewCount: 743,
        lastUpdated: '2025-08-30T08:45:00Z',
        description: 'Premium running shoes with responsive BOOST midsole and supportive Primeknit upper for ultimate performance.',
        specifications: [
          'Upper: Primeknit textile',
          'Midsole: BOOST technology',
          'Outsole: Continental rubber',
          'Support: Torsion system',
          'Fit: Snug, supportive',
          'Use: Running, training'
        ]
      },
      {
        id: 7,
        name: 'PlayStation 5',
        category: 'Gaming',
        image: '/api/placeholder/80/80',
        price: 'Rp 8,000,000',
        originalPrice: 'Rp 8,999,000',
        discount: '11%',
        coins: 80,
        rating: 4.7,
        reviewCount: 2156,
        lastUpdated: '2025-08-30T08:30:00Z',
        description: 'Next-generation gaming console with lightning-fast loading, stunning graphics, and immersive 3D audio technology.',
        specifications: [
          'CPU: AMD Zen 2 8-core',
          'GPU: AMD RDNA 2',
          'Storage: 825GB SSD',
          'Memory: 16GB GDDR6',
          'Resolution: Up to 4K 120Hz',
          'Features: Ray tracing, 3D audio'
        ]
      },
      {
        id: 8,
        name: 'iPad Pro 12.9"',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        price: 'Rp 12,000,000',
        originalPrice: 'Rp 15,999,000',
        discount: '25%',
        coins: 120,
        rating: 4.8,
        reviewCount: 890,
        lastUpdated: '2025-08-30T08:15:00Z',
        description: 'The ultimate iPad experience with M2 chip, Liquid Retina XDR display, and all-day battery life for creative professionals.',
        specifications: [
          'Display: 12.9-inch Liquid Retina XDR',
          'Chip: Apple M2',
          'Storage: 128GB',
          'Camera: 12MP Wide, 10MP Ultra Wide',
          'Battery: All-day battery life', 
          'Apple Pencil: 2nd generation compatible'
        ]
      },
      {
        id: 9,
        name: 'Microsoft Surface Pro',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        price: 'Rp 13,500,000',
        originalPrice: 'Rp 16,999,000',
        discount: '20%',
        coins: 135,
        rating: 4.5,
        reviewCount: 456,
        lastUpdated: '2025-08-30T08:00:00Z',
        description: 'Versatile 2-in-1 laptop with Intel Core processor, perfect for productivity and creativity on the go.',
        specifications: [
          'Processor: Intel Core i5',
          'Memory: 8GB RAM',
          'Storage: 256GB SSD',
          'Display: 13-inch PixelSense',
          'Battery: Up to 15.5 hours',
          'Features: Detachable keyboard'
        ]
      },
      {
        id: 10,
        name: 'Canon EOS R6',
        category: 'Electronic',
        image: '/api/placeholder/80/80',
        price: 'Rp 25,000,000',
        originalPrice: 'Rp 28,999,000',
        discount: '13%',
        coins: 250,
        rating: 4.9,
        reviewCount: 234,
        lastUpdated: '2025-08-30T07:45:00Z',
        description: 'Professional mirrorless camera with exceptional low-light performance and advanced autofocus system.',
        specifications: [
          'Sensor: 20.1MP full-frame CMOS',
          'Processor: DIGIC X',
          'Autofocus: Dual Pixel CMOS AF II',
          'Video: 4K 60p recording',
          'Stabilization: In-body IS',
          'Viewfinder: 3.69M-dot OLED'
        ]
      }
    ].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)))

    // Active campaign data
    const activeCampaign = ref({
      id: 1,
      title: 'Summer Sale 2024',
      description: 'Get up to 50% off on selected electronics and fashion items',
      discount: 'Up to 50% OFF',
      validity: 'Valid until Aug 31',
      image: '/api/placeholder/400/200'
    })

    // Add touch scroll functionality for categories
    const initializeCategoryScrolling = () => {
      const container = document.querySelector('.categories-scroll-container')
      if (container) {
        let isDown = false
        let startX
        let scrollLeft

        container.addEventListener('mousedown', (e) => {
          isDown = true
          startX = e.pageX - container.offsetLeft
          scrollLeft = container.scrollLeft
        })

        container.addEventListener('mouseleave', () => {
          isDown = false
        })

        container.addEventListener('mouseup', () => {
          isDown = false
        })

        container.addEventListener('mousemove', (e) => {
          if (!isDown) return
          e.preventDefault()
          const x = e.pageX - container.offsetLeft
          const walk = (x - startX) * 2
          container.scrollLeft = scrollLeft - walk
        })
      }
    }

    const handleSearch = () => {
      console.log('Search query:', searchQuery.value)
    }

    const viewProductDetails = (product) => {
      // Store product details for next view
      sessionStorage.setItem('selectedProduct', JSON.stringify(product))
      router.push(`/product/${product.id}`)
    }

    const shareProduct = (product) => {
      console.log('Share product:', product.name)
      // Implement share functionality
    }

    // Initialize scrolling after component mounts
    onMounted(() => {
      initializeCategoryScrolling()
    })

    return {
      searchQuery,
      userPoints,
      categories,
      featuredProducts,
      activeCampaign,
      handleSearch,
      viewProductDetails,
      shareProduct
    }
  }
}
</script>

<style scoped>
/* Dashboard View - Add blue background and fix scrolling */
.dashboard-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 120px; /* Increased to prevent bottom navigation cutoff */
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Dashboard Section - Clean containers with proper text handling */
.dashboard-section {
  background: white;
  margin: 0 1rem 1.5rem 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.9);
  /* Ensure proper text wrapping */
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
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

.see-more-btn {
  background: none;
  border: none;
  color: #4FC3F7;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Baloo 2', sans-serif;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.see-more-btn:hover {
  background: rgba(79, 195, 247, 0.1);
  transform: translateY(-1px);
}

/* Categories - Enhanced scrollable with touch support */
.categories-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  cursor: grab;
}

.categories-scroll-container:active {
  cursor: grabbing;
}

.categories-scroll-container::-webkit-scrollbar {
  display: none;
}

.categories-grid {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  width: max-content;
  min-width: 100%;
  touch-action: pan-x;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
  flex-shrink: 0;
  position: relative;
  padding: 0.5rem;
  border-radius: 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-2px);
  background: rgba(79, 195, 247, 0.05);
}

.category-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}

.category-card:hover .category-icon {
  transform: scale(1.05);
}

.category-name {
  font-size: 0.8rem;
  color: #1F2937;
  text-align: center;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  line-height: 1.2;
  /* Fixed text overflow for category names */
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.category-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #EF4444;
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

/* Products Grid - 2 products per row */
.products-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.product-card {
  display: flex;
  flex-direction: column;
  background: #F8FAFC;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s;
  border: 1px solid #E2E8F0;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #CBD5E1;
}

.product-image {
  position: relative;
  width: 100%;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #E5E7EB;
  margin-bottom: 0.75rem;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: #4FC3F7;
  color: white;
  font-size: 0.625rem;
  padding: 0.25rem 0.375rem;
  border-radius: 6px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(79, 195, 247, 0.3);
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.3;
  margin-bottom: 0.25rem;
  /* Fixed text overflow for product names */
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.product-price {
  font-size: 0.8rem;
  color: #059669;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.earn-coins {
  font-size: 0.7rem;
  color: #F59E0B;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
}

.share-btn {
  background: #4FC3F7;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(79, 195, 247, 0.3);
}

.share-btn:hover {
  background: #29B6F6;
  transform: scale(1.1);
}

/* Campaign Card */
.campaign-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.campaign-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.campaign-image {
  position: relative;
  height: 160px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.campaign-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.campaign-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%);
  color: white;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.campaign-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  font-family: 'Baloo 2', sans-serif;
  /* Fixed text overflow for campaign titles */
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.campaign-description {
  font-size: 0.875rem;
  margin-bottom: 1rem;
  opacity: 0.95;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.4;
  /* Fixed text overflow for campaign descriptions */
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.campaign-details {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.campaign-discount {
  background: #EF4444;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Baloo 2', sans-serif;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

.campaign-validity {
  font-size: 0.75rem;
  opacity: 0.9;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Responsive Styling for Tablet and Desktop */
@media (min-width: 768px) {
  .dashboard-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .page-container,
  .app-main {
    background: transparent !important;
  }

  .categories-scroll-container {
    scroll-snap-type: x mandatory;
  }
  
  .category-card {
    scroll-snap-align: center;
  }
}

@media (min-width: 1024px) {
  body {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
  }
  
  .dashboard-view {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: auto !important;
  }
  
  .page-container {
    background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%) !important;
    min-height: 100vh !important;
    height: auto !important;
    padding: 0 !important;
    justify-content: flex-start !important;
    align-items: stretch !important;
  }
  
  .app-main {
    background: transparent !important;
    box-shadow: none !important;
    min-height: auto !important;
    max-height: none !important;
    height: auto !important;
    overflow: visible !important;
    max-width: none !important;
    width: 100% !important;
    border-radius: 0 !important;
  }

  .categories-scroll-container {
    scrollbar-width: thin;
    scrollbar-color: rgba(79, 195, 247, 0.3) transparent;
  }
  
  .categories-scroll-container::-webkit-scrollbar {
    display: block;
    height: 4px;
  }
  
  .categories-scroll-container::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  
  .categories-scroll-container::-webkit-scrollbar-thumb {
    background: rgba(79, 195, 247, 0.5);
    border-radius: 2px;
  }
  
  .categories-scroll-container::-webkit-scrollbar-thumb:hover {
    background: rgba(79, 195, 247, 0.7);
  }
}
</style>