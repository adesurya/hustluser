<!-- SuccessIcon.vue -->
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
.success-icon {
  width: 80px;
  height: 80px;
  background: #10B981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  animation: scaleIn 0.5s ease-out;
}

.success-checkmark {
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

@keyframes scaleIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
</style>

<!-- Mascot.vue -->
<!-- Create as separate file: src/components/Mascot.vue -->
<template>
  <div class="mascot">
    <span class="mascot-face">😸</span>
    <span class="hearts">❤️</span>
  </div>
</template>

<script>
export default {
  name: 'Mascot'
}
</script>

<style scoped>
.mascot {
  width: 120px;
  height: 120px;
  background: linear-gradient(45deg, #00D4FF, #FF00E6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  position: relative;
  animation: bounce 2s infinite;
}

.mascot-face {
  color: white;
  font-size: 3rem;
}

.hearts {
  position: absolute;
  top: -10px;
  right: -10px;
  color: #FF1744;
  font-size: 1.5rem;
  animation: pulse 1.5s infinite;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
  40%, 43% { transform: translateY(-20px); }
  70% { transform: translateY(-10px); }
  90% { transform: translateY(-4px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>

<!-- StatCard.vue -->
<!-- Create as separate file: src/components/StatCard.vue -->
<template>
  <div class="stat-card">
    <div class="stat-icon">{{ icon }}</div>
    <div class="stat-value">{{ value }}</div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    value: {
      type: [String, Number],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: '📊'
    }
  }
}
</script>

<style scoped>
.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}
</style>