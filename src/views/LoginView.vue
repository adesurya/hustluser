<template>
  <div class="login-page">
    <AppHeader />
    
    <div class="page-header">
      <h1 class="page-title">Log in to your account.</h1>
      <p class="page-subtitle">Enter your details below to log in.</p>
    </div>

    <div class="form-container">
      <ErrorMessage v-if="errorMessage" :message="errorMessage" />

      <GoogleButton />

      <LoginForm 
        @submit="handleLogin"
        v-model:identifier="loginData.identifier"
        v-model:password="loginData.password"
        v-model:remember="loginData.remember"
      />
    </div>

    <div class="form-footer">
      <p>Don't have an account? 
        <router-link to="/signup" class="auth-link">Sign Up</router-link>
      </p>
      <p>Didn't receive the activation link?</p>
      <a href="#" class="resend-link">Resend Verification Link</a>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppHeader from '../components/AppHeader.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
import GoogleButton from '../components/GoogleButton.vue'
import LoginForm from '../components/LoginForm.vue'

export default {
  name: 'LoginView',
  components: {
    AppHeader,
    ErrorMessage,
    GoogleButton,
    LoginForm
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const errorMessage = ref('')
    const loginData = reactive({
      identifier: '',
      password: '',
      remember: false
    })

    const handleLogin = async () => {
      errorMessage.value = ''
      
      if (!loginData.identifier || !loginData.password) {
        errorMessage.value = 'Please fill in all fields'
        return
      }

      const result = await authStore.login({
        identifier: loginData.identifier,
        password: loginData.password
      })
      
      if (result.success) {
        router.push('/login-success')
      } else {
        errorMessage.value = result.error
      }
    }

    onMounted(() => {
      authStore.clearError()
    })

    return {
      loginData,
      errorMessage,
      handleLogin
    }
  }
}
</script>