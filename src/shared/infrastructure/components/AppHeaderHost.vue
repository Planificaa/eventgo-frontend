<script setup>
import Divider from 'primevue/divider'
import { useAppHeader } from './useAppHeader.js'

const navigationItems = [
  {
    key: 'dashboard',
    icon: 'pi pi-home',
    labelKey: 'header.dashboard',
    to: '/host/dashboard',
  },
  {
    key: 'events',
    icon: 'pi pi-calendar',
    labelKey: 'header.events',
    to: '/events',
  },
  {
    key: 'quotes',
    icon: 'pi pi-file-edit',
    labelKey: 'header.quotes',
    to: '/quotes',
  },
  {
    key: 'messages',
    icon: 'pi pi-envelope',
    labelKey: 'header.messages',
    to: '/messages',
  },
]

const {
  languageOptions,
  selectedLanguage,
  changeLanguage,
  sidebarVisible,
  toggleSidebar,
  closeSidebar,
  handleLogout,
  isAuthenticated,
  userDisplayName,
} = useAppHeader()
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <Button icon="pi pi-bars" @click="toggleSidebar" class="menu-toggle-btn" text />

      <div class="logo-container">
        <img src="/src/assets/img/EventGO_logo.png" alt="EventGO" class="logo" />
      </div>

      <nav class="main-navigation">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.key"
          :to="item.to"
          class="nav-item"
        >
          <i :class="item.icon"></i>
          <span>{{ $t(item.labelKey) }}</span>
        </RouterLink>
      </nav>

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

        <RouterLink to="/notifications" class="user-action-btn" title="Notificaciones">
          <i class="pi pi-bell"></i>
        </RouterLink>

        <RouterLink to="/settings" class="user-action-btn" title="Configuración">
          <i class="pi pi-cog"></i>
        </RouterLink>

        <RouterLink to="/profile" class="user-profile" v-if="isAuthenticated">
          <Avatar
            class="user-avatar"
            shape="circle"
            image="https://www.gravatar.com/avatar/05dfd4b41340d09cae045235eb0893c3?d=mp"
          />
          <span class="user-name">{{ userDisplayName }}</span>
        </RouterLink>

        <Button
          v-if="isAuthenticated"
          icon="pi pi-sign-out"
          label="Sign Out"
          @click="handleLogout"
          class="p-button-danger p-button-sm"
        />
      </div>
    </div>

    <Sidebar v-model:visible="sidebarVisible" position="left" class="custom-sidebar">
      <template #header>
        <div class="sidebar-header">
          <div>
            <img class="logo" src="/src/assets/img/EventGO_logo.png" />
          </div>
        </div>
      </template>

      <nav class="sidebar-navigation">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.key"
          :to="item.to"
          class="sidebar-nav-item"
          @click="closeSidebar"
        >
          <i :class="item.icon"></i>
          <span>{{ $t(item.labelKey) }}</span>
        </RouterLink>
        <Divider />
        <RouterLink to="/notifications" class="sidebar-nav-item" @click="closeSidebar">
          <i class="pi pi-bell"></i>
          <span>Notificaciones</span>
        </RouterLink>
        <RouterLink to="/settings" class="sidebar-nav-item" @click="closeSidebar">
          <i class="pi pi-cog"></i>
          <span>Configuración</span>
        </RouterLink>
        <Divider />
        <Button
          label="Cerrar Sesión"
          icon="pi pi-sign-out"
          @click="handleLogout"
          class="p-button-danger p-button-text w-full text-left p-3"
        />
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

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 32px;
  width: auto;
}

.menu-toggle-btn {
  display: none;
  color: #6fffe9 !important;
  background: transparent !important;
  border: none !important;
  padding: 0.5rem !important;
}

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

@media (max-width: 768px) {
  .menu-toggle-btn {
    display: flex !important;
  }

  .main-navigation {
    display: none;
  }

  .user-name {
    display: none;
  }

  .header-container {
    padding: 0.5rem 1rem;
  }

  .logo {
    height: 28px;
  }
}

.app-header :deep(.p-sidebar) {
  width: 280px !important;
  background: #ffffff !important;
}

.app-header :deep(.p-sidebar-header) {
  background: #3a506b !important;
  border-bottom: 1px solid #5bc0be !important;
}

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

@media (max-width: 768px) {
  .language-selector {
    min-width: 50px !important;
  }

  .language-selector :deep(.p-dropdown-label) {
    font-size: 1rem;
  }
}
</style>
