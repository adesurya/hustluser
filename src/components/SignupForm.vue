<template>
  <form @submit.prevent="$emit('submit')" class="auth-form">
    <div class="form-group">
      <div class="input-wrapper">
        <span class="input-icon">👤</span>
        <input 
          type="text" 
          :value="username"
          @input="$emit('update:username', $event.target.value)"
          class="form-input" 
          placeholder="User name"
          required
        />
      </div>
    </div>

    <div class="form-group">
      <div class="input-wrapper">
        <span class="input-icon">📧</span>
        <input 
          type="email" 
          :value="email"
          @input="$emit('update:email', $event.target.value)"
          class="form-input" 
          placeholder="Email address"
          required
        />
      </div>
    </div>

    <div class="form-group">
      <div class="input-wrapper">
        <span class="input-icon">📱</span>
        <input 
          type="tel" 
          :value="phoneNumber"
          @input="$emit('update:phoneNumber', $event.target.value)"
          class="form-input" 
          placeholder="Phone number"
          required
        />
      </div>
    </div>

    <div class="form-group">
      <div class="input-wrapper">
        <span class="input-icon">🔒</span>
        <input 
          :type="showPassword ? 'text' : 'password'"
          :value="password"
          @input="$emit('update:password', $event.target.value)"
          class="form-input" 
          placeholder="Password"
          required
        />
        <button 
          type="button" 
          class="password-toggle"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? '👁️' : '👁️‍🗨️' }}
        </button>
      </div>
    </div>

    <div class="form-group">
      <div class="input-wrapper">
        <span class="input-icon">🔒</span>
        <input 
          :type="showConfirmPassword ? 'text' : 'password'"
          :value="confirmPassword"
          @input="$emit('update:confirmPassword', $event.target.value)"
          class="form-input" 
          placeholder="Confirm password"
          required
        />
        <button 
          type="button" 
          class="password-toggle"
          @click="showConfirmPassword = !showConfirmPassword"
        >
          {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
        </button>
      </div>
    </div>

    <button type="submit" class="primary-btn">
      Sign Up
    </button>
  </form>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'SignupForm',
  props: {
    username: String,
    email: String,
    phoneNumber: String,
    password: String,
    confirmPassword: String
  },
  emits: [
    'submit', 
    'update:username', 
    'update:email', 
    'update:phoneNumber', 
    'update:password', 
    'update:confirmPassword'
  ],
  setup() {
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    
    return {
      showPassword,
      showConfirmPassword
    }
  }
}
</script>

<style scoped>
.auth-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.25rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  transition: all 0.2s;
  min-height: 56px;
}

.input-wrapper:focus-within {
  border-color: #4F46E5;
  background: white;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-icon {
  margin-right: 1rem;
  color: #9CA3AF;
  font-size: 1.25rem;
}

.form-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 1rem;
  color: #1F2937;
}

.form-input::placeholder {
  color: #9CA3AF;
}

.password-toggle {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
  margin-left: 0.5rem;
}

.primary-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 1.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
  min-height: 56px;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

/* Desktop */
@media (min-width: 768px) {
  .form-group {
    margin-bottom: 1.5rem;
  }

  .input-wrapper {
    padding: 1.125rem 1.5rem;
    min-height: 60px;
    border-radius: 14px;
  }

  .input-icon {
    font-size: 1.375rem;
    margin-right: 1.25rem;
  }

  .form-input {
    font-size: 1.125rem;
  }

  .password-toggle {
    font-size: 1.375rem;
  }

  .primary-btn {
    padding: 1.375rem;
    font-size: 1.125rem;
    min-height: 60px;
    border-radius: 14px;
    margin-top: 1.5rem;
  }
}

/* Large Desktop */
@media (min-width: 1024px) {
  .input-wrapper {
    padding: 1.25rem 1.75rem;
    min-height: 64px;
  }

  .form-input {
    font-size: 1.25rem;
  }

  .primary-btn {
    padding: 1.5rem;
    font-size: 1.25rem;
    min-height: 64px;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .form-group {
    margin-bottom: 1rem;
  }

  .input-wrapper {
    padding: 0.875rem 1rem;
    min-height: 52px;
  }

  .input-icon {
    font-size: 1.125rem;
    margin-right: 0.75rem;
  }

  .form-input {
    font-size: 0.9rem;
  }

  .password-toggle {
    font-size: 1.125rem;
  }

  .primary-btn {
    padding: 1rem;
    font-size: 1rem;
    min-height: 52px;
    margin-top: 0.75rem;
  }
}
</style>