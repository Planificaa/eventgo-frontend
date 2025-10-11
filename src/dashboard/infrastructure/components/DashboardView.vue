<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Calendar from 'primevue/calendar';

// Composables
const router = useRouter();
const { t } = useI18n();

// User Data
const userName = ref('Roberto Fox');

// Metrics Data - En producción vendrían de una API
const activeEvents = ref(5);
const eventsThisWeek = ref(2);
const pendingTasks = ref(12);
const tasksToday = ref(4);
const quotes = ref(3);
const newQuotesWeek = ref(1);

// Calendar
const selectedDate = ref(new Date());

// Recent Messages - En producción vendrían de una API
const recentMessages = ref([
  {
    id: 1,
    sender: 'Laura Gomez',
    preview: 'Can we review the details...'
  },
  {
    id: 2,
    sender: 'Miguel Angel',
    preview: 'I confirm the meeting tomorrow...'
  },
  {
    id: 3,
    sender: 'Company',
    preview: 'We need a quote for...'
  }
]);

// Computed properties
const hasMessages = computed(() => recentMessages.value.length > 0);
</script>
<template>
  <div class="dashboard-container">
    <!-- Welcome Section -->
    <header class="dashboard-header">
      <h1 class="welcome-title">{{ $t('dashboard.welcome', { name: userName }) }}</h1>
      <p class="welcome-subtitle">{{ $t('dashboard.activitySummary') }}</p>
    </header>

    <!-- Main Content -->
    <main class="dashboard-content">
      <!-- Metrics Cards Section -->
      <section class="metrics-section">
        <!-- Active Events Card -->
        <Card class="metric-card">
          <template #content>
            <div class="metric-content">
              <h3 class="metric-title">{{ $t('dashboard.metrics.activeEvents.title') }}</h3>
              <p class="metric-value metric-value--purple">{{ activeEvents }}</p>
              <p class="metric-subtitle">{{ $t('dashboard.metrics.activeEvents.subtitle', { count: eventsThisWeek }) }}</p>
              <RouterLink to="/events" class="metric-link">
                {{ $t('dashboard.seeAll') }}
              </RouterLink>
            </div>
          </template>
        </Card>

        <!-- Pending Tasks Card -->
        <Card class="metric-card">
          <template #content>
            <div class="metric-content">
              <h3 class="metric-title">{{ $t('dashboard.metrics.pendingTasks.title') }}</h3>
              <p class="metric-value metric-value--orange">{{ pendingTasks }}</p>
              <p class="metric-subtitle">{{ $t('dashboard.metrics.pendingTasks.subtitle', { count: tasksToday }) }}</p>
              <RouterLink to="/tasks" class="metric-link">
                {{ $t('dashboard.viewAll') }}
              </RouterLink>
            </div>
          </template>
        </Card>

        <!-- Quotes Card -->
        <Card class="metric-card">
          <template #content>
            <div class="metric-content">
              <h3 class="metric-title">{{ $t('dashboard.metrics.quotes.title') }}</h3>
              <p class="metric-value metric-value--green">{{ quotes }}</p>
              <p class="metric-subtitle">{{ $t('dashboard.metrics.quotes.subtitle', { count: newQuotesWeek }) }}</p>
              <RouterLink to="/quotes" class="metric-link">
                {{ $t('dashboard.seeAll') }}
              </RouterLink>
            </div>
          </template>
        </Card>
      </section>

      <!-- Calendar and Messages Section -->
      <section class="content-grid">
        <!-- Calendar Section -->
        <div class="calendar-container">
          <Card class="calendar-card">
            <template #content>
              <Calendar
                v-model="selectedDate"
                inline
                :showWeek="true"
                class="dashboard-calendar"
              />
            </template>
          </Card>
        </div>

        <!-- Recent Messages Section -->
        <aside class="messages-container">
          <h2 class="section-title">{{ $t('dashboard.recentMessages.title') }}</h2>

          <Card
            v-for="message in recentMessages"
            :key="message.id"
            class="message-card"
          >
            <template #content>
              <div class="message-content">
                <h4 class="message-sender">{{ message.sender }}</h4>
                <p class="message-preview">{{ message.preview }}</p>
              </div>
            </template>
          </Card>

          <RouterLink to="/messages" class="messages-link">
            {{ $t('dashboard.recentMessages.seeAll') }}
          </RouterLink>
        </aside>
      </section>
    </main>
  </div>
</template>
<style scoped>
/* Variables del proyecto */
:root {
  --color-primary: #3A506B;
  --color-text-primary: #6FFFE9;
  --color-text-hover: #FFFFFF;
  --color-accent: #5BC0BE;
  --color-dark: #1C2541;
}

/* Container Principal */
.dashboard-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 70px);
}

/* Welcome Header */
.dashboard-header {
  margin-bottom: 2rem;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  font-size: 1rem;
  color: #64748b;
}

/* Main Content */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Metrics Section */
.metrics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: white;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Personalización de PrimeVue Card */
.metric-card :deep(.p-card-body) {
  padding: 1.5rem;
}

.metric-card :deep(.p-card-content) {
  padding: 0;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-title {
  font-size: 1rem;
  font-weight: 500;
  color: #475569;
  margin: 0;
}

.metric-value {
  font-size: 3rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.metric-value--purple {
  color: #8b5cf6;
}

.metric-value--orange {
  color: #f97316;
}

.metric-value--green {
  color: #10b981;
}

.metric-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.metric-link {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  align-self: flex-end;
  transition: color 0.2s;
}

.metric-link:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

/* Content Grid (Calendar + Messages) */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* Calendar Container */
.calendar-container {
  width: 100%;
}

.calendar-card {
  background: white;
  border-radius: 12px;
}

.calendar-card :deep(.p-card-body) {
  padding: 1rem;
}

.calendar-card :deep(.p-card-content) {
  padding: 0;
}

/* Personalización del Calendar de PrimeVue */
.dashboard-calendar :deep(.p-datepicker) {
  width: 100%;
  border: none;
}

.dashboard-calendar :deep(.p-datepicker-header) {
  background: var(--color-primary);
  color: white;
  border-radius: 8px 8px 0 0;
}

.dashboard-calendar :deep(.p-datepicker-title) {
  color: white;
}

.dashboard-calendar :deep(.p-datepicker-prev),
.dashboard-calendar :deep(.p-datepicker-next) {
  color: white;
}

.dashboard-calendar :deep(.p-highlight) {
  background: var(--color-accent);
  color: white;
}

/* Messages Container */
.messages-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-dark);
  margin: 0 0 1rem 0;
}

.message-card {
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.message-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.message-card :deep(.p-card-body) {
  padding: 1rem;
}

.message-card :deep(.p-card-content) {
  padding: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message-sender {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-dark);
  margin: 0;
}

.message-preview {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.messages-link {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: 500;
  text-align: right;
  margin-top: 0.5rem;
  transition: color 0.2s;
}

.messages-link:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .messages-container {
    order: -1; /* Mostrar mensajes primero en tablet */
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .metrics-section {
    grid-template-columns: 1fr;
  }

  .metric-value {
    font-size: 2.5rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    margin-bottom: 1.5rem;
  }

  .welcome-title {
    font-size: 1.25rem;
  }

  .welcome-subtitle {
    font-size: 0.875rem;
  }

  .metric-value {
    font-size: 2rem;
  }
}
</style>
