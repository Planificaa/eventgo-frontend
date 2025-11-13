<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '/src/auth-management/infrastructure/composables/useAuth.js'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'

const { t } = useI18n()
const router = useRouter()
const { login, isLoading } = useAuth()
const toast = useToast()

// Form data
const email = ref('')
const password = ref('')
const rememberMe = ref(false)

// Error handling
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''

  try {
    await login(email.value, password.value)

    toast.add({
      severity: 'success',
      summary: t('auth.successLogin'),
      life: 3000
    })

    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = error.message || t('auth.errorLogin')
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage.value,
      life: 5000
    })
  }
}
</script>

<template>
  <div class="auth-container">
    <Toast />
    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <img src="/src/assets/img/EventGO_logo.png" alt="EventGO" />
      </div>

      <!-- Header -->
      <div class="auth-header">
        <h1 class="auth-title">{{ $t('auth.loginTitle') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.loginSubtitle') }}</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="auth-form">
        <!-- Email Input -->
        <div class="form-field">
          <label for="email" class="form-label">{{ $t('auth.email') }}</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            :placeholder="$t('auth.email')"
            required
            class="w-full"
          />
        </div>

        <!-- Password Input -->
        <div class="form-field">
          <label for="password" class="form-label">{{ $t('auth.password') }}</label>
          <Password
            id="password"
            v-model="password"
            :placeholder="$t('auth.password')"
            :feedback="false"
            toggleMask
            required
            class="w-full"
          />
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="form-options">
          <div class="remember-me">
            <Checkbox v-model="rememberMe" inputId="remember" :binary="true" />
            <label for="remember">{{ $t('auth.rememberMe') }}</label>
          </div>
          <RouterLink to="/forgot-password" class="forgot-link">
            {{ $t('auth.forgotPassword') }}
          </RouterLink>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          :label="$t('auth.loginButton')"
          class="w-full submit-btn"
          :loading="isLoading"
        />
      </form>

      <!-- Register Link -->
      <div class="auth-footer">
        <span>{{ $t('auth.noAccount') }}</span>
        <RouterLink to="/register" class="register-link">
          {{ $t('auth.registerHere') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container principal */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3a506b 0%, #1c2541 100%);
  padding: 2rem;
}

/* Card del formulario */
.auth-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 3rem;
  max-width: 480px;
  width: 100%;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo */
.auth-logo {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo img {
  height: 48px;
  width: auto;
}

/* Header */
.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1c2541;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  font-size: 1rem;
  color: #6b7280;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #1c2541;
  font-size: 0.875rem;
}

/* Form options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remember-me label {
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

.forgot-link {
  font-size: 0.875rem;
  color: #5bc0be;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #3a506b;
}

/* Submit button */
.submit-btn {
  background: #5bc0be !important;
  border: none !important;
  padding: 0.75rem !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  transition: all 0.3s ease !important;
}

.submit-btn:hover {
  background: #3a506b !important;
}

/* Footer */
.auth-footer {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.register-link {
  color: #5bc0be;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #3a506b;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }

  .auth-title {
    font-size: 1.5rem;
  }

  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .auth-container {
    padding: 1rem;
  }

  .auth-card {
    padding: 1.5rem;
  }
}

/* PrimeVue deep selectors */
.auth-form :deep(.p-inputtext),
.auth-form :deep(.p-password-input) {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}

.auth-form :deep(.p-inputtext:focus),
.auth-form :deep(.p-password-input:focus) {
  border-color: #5bc0be;
  box-shadow: 0 0 0 3px rgba(91, 192, 190, 0.1);
}

.auth-form :deep(.p-password) {
  width: 100%;
}

.auth-form :deep(.p-checkbox .p-checkbox-box) {
  border-radius: 4px;
  border-color: #d1d5db;
}

.auth-form :deep(.p-checkbox .p-checkbox-box.p-highlight) {
  background: #5bc0be;
  border-color: #5bc0be;
}
</style>
