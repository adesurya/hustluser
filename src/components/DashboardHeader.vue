<template>
  <div class="dashboard-header">
    <div class="user-info">
      <h2>Welcome back!</h2>
      <p>{{ username }}</p>
    </div>
    <button @click="$emit('logout')" class="logout-btn">
      Logout
    </button>
  </div>
</template>

<script>
export default {
  name: 'DashboardHeader',
  props: {
    username: {
      type: String,
      default: 'User'
    }
  },
  emits: ['logout']
}
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E5E7EB;
}

.user-info h2 {
  color: #1F2937;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.user-info p {
  color: #6B7280;
  font-size: 0.875rem;
}

.logout-btn {
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #DC2626;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .logout-btn {
    align-self: flex-end;
  }
}
</style>