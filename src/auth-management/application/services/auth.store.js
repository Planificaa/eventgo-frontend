/**
 * Auth Store (Pinia)
 * Gestiona el estado global de autenticación
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AuthApiService } from '../auth-api.service.js';

const STORAGE_KEYS = {
  token: 'authToken',
  user: 'authUser',
  storageType: 'authStorageType',
};

const STORAGE_TYPES = {
  local: 'local',
  session: 'session',
};

const storageOrder = [STORAGE_TYPES.local, STORAGE_TYPES.session];

const isBrowser = typeof window !== 'undefined';

const getStorage = (type) => {
  if (!isBrowser) return null;
  return type === STORAGE_TYPES.local ? window.localStorage : window.sessionStorage;
};

const readPersistedSession = () => {
  if (!isBrowser) {
    return { token: null, user: null, storageType: null };
  }

  for (const type of storageOrder) {
    const storage = getStorage(type);
    if (!storage) continue;

    try {
      const storedToken = storage.getItem(STORAGE_KEYS.token);
      const storedUser = storage.getItem(STORAGE_KEYS.user);

      if (storedToken && storedUser) {
        return {
          token: storedToken,
          user: JSON.parse(storedUser),
          storageType: storage.getItem(STORAGE_KEYS.storageType) || type,
        };
      }
    } catch (parseError) {
      storage.removeItem(STORAGE_KEYS.token);
      storage.removeItem(STORAGE_KEYS.user);
      storage.removeItem(STORAGE_KEYS.storageType);
      console.error('Error al leer la sesión almacenada:', parseError);
    }
  }

  return { token: null, user: null, storageType: null };
};

export const useAuthStore = defineStore('auth', () => {
  const initialSession = readPersistedSession();

  const user = ref(initialSession.user);
  const token = ref(initialSession.token);
  const activeStorage = ref(initialSession.storageType);
  const isLoading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => Boolean(token.value) && Boolean(user.value));
  const isOrganizer = computed(() => user.value?.role === 'organizer');
  const isAdmin = computed(() => user.value?.role === 'admin');

  const clearPersistedSession = () => {
    if (!isBrowser) return;

    storageOrder.forEach((type) => {
      const storage = getStorage(type);
      if (!storage) return;
      storage.removeItem(STORAGE_KEYS.token);
      storage.removeItem(STORAGE_KEYS.user);
      storage.removeItem(STORAGE_KEYS.storageType);
    });
  };

  const persistSessionData = (storageType) => {
    if (!isBrowser || !token.value || !user.value) return;

    const targetStorage = getStorage(storageType);
    const oppositeType = storageType === STORAGE_TYPES.local ? STORAGE_TYPES.session : STORAGE_TYPES.local;
    const oppositeStorage = getStorage(oppositeType);

    const serializedUser = JSON.stringify(user.value);

    if (targetStorage) {
      targetStorage.setItem(STORAGE_KEYS.token, token.value);
      targetStorage.setItem(STORAGE_KEYS.user, serializedUser);
      targetStorage.setItem(STORAGE_KEYS.storageType, storageType);
    }

    if (oppositeStorage) {
      oppositeStorage.removeItem(STORAGE_KEYS.token);
      oppositeStorage.removeItem(STORAGE_KEYS.user);
      oppositeStorage.removeItem(STORAGE_KEYS.storageType);
    }
  };

  const persistSession = (sessionUser, sessionToken, remember) => {
    user.value = sessionUser;
    token.value = sessionToken;

    if (!sessionUser || !sessionToken) {
      activeStorage.value = null;
      clearPersistedSession();
      return;
    }

    const storageType = remember ? STORAGE_TYPES.local : STORAGE_TYPES.session;
    activeStorage.value = storageType;
    persistSessionData(storageType);
  };

  const persistUser = () => {
    if (!activeStorage.value) return;
    persistSessionData(activeStorage.value);
  };

  const register = async (userData, options = {}) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await AuthApiService.register(userData);
      const remember = options.remember ?? true;
      persistSession(response.user, response.token, remember);
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (email, password, options = {}) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await AuthApiService.login(email, password);
      const remember = options.remember ?? false;
      persistSession(response.user, response.token, remember);
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      await AuthApiService.logout();
      user.value = null;
      token.value = null;
      activeStorage.value = null;
      clearPersistedSession();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const restoreSession = async () => {
    if (!isBrowser) return false;

    const persisted = readPersistedSession();
    if (!persisted.token || !persisted.user) {
      clearPersistedSession();
      return false;
    }

    try {
      await AuthApiService.validateToken(persisted.token);
      token.value = persisted.token;
      user.value = persisted.user;
      activeStorage.value = persisted.storageType || STORAGE_TYPES.local;
      return true;
    } catch (err) {
      clearPersistedSession();
      token.value = null;
      user.value = null;
      activeStorage.value = null;
      error.value = err.message;
      return false;
    }
  };

  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData };
    persistUser();
  };

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isOrganizer,
    isAdmin,
    register,
    login,
    logout,
    restoreSession,
    updateUser,
  };
});
