<template>
  <div class="success-icon">
    <span class="success-checkmark">✓</span>
  </div>
</template>

<script>
export default {
  name: 'SuccessIcon'
}
</script>

<style scoped>
/* Mobile First - Base styles */
.success-icon {
  width: 60px;
  height: 60px;
  background: #10B981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  animation: scaleIn 0.5s ease-out;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.success-checkmark {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

@keyframes scaleIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

/* Tablet - 768px and up */
@media (min-width: 768px) {
  .success-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 2rem;
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.25);
  }

  .success-checkmark {
    font-size: 2rem;
  }
}

/* Desktop Small - 1024px and up */
@media (min-width: 1024px) {
  .success-icon {
    width: 100px;
    height: 100px;
    margin-bottom: 2.5rem;
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.25);
  }

  .success-checkmark {
    font-size: 2.5rem;
  }
}

/* Desktop Large - 1200px and up */
@media (min-width: 1200px) {
  .success-icon {
    width: 120px;
    height: 120px;
    margin-bottom: 3rem;
  }

  .success-checkmark {
    font-size: 3rem;
  }
}
</style>