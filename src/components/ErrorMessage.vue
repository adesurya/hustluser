<template>
  <div class="error-message">
    {{ message }}
  </div>
</template>

<script>
export default {
  name: 'ErrorMessage',
  props: {
    message: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
/* Mobile First - Base styles */
.error-message {
  background: #FEF2F2;
  color: #DC2626;
  padding: 0.625rem;
  border-radius: 8px;
  margin-bottom: 0.875rem;
  font-size: 0.8rem;
  border: 1px solid #FECACA;
  line-height: 1.5;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 400;
}

/* Tablet - 768px and up */
@media (min-width: 768px) {
  .error-message {
    padding: 0.75rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    border-radius: 10px;
  }
}

/* Desktop Small - 1024px and up */
@media (min-width: 1024px) {
  .error-message {
    padding: 0.875rem;
    margin-bottom: 1.25rem;
    font-size: 1rem;
    border-radius: 12px;
  }
}

/* Desktop Large - 1200px and up */
@media (min-width: 1200px) {
  .error-message {
    padding: 1rem;
    margin-bottom: 1.5rem;
    font-size: 1rem;
  }
}
</style>