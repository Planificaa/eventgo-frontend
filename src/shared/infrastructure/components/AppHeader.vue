<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// Idiomas
const languageOptions = ref([
  { name: 'English', code: 'en', flag: '🇺🇸' },
  { name: 'Spanish', code: 'es', flag: '🇪🇸' },
])
const selectedLanguage = ref(languageOptions.value.find((lang) => lang.code === locale.value))
const changeLanguage = (language) => {
  locale.value = language.code
  selectedLanguage.value = language
}

// Sidebar
const sidebarVisible = ref(false)
const toggleSidebar = () => { sidebarVisible.value = !sidebarVisible.value }

const closeSidebar = () => {
  sidebarVisible.value = false
}
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Botón hamburger -->
      <Button icon="pi pi-bars" @click="toggleSidebar" class="menu-toggle-btn" text />

      <!-- Logo -->
      <div class="logo-container">
        <img src="/src/assets/img/EventGO_logo.png" alt="EventGO" class="logo" />
      </div>

      <!-- Navegación principal -->
      <nav class="main-navigation">
        <RouterLink to="/dashboard" class="nav-item">
          <i class="pi pi-home"></i>
          <span>{{ $t('header.dashboard') }}</span>
        </RouterLink>
        <RouterLink to="/events" class="nav-item">
          <i class="pi pi-calendar"></i>
          <span>{{ $t('header.events') }}</span>
        </RouterLink>
        <RouterLink to="/tasks" class="nav-item">
          <i class="pi pi-check-square"></i>
          <span>{{ $t('header.task') }}</span>
        </RouterLink>
        <RouterLink to="/quotes" class="nav-item">
          <i class="pi pi-file-edit"></i>
          <span>{{ $t('header.quotes') }}</span>
        </RouterLink>
        <RouterLink to="/messages" class="nav-item">
          <i class="pi pi-envelope"></i>
          <span>{{ $t('header.messages') }}</span>
        </RouterLink>


      </nav>

      <!-- Zona de usuario -->
      <div class="user-zone">
        <Dropdown
          v-model="selectedLanguage"
          :options="languageOptions"
          optionLabel="name"
          @change="changeLanguage($event.value)"
          class="language-selector"
        >
          <template #value="slotProps">
            <span v-if="slotProps.value">{{ slotProps.value.flag }}</span>
          </template>
          <template #option="slotProps">
            <span>{{ slotProps.option.flag }} {{ slotProps.option.name }}</span>
          </template>
        </Dropdown>

        <Button icon="pi pi-cog" class="user-action-btn" text />

        <RouterLink to="/profile" class="user-profile">
          <Avatar
            class="user-avatar"
            shape="circle"
            image="https://www.gravatar.com/avatar/05dfd4b41340d09cae045235eb0893c3?d=mp"
          />
          <span class="user-name">Roberto Fox</span>
        </RouterLink>
      </div>
    </div>

    <!-- Sidebar para móvil -->
    <Sidebar v-model:visible="sidebarVisible" position="left" class="custom-sidebar">
      <template #header>
        <div class="sidebar-header">
          <div>
            <img class="logo" src="/src/assets/img/EventGO_logo.png" />
          </div>
        </div>
      </template>

      <nav class="sidebar-navigation">
        <RouterLink to="/dashboard" class="sidebar-nav-item" @click="closeSidebar">
          <i class="pi pi-home"></i>
          <span>{{ $t('header.dashboard') }}</span>
        </RouterLink>
        <RouterLink to="/events" class="sidebar-nav-item" @click="closeSidebar">
          <i class="pi pi-calendar"></i>
          <span>{{ $t('header.events') }}</span>
        </RouterLink>
        <RouterLink to="/tasks" class="sidebar-nav-item" @click="closeSidebar">
          <i class="pi pi-check-square"></i>
          <span>{{ $t('header.task') }}</span>
        </RouterLink>
        <RouterLink to="/quotes" class="sidebar-nav-item" @click="closeSidebar">
          <i class="pi pi-file-edit"></i>
          <span>{{ $t('header.quotes') }}</span>
        </RouterLink>
        <RouterLink to="/messages" class="sidebar-nav-item" @click="closeSidebar">
          <i class="pi pi-envelope"></i>
          <span>{{ $t('header.messages') }}</span>
        </RouterLink>
      </nav>
    </Sidebar>

  </header>
</template>
<style scoped>

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.user-profile:hover .user-name {
  color: #ffffff;
}

/* Header principal */
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #3a506b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
}

/* Logo */
.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 32px;
  width: auto;
}

/* Botón hamburger - oculto en desktop */
.menu-toggle-btn {
  display: none;
  color: #6fffe9 !important;
  background: transparent !important;
  border: none !important;
  padding: 0.5rem !important;
}

/* Navegación principal - visible en desktop */
.main-navigation {
  display: flex;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6fffe9;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-item:hover,
.nav-item.router-link-active {
  background: #5bc0be;
  color: #ffffff;
}

/* Zona de usuario */
.user-zone {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-action-btn {
  color: #6fffe9 !important;
  background: transparent !important;
  border: none !important;
  padding: 0.5rem !important;
  border-radius: 50% !important;
  transition: all 0.3s ease !important;
}

.user-action-btn:hover {
  background: #5bc0be !important;
  color: #ffffff !important;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 32px !important;
  height: 32px !important;
  background: #1c2541 !important;
  border: 2px solid #5bc0be !important;
}

.user-name {
  color: #6fffe9;
  font-weight: 500;
  font-size: 0.875rem;
}

/* Sidebar estilos */
.custom-sidebar {
  width: 280px !important;
}

.sidebar-header {
  padding: 1rem;
  color: #6fffe9;
  text-align: center;
}

.sidebar-navigation {
  padding: 1rem 0;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #1c2541;
  text-decoration: none;
  padding: 1rem 1.5rem;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.sidebar-nav-item:hover,
.sidebar-nav-item.router-link-active {
  background: #f0f9ff;
  border-left-color: #5bc0be;
  color: #1c2541;
}

/* RESPONSIVE - Móvil */
@media (max-width: 768px) {
  /* Mostrar hamburger, ocultar navegación */
  .menu-toggle-btn {
    display: flex !important;
  }

  .main-navigation {
    display: none;
  }

  /* Ocultar nombre de usuario en móvil */
  .user-name {
    display: none;
  }

  /* Compactar header */
  .header-container {
    padding: 0.5rem 1rem;
  }

  .logo {
    height: 28px;
  }
}

/* Sidebar estilos mejorados */
.app-header :deep(.p-sidebar) {
  width: 280px !important;
  background: #ffffff !important;
}

.app-header :deep(.p-sidebar-header) {
  background: #3a506b !important;
  border-bottom: 1px solid #5bc0be !important;
}

.sidebar-header {
  padding: 1.5rem;
  color: #6fffe9;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
}

.sidebar-navigation {
  padding: 1rem 0;
  background: #ffffff;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #1c2541;
  text-decoration: none;
  padding: 1rem 1.5rem;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  font-weight: 500;
}

.sidebar-nav-item i {
  font-size: 1.1rem;
  color: #3a506b;
}

.sidebar-nav-item:hover {
  background: #f0f9ff;
  border-left-color: #5bc0be;
  color: #1c2541;
}

.sidebar-nav-item.router-link-active {
  background: #e0f7fa;
  border-left-color: #5bc0be;
  color: #1c2541;
}

.sidebar-nav-item.router-link-active i {
  color: #5bc0be;
}

/* Selector de idioma */
.language-selector {
  min-width: 60px !important;
}

.language-selector :deep(.p-dropdown) {
  background: transparent !important;
  border: 1px solid #5bc0be !important;
  border-radius: 6px !important;
}

.language-selector :deep(.p-dropdown:not(.p-disabled):hover) {
  border-color: #6fffe9 !important;
}

.language-selector :deep(.p-dropdown-trigger) {
  color: #6fffe9 !important;
}

.language-selector :deep(.p-dropdown-label) {
  color: #6fffe9 !important;
  font-size: 1.2rem;
  padding: 0.25rem 0.5rem !important;
}

/* Panel del dropdown */
.language-selector :deep(.p-dropdown-panel) {
  background: #ffffff !important;
  border: 1px solid #5bc0be !important;
  border-radius: 6px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.language-selector :deep(.p-dropdown-item) {
  color: #1c2541 !important;
  padding: 0.75rem 1rem !important;
}

.language-selector :deep(.p-dropdown-item:hover) {
  background: #f0f9ff !important;
  color: #1c2541 !important;
}

/* Responsive - ocultar en móvil si es necesario */
@media (max-width: 768px) {
  .language-selector {
    min-width: 50px !important;
  }

  .language-selector :deep(.p-dropdown-label) {
    font-size: 1rem;
  }
}
</style>
