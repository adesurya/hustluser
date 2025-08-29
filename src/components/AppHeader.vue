<template>
  <div class="header">
    <div class="logo-container">
      <div class="logo">
        <!-- Replace this with your custom logo -->
        <img v-if="logoPath" :src="logoPath" alt="Hazel Logo" class="logo-image" />
        <span v-else class="logo-emoji">🐱</span>
      </div>
      <div class="logo-text">
        <img src="img/text.png" alt="Hazel Text" width="120" height="auto">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    logoPath: {
      type: String,
      default: '/img/logo.png' // Add your logo path here: '/images/logo.png'
    }
  }
}
</script>

<style scoped>
.header {
  padding: 2rem 1.5rem 1.5rem;
  text-align: center;
  background: white;
}

.logo-container {
  display: flex;
  align-items: flex-end;   /* sejajarkan ke bawah */
  justify-content: center; /* posisikan ke tengah horizontal */
  gap: 0.75rem;
  margin-bottom: 0.75rem;  /* jarak ke tagline */
}

.logo {
  width: 48px;
  height: 48px;
  background: linear-gradient(45deg, #00D4FF, #FF00E6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.logo-emoji {
  font-size: 1.5rem;
  font-weight: 600;
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 800; /* ExtraBold for brand logo */
  color: #FF00E6;
  letter-spacing: -0.025em;
  font-family: 'Baloo 2', sans-serif;
}

.logo-text img {
  max-height: 36px;  /* sesuaikan tinggi agar balance dengan logo */
  display: block;
  margin-bottom: 2px; /* fine-tuning sejajar */
}

.tagline {
  color: #6B7280;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Baloo 2', sans-serif;
}

/* Desktop Responsive */
@media (min-width: 768px) {
  .header {
    padding: 2.5rem 2rem 2rem;
  }

  .logo {
    width: 56px;
    height: 56px;
    border-radius: 14px;
  }

  .logo-emoji {
    font-size: 1.75rem;
    font-weight: 700;
  }

  .logo-text {
    font-size: 2rem;
    font-weight: 800; /* ExtraBold maintained */
  }

  .tagline {
    font-size: 1.125rem;
  }

  .logo-container {
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .logo-text img {
    max-height: 42px;
    margin-bottom: 3px;
  }

}

/* Large Desktop */
@media (min-width: 1024px) {
  .logo-text img {
    max-height: 90%;   /* biar lebih proporsional */
    margin-bottom: 4px;
  }

  .header {
    padding: 3rem 2.5rem 2.5rem;
  }

  .logo {
    width: 64px;
    height: 64px;
    border-radius: 16px;
  }

  .logo-emoji {
    font-size: 2rem;
    font-weight: 700;
  }

  .logo-text {
    font-size: 2.25rem;
    font-weight: 800; /* ExtraBold for impact */
  }

  .tagline {
    font-size: 1.25rem;
  }
}

/* Mobile Responsive */
@media (max-width: 767px) {
  .header {
    padding: 1.5rem 1rem 1rem;
  }

  .logo {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  .logo-emoji {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: 700; /* Bold for mobile */
  }

  .tagline {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    font-weight: 500;
  }

  .logo-container {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .logo {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .logo-emoji {
    font-size: 1.125rem;
    font-weight: 600;
  }

  .logo-text {
    font-size: 1.375rem;
    font-weight: 700;
  }

  .tagline {
    font-size: 0.9rem;
  }

  .logo-text img {
    max-height: 28px;
    margin-bottom: 1px;
  }
}
</style>