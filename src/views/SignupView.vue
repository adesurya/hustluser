<template>
  <div class="signup-page">
    <AppHeader />
    
    <div class="page-header">
      <h1 class="page-title">Sign Up</h1>
      <p class="page-subtitle">Just a few quick things to get started.</p>
    </div>

    <div class="form-container">
      <ErrorMessage v-if="errorMessage" :message="errorMessage" />

      <SignupForm 
        @submit="handleSignup"
        v-model:username="signupData.username"
        v-model:email="signupData.email"
        v-model:phoneNumber="signupData.phoneNumber"
        v-model:password="signupData.password"
        v-model:confirmPassword="signupData.confirmPassword"
      />
    </div>

    <div class="form-footer">
      <p>Already have an account? 
        <router-link to="/login" class="auth-link">Sign In</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppHeader from '../components/AppHeader.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
import SignupForm from '../components/SignupForm.vue'

export default {
  name: 'SignupView',
  components: {
    AppHeader,
    ErrorMessage,
    SignupForm
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const errorMessage = ref('')
    const signupData = reactive({
      username: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    })

    const validateForm = () => {
      if (!signupData.username || !signupData.email || !signupData.phoneNumber || 
          !signupData.password || !signupData.confirmPassword) {
        return 'Please fill in all fields'
      }

      if (signupData.password !== signupData.confirmPassword) {
        return 'Passwords do not match'
      }

      if (signupData.password.length < 6) {
        return 'Password must be at least 6 characters'
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(signupData.email)) {
        return 'Please enter a valid email address'
      }

      // Username validation
      if (signupData.username.length < 3) {
        return 'Username must be at least 3 characters'
      }

      if (!/^[a-zA-Z0-9_]+$/.test(signupData.username)) {
        return 'Username can only contain letters, numbers, and underscores'
      }

      // Phone number validation
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(signupData.phoneNumber.replace(/\s/g, ''))) {
        return 'Please enter a valid phone number'
      }

      return null
    }

    const handleSignup = async () => {
      errorMessage.value = ''
      
      const validationError = validateForm()
      if (validationError) {
        errorMessage.value = validationError
        return
      }

      const result = await authStore.register(signupData)
      
      if (result.success) {
        // Store success data for SignupSuccessView
        sessionStorage.setItem('signupSuccess', JSON.stringify({
          message: result.data.message,
          email: signupData.email,
          requiresEmailVerification: result.data.requiresEmailVerification
        }))
        router.push('/signup-success')
      } else {
        errorMessage.value = result.error
      }
    }

    onMounted(() => {
      authStore.clearError()
    })

    return {
      signupData,
      errorMessage,
      handleSignup
    }
  }
}
</script>

<style scoped>
/* Signup page - clean responsive design */
.signup-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
  position: relative;
}

/* Mobile: Full screen with subtle gradient background */
@media (max-width: 767px) {
  .signup-page {
    background: linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(180deg, rgba(35, 235, 250, 0.08) 0%, rgba(255, 0, 128, 0.08) 100%);
    display: flex;
    flex-direction: column;
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .page-header {
    padding-top: max(1.5rem, env(safe-area-inset-top) + 1rem);
    flex-shrink: 0;
  }
  
  .form-container {
    flex: 1 1 auto;
    overflow-y: auto;
    min-height: 0;
  }
  
  .form-footer {
    padding-bottom: max(1.5rem, env(safe-area-inset-bottom) + 1rem);
    flex-shrink: 0;
  }
}

/* Tablet and Desktop: Transparent background */
@media (min-width: 768px) {
  .signup-page {
    background: transparent;
    justify-content: flex-start;
    height: 100%;
  }
  
  .form-container {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    min-height: 0;
  }
  
  .form-footer {
    flex-shrink: 0;
  }
}

/* Enhanced styling for better visual hierarchy */
.page-header {
  position: relative;
}

/* Consistent text colors across all screen sizes */
.page-title {
  color: #1F2937 !important;
  font-weight: 800 !important;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: #6B7280 !important;
  font-weight: 500 !important;
}

.form-container {
  position: relative;
  z-index: 1;
}

.form-footer {
  color: #4B5563 !important;
  font-weight: 500 !important;
  margin-top: auto;
}

.form-footer p {
  color: inherit !important;
  margin: 0;
  line-height: 1.6;
}

.auth-link {
  color: #4F46E5 !important;
  font-weight: 700 !important;
  text-decoration: none;
  border-bottom: 1px solid rgba(79, 70, 229, 0.3);
  transition: all 0.2s ease;
  padding-bottom: 1px;
}

.auth-link:hover {
  color: #6366F1 !important;
  text-decoration: none;
  border-bottom-color: #6366F1;
  transform: translateY(-0.5px);
}

.auth-link:active {
  transform: translateY(0);
}

.auth-link:focus {
  outline: 2px solid #4F46E5;
  outline-offset: 3px;
  border-radius: 3px;
  background: rgba(79, 70, 229, 0.05);
}

/* Smooth animations */
.signup-page {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced visual feedback */
.signup-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  z-index: -1;
}

/* Typography scaling for different screen sizes */
@media (min-width: 768px) and (max-width: 1023px) {
  .page-title {
    font-size: 1.5rem !important;
  }
  
  .page-subtitle {
    font-size: 0.875rem !important;
  }
}

@media (min-width: 1024px) and (max-width: 1199px) {
  .page-title {
    font-size: 1.625rem !important;
  }
  
  .page-subtitle {
    font-size: 0.9375rem !important;
  }
}

@media (min-width: 1200px) {
  .page-title {
    font-size: 1.75rem !important;
  }
  
  .page-subtitle {
    font-size: 1rem !important;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .auth-link,
  .signup-page {
    transition: none;
    animation: none;
  }
}

@media (prefers-contrast: high) {
  .auth-link {
    border-bottom-width: 2px;
  }
}
</style>