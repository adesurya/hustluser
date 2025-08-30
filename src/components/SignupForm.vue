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
        <span class="input-icon">📞</span>
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
/* Mobile First - Base styles */
.auth-form {
  width: 100%;
}

.form-group {
  margin-bottom: 0.875rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 0.75rem 0.875rem;
  transition: all 0.2s;
  min-height: 48px;
}

.input-wrapper:focus-within {
  border-color: #4F46E5;
  background: white;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-icon {
  margin-right: 0.75rem;
  color: #9CA3AF;
  font-size: 0.9rem;
  width: 14px;
  text-align: center;
  flex-shrink: 0;
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

.form-input::placeholder {
  color: #9CA3AF;
}

.password-toggle {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.primary-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 0.875rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.75rem;
  min-height: 48px;
  font-family: 'Baloo 2', sans-serif;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

/* Tablet - 768px and up */
@media (min-width: 768px) {
  .form-group {
    margin-bottom: 1rem;
  }

  .input-wrapper {
    padding: 0.875rem 1rem;
    min-height: 52px;
  }

  .input-icon {
    font-size: 1rem;
    margin-right: 0.875rem;
    width: 16px;
  }

  .form-input {
    font-size: 0.9rem;
  }

  .password-toggle {
    font-size: 1rem;
  }

  .primary-btn {
    padding: 1rem;
    font-size: 1rem;
    min-height: 52px;
    margin-top: 1rem;
  }
}

/* Desktop Small - 1024px and up */
@media (min-width: 1024px) {
  .form-group {
    margin-bottom: 1.25rem;
  }

  .input-wrapper {
    padding: 1rem 1.25rem;
    min-height: 56px;
    border-radius: 14px;
  }

  .input-icon {
    font-size: 1.125rem;
    margin-right: 1rem;
    width: 18px;
  }

  .form-input {
    font-size: 1rem;
  }

  .password-toggle {
    font-size: 1.125rem;
  }

  .primary-btn {
    padding: 1.125rem;
    font-size: 1.125rem;
    min-height: 56px;
    border-radius: 14px;
    margin-top: 1.25rem;
  }
}

/* Desktop Large - 1200px and up */
@media (min-width: 1200px) {
  .form-group {
    margin-bottom: 1.5rem;
  }

  .input-wrapper {
    padding: 1.125rem 1.5rem;
    min-height: 60px;
  }

  .input-icon {
    font-size: 1.25rem;
    margin-right: 1.25rem;
    width: 20px;
  }

  .form-input {
    font-size: 1.125rem;
  }

  .password-toggle {
    font-size: 1.25rem;
  }

  .primary-btn {
    padding: 1.25rem;
    font-size: 1.125rem;
    min-height: 60px;
    margin-top: 1.5rem;
  }
}
</style>