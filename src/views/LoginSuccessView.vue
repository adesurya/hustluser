<template>
  <div class="login-success-page">
    <!-- Success Content -->
    <div class="success-content">
      <!-- Success Icon -->
      <div class="success-icon-wrapper">
        <div class="success-icon">
          <span class="checkmark">✓</span>
        </div>
      </div>

      <!-- Success Text -->
      <h2 class="success-title">Login successful</h2>

      <!-- Logo Image instead of mascot -->
      <div class="logo-container">
        <img src="/img/login-success.png" alt="Login Success" class="success-logo" />
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginSuccessView',
  setup() {
    const router = useRouter()

    onMounted(() => {
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    })

    return {}
  }
}
</script>

<style scoped>
/* Mobile First - Base styles with consistent gradient background */
.login-success-page {
  min-height: 100vh;
  background: linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(180deg, rgba(35, 235, 250, 0.1) 0%, rgba(255, 0, 128, 0.1) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 2;
}

/* Success Icon */
.success-icon-wrapper {
  margin-bottom: 1.5rem;
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
  margin-bottom: 2rem;
  font-family: 'Baloo 2', sans-serif;
}

/* Logo Container */
.logo-container {
  position: relative;
  margin-top: 1rem;
  animation: float 3s ease-in-out infinite;
}

.success-logo {
  width: 200px;
  height: auto;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
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
  .login-success-page {
    padding: 3rem 2rem;
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
    margin-bottom: 2.5rem;
  }

  .success-logo {
    width: 250px;
  }
}

/* Desktop Small - 1024px and up */
@media (min-width: 1024px) {
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
    margin-bottom: 3rem;
  }

  .success-logo {
    width: 300px;
  }
}

/* Desktop Large - 1200px and up */
@media (min-width: 1200px) {
  .success-title {
    font-size: 2.25rem;
  }

  .success-logo {
    width: 350px;
  }
}
</style>