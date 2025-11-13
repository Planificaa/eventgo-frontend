<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';

import HostDashboard from './host/HostDashboard.vue';
import OrganizerDashboard from './organizer/OrganizerDashboard.vue';

const { user, isHost } = useAuth();
const { t } = useI18n();

const currentUserName = computed(
  () => user.value?.name || t('dashboard.user.defaultName'),
);

const showHostView = computed(() => isHost.value);
const dashboardComponent = computed(() => {
  if (showHostView.value) {
    return HostDashboard;
  }

  return OrganizerDashboard;
});

const headerTitle = computed(() =>
  showHostView.value
    ? t('dashboard.host.welcome', { name: currentUserName.value })
    : t('dashboard.welcome', { name: currentUserName.value }),
);

const headerSubtitle = computed(() =>
  showHostView.value
    ? t('dashboard.host.subtitle')
    : t('dashboard.activitySummary'),
);
</script>

<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1 class="welcome-title">{{ headerTitle }}</h1>
      <p class="welcome-subtitle">{{ headerSubtitle }}</p>
    </header>

    <component :is="dashboardComponent" />
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.welcome-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1c2541;
  margin: 0;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: #4b5563;
  margin: 0;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1.5rem;
  }

  .welcome-title {
    font-size: 1.8rem;
  }
}
</style>
