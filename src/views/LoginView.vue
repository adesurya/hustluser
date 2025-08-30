<template>
  <div class="login-page">
    <AppHeader />
    
    <div class="page-header">
      <h1 class="page-title">Log in to your account.</h1>
      <p class="page-subtitle">Enter your email address and password to log in.</p>
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

<style scoped>
/* Login page uses mobile-first design with proper typography */
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
}

/* On mobile, full screen layout */
@media (max-width: 767px) {
  .login-page {
    background: linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(180deg, rgba(35, 235, 250, 0.1) 0%, rgba(255, 0, 128, 0.1) 100%);
  }
}

/* Typography fixes */
.page-title {
  color: #1F2937 !important; /* Dark gray for visibility */
}

.page-subtitle {
  color: #6B7280 !important; /* Medium gray for good contrast */
}

.form-footer {
  color: #4B5563 !important; /* Dark gray for readability */
}

.form-footer p {
  color: #4B5563 !important;
}

.auth-link {
  color: #4F46E5 !important; /* Indigo for links */
}

.resend-link {
  color: #6B7280 !important;
}

.resend-link:hover {
  color: #4B5563 !important;
}
</style>