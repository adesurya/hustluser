<template>
  <div class="hustl-header" :class="{ 'transparent': transparent, 'dashboard-style': isDashboard }">
    <div class="header-content">
      <div class="logo-section">
        <img src="/img/logo.png" alt="Hustl Logo" class="hustl-logo" />
        <img src="/img/text.png" alt="Hustl Logo" class="hustl-logo" />
      </div>
      
      <!-- Optional right content slot -->
      <div v-if="$slots.right" class="header-right">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HustlHeader',
  props: {
    transparent: {
      type: Boolean,
      default: false
    },
    isDashboard: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
/* Mobile First - Base styles */
.hustl-header {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(229, 231, 235, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.hustl-header.transparent {
  background: transparent;
  border-bottom: none;
  backdrop-filter: none;
}

.hustl-header.dashboard-style {
  background: rgba(79, 195, 247, 0.1);
  border-bottom: 1px solid rgba(79, 195, 247, 0.2);
  backdrop-filter: blur(15px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.hustl-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.hustl-logo:hover {
  transform: scale(1.05);
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  letter-spacing: -0.01em;
}

.dashboard-style .logo-text {
  color: #0F172A;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Tablet - 768px and up */
@media (min-width: 768px) {
  .hustl-header {
    padding: 1rem 1.5rem;
  }

  .hustl-logo {
    width: 60px;
    height: 60px;
    border-radius: 8px;
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: 800;
  }

  .logo-section {
    gap: 0.75rem;
  }
}

/* Desktop Small - 1024px and up */
@media (min-width: 1024px) {
  .hustl-header {
    padding: 1.25rem 2rem;
  }

  .hustl-logo {
    width: 60px;
    height: 60px;
    border-radius: 10px;
  }

  .logo-text {
    font-size: 1.375rem;
    font-weight: 800;
  }

  .logo-section {
    gap: 1rem;
  }
}

/* Desktop Large - 1200px and up */
@media (min-width: 1200px) {
  .hustl-header {
    padding: 1.5rem 2.5rem;
  }

  .hustl-logo {
    width: 60x;
    height: 60px;
    border-radius: 12px;
  }

  .logo-text {
    font-size: 1.5rem;
  }
}

/* Very Small Mobile - 360px and below */
@media (max-width: 360px) {
  .hustl-header {
    padding: 0.625rem 0.75rem;
  }

  .hustl-logo {
    width: 24px;
    height: 24px;
    border-radius: 5px;
  }

  .logo-text {
    font-size: 1rem;
    font-weight: 700;
  }

  .logo-section {
    gap: 0.375rem;
  }
}
</style>