<template>
  <div class="sticky-footer">
    <div class="nav-container">
      <button 
        v-for="item in navItems" 
        :key="item.id"
        class="nav-item"
        :class="{ active: activeTab === item.id }"
        @click="$emit('navigate', item.id)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StickyFooter',
  props: {
    activeTab: {
      type: String,
      default: 'home'
    }
  },
  emits: ['navigate'],
  data() {
    return {
      navItems: [
        { id: 'home', icon: '🏠', label: 'Home' },
        { id: 'category', icon: '📱', label: 'Kategori' },
        { id: 'chat', icon: '🎧', label: 'Chat CS' },
        { id: 'cart', icon: '🛒', label: 'Keranjang' },
        { id: 'account', icon: '👤', label: 'Akun' }
      ]
    }
  }
}
</script>

<style scoped>
/* Mobile First - Base styles */
.sticky-footer {
  background: white;
  border-top: 1px solid #E5E7EB;
  padding: 0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom));
  width: 100%;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 100%;
  margin: 0 auto;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.2s;
  min-width: 0;
  flex: 1;
}

.nav-item:hover {
  transform: translateY(-1px);
}

.nav-item.active .nav-icon {
  color: #4F46E5;
}

.nav-item.active .nav-label {
  color: #4F46E5;
  font-weight: 600;
}

.nav-icon {
  font-size: 1rem;
  margin-bottom: 0.125rem;
  color: #6B7280;
  transition: color 0.2s;
}

.nav-label {
  font-size: 0.625rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 400;
  transition: color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Tablet - 768px and up */
@media (min-width: 768px) {
  .sticky-footer {
    padding: 0.75rem 0 calc(0.75rem + env(safe-area-inset-bottom));
  }

  .nav-container {
    max-width: 420px;
  }

  .nav-item {
    padding: 0.375rem;
  }

  .nav-icon {
    font-size: 1.125rem;
    margin-bottom: 0.25rem;
  }

  .nav-label {
    font-size: 0.75rem;
  }
}

/* Desktop Small - 1024px and up */
@media (min-width: 1024px) {
  .sticky-footer {
    padding: 1rem 0 calc(1rem + env(safe-area-inset-bottom));
  }

  .nav-container {
    max-width: 440px;
  }

  .nav-item {
    padding: 0.5rem;
  }

  .nav-icon {
    font-size: 1.25rem;
    margin-bottom: 0.375rem;
  }

  .nav-label {
    font-size: 0.875rem;
  }
}

/* Desktop Large - 1200px and up */
@media (min-width: 1200px) {
  .nav-container {
    max-width: 460px;
  }

  .nav-icon {
    font-size: 1.375rem;
  }

  .nav-label {
    font-size: 1rem;
  }
}

/* Ultra Wide - 1440px and up */
@media (min-width: 1440px) {
  .nav-container {
    max-width: 480px;
  }
}
</style>