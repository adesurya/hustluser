<template>
  <button class="google-btn" @click="handleGoogleLogin">
    <img src="/img/google-logo.png" alt="Google Logo" class="google-icon">
    Continue with Google
  </button>
</template>

<script>
export default {
  name: 'GoogleButton',
  methods: {
    handleGoogleLogin() {
      // Implement Google OAuth login here
      console.log('Google login clicked')
    }
  }
}
</script>

<style scoped>
/* Mobile First - Base styles */
.google-btn {
  width: 100%;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 0.875rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  margin-bottom: 1.25rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 50px;
  font-family: 'Baloo 2', sans-serif;
}

.google-btn:hover {
  border-color: #D1D5DB;
  background: #F9FAFB;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.google-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Tablet - 768px and up */
@media (min-width: 768px) {
  .google-btn {
    padding: 1rem 1.25rem;
    font-size: 1rem;
    margin-bottom: 1.5rem;
    border-radius: 14px;
    min-height: 56px;
    gap: 0.75rem;
  }

  .google-icon {
    width: 18px;
    height: 18px;
  }
}

/* Desktop Small - 1024px and up */
@media (min-width: 1024px) {
  .google-btn {
    padding: 1.125rem 1.5rem;
    font-size: 1.125rem;
    margin-bottom: 2rem;
    min-height: 60px;
    gap: 1rem;
  }

  .google-icon {
    width: 20px;
    height: 20px;
  }
}

/* Desktop Large - 1200px and up */
@media (min-width: 1200px) {
  .google-btn {
    padding: 1.25rem 1.75rem;
    font-size: 1.125rem;
    min-height: 64px;
  }

  .google-icon {
    width: 20px;
    height: 20px;
  }
}
</style>