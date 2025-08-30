<template>
  <div class="header">
    <div class="logo-container">
      <div class="logo">
        <!-- Replace this with your custom logo -->
        <img v-if="logoPath" :src="logoPath" alt="Hazel Logo" class="logo-image" />
        <span v-else class="logo-emoji">🐱</span>
      </div>
      <div class="logo-text">
        <img src="img/text.png" alt="Hazel Text" class="logo-text-img">
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
/* Mobile First - Base styles */
.header {
  padding: 1.5rem 1rem 1rem;
  text-align: center;
  background: transparent; /* Changed from white to transparent */
  flex-shrink: 0;
}

.logo-container {
  display: flex;
  align-items: flex-end;   /* align to bottom */
  justify-content: center; /* center horizontally */
  gap: 0.5rem;
  margin-bottom: 0.5rem;   /* space to tagline */
}

.logo {
  width: 32px;
  height: 32px;
  background: linear-gradient(45deg, #00D4FF, #FF00E6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);
  flex-shrink: 0;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.logo-emoji {
  font-size: 1rem;
  font-weight: 600;
}

.logo-text {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1F2937; /* Changed from #FF00E6 to dark gray for better visibility */
  letter-spacing: -0.025em;
  font-family: 'Baloo 2', sans-serif;
  display: flex;
  align-items: flex-end;
}

.logo-text-img {
  height: 24px;  /* adjust height to balance with logo */
  width: auto;
  display: block;
  margin-bottom: 2px; /* fine-tuning alignment */
}

/* Tablet - 768px and up */
@media (min-width: 768px) {
  .header {
    padding: 2rem 1.5rem 1.5rem;
  }

  .logo-container {
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .logo {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .logo-image {
    border-radius: 10px;
  }

  .logo-emoji {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: 800; /* ExtraBold maintained */
  }

  .logo-text-img {
    height: 30px;
    margin-bottom: 2px;
  }
}

/* Desktop Small - 1024px and up */
@media (min-width: 1024px) {
  .header {
    padding: 2.5rem 2rem 2rem;
  }

  .logo-container {
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .logo {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }

  .logo-image {
    border-radius: 12px;
  }

  .logo-emoji {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .logo-text {
    font-size: 1.75rem;
    font-weight: 800; /* ExtraBold for impact */
  }

  .logo-text-img {
    height: 36px;
    margin-bottom: 3px;
  }
}

/* Desktop Large - 1200px and up */
@media (min-width: 1200px) {
  .header {
    padding: 3rem 2.5rem 2.5rem;
  }

  .logo {
    width: 56px;
    height: 56px;
    border-radius: 14px;
  }

  .logo-image {
    border-radius: 14px;
  }

  .logo-emoji {
    font-size: 1.75rem;
    font-weight: 700;
  }

  .logo-text {
    font-size: 2rem;
    font-weight: 800; /* ExtraBold for impact */
  }

  .logo-text-img {
    height: 42px;
    margin-bottom: 4px;
  }
}

/* Ultra Wide - 1440px and up */
@media (min-width: 1440px) {
  .logo-text-img {
    height: 45px; /* more proportional */
    margin-bottom: 4px;
  }

  .logo-text {
    font-size: 2.25rem;
    font-weight: 800;
  }

  .logo {
    width: 64px;
    height: 64px;
    border-radius: 16px;
  }

  .logo-image {
    border-radius: 16px;
  }

  .logo-emoji {
    font-size: 2rem;
    font-weight: 700;
  }
}

/* Small Mobile - 480px and below */
@media (max-width: 480px) {
  .header {
    padding: 1.25rem 0.875rem 0.875rem;
  }

  .logo {
    width: 28px;
    height: 28px;
    border-radius: 7px;
  }

  .logo-image {
    border-radius: 7px;
  }

  .logo-emoji {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .logo-text-img {
    height: 20px;
    margin-bottom: 1px;
  }

  .logo-container {
    gap: 0.375rem;
    margin-bottom: 0.375rem;
  }
}

/* Very Small Mobile - 360px and below */
@media (max-width: 360px) {
  .header {
    padding: 1rem 0.75rem 0.75rem;
  }

  .logo {
    width: 26px;
    height: 26px;
    border-radius: 6px;
  }

  .logo-image {
    border-radius: 6px;
  }

  .logo-emoji {
    font-size: 0.75rem;
  }

  .logo-text {
    font-size: 1.125rem;
  }

  .logo-text-img {
    height: 18px;
    margin-bottom: 1px;
  }
}
</style>