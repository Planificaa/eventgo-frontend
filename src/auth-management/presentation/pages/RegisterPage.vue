<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/auth-management/infrastructure/composables/useAuth.js";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const { register, isLoading } = useAuth();

const form = ref({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "host",
  acceptTerms: false,
});

const errors = ref({});

const validate = () => {
  errors.value = {};

  if (!form.value.name || form.value.name.length < 3)
    errors.value.name = t("auth.errorNameLength");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email))
    errors.value.email = t("auth.errorInvalidEmail");

  if (form.value.password.length < 8)
    errors.value.password = t("auth.errorPasswordLength");

  if (form.value.password !== form.value.confirmPassword)
    errors.value.confirmPassword = t("auth.errorPasswordMismatch");

  if (!form.value.acceptTerms)
    errors.value.acceptTerms = t("auth.errorAcceptTerms");

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) return;

  try {
    const data = {
      name: form.value.name.trim(),
      email: form.value.email.trim().toLowerCase(),
      password: form.value.password,
      role: form.value.role,
    };

    const res = await register(data, { remember: true });

    // Redirigir por rol
    if (res.user.role === "host") router.push("/host/dashboard");
    else router.push("/organizer/dashboard");

    toast.add({
      severity: "success",
      summary: t("auth.successRegister"),
      detail: t("auth.welcomeHost"),
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: t("common.error"),
      detail: error.message,
    });
  }
};
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
        <!-- Name Input -->
        <div class="form-field">
          <label for="name" class="form-label">
            {{ $t('auth.fullName') }}
            <span class="required">*</span>
          </label>
          <InputText
            id="name"
            v-model="formData.name"
            type="text"
            :placeholder="$t('auth.fullNamePlaceholder')"
            required
            autocomplete="name"
            :class="{ 'p-invalid': errors.name }"
            :disabled="isLoading"
            @input="clearError('name')"
          />
          <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
        </div>

        <!-- Email Input -->
        <div class="form-field">
          <label for="email" class="form-label">
            {{ $t('auth.email') }}
            <span class="required">*</span>
          </label>
          <InputText
            id="email"
            v-model="formData.email"
            type="email"
            :placeholder="$t('auth.emailPlaceholder')"
            required
            autocomplete="email"
            :class="{ 'p-invalid': errors.email }"
            :disabled="isLoading"
            @input="clearError('email')"
          />
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
        </div>

        <!-- Password Input -->
        <div class="form-field">
          <label for="password" class="form-label">
            {{ $t('auth.password') }}
            <span class="required">*</span>
          </label>
          <Password
            id="password"
            v-model="formData.password"
            :placeholder="$t('auth.passwordPlaceholder')"
            toggleMask
            :feedback="true"
            required
            autocomplete="new-password"
            :class="{ 'p-invalid': errors.password }"
            :disabled="isLoading"
            @input="clearError('password')"
          >
            <template #footer>
              <p class="password-hint">{{ $t('auth.passwordHint') }}</p>
            </template>
          </Password>
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>

        <!-- Confirm Password Input -->
        <div class="form-field">
          <label for="confirmPassword" class="form-label">
            {{ $t('auth.confirmPassword') }}
            <span class="required">*</span>
          </label>
          <Password
            id="confirmPassword"
            v-model="formData.confirmPassword"
            :placeholder="$t('auth.confirmPasswordPlaceholder')"
            toggleMask
            :feedback="false"
            required
            autocomplete="new-password"
            :class="{ 'p-invalid': errors.confirmPassword }"
            :disabled="isLoading"
            @input="clearError('confirmPassword')"
          />
          <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
        </div>

        <!-- Role Selection -->
        <div class="form-field">
          <label class="form-label">
            {{ $t('auth.selectRole') }}
            <span class="required">*</span>
          </label>
          <div class="role-selection">
            <div
              v-for="option in roleOptions"
              :key="option.value"
              class="role-option"
              :class="{ 'role-option--selected': formData.role === option.value }"
              @click="!isLoading && (formData.role = option.value)"
            >
              <input
                type="radio"
                :id="`role-${option.value}`"
                :value="option.value"
                v-model="formData.role"
                :disabled="isLoading"
                class="role-radio"
              />
              <label :for="`role-${option.value}`" class="role-label">
                <i
                  class="role-icon pi"
                  :class="option.value === 'host' ? 'pi-users' : 'pi-briefcase'"
                ></i>
                <div class="role-info">
                  <span class="role-title">{{ option.label }}</span>
                  <span class="role-description">{{ option.description }}</span>
                </div>
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
              :disabled="isLoading"
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
          :disabled="isLoading"
          icon="pi pi-user-plus"
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
  width: 120px;
  height: auto;
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
  margin: 0 0 0.5rem 0;
}

.auth-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
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
  color: #374151;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
  margin-left: 0.25rem;
}

/* Role Selection */
.role-selection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.role-option {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #ffffff;
}

.role-option:hover {
  border-color: #5bc0be;
  background: #f0f9ff;
}

.role-option--selected {
  border-color: #5bc0be;
  background: linear-gradient(135deg, rgba(91, 192, 190, 0.1) 0%, rgba(58, 80, 107, 0.05) 100%);
}

.role-radio {
  display: none;
}

.role-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  width: 100%;
}

.role-icon {
  font-size: 1.5rem;
  color: #5bc0be;
  min-width: 32px;
  text-align: center;
}

.role-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.role-title {
  font-weight: 600;
  color: #1c2541;
  font-size: 1rem;
}

.role-description {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Terms */
.terms-container {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.terms-label {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.terms-link {
  color: #3a506b;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: #5bc0be;
  text-decoration: underline;
}

/* Submit Button */
.submit-btn {
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #3a506b 0%, #5bc0be 100%) !important;
  border: none !important;
  padding: 0.875rem !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(91, 192, 190, 0.3) !important;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Footer */
.auth-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #6b7280;
}

.login-link {
  color: #3a506b;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #5bc0be;
}

/* Password Hint */
.password-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  padding: 0.5rem 0 0 0;
}

/* Error Messages */
.p-error {
  color: #ef4444;
  font-size: 0.8125rem;
  margin-top: 0.25rem;
}

/* PrimeVue Overrides */
:deep(.p-inputtext),
:deep(.p-password-input) {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.9375rem;
  transition: all 0.3s ease;
}

:deep(.p-inputtext.p-invalid),
:deep(.p-password.p-invalid .p-password-input) {
  border-color: #ef4444;
}

:deep(.p-inputtext:enabled:focus),
:deep(.p-password:not(.p-disabled).p-focus .p-password-input) {
  border-color: #5bc0be;
  box-shadow: 0 0 0 0.2rem rgba(91, 192, 190, 0.15);
}

:deep(.p-inputtext:disabled),
:deep(.p-password-input:disabled) {
  background-color: #f9fafb;
  color: #9ca3af;
}

:deep(.p-checkbox .p-checkbox-box) {
  border: 2px solid #e5e7eb;
  border-radius: 4px;
  transition: all 0.3s ease;
}

:deep(.p-checkbox .p-checkbox-box.p-highlight) {
  border-color: #5bc0be;
  background: #5bc0be;
}

:deep(.p-checkbox.p-invalid .p-checkbox-box) {
  border-color: #ef4444;
}

:deep(.p-password-meter) {
  height: 6px;
  border-radius: 3px;
}

/* Scrollbar personalizado */
.auth-card::-webkit-scrollbar {
  width: 6px;
}

.auth-card::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.auth-card::-webkit-scrollbar-thumb {
  background: #5bc0be;
  border-radius: 10px;
}

.auth-card::-webkit-scrollbar-thumb:hover {
  background: #3a506b;
}

/* Responsive */
@media (max-width: 640px) {
  .auth-container {
    padding: 1rem;
  }

  .auth-card {
    padding: 2rem 1.5rem;
  }

  .auth-title {
    font-size: 1.75rem;
  }

  .auth-logo img {
    width: 100px;
  }

  .role-label {
    flex-direction: column;
    text-align: center;
  }

  .role-info {
    align-items: center;
    text-align: center;
  }
}
</style>
