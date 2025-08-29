<!-- ErrorMessage.vue -->
<template>
  <div class="error-message">
    {{ message }}
  </div>
</template>

<script>
export default {
  name: 'ErrorMessage',
  props: {
    message: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.error-message {
  background: #FEF2F2;
  color: #DC2626;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  border: 1px solid #FECACA;
}
</style>

<!-- LoadingOverlay.vue -->
<!-- Create as separate file: src/components/LoadingOverlay.vue -->
<template>
  <div class="loading-overlay">
    <div class="loading-spinner"></div>
  </div>
</template>

<script>
export default {
  name: 'LoadingOverlay'
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E5E7EB;
  border-top: 4px solid #4F46E5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

<!-- GoogleButton.vue -->
<!-- Create as separate file: src/components/GoogleButton.vue -->
<template>
  <button class="google-btn" @click="handleGoogleLogin">
    <span class="google-icon">🌐</span>
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
.google-btn {
  width: 100%;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.google-btn:hover {
  border-color: #D1D5DB;
  background: #F9FAFB;
}

.google-icon {
  font-size: 1.125rem;
}
</style>