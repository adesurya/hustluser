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

    <!-- Mascot Character -->
    <div class="mascot-container">
      <div class="mascot-character">
        <!-- Cat ears -->
        <div class="cat-ears">
          <div class="ear left"></div>
          <div class="ear right"></div>
        </div>
        
        <!-- Cat head -->
        <div class="cat-head">
          <!-- Eyes -->
          <div class="eyes">
            <div class="eye left">
              <div class="pupil"></div>
            </div>
            <div class="eye right">
              <div class="pupil"></div>
            </div>
          </div>
          
          <!-- Nose -->
          <div class="nose"></div>
          
          <!-- Cheeks -->
          <div class="cheek left"></div>
          <div class="cheek right"></div>
        </div>
        
        <!-- Cat body -->
        <div class="cat-body"></div>
        
        <!-- Floating Hearts -->
        <div class="floating-hearts">
          <div class="heart heart-1">❤️</div>
          <div class="heart heart-2">❤️</div>
          <div class="heart heart-3">❤️</div>
        </div>
      </div>
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
/* Mobile First - Base styles */
.signup-success-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f5e8 0%, #fce4ec 100%);
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
  color: #1F2937;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 2rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 400;
}

/* Email Verification */
.email-verification {
  background: rgba(255, 255, 255, 0.8);
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

/* Mascot Character */
.mascot-container {
  position: relative;
  margin-bottom: 2rem;
  z-index: 2;
}

.mascot-character {
  position: relative;
  animation: float 3s ease-in-out infinite;
}

/* Cat Ears */
.cat-ears {
  position: relative;
  width: 120px;
  height: 40px;
  margin: 0 auto 10px;
}

.ear {
  position: absolute;
  width: 35px;
  height: 35px;
  background: #00D4FF;
  border-radius: 50% 50% 0 50%;
  transform: rotate(45deg);
}

.ear.left {
  left: 15px;
  transform: rotate(45deg);
}

.ear.right {
  right: 15px;
  transform: rotate(-45deg);
}

.ear::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: #FF69B4;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
}

/* Cat Head */
.cat-head {
  width: 100px;
  height: 100px;
  background: #00D4FF;
  border-radius: 50%;
  position: relative;
  margin: 0 auto;
  z-index: 1;
}

/* Eyes */
.eyes {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
}

.eye {
  width: 12px;
  height: 15px;
  background: white;
  border-radius: 50%;
  position: relative;
}

.pupil {
  width: 8px;
  height: 8px;
  background: #333;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 2px;
}

/* Nose */
.nose {
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 6px;
  background: #FF69B4;
  border-radius: 50%;
}

/* Cheeks */
.cheek {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #FF69B4;
  border-radius: 50%;
  opacity: 0.6;
  top: 55px;
}

.cheek.left {
  left: 15px;
}

.cheek.right {
  right: 15px;
}

/* Cat Body */
.cat-body {
  width: 90px;
  height: 60px;
  background: #FF1493;
  border-radius: 50px 50px 20px 20px;
  position: relative;
  margin: 10px auto 0;
  z-index: 0;
}

/* Floating Hearts */
.floating-hearts {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.heart {
  position: absolute;
  font-size: 1.2rem;
  animation: floatHeart 4s infinite;
}

.heart-1 {
  top: 20px;
  left: -20px;
  animation-delay: 0s;
}

.heart-2 {
  top: 60px;
  right: -25px;
  animation-delay: 1.5s;
}

.heart-3 {
  top: 100px;
  left: -15px;
  animation-delay: 3s;
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

@keyframes floatHeart {
  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.8; }
  25% { transform: translateY(-10px) scale(1.1); opacity: 1; }
  50% { transform: translateY(-5px) scale(0.9); opacity: 0.6; }
  75% { transform: translateY(-12px) scale(1.05); opacity: 0.9; }
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

  .cat-ears {
    width: 140px;
    height: 50px;
  }

  .ear {
    width: 40px;
    height: 40px;
  }

  .cat-head {
    width: 120px;
    height: 120px;
  }

  .eyes {
    top: 35px;
    gap: 25px;
  }

  .eye {
    width: 14px;
    height: 18px;
  }

  .pupil {
    width: 10px;
    height: 10px;
  }

  .nose {
    top: 60px;
    width: 10px;
    height: 8px;
  }

  .cheek {
    width: 25px;
    height: 25px;
    top: 65px;
  }

  .cheek.left {
    left: 20px;
  }

  .cheek.right {
    right: 20px;
  }

  .cat-body {
    width: 110px;
    height: 70px;
  }

  .heart {
    font-size: 1.4rem;
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

  .cat-ears {
    width: 160px;
    height: 60px;
  }

  .ear {
    width: 45px;
    height: 45px;
  }

  .cat-head {
    width: 140px;
    height: 140px;
  }

  .eyes {
    top: 40px;
    gap: 30px;
  }

  .eye {
    width: 16px;
    height: 20px;
  }

  .pupil {
    width: 12px;
    height: 12px;
  }

  .nose {
    top: 70px;
    width: 12px;
    height: 10px;
  }

  .cheek {
    width: 30px;
    height: 30px;
    top: 75px;
  }

  .cheek.left {
    left: 25px;
  }

  .cheek.right {
    right: 25px;
  }

  .cat-body {
    width: 130px;
    height: 80px;
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
}
</style>