<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'

const { t } = useI18n()
const router = useRouter()
const { register, isLoading } = useAuth()
const toast = useToast()

// Form data
const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user',
  acceptTerms: false
})

// Validation
const errors = ref({})

const validateForm = () => {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = t('auth.errorFullName')
  }

  if (!formData.value.email.includes('@')) {
    errors.value.email = t('auth.errorInvalidEmail')
  }

  if (formData.value.password.length < 8) {
    errors.value.password = t('auth.errorPasswordLength')
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = t('auth.errorPasswordMismatch')
  }

  if (!formData.value.acceptTerms) {
    errors.value.acceptTerms = t('auth.errorAcceptTerms')
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: Object.values(errors.value)[0],
      life: 5000
    })
    return
  }

  try {
    await register({
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password,
      role: formData.value.role
    })

    toast.add({
      severity: 'success',
      summary: t('auth.successRegister'),
      life: 3000
    })

    router.push('/dashboard')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || t('auth.errorEmailRegistered'),
      life: 5000
    })
  }
}

// Password strength
const passwordStrength = computed(() => {
  const password = formData.value.password
  if (password.length === 0) return 0
  if (password.length < 8) return 1
  if (password.length < 12) return 2
  return 3
})

const passwordStrengthLabel = computed(() => {
  const labels = ['', 'Débil', 'Media', 'Fuerte']
  return labels[passwordStrength.value]
})
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
        <h1 class="auth-title">{{ $t('auth.registerTitle') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.registerSubtitle') }}</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="auth-form">
        <!-- Full Name -->
        <div class="form-field">
          <label for="name" class="form-label">{{ $t('auth.fullName') }}</label>
          <InputText
            id="name"
            v-model="formData.name"
            :placeholder="$t('auth.fullName')"
            required
            class="w-full"
            :class="{ 'p-invalid': errors.name }"
          />
          <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
        </div>

        <!-- Email -->
        <div class="form-field">
          <label for="email" class="form-label">{{ $t('auth.email') }}</label>
          <InputText
            id="email"
            v-model="formData.email"
            type="email"
            :placeholder="$t('auth.email')"
            required
            class="w-full"
            :class="{ 'p-invalid': errors.email }"
          />
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
        </div>

        <!-- Password -->
        <div class="form-field">
          <label for="password" class="form-label">
            {{ $t('auth.securePassword') }}
          </label>
          <Password
            id="password"
            v-model="formData.password"
            :placeholder="$t('auth.password')"
            toggleMask
            :feedback="false"
            required
            class="w-full"
            :class="{ 'p-invalid': errors.password }"
          />
          <div class="password-strength" v-if="formData.password.length > 0">
            <div class="strength-bar">
              <div
                class="strength-fill"
                :class="'strength-' + passwordStrength"
                :style="{ width: (passwordStrength * 33.33) + '%' }"
              ></div>
            </div>
            <small>{{ passwordStrengthLabel }}</small>
          </div>
          <small class="help-text">{{ $t('auth.minChars') }}</small>
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>

        <!-- Confirm Password -->
        <div class="form-field">
          <label for="confirmPassword" class="form-label">
            {{ $t('auth.confirmPassword') }}
          </label>
          <Password
            id="confirmPassword"
            v-model="formData.confirmPassword"
            :placeholder="$t('auth.confirmPassword')"
            :feedback="false"
            toggleMask
            required
            class="w-full"
            :class="{ 'p-invalid': errors.confirmPassword }"
          />
          <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
        </div>

        <!-- Role Selection -->
        <div class="form-field">
          <label class="form-label">{{ $t('auth.roleQuestion') }}</label>
          <div class="role-options">
            <div class="role-option">
              <input
                type="radio"
                id="roleClient"
                value="user"
                v-model="formData.role"
              />
              <label for="roleClient" class="role-label">
                <i class="pi pi-user"></i>
                <span>{{ $t('auth.roleClient') }}</span>
              </label>
            </div>
            <div class="role-option">
              <input
                type="radio"
                id="roleOrganizer"
                value="organizer"
                v-model="formData.role"
              />
              <label for="roleOrganizer" class="role-label">
                <i class="pi pi-briefcase"></i>
                <span>{{ $t('auth.roleOrganizer') }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Terms & Conditions -->
        <div class="form-field">
          <div class="terms-container">
            <Checkbox
              v-model="formData.acceptTerms"
              inputId="terms"
              :binary="true"
              :class="{ 'p-invalid': errors.acceptTerms }"
            />
            <label for="terms" class="terms-label">
              {{ $t('auth.agreeTerms') }}
              <a href="#" class="terms-link">{{ $t('auth.terms') }}</a>
              {{ $t('auth.and') }}
              <a href="#" class="terms-link">{{ $t('auth.privacyPolicy') }}</a>
            </label>
          </div>
          <small v-if="errors.acceptTerms" class="p-error">{{ errors.acceptTerms }}</small>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          :label="$t('auth.registerButton')"
          class="w-full submit-btn"
          :loading="isLoading"
        />
      </form>

      <!-- Login Link -->
      <div class="auth-footer">
        <span>{{ $t('auth.alreadyAccount') }}</span>
        <RouterLink to="/login" class="login-link">
          {{ $t('auth.loginHere') }}
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
  max-width: 580px;
  width: 100%;
  animation: slideUp 0.5s ease;
  max-height: 95vh;
  overflow-y: auto;
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
  gap: 1.25rem;
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

.help-text {
  color: #6b7280;
  font-size: 0.75rem;
}

/* Password strength */
.password-strength {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.strength-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-1 {
  background: #ef4444;
}

.strength-2 {
  background: #f59e0b;
}

.strength-3 {
  background: #10b981;
}

/* Role options */
.role-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.role-option {
  position: relative;
}

.role-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.role-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.role-label i {
  font-size: 1.5rem;
  color: #6b7280;
}

.role-option input[type="radio"]:checked + .role-label {
  border-color: #5bc0be;
  background: #f0fdfa;
}

.role-option input[type="radio"]:checked + .role-label i {
  color: #5bc0be;
}

/* Terms & Conditions */
.terms-container {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.terms-label {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.terms-link {
  color: #5bc0be;
  text-decoration: none;
  font-weight: 500;
}

.terms-link:hover {
  text-decoration: underline;
}

/* Submit button */
.submit-btn {
  background: #5bc0be !important;
  border: none !important;
  padding: 0.75rem !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  transition: all 0.3s ease !important;
  margin-top: 0.5rem;
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

.login-link {
  color: #5bc0be;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
  transition: color 0.3s ease;
}

.login-link:hover {
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

  .role-options {
    grid-template-columns: 1fr;
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

.auth-form :deep(.p-inputtext.p-invalid),
.auth-form :deep(.p-password-input.p-invalid) {
  border-color: #ef4444;
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

.auth-form :deep(.p-checkbox.p-invalid .p-checkbox-box) {
  border-color: #ef4444;
}

.p-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
</style>
