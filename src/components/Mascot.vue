<template>
  <div class="login-success">
    <!-- Icon check -->
    <!-- <div class="check-icon">
      <img src="/img/check-green.png" alt="Success" />
    </div> -->

    <!-- Text -->
    <h2 class="success-text">Login successful</h2>

    <!-- Mascot -->
    <div class="mascot-wrapper">
      <img src="/img/login-success.png" alt="Mascot" class="mascot" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginSuccess'
}
</script>

<style scoped>
.login-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* supaya tidak ketengah */
  min-height: 100vh;
  background: linear-gradient(180deg, #e0f7fa, #fce4ec);
  text-align: center;
  padding: 1rem;
  position: relative;
  overflow: hidden; /* biar gambar bawah tidak keluar */
}

/* Check Icon */
.check-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #00c853;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 60px;
  position: relative;
  animation: pop 0.8s ease-out;
  box-shadow: 0 0 15px rgba(0, 200, 83, 0.5);
}

.check-icon img {
  width: 40px;
  height: 40px;
}

/* Text */
.success-text {
  margin: 1rem 0 2rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #00c853;
}

/* Mascot container (fix position at bottom) */
.mascot-wrapper {
  position: absolute;
  bottom: -40px; /* hanya tampil sedikit */
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  max-width: 100%;
  overflow: hidden;
}

.mascot {
  width: 100%;
  animation: bounce 2s infinite;
}

/* Animations */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

@keyframes pop {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
