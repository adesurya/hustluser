<template>
  <div class="bank-account-view dashboard-page">
    <HustlHeader :isDashboard="true" />

    <!-- Header with Back Button -->
    <div class="dashboard-section header-section">
      <div class="header-container">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span class="back-text">Back</span>
        </button>
        <h3 class="page-title">Bank Accounts</h3>
        <button class="add-btn" @click="showAddModal = true" :disabled="isLoading">
          <span class="add-icon">+</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="dashboard-section loading-section">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading bank accounts...</p>
    </div>

    <!-- Bank Accounts List -->
    <div v-else-if="bankAccounts.length > 0" class="dashboard-section accounts-section">
      <div class="section-header">
        <h3 class="section-title">Your Bank Accounts</h3>
        <span class="account-count">{{ bankAccounts.length }} account{{ bankAccounts.length > 1 ? 's' : '' }}</span>
      </div>
      
      <div class="accounts-list">
        <div 
          v-for="account in bankAccounts" 
          :key="account.id" 
          class="account-item"
          :class="{ 'primary-account': account.isPrimary }"
        >
          <div class="account-icon">
            <span>🏦</span>
          </div>
          <div class="account-info">
            <h4 class="account-bank-name">{{ formatBankName(account.bankName) }}</h4>
            <p class="account-name">{{ account.accountName }}</p>
            <p class="account-number">{{ account.maskedAccountNumber || formatAccountNumber(account.accountNumber) }}</p>
            <div v-if="account.notes" class="account-notes">
              <span class="notes-text">{{ account.notes }}</span>
            </div>
            <div class="account-meta">
              <span class="account-date">Added {{ formatDate(account.created_at) }}</span>
              <div class="account-badges">
                <span v-if="account.isPrimary" class="badge primary-badge">Primary</span>
                <span v-if="account.isVerified" class="badge verified-badge">Verified</span>
                <span v-else class="badge unverified-badge">Unverified</span>
              </div>
            </div>
          </div>
          <div class="account-actions">
            <button 
              class="action-btn edit-btn" 
              @click="editAccount(account)"
              :disabled="isSubmitting"
            >
              ✏️
            </button>
            <button 
              v-if="!account.isPrimary" 
              class="action-btn primary-btn" 
              @click="setPrimary(account.id)"
              :disabled="isSubmitting"
              title="Set as Primary"
            >
              ⭐
            </button>
            <button 
              class="action-btn delete-btn" 
              @click="deleteAccount(account.id)"
              :disabled="isSubmitting || account.isPrimary"
              :title="account.isPrimary ? 'Cannot delete primary account' : 'Delete account'"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="dashboard-section empty-section">
      <div class="empty-state">
        <div class="empty-icon">🏦</div>
        <h4 class="empty-title">No bank accounts yet</h4>
        <p class="empty-message">Add your first bank account to start receiving payments</p>
        <button class="add-first-account-btn" @click="showAddModal = true">
          <span class="btn-icon">+</span>
          <span class="btn-text">Add Bank Account</span>
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="dashboard-section error-section">
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error }}</span>
        <button class="retry-btn" @click="loadBankAccounts">Retry</button>
      </div>
    </div>

    <!-- Add/Edit Bank Account Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ editingAccount ? 'Edit' : 'Add' }} Bank Account</h3>
          <button class="modal-close" @click="closeModals">
            <span class="close-icon">✕</span>
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <!-- Bank Name -->
          <div class="form-group">
            <label class="form-label">Bank Name *</label>
            <div class="input-wrapper">
              <span class="input-icon">🏦</span>
              <select 
                v-model="formData.bankName"
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
            <div v-if="formData.bankName === 'Other'" class="custom-bank-input">
              <div class="input-wrapper">
                <span class="input-icon">🏛️</span>
                <input 
                  type="text" 
                  v-model="formData.customBankName"
                  class="form-input"
                  placeholder="Enter bank name"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Account Name -->
          <div class="form-group">
            <label class="form-label">Account Name *</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input 
                type="text" 
                v-model="formData.accountName"
                class="form-input"
                placeholder="Full name as per bank account"
                required
                maxlength="100"
              />
            </div>
          </div>

          <!-- Account Number -->
          <div class="form-group">
            <label class="form-label">Account Number *</label>
            <div class="input-wrapper">
              <span class="input-icon">💳</span>
              <input 
                type="text" 
                v-model="formData.accountNumber"
                class="form-input"
                placeholder="Enter account number"
                required
                pattern="[0-9]{8,20}"
                maxlength="20"
                @input="formatAccountNumberInput"
              />
            </div>
            <div class="field-hint">
              Account number should be 8-20 digits
            </div>
          </div>

          <!-- Primary Account Toggle -->
          <div class="form-group">
            <div class="checkbox-wrapper">
              <label class="checkbox-container">
                <input 
                  type="checkbox" 
                  v-model="formData.isPrimary"
                  class="checkbox-input"
                />
                <span class="checkbox-checkmark"></span>
                <span class="checkbox-label">Set as primary account</span>
              </label>
              <div class="checkbox-hint">
                Primary account will be used as default for redemptions
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label class="form-label">Notes (Optional)</label>
            <div class="input-wrapper">
              <span class="input-icon">📝</span>
              <textarea 
                v-model="formData.notes"
                class="form-textarea"
                placeholder="Add notes about this account (e.g., Business account, Personal savings)"
                rows="3"
                maxlength="200"
              ></textarea>
            </div>
            <div class="field-hint">
              {{ formData.notes?.length || 0 }}/200 characters
            </div>
          </div>

          <!-- Validation Errors -->
          <div v-if="validationErrors.length > 0" class="validation-errors">
            <ul class="error-list">
              <li v-for="error in validationErrors" :key="error" class="error-item">
                {{ error }}
              </li>
            </ul>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeModals" :disabled="isSubmitting">
              Cancel
            </button>
            <button type="submit" class="submit-btn" :disabled="isSubmitting || !isFormValid">
              <span v-if="isSubmitting" class="submit-icon">⏳</span>
              <span v-else class="submit-icon">💾</span>
              <span class="submit-text">
                {{ isSubmitting ? 'Saving...' : (editingAccount ? 'Update' : 'Add') + ' Account' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-toast">
      <span class="success-icon">✅</span>
      <span class="success-text">{{ successMessage }}</span>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '../components/BottomNavigation.vue'
import HustlHeader from '../components/HustlHeader.vue'
import { useCachedApi } from '../composables/useCachedApi'
import apiService from '../services/api'

export default {
  name: 'BankAccountView',
  components: {
    BottomNavigation,
    HustlHeader
  },
  setup() {
    const router = useRouter()
    
    // Use cached API composable
    const { 
      getBankAccounts, 
      addBankAccount, 
      updateBankAccount,
      setPrimaryBankAccount,
      deleteBankAccount 
    } = useCachedApi()
    
    // State management
    const isLoading = ref(true)
    const isSubmitting = ref(false)
    const error = ref('')
    const successMessage = ref('')
    const bankAccounts = ref([])
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const editingAccount = ref(null)
    const validationErrors = ref([])

    // Form data
    const formData = reactive({
      bankName: '',
      customBankName: '',
      accountName: '',
      accountNumber: '',
      isPrimary: false,
      notes: ''
    })

    // Computed properties
    const isFormValid = computed(() => {
      const bankName = formData.bankName === 'Other' ? formData.customBankName : formData.bankName
      return bankName && 
             formData.accountName && 
             formData.accountNumber && 
             formData.accountNumber.length >= 8 &&
             validationErrors.value.length === 0
    })

    // Helper methods
    const formatBankName = (bankName) => {
      return apiService.constructor.formatBankName(bankName)
    }

    const formatAccountNumber = (accountNumber) => {
      return apiService.constructor.formatBankAccountNumber(accountNumber)
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown'
      
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return 'today'
      if (diffDays === 2) return 'yesterday'
      if (diffDays <= 7) return `${diffDays} days ago`
      if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`
      if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      })
    }

    const formatAccountNumberInput = (event) => {
      // Remove non-numeric characters
      formData.accountNumber = event.target.value.replace(/\D/g, '')
      validateForm()
    }

    const validateForm = () => {
      const errors = []
      
      const bankName = formData.bankName === 'Other' ? formData.customBankName : formData.bankName
      if (!bankName) {
        errors.push('Bank name is required')
      }
      
      if (!formData.accountName || formData.accountName.trim().length < 3) {
        errors.push('Account name must be at least 3 characters')
      }
      
      if (!formData.accountNumber) {
        errors.push('Account number is required')
      } else if (formData.accountNumber.length < 8 || formData.accountNumber.length > 20) {
        errors.push('Account number must be 8-20 digits')
      } else if (!/^\d+$/.test(formData.accountNumber)) {
        errors.push('Account number must contain only numbers')
      }
      
      validationErrors.value = errors
    }

    // API methods
    const loadBankAccounts = async (forceRefresh = false) => {
      isLoading.value = true
      error.value = ''
      
      try {
        const response = await getBankAccounts(
          { limit: 50 },
          { 
            ttl: 10 * 60 * 1000, // 10 minutes cache
            forceRefresh: forceRefresh 
          }
        )
        
        if (response.success) {
          bankAccounts.value = response.data || []
        } else {
          throw new Error(response.message || 'Failed to load bank accounts')
        }

      } catch (err) {
        console.error('Error loading bank accounts:', err)
        error.value = 'Failed to load bank accounts. Please try again.'
        bankAccounts.value = []
      } finally {
        isLoading.value = false
      }
    }

    const handleSubmit = async () => {
      validateForm()
      
      if (!isFormValid.value) {
        return
      }

      isSubmitting.value = true
      error.value = ''
      
      try {
        const bankAccountData = {
          bankName: formData.bankName === 'Other' ? formData.customBankName : formData.bankName,
          accountName: formData.accountName.trim(),
          accountNumber: formData.accountNumber,
          isPrimary: formData.isPrimary,
          notes: formData.notes.trim()
        }

        let response
        if (editingAccount.value) {
          // Update existing account
          response = await updateBankAccount(editingAccount.value.id, bankAccountData)
        } else {
          // Add new account
          response = await addBankAccount(bankAccountData)
        }

        if (response.success) {
          successMessage.value = editingAccount.value 
            ? 'Bank account updated successfully!' 
            : 'Bank account added successfully!'
          
          // Refresh the list
          await loadBankAccounts(true)
          
          // Close modal and reset form
          closeModals()
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            successMessage.value = ''
          }, 3000)
        } else {
          throw new Error(response.message || 'Failed to save bank account')
        }

      } catch (err) {
        console.error('Error saving bank account:', err)
        error.value = err.message || 'Failed to save bank account. Please try again.'
      } finally {
        isSubmitting.value = false
      }
    }

    const setPrimary = async (accountId) => {
      if (isSubmitting.value) return

      isSubmitting.value = true
      error.value = ''
      
      try {
        const response = await setPrimaryBankAccount(accountId)
        
        if (response.success) {
          successMessage.value = 'Primary account updated successfully!'
          await loadBankAccounts(true)
          
          setTimeout(() => {
            successMessage.value = ''
          }, 3000)
        } else {
          throw new Error(response.message || 'Failed to set primary account')
        }

      } catch (err) {
        console.error('Error setting primary account:', err)
        error.value = err.message || 'Failed to set primary account. Please try again.'
      } finally {
        isSubmitting.value = false
      }
    }

    const deleteAccount = async (accountId) => {
      if (isSubmitting.value) return

      const account = bankAccounts.value.find(acc => acc.id === accountId)
      if (account && account.isPrimary) {
        alert('Cannot delete primary account. Please set another account as primary first.')
        return
      }

      if (!confirm('Are you sure you want to delete this bank account? This action cannot be undone.')) {
        return
      }

      isSubmitting.value = true
      error.value = ''
      
      try {
        const response = await deleteBankAccount(accountId)
        
        if (response.success) {
          successMessage.value = 'Bank account deleted successfully!'
          await loadBankAccounts(true)
          
          setTimeout(() => {
            successMessage.value = ''
          }, 3000)
        } else {
          throw new Error(response.message || 'Failed to delete bank account')
        }

      } catch (err) {
        console.error('Error deleting bank account:', err)
        error.value = err.message || 'Failed to delete bank account. Please try again.'
      } finally {
        isSubmitting.value = false
      }
    }

    const editAccount = (account) => {
      editingAccount.value = account
      formData.bankName = account.bankName
      formData.customBankName = ''
      formData.accountName = account.accountName
      formData.accountNumber = account.accountNumber
      formData.isPrimary = account.isPrimary
      formData.notes = account.notes || ''
      
      showEditModal.value = true
      validationErrors.value = []
    }

    const closeModals = () => {
      showAddModal.value = false
      showEditModal.value = false
      editingAccount.value = null
      
      // Reset form
      formData.bankName = ''
      formData.customBankName = ''
      formData.accountName = ''
      formData.accountNumber = ''
      formData.isPrimary = false
      formData.notes = ''
      validationErrors.value = []
    }

    const goBack = () => {
      router.go(-1)
    }

    // Initialize on mount
    onMounted(() => {
      loadBankAccounts()
    })

    return {
      isLoading,
      isSubmitting,
      error,
      successMessage,
      bankAccounts,
      showAddModal,
      showEditModal,
      editingAccount,
      formData,
      validationErrors,
      isFormValid,
      formatBankName,
      formatAccountNumber,
      formatDate,
      formatAccountNumberInput,
      validateForm,
      loadBankAccounts,
      handleSubmit,
      setPrimary,
      deleteAccount,
      editAccount,
      closeModals,
      goBack
    }
  }
}
</script>

<style scoped>
.bank-account-view {
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
  justify-content: space-between;
  gap: 1rem;
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
  flex-shrink: 0;
}

.back-btn:hover {
  background: rgba(79, 195, 247, 0.1);
  transform: translateX(-2px);
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  flex: 1;
  margin: 0;
}

.add-btn {
  background: #4FC3F7;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.25);
  flex-shrink: 0;
}

.add-btn:hover:not(:disabled) {
  background: #29B6F6;
  transform: scale(1.1);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Loading Section */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(79, 195, 247, 0.3);
  border-top: 4px solid #4FC3F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  margin: 0;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
}

.account-count {
  font-size: 0.875rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

/* Accounts List */
.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.account-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: #F8FAFC;
  border-radius: 12px;
  border: 2px solid #E2E8F0;
  transition: all 0.2s;
  position: relative;
}

.account-item:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
  transform: translateY(-1px);
}

.account-item.primary-account {
  border-color: #F59E0B;
  background: linear-gradient(135deg, #FEF3C7, #F9FAFB);
}

.account-item.primary-account::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #F59E0B, #FCD34D);
  border-radius: 12px 12px 0 0;
}

.account-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #4FC3F7, #29B6F6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.25);
}

.account-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.account-bank-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
  line-height: 1.3;
}

.account-name {
  font-size: 0.875rem;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-number {
  font-size: 0.8rem;
  color: #6B7280;
  font-family: 'Courier New', monospace;
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.5px;
}

.account-notes {
  margin: 0.25rem 0;
}

.notes-text {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-style: italic;
  font-weight: 400;
}

.account-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.account-date {
  font-size: 0.7rem;
  color: #9CA3AF;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
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
  border-radius: 12px;
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

.unverified-badge {
  background: #FEE2E2;
  color: #991B1B;
}

.account-actions {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex-shrink: 0;
}

.action-btn {
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover:not(:disabled) {
  border-color: #4FC3F7;
  background: rgba(79, 195, 247, 0.1);
}

.primary-btn:hover:not(:disabled) {
  border-color: #F59E0B;
  background: rgba(245, 158, 11, 0.1);
}

.delete-btn:hover:not(:disabled) {
  border-color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Empty State */
.empty-section {
  padding: 3rem 1.25rem;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6B7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.5rem;
  font-family: 'Baloo 2', sans-serif;
}

.empty-message {
  font-size: 0.875rem;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 300px;
}

.add-first-account-btn {
  background: linear-gradient(135deg, #4FC3F7, #29B6F6);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.25);
}

.add-first-account-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.3);
}

.btn-icon {
  font-size: 1.125rem;
}

/* Error Section */
.error-section {
  background: #FEF2F2;
  border: 2px solid #FECACA;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #DC2626;
  font-family: 'Baloo 2', sans-serif;
}

.error-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-weight: 500;
}

.retry-btn {
  background: #DC2626;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Baloo 2', sans-serif;
}

.retry-btn:hover {
  background: #B91C1C;
  transform: translateY(-1px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  box-sizing: border-box;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #6B7280;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #F3F4F6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  margin-bottom: 0.5rem;
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
  color: #6B7280;
}

.form-input,
.form-textarea {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.875rem;
  color: #1F2937;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9CA3AF;
  font-weight: 400;
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.custom-bank-input {
  margin-top: 0.75rem;
}

.field-hint {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 400;
  margin-top: 0.375rem;
  font-style: italic;
}

/* Checkbox Styles */
.checkbox-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 0;
}

.checkbox-input {
  display: none;
}

.checkbox-checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #D1D5DB;
  border-radius: 6px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.checkbox-input:checked + .checkbox-checkmark {
  background: #4FC3F7;
  border-color: #4FC3F7;
}

.checkbox-input:checked + .checkbox-checkmark::after {
  content: '✓';
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.checkbox-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  font-family: 'Baloo 2', sans-serif;
  line-height: 1.4;
}

.checkbox-hint {
  font-size: 0.75rem;
  color: #6B7280;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 400;
  margin-left: 2.75rem;
  line-height: 1.4;
}

/* Validation Errors */
.validation-errors {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.error-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.error-item {
  font-size: 0.8rem;
  color: #DC2626;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
  margin-bottom: 0.25rem;
  position: relative;
  padding-left: 1rem;
}

.error-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #DC2626;
}

.error-item:last-child {
  margin-bottom: 0;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cancel-btn {
  background: white;
  color: #374151;
  border: 2px solid #E5E7EB;
}

.cancel-btn:hover:not(:disabled) {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.submit-btn {
  background: linear-gradient(135deg, #4FC3F7, #29B6F6);
  color: white;
  border: 2px solid transparent;
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.25);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 195, 247, 0.3);
}

.submit-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.submit-icon {
  font-size: 1rem;
}

/* Success Toast */
.success-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #10B981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 25px -3px rgba(16, 185, 129, 0.3);
  z-index: 1100;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.success-icon {
  font-size: 1.125rem;
}

/* Responsive Design */
@media (max-width: 640px) {
  .modal-content {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .account-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .account-actions {
    flex-direction: row;
    justify-content: flex-end;
    align-self: flex-end;
  }
  
  .account-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .success-toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: calc(100% - 2rem);
  }
}

@media (min-width: 768px) {
  .dashboard-section {
    margin: 0 2rem 1.5rem 2rem;
    padding: 1.5rem;
  }
}
</style>