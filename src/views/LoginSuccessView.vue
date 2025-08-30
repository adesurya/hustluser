<template>
  <div class="login-success-page">
    <!-- Success Content -->
    <div class="success-content">
      <!-- Success Icon -->
      <div class="success-icon-wrapper">
        <img src="/img/login-success.png" alt="Login Success" class="success-icon" />
      </div>

      <!-- Success Text -->
      <h2 class="success-title">Login successful</h2>

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
          
          <!-- Hearts around mascot -->
          <div class="floating-hearts">
            <div class="heart heart-1">❤️</div>
            <div class="heart heart-2">❤️</div>
            <div class="heart heart-3">❤️</div>
          </div>
        </div>
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
/* Mobile First - Base styles */
.login-success-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #E1BEE7 100%);
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
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
}

/* Success Title */
.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 2rem;
  font-family: 'Baloo 2', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Mascot Character */
.mascot-container {
  position: relative;
  margin-top: 1rem;
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

/* Animations */
@keyframes bounceIn {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
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
  .login-success-page {
    padding: 3rem 2rem;
  }

  .success-icon {
    width: 150px;
    height: 150px;
  }

  .success-title {
    font-size: 1.75rem;
    margin-bottom: 2.5rem;
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
}

/* Desktop Small - 1024px and up */
@media (min-width: 1024px) {
  .success-icon {
    width: 180px;
    height: 180px;
  }

  .success-title {
    font-size: 2rem;
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
  .success-title {
    font-size: 2.25rem;
  }

  .success-icon {
    width: 200px;
    height: 200px;
  }
}
</style>