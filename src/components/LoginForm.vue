<template>
  <div class="login-form-container">
    <form @submit.prevent="$emit('submit')" class="auth-form">
      <div class="form-group">
        <div class="input-wrapper">
          <span class="input-icon">📧</span>
          <input 
            type="text" 
            :value="identifier"
            @input="$emit('update:identifier', $event.target.value)"
            class="form-input" 
            placeholder="Email"
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

      <div class="form-options">
        <label class="checkbox-wrapper">
          <input 
            type="checkbox" 
            :checked="remember"
            @change="$emit('update:remember', $event.target.checked)"
            class="checkbox"
          />
          <span class="checkbox-text">Remember me</span>
        </label>
        <a href="#" class="forgot-link">Forgot Password?</a>
      </div>

      <button type="submit" class="primary-btn">
        Sign In
      </button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'LoginForm',
  props: {
    identifier: String,
    password: String,
    remember: Boolean
  },
  emits: ['submit', 'update:identifier', 'update:password', 'update:remember'],
  setup() {
    const showPassword = ref(false)
    
    return {
      showPassword
    }
  }
}
</script>

<style scoped>
/* Container for the entire login form */
.login-form-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Mobile First - Base styles with consistent proportions */
.auth-form {
  width: 100%;
  background: transparent;
  padding: 0;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 2px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  transition: all 0.2s;
  min-height: 60px;
}

.input-wrapper:focus-within {
  border-color: #4F46E5;
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-icon {
  margin-right: 1rem;
  color: #9CA3AF;
  font-size: 1.25rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 1rem;
  color: #000000 !important;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 500;
}

.form-input::placeholder {
  color: #9CA3AF !important;
  font-weight: 400;
}

.password-toggle {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.5rem;
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox {
  margin-right: 0.75rem;
  width: 18px;
  height: 18px;
}

.checkbox-text {
  color: #000000 !important;
  font-weight: 500;
  font-family: 'Baloo 2', sans-serif;
}

.forgot-link {
  color: #4F46E5 !important;
  text-decoration: none;
  font-weight: 600;
  font-family: 'Baloo 2', sans-serif;
}

.forgot-link:hover {
  text-decoration: underline;
}

.primary-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 16px;
  padding: 1.25rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
  min-height: 60px;
  font-family: 'Baloo 2', sans-serif;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

/* Tablet - Keep same proportions */
@media (min-width: 768px) {
  .form-group {
    margin-bottom: 1.5rem;
  }

  .input-wrapper {
    padding: 1.25rem 1.5rem;
    min-height: 60px;
    border-radius: 16px;
  }

  .input-icon {
    font-size: 1.25rem;
    margin-right: 1rem;
    width: 20px;
  }

  .form-input {
    font-size: 1rem;
  }

  .password-toggle {
    font-size: 1.25rem;
    right: 1.5rem;
  }

  .form-options {
    margin-bottom: 2rem;
    font-size: 0.95rem;
  }

  .checkbox {
    width: 18px;
    height: 18px;
  }

  .primary-btn {
    padding: 1.25rem;
    font-size: 1.125rem;
    min-height: 60px;
    border-radius: 16px;
    margin-top: 1rem;
  }
}

/* Desktop - Keep same proportions */
@media (min-width: 1024px) {
  .form-group {
    margin-bottom: 1.5rem;
  }

  .input-wrapper {
    padding: 1.25rem 1.5rem;
    min-height: 60px;
  }

  .input-icon {
    font-size: 1.25rem;
    margin-right: 1rem;
    width: 20px;
  }

  .form-input {
    font-size: 1rem;
  }

  .password-toggle {
    font-size: 1.25rem;
    right: 1.5rem;
  }

  .form-options {
    margin-bottom: 2rem;
    font-size: 0.95rem;
  }

  .checkbox {
    width: 18px;
    height: 18px;
  }

  .primary-btn {
    padding: 1.25rem;
    font-size: 1.125rem;
    min-height: 60px;
    margin-top: 1rem;
  }
}
</style>