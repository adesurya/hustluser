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
/* Mobile First - Base styles */
.signup-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
}

/* Tablet - 768px and up */
@media (min-width: 768px) {
  .signup-page {
    min-height: calc(100vh - 2rem);
  }
}

/* Desktop Small - 1024px and up */
@media (min-width: 1024px) {
  .signup-page {
    min-height: calc(100vh - 3rem);
  }
}

/* Desktop Large - 1200px and up */
@media (min-width: 1200px) {
  .signup-page {
    min-height: calc(100vh - 4rem);
  }
}
</style>