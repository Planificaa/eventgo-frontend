/**
 * useAuth Composable
 * Hook para manejar autenticación en componentes
 */

import { useAuthStore } from '/src/auth-management/application/services/auth.store.js';

export function useAuth() {
  const authStore = useAuthStore();

  return {
    // Estado
    user: authStore.user,
    token: authStore.token,
    isLoading: authStore.isLoading,
    error: authStore.error,

    // Computed
    isAuthenticated: authStore.isAuthenticated,
    isOrganizer: authStore.isOrganizer,
    isAdmin: authStore.isAdmin,

    // Acciones
    register: authStore.register,
    login: authStore.login,
    logout: authStore.logout,
    restoreSession: authStore.restoreSession,
    updateUser: authStore.updateUser,
  };
}
