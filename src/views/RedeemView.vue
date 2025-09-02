<template>
  <div class="redeem-view dashboard-page">
    <HustlHeader :isDashboard="true" />

    <!-- Header with Back Button -->
    <div class="dashboard-section header-section">
      <div class="header-container">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span class="back-text">Back</span>
        </button>
      </div>
    </div>

    <!-- Current Balance Section -->
    <div class="dashboard-section balance-section">
      <div class="balance-card">
        <div class="balance-info">
          <div class="balance-icon">🪙</div>
          <div class="balance-details">
            <span class="balance-amount">{{ formatNumber(currentPoints) }}</span>
            <span class="balance-label">Available Points</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Redeem Form Section -->
    <div class="dashboard-section form-section">
      <div class="section-header">
        <h3 class="section-title">Redeem Points</h3>
      </div>

      <form @submit.prevent="handleRedeem" class="redeem-form">
        <!-- Points to Redeem -->
        <div class="form-group">
          <label class="form-label">Points to Redeem</label>
          <div class="input-wrapper">
            <span class="input-icon">🪙</span>
            <input 
              type="number" 
              v-model.number="redeemData.pointsToRedeem"
              class="form-input"
              placeholder="Enter points to redeem"
              :min="100"
              :max="currentPoints"
              step="100"
              required
            />
          </div>
          <div class="redeem-value">
            <span class="value-label">Redemption Value:</span>
            <span class="value-amount">{{ formatCurrency(redeemData.pointsToRedeem) }}</span>
          </div>
        </div>

        <!-- Redemption Type -->
        <div class="form-group">
          <label class="form-label">Redemption Type</label>
          <div class="radio-group">
            <label class="radio-option">
              <input 
                type="radio" 
                value="cash" 
                v-model="redeemData.redemptionType"
                class="radio-input"
              />
              <span class="radio-text">Cash Transfer</span>
            </label>
            <label class="radio-option">
              <input 
                type="radio" 
                value="voucher" 
                v-model="redeemData.redemptionType"
                class="radio-input"
              />
              <span class="radio-text">Gift Voucher</span>
            </label>
          </div>
        </div>

        <!-- Bank Details (for cash redemption) -->
        <div v-if="redeemData.redemptionType === 'cash'" class="bank-details">
          <div class="form-group">
            <label class="form-label">Bank Name</label>
            <div class="input-wrapper">
              <span class="input-icon">🏦</span>
              <input 
                type="text" 
                v-model="redeemData.redemptionDetails.bankName"
                class="form-input"
                placeholder="e.g., Bank BCA"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Account Name</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input 
                type="text" 
                v-model="redeemData.redemptionDetails.accountName"
                class="form-input"
                placeholder="Full name as per bank account"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Account Number</label>
            <div class="input-wrapper">
              <span class="input-icon">💳</span>
              <input 
                type="text" 
                v-model="redeemData.redemptionDetails.bankAccount"
                class="form-input"
                placeholder="Enter account number"
                required
              />
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="isSubmitting || !isFormValid"
          >
            <span v-if="isSubmitting" class="submit-icon">⏳</span>
            <span v-else class="submit-icon">🎁</span>
            <span class="submit-text">
              {{ isSubmitting ? 'Processing...' : 'Submit Redemption' }}
            </span>
          </button>
        </div>
      </form>

      <!-- Error/Success Messages -->
      <div v-if="error" class="error-section">
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ error }}</span>
        </div>
      </div>

      <div v-if="success" class="success-section">
        <div class="success-message">
          <span class="success-icon">✅</span>
          <span class="success-text">{{ success }}</span>
        </div>
      </div>
    </div>

    <!-- Terms Section -->
    <div class="dashboard-section terms-section">
      <div class="terms-content">
        <h4 class="terms-title">Redemption Terms</h4>
        <ul class="terms-list">
          <li>Minimum redemption: 100 points</li>
          <li>Processing time: 3-5 business days</li>
          <li>1 point = Rp 1.00</li>
          <li>Bank transfer fees may apply</li>
          <li>Redemptions are subject to verification</li>
        </ul>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import apiService from '../services/api'

export default {
  name: 'RedeemView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    // State
    const currentPoints = ref(authStore.userPoints || 0)
    const isSubmitting = ref(false)
    const error = ref('')
    const success = ref('')

    const redeemData = reactive({
      pointsToRedeem: 100,
      redemptionType: 'cash',
      redemptionDetails: {
        bankName: '',
        accountName: '',
        bankAccount: ''
      }
    })

    // Computed
    const isFormValid = computed(() => {
      if (redeemData.pointsToRedeem < 100 || redeemData.pointsToRedeem > currentPoints.value) {
        return false
      }

      if (redeemData.redemptionType === 'cash') {
        return redeemData.redemptionDetails.bankName &&
               redeemData.redemptionDetails.accountName &&
               redeemData.redemptionDetails.bankAccount
      }

      return true
    })

    // Methods
    const formatNumber = (num) => {
      if (!num) return '0'
      return num.toLocaleString('id-ID')
    }

    const formatCurrency = (points) => {
      if (!points) return 'Rp 0'
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(points)
    }

    const goBack = () => {
      router.go(-1)
    }

    const handleRedeem = async () => {
      error.value = ''
      success.value = ''
      isSubmitting.value = true

      try {
        const response = await apiService.createRedemption(redeemData)

        if (response.success) {
          success.value = 'Redemption request submitted successfully! Please wait for processing.'
          
          // Reset form
          redeemData.pointsToRedeem = 100
          redeemData.redemptionDetails = {
            bankName: '',
            accountName: '',
            bankAccount: ''
          }

          // Update current points
          currentPoints.value = currentPoints.value - redeemData.pointsToRedeem

          // Redirect after success
          setTimeout(() => {
            router.push('/profile')
          }, 2000)

        } else {
          error.value = response.message || 'Failed to submit redemption'
        }

      } catch (err) {
        console.error('Redemption error:', err)
        error.value = err.message || 'Failed to submit redemption. Please try again.'
      } finally {
        isSubmitting.value = false
      }
    }

    // Load current points on mount
    onMounted(async () => {
      try {
        const response = await apiService.getMyPoints()
        if (response.success) {
          currentPoints.value = response.data.currentBalance || 0
        }
      } catch (err) {
        console.warn('Failed to load current points:', err)
      }
    })

    return {
      currentPoints,
      redeemData,
      isSubmitting,
      error,
      success,
      isFormValid,
      formatNumber,
      formatCurrency,
      goBack,
      handleRedeem
    }
  }
}
</script>

<style scoped>
.redeem-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 100%);
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.dashboard-section {
  background: white;
  margin: 0 1rem 1.5rem 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.9);
}

.dashboard-section:first-child {
  margin-top: 1rem;
}

/* Header Section */
.header-section {
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.header-container {
  display: flex;
  align-items: center;
}

.back-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  color: #4FC3F7;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(79, 195, 247, 0.1);
  transform: translateX(-2px);
}

/* Balance Section */
.balance-section {
  padding: 1.25rem;
}

.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  text-align: center;
}

.balance-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.balance-icon {
  font-size: 2rem;
}

.balance-amount {
  font-size: 2rem;
  font-weight: 800;
  font-family: 'Baloo 2', sans-serif;
  display: block;
}

.balance-label {
  font-size: 0.875rem;
  opacity: 0.8;
  font-family: 'Baloo 2', sans-serif;
}

/* Form Section */
.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.redeem-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 0.75rem;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  border-color: #4FC3F7;
  background: white;
  box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.1);
}

.input-icon {
  margin-right: 0.75rem;
  font-size: 1rem;
}

.form-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.875rem;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
}

.redeem-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #F0FDF4;
  border-radius: 8px;
  border: 1px solid #BBF7D0;
}

.value-label {
  font-size: 0.8rem;
  color: #166534;
  font-family: 'Baloo 2', sans-serif;
}

.value-amount {
  font-size: 0.875rem;
  font-weight: 700;
  color: #16A34A;
  font-family: 'Baloo 2', sans-serif;
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.75rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  transition: all 0.2s;
  flex: 1;
  min-width: 120px;
}

.radio-option:hover {
  border-color: #4FC3F7;
  background: rgba(79, 195, 247, 0.05);
}

.radio-input:checked + .radio-option {
  border-color: #4FC3F7;
  background: rgba(79, 195, 247, 0.1);
}

.radio-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
}

/* Bank Details */
.bank-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #F8FAFC;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
}

/* Form Actions */
.form-actions {
  margin-top: 1rem;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Messages */
.error-section, .success-section {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
}

.error-section {
  background: #FEF2F2;
  border: 1px solid #FECACA;
}

.success-section {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
}

.error-message, .success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-text {
  color: #DC2626;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.success-text {
  color: #16A34A;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Terms Section */
.terms-section {
  background: #F8FAFC;
}

.terms-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  margin-bottom: 1rem;
}

.terms-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.terms-list li {
  font-size: 0.8rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 1rem;
}

.terms-list li::before {
  content: '•';
  color: #4FC3F7;
  font-weight: bold;
  position: absolute;
  left: 0;
}
</style>