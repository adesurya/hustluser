<template>
  <div class="quick-actions">
    <h3 class="actions-title">Quick Actions</h3>
    <div class="actions-grid">
      <button class="action-btn" @click="handleProfileEdit">
        <span class="action-icon">👤</span>
        <span class="action-text">Edit Profile</span>
      </button>
      <button class="action-btn" @click="handleSettings">
        <span class="action-icon">⚙️</span>
        <span class="action-text">Settings</span>
      </button>
      <button class="action-btn" @click="handleSupport">
        <span class="action-icon">💬</span>
        <span class="action-text">Support</span>
      </button>
      <button class="action-btn" @click="handleHistory">
        <span class="action-icon">📊</span>
        <span class="action-text">History</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickActions',
  methods: {
    handleProfileEdit() {
      console.log('Edit profile clicked')
    },
    handleSettings() {
      console.log('Settings clicked')
    },
    handleSupport() {
      console.log('Support clicked')
    },
    handleHistory() {
      console.log('History clicked')
    }
  }
}
</script>

<style scoped>
.quick-actions {
  margin-top: 1rem;
}

.actions-title {
  margin-bottom: 1rem;
  color: #1F2937;
  font-size: 1.125rem;
  font-weight: 600;
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.action-btn {
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover {
  border-color: #4F46E5;
  background: #F8FAFC;
  transform: translateY(-1px);
}

.action-icon {
  font-size: 1.5rem;
}

.action-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

@media (max-width: 768px) {
  .actions-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  
  .action-btn {
    padding: 0.75rem;
  }
}
</style>