<template>
  <div class="dashboard">
    <DashboardHeader 
      :username="authStore.userName"
      @logout="handleLogout"
    />

    <div class="stats-grid">
      <StatCard 
        :value="authStore.userPoints"
        label="Points"
        icon="⭐"
      />
      <StatCard 
        :value="authStore.userRole"
        label="Role"
        icon="👤"
      />
    </div>

    <UserInfoCard :user="authStore.user" />

    <QuickActions />
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import DashboardHeader from '../components/DashboardHeader.vue'
import StatCard from '../components/StatCard.vue'
import UserInfoCard from '../components/UserInfoCard.vue'
import QuickActions from '../components/QuickActions.vue'

export default {
  name: 'DashboardView',
  components: {
    DashboardHeader,
    StatCard,
    UserInfoCard,
    QuickActions
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const handleLogout = () => {
      authStore.logout()
      router.push('/login')
    }

    return {
      authStore,
      handleLogout
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 2rem 1.5rem;
  min-height: 100vh;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1.5rem 1rem;
  }
}
</style>