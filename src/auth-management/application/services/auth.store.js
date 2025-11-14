// src/auth-management/application/services/auth.store.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/shared/infrastructure/http/axios.config.js'

// Helpers para persistencia
const STORAGE_KEYS = {
  TOKEN: 'authToken',
  USER: 'authUser',
  STORAGE_TYPE: 'authStorageType'
}

const persistSession = (user, token, storageType = 'local') => {
  const storage = storageType === 'local' ? localStorage : sessionStorage
  storage.setItem(STORAGE_KEYS.TOKEN, token)
  storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  storage.setItem(STORAGE_KEYS.STORAGE_TYPE, storageType)
}

const clearPersistedSession = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.STORAGE_TYPE)
  sessionStorage.removeItem(STORAGE_KEYS.TOKEN)
  sessionStorage.removeItem(STORAGE_KEYS.USER)
  sessionStorage.removeItem(STORAGE_KEYS.STORAGE_TYPE)
}

const loadPersistedSession = () => {
  // siempre buscamos primero en localStorage
  const token =
    localStorage.getItem(STORAGE_KEYS.TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.TOKEN)

  const userRaw =
    localStorage.getItem(STORAGE_KEYS.USER) ||
    sessionStorage.getItem(STORAGE_KEYS.USER)

  const storageType =
    localStorage.getItem(STORAGE_KEYS.STORAGE_TYPE) ||
    sessionStorage.getItem(STORAGE_KEYS.STORAGE_TYPE) ||
    'local'

  return {
    token: token || null,
    user: userRaw ? JSON.parse(userRaw) : null,
    storageType
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)
  const storageType = ref('local')

  /* ============================================================
     LOGIN (funciona perfecto con JSON-SERVER)
  ============================================================ */
  const login = async (email, password, persistence = 'local') => {
    try {
      const { data } = await api.get('/users', {
        params: { email, password }
      })

      if (!data || data.length === 0) {
        throw new Error('Credenciales inválidas')
      }

      const loggedUser = data[0]

      // json-server no genera tokens → generamos uno básico
      const generatedToken = 'auth_' + Math.random().toString(36).substring(2)

      // Guardar en estado
      user.value = loggedUser
      token.value = generatedToken
      storageType.value = persistence

      persistSession(loggedUser, generatedToken, persistence)

      return true
    } catch (err) {
      console.error('Login error:', err)
      throw err
    }
  }

  /* ============================================================
     RESTORE SESSION — MÁXIMA IMPORTANCIA
     No usamos validateToken (json-server no lo soporta)
  ============================================================ */
  const restoreSession = async () => {
    const persisted = loadPersistedSession()

    if (!persisted.token || !persisted.user) {
      // limpiar basura
      clearPersistedSession()
      user.value = null
      token.value = null
      return false
    }

    // Simplemente restauramos lo persistido
    token.value = persisted.token
    user.value = persisted.user
    storageType.value = persisted.storageType

    return true
  }

  /* ============================================================
     LOGOUT
  ============================================================ */
  const logout = async () => {
    clearPersistedSession()
    user.value = null
    token.value = null
    storageType.value = 'local'
  }

  /* ============================================================
     GETTERS
  ============================================================ */
  const isAuthenticated = computed(() => token.value !== null)

  const isHost = computed(() => user.value?.role === 'host')
  const isOrganizer = computed(() => user.value?.role === 'organizer')

  return {
    user,
    token,
    storageType,

    login,
    restoreSession,
    logout,

    isAuthenticated,
    isHost,
    isOrganizer
  }
})
