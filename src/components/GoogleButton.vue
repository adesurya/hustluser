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
      // Redirect ke endpoint Google OAuth API
      window.location.href = 'https://apihustl.sijago.ai/api/v1/auth/google'
    }
  }
}
</script>

<style scoped>
.google-btn {
  width: 100%;
  background: #FFFFFF;
  border: 2px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #000000 !important;
  cursor: pointer;
  margin-bottom: 2rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 60px;
  font-family: 'Baloo 2', sans-serif;
}

.google-btn:hover {
  border-color: #D1D5DB;
  background: #F9FAFB;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Responsive styles */
@media (min-width: 768px) {
  .google-btn {
    padding: 1.25rem 1.5rem;
    font-size: 1rem;
    margin-bottom: 2rem;
    border-radius: 16px;
    min-height: 60px;
    gap: 0.75rem;
  }

  .google-icon {
    width: 20px;
    height: 20px;
  }
}

@media (min-width: 1024px) {
  .google-btn {
    padding: 1.25rem 1.5rem;
    font-size: 1rem;
    margin-bottom: 2rem;
    min-height: 60px;
    gap: 0.75rem;
  }

  .google-icon {
    width: 20px;
    height: 20px;
  }
}
</style>