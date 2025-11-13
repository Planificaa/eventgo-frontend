/**
 * Auth Store (Pinia)
 * Gestiona el estado global de autenticación
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AuthApiService } from '../auth-api.service.js';

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref(null);
  const token = ref(localStorage.getItem('authToken') || null);
  const isLoading = ref(false);
  const error = ref(null);

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isOrganizer = computed(() => user.value?.role === 'organizer');
  const isAdmin = computed(() => user.value?.role === 'admin');

  /**
   * Registra un nuevo usuario
   */
  const register = async (userData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await AuthApiService.register(userData);
      user.value = response.user;
      token.value = response.token;
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Inicia sesión
   */
  const login = async (email, password) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await AuthApiService.login(email, password);
      user.value = response.user;
      token.value = response.token;
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Cierra la sesión
   */
  const logout = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      await AuthApiService.logout();
      user.value = null;
      token.value = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Restaura la sesión desde localStorage
   */
  const restoreSession = () => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        token.value = storedToken;
        user.value = JSON.parse(storedUser);
      } catch (err) {
        console.error('Error al restaurar sesión:', err);
        logout();
      }
    }
  };

  /**
   * Actualiza la información del usuario
   */
  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData };
    localStorage.setItem('user', JSON.stringify(user.value));
  };

  return {
    // Estado
    user,
    token,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    isOrganizer,
    isAdmin,

    // Acciones
    register,
    login,
    logout,
    restoreSession,
    updateUser,
  };
});
