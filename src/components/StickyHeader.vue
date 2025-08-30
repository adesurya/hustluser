<template>
  <div class="sticky-header">
    <div class="header-top">
      <div class="location-info">
        <span class="location-icon">📍</span>
        <div class="location-text">
          <span class="delivery-text">Dikirim ke {{ location }}</span>
          <span class="time-text">{{ timeRange }}</span>
        </div>
      </div>
      <button class="favorite-btn">
        <span class="heart-icon">🖤</span>
      </button>
    </div>
    
    <div class="search-section">
      <div class="search-container">
        <span class="search-emoji">🔍</span>
        <input 
          type="text" 
          class="search-input"
          :placeholder="searchPlaceholder"
          v-model="searchQuery"
          @input="$emit('search', searchQuery)"
        />
        <button class="search-btn">
          <span class="search-icon">🔍</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'StickyHeader',
  props: {
    location: {
      type: String,
      default: 'Cirendeu'
    },
    timeRange: {
      type: String,
      default: '07:00 - 08:00'
    },
    searchPlaceholder: {
      type: String,
      default: 'Cari beragam kebutuhan harian'
    }
  },
  emits: ['search'],
  setup() {
    const searchQuery = ref('')
    
    return {
      searchQuery
    }
  }
}
</script>

<style scoped>
/* Mobile First - Base styles */
.sticky-header {
  background: linear-gradient(135deg, #C8E6C9, #E8F5E8);
  padding: 0.75rem;
  width: 100%;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.location-icon {
  font-size: 0.875rem;
}

.location-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.delivery-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.time-text {
  font-size: 0.6875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
}

.favorite-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}

.heart-icon {
  font-size: 1rem;
}

.search-section {
  width: 100%;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 20px;
  padding: 0.5rem 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-emoji {
  font-size: 0.875rem;
  margin-right: 0.5rem;
  color: #9CA3AF;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.75rem;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.search-input::placeholder {
  color: #9CA3AF;
}

.search-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 0.5rem;
}

.search-icon {
  font-size: 0.875rem;
  color: #6B7280;
}

/* Tablet - 768px and up */
@media (min-width: 768px) {
  .sticky-header {
    padding: 1rem;
  }

  .header-top {
    margin-bottom: 1rem;
  }

  .location-icon {
    font-size: 1rem;
  }

  .delivery-text {
    font-size: 0.875rem;
  }

  .time-text {
    font-size: 0.75rem;
  }

  .heart-icon {
    font-size: 1.125rem;
  }

  .search-container {
    padding: 0.625rem 1rem;
  }

  .search-emoji {
    font-size: 1rem;
  }

  .search-input {
    font-size: 0.875rem;
  }

  .search-icon {
    font-size: 1rem;
  }
}

/* Desktop Small - 1024px and up */
@media (min-width: 1024px) {
  .sticky-header {
    padding: 1.25rem;
  }

  .delivery-text {
    font-size: 1rem;
  }

  .time-text {
    font-size: 0.875rem;
  }

  .search-container {
    padding: 0.75rem 1.25rem;
  }

  .search-input {
    font-size: 1rem;
  }
}

/* Desktop Large - 1200px and up */
@media (min-width: 1200px) {
  .sticky-header {
    padding: 1.5rem;
  }

  .search-container {
    padding: 0.875rem 1.5rem;
  }
}
</style>