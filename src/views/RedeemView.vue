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

        <!-- Bank Account Selection (for cash redemption) - NEW FEATURE -->
        <div v-if="redeemData.redemptionType === 'cash'" class="bank-account-selection">
          <!-- Bank Account Options -->
          <div class="form-group">
            <label class="form-label">Select Bank Account</label>
            
            <!-- Show saved bank accounts if any -->
            <div v-if="bankAccounts.length > 0" class="bank-accounts-list">
              <div 
                v-for="account in bankAccounts" 
                :key="account.id"
                class="bank-account-option"
                :class="{ 'selected': selectedBankAccountId === account.id }"
                @click="selectBankAccount(account.id)"
              >
                <input 
                  type="radio" 
                  :value="account.id"
                  v-model="selectedBankAccountId"
                  class="account-radio"
                />
                <div class="account-info">
                  <div class="account-bank-name">{{ formatBankName(account.bankName) }}</div>
                  <div class="account-holder-name">{{ account.accountName }}</div>
                  <div class="account-number">{{ account.maskedAccountNumber || formatAccountNumber(account.accountNumber) }}</div>
                  <div class="account-badges">
                    <span v-if="account.isPrimary" class="badge primary-badge">Primary</span>
                    <span v-if="account.isVerified" class="badge verified-badge">Verified</span>
                  </div>
                </div>
              </div>
              
              <!-- Option to add new account -->
              <div 
                class="bank-account-option new-account-option"
                :class="{ 'selected': selectedBankAccountId === 'new' }"
                @click="selectBankAccount('new')"
              >
                <input 
                  type="radio" 
                  value="new"
                  v-model="selectedBankAccountId"
                  class="account-radio"
                />
                <div class="account-info">
                  <div class="new-account-text">
                    <span class="new-account-icon">+</span>
                    <span class="new-account-label">Use different bank account</span>
                  </div>
                  <div class="new-account-desc">Enter new bank account details</div>
                </div>
              </div>
            </div>

            <!-- If no saved accounts, show message and force manual input -->
            <div v-else class="no-accounts-message">
              <div class="message-icon">🏦</div>
              <div class="message-content">
                <h4 class="message-title">No saved bank accounts</h4>
                <p class="message-text">Add your bank account details below or <a href="/profile/bank-accounts" class="add-account-link">manage your accounts</a> first.</p>
              </div>
            </div>
          </div>

          <!-- Manual Bank Details Input (when "new" is selected or no saved accounts) -->
          <div v-if="selectedBankAccountId === 'new' || bankAccounts.length === 0" class="manual-bank-details">
            <div class="manual-input-header">
              <h4 class="manual-title">Bank Account Details</h4>
              <div class="save-account-toggle">
                <label class="toggle-container">
                  <input 
                    type="checkbox" 
                    v-model="saveNewAccount"
                    class="toggle-input"
                  />
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">Save for future use</span>
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Bank Name</label>
              <div class="input-wrapper">
                <span class="input-icon">🏦</span>
                <select 
                  v-model="redeemData.redemptionDetails.bankName"
                  class="form-input"
                  required
                >
                  <option value="">Select Bank</option>
                  <option value="Bank Central Asia">Bank Central Asia (BCA)</option>
                  <option value="Bank Rakyat Indonesia">Bank Rakyat Indonesia (BRI)</option>
                  <option value="Bank Negara Indonesia">Bank Negara Indonesia (BNI)</option>
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="CIMB Niaga">CIMB Niaga</option>
                  <option value="Bank Danamon">Bank Danamon</option>
                  <option value="Bank Permata">Bank Permata</option>
                  <option value="OCBC NISP">OCBC NISP</option>
                  <option value="Other">Other Bank</option>
                </select>
              </div>
              <!-- Custom bank name input if "Other" is selected -->
              <div v-if="redeemData.redemptionDetails.bankName === 'Other'" class="custom-bank-input">
                <div class="input-wrapper">
                  <span class="input-icon">🏛️</span>
                  <input 
                    type="text" 
                    v-model="redeemData.redemptionDetails.customBankName"
                    class="form-input"
                    placeholder="Enter bank name"
                    required
                  />
                </div>
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
                  pattern="[0-9]{8,20}"
                  maxlength="20"
                  @input="formatBankAccountInput"
                />
              </div>
              <div class="field-hint">Account number should be 8-20 digits</div>
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
            <span v-else class="submit-icon">📜</span>
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
          <li>Saved bank accounts can be managed in your profile</li>
        </ul>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script>
// RedeemView.vue <script> section - FIXED VERSION
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import apiService from '../services/api'
import { useCachedApi } from '../composables/useCachedApi'

export default {
  name: 'RedeemView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    // Use cached API composable for points and bank accounts data
    const { getMyPoints, getBankAccounts, addBankAccount } = useCachedApi()

    // State
    const currentPoints = ref(authStore.userPoints || 0)
    const isSubmitting = ref(false)
    const error = ref('')
    const success = ref('')
    const isLoadingPoints = ref(false)
    const isLoadingBankAccounts = ref(false)
    
    // Bank accounts state
    const bankAccounts = ref([])
    const selectedBankAccountId = ref(null)
    const saveNewAccount = ref(true)

    const redeemData = reactive({
      pointsToRedeem: 100,
      redemptionType: 'cash',
      redemptionDetails: {
        bankName: '',
        customBankName: '',
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
        // If using saved account
        if (selectedBankAccountId.value && selectedBankAccountId.value !== 'new') {
          return true
        }
        
        // If using new account details
        if (selectedBankAccountId.value === 'new' || bankAccounts.value.length === 0) {
          const bankName = redeemData.redemptionDetails.bankName === 'Other' 
            ? redeemData.redemptionDetails.customBankName 
            : redeemData.redemptionDetails.bankName
            
          return bankName &&
                 redeemData.redemptionDetails.accountName &&
                 redeemData.redemptionDetails.bankAccount &&
                 redeemData.redemptionDetails.bankAccount.length >= 8
        }
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

    const formatBankName = (bankName) => {
      return apiService.constructor.formatBankName(bankName)
    }

    const formatAccountNumber = (accountNumber) => {
      return apiService.constructor.formatBankAccountNumber(accountNumber)
    }

    const formatBankAccountInput = (event) => {
      // Remove non-numeric characters
      redeemData.redemptionDetails.bankAccount = event.target.value.replace(/\D/g, '')
    }

    const goBack = () => {
      router.go(-1)
    }

    // Load current points with caching
    const loadCurrentPoints = async () => {
      isLoadingPoints.value = true
      
      try {
        const response = await getMyPoints({ 
          ttl: 30 * 1000, // 30 seconds TTL for real-time points
          forceRefresh: false 
        })
        
        if (response.success) {
          currentPoints.value = response.data.currentBalance || 0
          authStore.setUserPoints(currentPoints.value)
        } else {
          console.warn('Failed to load points from cached API:', response.message)
          currentPoints.value = authStore.userPoints || 0
        }
      } catch (err) {
        console.warn('Failed to load current points:', err)
        currentPoints.value = authStore.userPoints || 0
      } finally {
        isLoadingPoints.value = false // FIXED: was setting wrong loading state
      }
    }

    // FIXED: Added the missing loadBankAccounts function
    const loadBankAccounts = async () => {
      isLoadingBankAccounts.value = true
      
      try {
        const response = await getBankAccounts({ 
          ttl: 10 * 60 * 1000, // 10 minutes TTL for bank accounts
          forceRefresh: false 
        })
        
        if (response.success && response.data) {
          // Handle different response structures from API
          const accounts = Array.isArray(response.data) ? response.data : response.data.items || []
          bankAccounts.value = accounts
          
          // Auto-select primary account if exists and no account is already selected
          if (accounts.length > 0 && !selectedBankAccountId.value) {
            const primaryAccount = accounts.find(account => account.isPrimary)
            if (primaryAccount) {
              selectedBankAccountId.value = primaryAccount.id
            }
          }
          
          console.log('Bank accounts loaded:', accounts.length, 'accounts')
        } else {
          console.warn('Failed to load bank accounts from cached API:', response.message)
          bankAccounts.value = []
        }
      } catch (err) {
        console.warn('Failed to load bank accounts:', err)
        bankAccounts.value = []
      } finally {
        isLoadingBankAccounts.value = false
      }
    }

    const selectBankAccount = (accountId) => {
      selectedBankAccountId.value = accountId
      
      if (accountId === 'new') {
        // Clear manual input fields when selecting new account option
        redeemData.redemptionDetails = {
          bankName: '',
          customBankName: '',
          accountName: '',
          bankAccount: ''
        }
      }
    }

    const handleRedeem = async () => {
      error.value = ''
      success.value = ''
      isSubmitting.value = true

      try {
        // Prepare redemption data
        const redemptionPayload = {
          pointsToRedeem: redeemData.pointsToRedeem,
          redemptionType: redeemData.redemptionType,
          redemptionValue: redeemData.pointsToRedeem, // 1:1 ratio
          redemptionDetails: {}
        }

        // Handle bank account details
        if (redeemData.redemptionType === 'cash') {
          if (selectedBankAccountId.value && selectedBankAccountId.value !== 'new') {
            // Use selected saved account
            const selectedAccount = bankAccounts.value.find(acc => acc.id === selectedBankAccountId.value)
            if (selectedAccount) {
              redemptionPayload.bankAccountId = selectedAccount.id
              redemptionPayload.redemptionDetails = {
                bankName: selectedAccount.bankName,
                accountName: selectedAccount.accountName,
                bankAccount: selectedAccount.accountNumber
              }
            }
          } else {
            // Use manual input details
            const bankName = redeemData.redemptionDetails.bankName === 'Other' 
              ? redeemData.redemptionDetails.customBankName 
              : redeemData.redemptionDetails.bankName

            redemptionPayload.redemptionDetails = {
              bankName: bankName,
              accountName: redeemData.redemptionDetails.accountName,
              bankAccount: redeemData.redemptionDetails.bankAccount
            }

            // Save new account if requested
            if (saveNewAccount.value && bankName && redeemData.redemptionDetails.accountName && redeemData.redemptionDetails.bankAccount) {
              try {
                const newAccountData = {
                  bankName: bankName,
                  accountName: redeemData.redemptionDetails.accountName,
                  accountNumber: redeemData.redemptionDetails.bankAccount,
                  isPrimary: bankAccounts.value.length === 0, // Set as primary if it's the first account
                  notes: 'Added during redemption process'
                }
                
                const addAccountResponse = await addBankAccount(newAccountData)
                if (addAccountResponse.success) {
                  console.log('New bank account saved successfully')
                  // Refresh bank accounts list
                  await loadBankAccounts()
                } else {
                  console.warn('Failed to save new bank account:', addAccountResponse.message)
                }
              } catch (saveError) {
                console.warn('Failed to save new bank account:', saveError)
                // Don't fail the redemption if saving account fails
              }
            }
          }
        }

        const response = await apiService.createRedemption(redemptionPayload)

        if (response.success) {
          success.value = 'Redemption request submitted successfully! Please wait for processing.'
          
          // Update current points locally first for immediate feedback
          const newPointsBalance = currentPoints.value - redeemData.pointsToRedeem
          currentPoints.value = newPointsBalance
          authStore.setUserPoints(newPointsBalance)
          
          // Force refresh points cache to get updated data from server
          try {
            await getMyPoints({ forceRefresh: true })
          } catch (cacheError) {
            console.warn('Failed to refresh points cache:', cacheError)
          }
          
          // Reset form
          redeemData.pointsToRedeem = 100
          selectedBankAccountId.value = null
          redeemData.redemptionDetails = {
            bankName: '',
            customBankName: '',
            accountName: '',
            bankAccount: ''
          }

          // Auto-select primary account again if exists
          const primaryAccount = bankAccounts.value.find(account => account.isPrimary)
          if (primaryAccount) {
            selectedBankAccountId.value = primaryAccount.id
          }

          // Redirect after success
          setTimeout(() => {
            router.push('/profile')
          }, 3000)

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

    // Initialize on mount
    onMounted(async () => {
      console.log('RedeemView mounted, loading data...')
      await Promise.all([
        loadCurrentPoints(),
        loadBankAccounts()
      ])
      console.log('Data loading completed')
    })

    return {
      currentPoints,
      redeemData,
      bankAccounts,
      selectedBankAccountId,
      saveNewAccount,
      isSubmitting,
      isLoadingPoints,
      isLoadingBankAccounts,
      error,
      success,
      isFormValid,
      formatNumber,
      formatCurrency,
      formatBankName,
      formatAccountNumber,
      formatBankAccountInput,
      goBack,
      loadCurrentPoints,
      loadBankAccounts, // NOW PROPERLY DEFINED AND RETURNED
      selectBankAccount,
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

/* Bank Account Selection - NEW STYLES */
.bank-account-selection {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #E2E8F0;
  margin-top: 1rem;
}

.bank-accounts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.bank-account-option {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.bank-account-option:hover {
  border-color: #4FC3F7;
  background: rgba(79, 195, 247, 0.02);
}

.bank-account-option.selected {
  border-color: #4FC3F7;
  background: rgba(79, 195, 247, 0.05);
  box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.1);
}

.account-radio {
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.account-info {
  flex: 1;
  min-width: 0;
}

.account-bank-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin-bottom: 0.25rem;
}

.account-holder-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  margin-bottom: 0.25rem;
}

.account-number {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.account-badges {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-family: 'Baloo 2', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.primary-badge {
  background: #FEF3C7;
  color: #92400E;
}

.verified-badge {
  background: #D1FAE5;
  color: #065F46;
}

.new-account-option {
  border-style: dashed;
  border-color: #9CA3AF;
}

.new-account-option:hover {
  border-color: #4FC3F7;
  border-style: solid;
}

.new-account-option.selected {
  border-style: solid;
}

.new-account-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.new-account-icon {
  font-size: 1rem;
  font-weight: bold;
  color: #4FC3F7;
}

.new-account-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
}

.new-account-desc {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-style: italic;
}

.no-accounts-message {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: #FEF3C7;
  border-radius: 12px;
  border: 1px solid #FDE68A;
  margin-bottom: 1rem;
}

.message-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
}

.message-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #92400E;
  font-family: 'Baloo 2', sans-serif;
  margin: 0 0 0.25rem 0;
}

.message-text {
  font-size: 0.8rem;
  color: #A16207;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.4;
  margin: 0;
}

.add-account-link {
  color: #4FC3F7;
  text-decoration: underline;
  font-weight: 600;
}

.add-account-link:hover {
  color: #29B6F6;
}

.manual-bank-details {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  border: 2px solid #E2E8F0;
  margin-top: 1rem;
}

.manual-input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.manual-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
}

.save-account-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  width: 44px;
  height: 24px;
  background: #E5E7EB;
  border-radius: 24px;
  position: relative;
  transition: all 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-input:checked + .toggle-slider {
  background: #4FC3F7;
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.toggle-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
}

.custom-bank-input {
  margin-top: 0.75rem;
}

.field-hint {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  margin-top: 0.375rem;
  font-style: italic;
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

/* Responsive Design */
@media (max-width: 640px) {
  .bank-account-option {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .account-radio {
    align-self: flex-start;
  }
  
  .manual-input-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .no-accounts-message {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .balance-info {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .radio-group {
    flex-direction: column;
  }
  
  .radio-option {
    min-width: auto;
  }
}

/* Additional responsive styles for existing elements */
@media (min-width: 768px) {
  .dashboard-section {
    margin: 0 2rem 1.5rem 2rem;
    padding: 1.5rem;
  }
  
  .bank-accounts-list {
    gap: 1rem;
  }
  
  .bank-account-option {
    padding: 1.25rem;
  }
  
  .manual-bank-details {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .dashboard-section {
    margin: 0 3rem 2rem 3rem;
    padding: 2rem;
  }
  
  .redeem-form {
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>