<template>
  <div class="signup-success-page">
    <!-- Success Content -->
    <div class="success-content">
      <!-- Success Icon -->
      <div class="success-icon-wrapper">
        <div class="success-icon">
          <span class="checkmark">✓</span>
        </div>
      </div>

      <!-- Success Title -->
      <h2 class="success-title">Registration successful!</h2>
      
      <!-- Success Message -->
      <p class="success-message">
        Please check your email to verify your account before logging in.
      </p>

      <!-- Email Info -->
      <div v-if="successData.email" class="email-verification">
        <p class="email-label">Verification email sent to:</p>
        <div class="email-display">{{ successData.email }}</div>
      </div>
    </div>

    <!-- Logo Image instead of mascot -->
    <div class="logo-container">
      <img src="/img/login-success.png" alt="Signup Success" class="success-logo" />
    </div>

    <!-- Redirect Info -->
    <div class="redirect-info">
      <p>Redirecting to login in {{ countdown }} seconds...</p>
      <router-link to="/login" class="manual-redirect-link">Go to Login Now</router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'SignupSuccessView',
  setup() {
    const router = useRouter()
    const countdown = ref(5)
    const successData = ref({
      message: 'Please check your email to verify your account before logging in.',
      email: '',
      requiresEmailVerification: true
    })
    
    let countdownInterval = null

    onMounted(() => {
      // Get success data from sessionStorage
      const storedData = sessionStorage.getItem('signupSuccess')
      if (storedData) {
        try {
          successData.value = JSON.parse(storedData)
          sessionStorage.removeItem('signupSuccess') // Clean up
        } catch (err) {
          console.error('Error parsing signup success data:', err)
        }
      }

      // Start countdown
      countdownInterval = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          router.push('/login')
        }
      }, 1000)
    })

    onUnmounted(() => {
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    })

    return {
      successData,
      countdown
    }
  }
}
</script>

<style scoped>
/* Mobile First - Base styles with consistent gradient background */
.signup-success-page {
  min-height: 100vh;
  background: linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(180deg, rgba(35, 235, 250, 0.1) 0%, rgba(255, 0, 128, 0.1) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 3rem 1.5rem 2rem;
  position: relative;
  overflow: hidden;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  justify-content: center;
  max-width: 320px;
}

/* Success Icon */
.success-icon-wrapper {
  margin-bottom: 2rem;
  animation: bounceIn 0.8s ease-out;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #10B981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
  position: relative;
}

.success-icon::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.checkmark {
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  z-index: 1;
}

/* Success Title */
.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #10B981;
  margin-bottom: 1rem;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.3;
}

/* Success Message */
.success-message {
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 2rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 400;
}

/* Email Verification */
.email-verification {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.email-label {
  font-size: 0.75rem;
  color: #6B7280;
  margin-bottom: 0.5rem;
  font-family: 'Baloo 2', sans-serif;
}

.email-display {
  font-size: 0.875rem;
  color: #1F2937;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
  word-break: break-all;
}

/* Logo Container */
.logo-container {
  position: relative;
  margin-bottom: 2rem;
  z-index: 2;
  animation: float 3s ease-in-out infinite;
}

.success-logo {
  width: 180px;
  height: auto;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

/* Redirect Info */
.redirect-info {
  text-align: center;
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  z-index: 2;
}

.manual-redirect-link {
  display: block;
  margin-top: 0.5rem;
  color: #4F46E5;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
}

.manual-redirect-link:hover {
  text-decoration: underline;
}

/* Animations */
@keyframes bounceIn {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.1; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

/* Tablet - 768px and up */
@media (min-width: 768px) {
  .signup-success-page {
    padding: 4rem 2rem 2rem;
  }

  .success-content {
    max-width: 360px;
  }

  .success-icon {
    width: 100px;
    height: 100px;
  }

  .success-icon::before {
    width: 120px;
    height: 120px;
  }

  .checkmark {
    font-size: 3rem;
  }

  .success-title {
    font-size: 1.75rem;
    margin-bottom: 1.25rem;
  }

  .success-message {
    font-size: 1rem;
    margin-bottom: 2.5rem;
  }

  .email-verification {
    padding: 1.25rem;
  }

  .email-label {
    font-size: 0.875rem;
  }

  .email-display {
    font-size: 1rem;
  }

  .success-logo {
    width: 220px;
  }

  .redirect-info {
    font-size: 0.875rem;
  }

  .manual-redirect-link {
    font-size: 1rem;
  }
}

/* Desktop Small - 1024px and up */
@media (min-width: 1024px) {
  .signup-success-page {
    padding: 4rem 2.5rem 2rem;
  }

  .success-content {
    max-width: 400px;
  }

  .success-icon {
    width: 120px;
    height: 120px;
  }

  .success-icon::before {
    width: 140px;
    height: 140px;
  }

  .checkmark {
    font-size: 3.5rem;
  }

  .success-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  .success-message {
    font-size: 1.125rem;
    margin-bottom: 3rem;
  }

  .success-logo {
    width: 260px;
  }
}

/* Desktop Large - 1200px and up */
@media (min-width: 1200px) {
  .signup-success-page {
    min-height: calc(100vh - 4rem);
  }

  .success-title {
    font-size: 2.25rem;
  }

  .success-message {
    font-size: 1.25rem;
  }

  .success-logo {
    width: 300px;
  }
}
</style>