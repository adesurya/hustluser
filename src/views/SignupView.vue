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