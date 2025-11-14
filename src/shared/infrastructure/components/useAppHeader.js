import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js'

export const useAppHeader = () => {
  const { locale } = useI18n()

  const languageOptions = ref([
    { name: 'English', code: 'en', flag: 'EN' },
    { name: 'Spanish', code: 'es', flag: 'ES' },
  ])

  const selectedLanguage = ref(
    languageOptions.value.find((lang) => lang.code === locale.value) ?? languageOptions.value[0]
  )

  const changeLanguage = (language) => {
    locale.value = language.code
    selectedLanguage.value = language
    localStorage.setItem('locale', language.code)
  }

  const sidebarVisible = ref(false)
  const toggleSidebar = () => {
    sidebarVisible.value = !sidebarVisible.value
  }
  const closeSidebar = () => {
    sidebarVisible.value = false
  }

  const router = useRouter()
  const { logout, isAuthenticated, user } = useAuth()

  const userDisplayName = computed(() => {
    if (!user.value) return ''

    const fullName = user.value.fullName || user.value.name || ''
    const nameParts = fullName.trim().split(' ')

    return nameParts.slice(0, 2).join(' ')
  })

  const handleLogout = async () => {
    try {
      closeSidebar()
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  return {
    languageOptions,
    selectedLanguage,
    changeLanguage,
    sidebarVisible,
    toggleSidebar,
    closeSidebar,
    handleLogout,
    isAuthenticated,
    userDisplayName,
  }
}
