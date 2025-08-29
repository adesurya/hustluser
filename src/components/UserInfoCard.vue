<template>
  <div class="user-info-card">
    <h3 class="card-title">User Information</h3>
    <div v-if="user" class="user-details">
      <div class="detail-row">
        <span class="detail-label">Email:</span>
        <span class="detail-value">{{ user.email }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Phone:</span>
        <span class="detail-value">{{ user.phoneNumber || 'Not provided' }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Verified:</span>
        <span class="detail-value">
          <span :class="user.isVerified ? 'status-verified' : 'status-unverified'">
            {{ user.isVerified ? 'Yes' : 'No' }}
          </span>
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Active:</span>
        <span class="detail-value">
          <span :class="user.isActive ? 'status-verified' : 'status-unverified'">
            {{ user.isActive ? 'Yes' : 'No' }}
          </span>
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Last Login:</span>
        <span class="detail-value">{{ formatDate(user.lastLogin) }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Member since:</span>
        <span class="detail-value">{{ formatDate(user.created_at) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserInfoCard',
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.user-info-card {
  background: #F9FAFB;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.card-title {
  margin-bottom: 1rem;
  color: #1F2937;
  font-size: 1.125rem;
  font-weight: 600;
}

.user-details {
  color: #6B7280;
  line-height: 1.6;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #E5E7EB;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #374151;
}

.detail-value {
  font-weight: 400;
}

.status-verified {
  color: #10B981;
  font-weight: 500;
}

.status-unverified {
  color: #EF4444;
  font-weight: 500;
}
</style>