<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Rating from 'primevue/rating';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';

import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';
import { AuthApiService } from '@/auth-management/application/auth-api.service.js';
import { QuoteApiService } from '@/quote-management/application/services/quote-api.service.js';
import { QuoteOrder } from '@/quote-management/domain/model';
import { ProfileApiService } from '@/profile-management/application/profile-api.service.js';

const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const { user, restoreSession, isOrganizer, isHost } = useAuth();

const selectedDate = ref(new Date());
const isLoading = ref(false);
const hostOrganizers = ref([]);
const searchTerm = ref('');
const selectedCategory = ref('all');
const selectedOrganizer = ref(null);
const organizerDialogVisible = ref(false);
const organizerDashboard = ref({
  activeEvents: 0,
  eventsThisWeek: 0,
  pendingTasks: 0,
  tasksToday: 0,
  quotes: 0,
  newQuotesWeek: 0,
});
const organizerMessages = ref([]);
const hostQuoteStats = ref({
  total: 0,
  approved: 0,
  pending: 0,
  declined: 0,
});
const hostDataLoaded = ref(false);
const organizerDataLoaded = ref(false);

const hostCategories = computed(() => {
  const categories = new Set();
  hostOrganizers.value.forEach((organizer) => {
    if (Array.isArray(organizer.eventTypes)) {
      organizer.eventTypes.forEach((type) => categories.add(type));
    }
  });
  return ['all', ...categories];
});

const filteredOrganizers = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  const category = selectedCategory.value;
  return hostOrganizers.value.filter((organizer) => {
    const texts = [
      organizer.name,
      organizer.specialty,
      organizer.description,
      ...(organizer.eventTypes || []),
    ]
      .filter(Boolean)
      .map((text) => text.toLowerCase());

    const matchesTerm = !term || texts.some((text) => text.includes(term));
    const matchesCategory =
      category === 'all' ||
      (organizer.eventTypes || []).some(
        (type) => type.toLowerCase() === category.toLowerCase(),
      );

    return matchesTerm && matchesCategory;
  });
});

const currentUserName = computed(
  () => user.value?.name || t('dashboard.user.defaultName'),
);

const showHostView = computed(() => isHost.value);

const ensureSession = async () => {
  if (!user.value) {
    await restoreSession();
  }
};

const loadHostDashboard = async () => {
  isLoading.value = true;
  hostDataLoaded.value = false;
  try {
    await ensureSession();

    const [organizersResponse, quotesResponse, apiUser] = await Promise.all([
      ProfileApiService.getAll(),
      QuoteApiService.getAll(),
      user.value?.id ? AuthApiService.fetchUsers({ id: user.value.id }) : [],
    ]);

    const normalizedOrganizers = Array.isArray(organizersResponse)
      ? organizersResponse.map((organizer) => ({
          id: organizer.id,
          name: organizer.name,
          specialty: organizer.specialty || organizer.role || '',
          rating: organizer.rating || 0,
          completedEvents: organizer.completedEvents || 0,
          avatar: organizer.avatar || '',
          location: organizer.location || '',
          description: organizer.description || '',
          eventTypes: organizer.eventTypes || [],
          priceRange: organizer.priceRange || '',
          languages: organizer.languages || [],
          contact: organizer.contact || {},
          highlights: organizer.highlights || [],
        }))
      : [];

    hostOrganizers.value = normalizedOrganizers;

    const userId = user.value?.id ? String(user.value.id) : null;
    const userQuotes = Array.isArray(quotesResponse)
      ? quotesResponse
          .map((data) => QuoteOrder.fromJSON(data))
          .filter((quoteOrder) => {
            const customerId = quoteOrder.customer?.id
              ? String(quoteOrder.customer.id)
              : null;
            const ownerId = quoteOrder.ownerId ? String(quoteOrder.ownerId) : null;
            return customerId === userId || ownerId === userId;
          })
      : [];

    const stats = userQuotes.reduce(
      (acc, quoteOrder) => {
        acc.total += 1;
        if (quoteOrder.state === QuoteOrder.STATES.APPROVED) {
          acc.approved += 1;
        } else if (quoteOrder.state === QuoteOrder.STATES.PENDING) {
          acc.pending += 1;
        } else if (quoteOrder.state === QuoteOrder.STATES.DECLINED) {
          acc.declined += 1;
        }
        return acc;
      },
      { total: 0, approved: 0, pending: 0, declined: 0 },
    );

    hostQuoteStats.value = stats;

    const [hostRecord] = Array.isArray(apiUser) ? apiUser : [];
    if (hostRecord?.dashboard) {
      const { dashboard } = hostRecord;
      hostQuoteStats.value.total =
        dashboard.totalQuotes ?? hostQuoteStats.value.total;
      hostQuoteStats.value.approved =
        dashboard.approvedQuotes ?? hostQuoteStats.value.approved;
      hostQuoteStats.value.pending =
        dashboard.pendingQuotes ?? hostQuoteStats.value.pending;
      hostQuoteStats.value.declined =
        dashboard.declinedQuotes ?? hostQuoteStats.value.declined;
    }

    hostDataLoaded.value = true;
  } catch (error) {
    console.error('Error loading host dashboard:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('dashboard.messages.loadError'),
      life: 5000,
    });
  } finally {
    isLoading.value = false;
  }
};

const loadOrganizerDashboard = async () => {
  isLoading.value = true;
  organizerDataLoaded.value = false;
  try {
    await ensureSession();

    const [quotesResponse, apiUser] = await Promise.all([
      QuoteApiService.getAll(),
      user.value?.id ? AuthApiService.fetchUsers({ id: user.value.id }) : [],
    ]);

    const userId = user.value?.id ? String(user.value.id) : null;
    const organizerQuotes = Array.isArray(quotesResponse)
      ? quotesResponse
          .map((data) => QuoteOrder.fromJSON(data))
          .filter((quoteOrder) => {
            const organizerId = quoteOrder.organizer?.id
              ? String(quoteOrder.organizer.id)
              : null;
            const ownerId = quoteOrder.ownerId ? String(quoteOrder.ownerId) : null;
            return organizerId === userId || ownerId === userId;
          })
      : [];

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const metrics = organizerQuotes.reduce(
      (acc, quoteOrder) => {
        if (quoteOrder.state === QuoteOrder.STATES.APPROVED) {
          acc.approvedQuotes += 1;
        } else if (quoteOrder.state === QuoteOrder.STATES.PENDING) {
          acc.pendingQuotes += 1;
        }

        if (quoteOrder.event?.date) {
          const eventDate = new Date(quoteOrder.event.date);
          if (eventDate >= startOfWeek && eventDate <= endOfWeek) {
            acc.eventsThisWeek += 1;
          }
        }
        return acc;
      },
      { approvedQuotes: 0, pendingQuotes: 0, eventsThisWeek: 0 },
    );

    const [organizerRecord] = Array.isArray(apiUser) ? apiUser : [];
    const dashboardData = organizerRecord?.dashboard || {};

    organizerDashboard.value = {
      activeEvents: dashboardData.activeEvents ?? metrics.approvedQuotes,
      eventsThisWeek: dashboardData.eventsThisWeek ?? metrics.eventsThisWeek,
      pendingTasks: dashboardData.pendingTasks ?? 0,
      tasksToday: dashboardData.tasksToday ?? 0,
      quotes: organizerQuotes.length,
      newQuotesWeek: dashboardData.newQuotesWeek ?? metrics.pendingQuotes,
    };

    organizerMessages.value = dashboardData.recentMessages || [];
    organizerDataLoaded.value = true;
  } catch (error) {
    console.error('Error loading organizer dashboard:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('dashboard.messages.loadError'),
      life: 5000,
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (showHostView.value) {
    loadHostDashboard();
  } else {
    loadOrganizerDashboard();
  }
});

watch(isHost, (value) => {
  if (value) {
    loadHostDashboard();
  }
});

watch(isOrganizer, (value) => {
  if (value) {
    loadOrganizerDashboard();
  }
});

watch(organizerDialogVisible, (visible) => {
  if (!visible) {
    selectedOrganizer.value = null;
  }
});

const handleOrganizerProfile = (organizer) => {
  selectedOrganizer.value = organizer;
  organizerDialogVisible.value = true;
};

const goToQuotes = () => {
  router.push({ name: 'quotes' });
};
</script>

<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1 class="welcome-title">
        {{
          showHostView
            ? t('dashboard.host.welcome', { name: currentUserName })
            : t('dashboard.welcome', { name: currentUserName })
        }}
      </h1>
      <p class="welcome-subtitle">
        {{
          showHostView
            ? t('dashboard.host.subtitle')
            : t('dashboard.activitySummary')
        }}
      </p>
    </header>

    <div v-if="isLoading" class="dashboard-loading">
      <Skeleton height="220px" class="mb-3" borderRadius="16px" />
      <Skeleton height="380px" borderRadius="16px" />
    </div>

    <main v-else class="dashboard-content">
      <template v-if="showHostView">
        <section class="host-metrics">
          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <h3 class="metric-title">{{ t('dashboard.host.metrics.totalQuotes') }}</h3>
                <p class="metric-value metric-value--primary">{{ hostQuoteStats.total }}</p>
                <p class="metric-subtitle">{{ t('dashboard.host.metrics.totalQuotesSubtitle') }}</p>
                <Button text class="metric-link" @click="goToQuotes">
                  {{ t('dashboard.host.actions.viewQuotes') }}
                </Button>
              </div>
            </template>
          </Card>

          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <h3 class="metric-title">{{ t('dashboard.host.metrics.pendingQuotes') }}</h3>
                <p class="metric-value metric-value--warning">{{ hostQuoteStats.pending }}</p>
                <p class="metric-subtitle">{{ t('dashboard.host.metrics.pendingQuotesSubtitle') }}</p>
              </div>
            </template>
          </Card>

          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <h3 class="metric-title">{{ t('dashboard.host.metrics.approvedQuotes') }}</h3>
                <p class="metric-value metric-value--success">{{ hostQuoteStats.approved }}</p>
                <p class="metric-subtitle">{{ t('dashboard.host.metrics.approvedQuotesSubtitle') }}</p>
              </div>
            </template>
          </Card>

          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <h3 class="metric-title">{{ t('dashboard.host.metrics.declinedQuotes') }}</h3>
                <p class="metric-value metric-value--danger">{{ hostQuoteStats.declined }}</p>
                <p class="metric-subtitle">{{ t('dashboard.host.metrics.declinedQuotesSubtitle') }}</p>
              </div>
            </template>
          </Card>
        </section>

        <section class="organizer-browser">
          <div class="browser-header">
            <div>
              <h2 class="section-title">{{ t('dashboard.host.organizerBrowser.title') }}</h2>
              <p class="section-subtitle">{{ t('dashboard.host.organizerBrowser.subtitle') }}</p>
            </div>
            <div class="browser-filters">
              <span class="p-input-icon-left search-wrapper">
                <i class="pi pi-search" />
                <InputText
                  v-model="searchTerm"
                  :placeholder="t('dashboard.host.organizerBrowser.search')"
                />
              </span>
              <Dropdown
                v-model="selectedCategory"
                :options="hostCategories"
                :placeholder="t('dashboard.host.organizerBrowser.filterPlaceholder')"
                optionLabel=""
                class="category-dropdown"
              >
                <template #value="{ value }">
                  <span>{{ value === 'all' ? t('dashboard.host.organizerBrowser.allCategories') : value }}</span>
                </template>
                <template #option="{ option }">
                  <span>{{ option === 'all' ? t('dashboard.host.organizerBrowser.allCategories') : option }}</span>
                </template>
              </Dropdown>
            </div>
          </div>

          <div v-if="hostDataLoaded && filteredOrganizers.length" class="organizer-grid">
            <Card
              v-for="organizer in filteredOrganizers"
              :key="organizer.id"
              class="organizer-card"
            >
              <template #content>
                <div class="organizer-card__header">
                  <Avatar
                    :image="organizer.avatar"
                    :label="organizer.name.charAt(0)"
                    size="large"
                    shape="circle"
                  />
                  <div>
                    <h3 class="organizer-name">{{ organizer.name }}</h3>
                    <p class="organizer-specialty">{{ organizer.specialty }}</p>
                  </div>
                </div>
                <div class="organizer-card__body">
                  <div class="organizer-rating">
                    <Rating :modelValue="organizer.rating" :readonly="true" :cancel="false" />
                    <span class="rating-value">{{ organizer.rating.toFixed(1) }}</span>
                  </div>
                  <p class="organizer-description">{{ organizer.description }}</p>
                  <div class="organizer-tags">
                    <Tag
                      v-for="type in organizer.eventTypes"
                      :key="type"
                      severity="info"
                      :value="type"
                      rounded
                    />
                  </div>
                </div>
                <div class="organizer-card__footer">
                  <Button
                    :label="t('dashboard.host.organizerBrowser.viewProfile')"
                    class="view-profile-btn"
                    @click="handleOrganizerProfile(organizer)"
                  />
                </div>
              </template>
            </Card>
          </div>

          <div v-else-if="hostDataLoaded" class="empty-organizers">
            <i class="pi pi-users" />
            <p>{{ t('dashboard.host.organizerBrowser.empty') }}</p>
          </div>
        </section>
      </template>

      <template v-else>
        <section v-if="organizerDataLoaded" class="metrics-section">
          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <h3 class="metric-title">{{ t('dashboard.metrics.activeEvents.title') }}</h3>
                <p class="metric-value metric-value--purple">{{ organizerDashboard.activeEvents }}</p>
                <p class="metric-subtitle">
                  {{ t('dashboard.metrics.activeEvents.subtitle', { count: organizerDashboard.eventsThisWeek }) }}
                </p>
                <Button text class="metric-link" @click="router.push('/events')">
                  {{ t('dashboard.seeAll') }}
                </Button>
              </div>
            </template>
          </Card>

          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <h3 class="metric-title">{{ t('dashboard.metrics.pendingTasks.title') }}</h3>
                <p class="metric-value metric-value--orange">{{ organizerDashboard.pendingTasks }}</p>
                <p class="metric-subtitle">
                  {{ t('dashboard.metrics.pendingTasks.subtitle', { count: organizerDashboard.tasksToday }) }}
                </p>
                <Button text class="metric-link" @click="router.push('/tasks')">
                  {{ t('dashboard.viewAll') }}
                </Button>
              </div>
            </template>
          </Card>

          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <h3 class="metric-title">{{ t('dashboard.metrics.quotes.title') }}</h3>
                <p class="metric-value metric-value--green">{{ organizerDashboard.quotes }}</p>
                <p class="metric-subtitle">
                  {{ t('dashboard.metrics.quotes.subtitle', { count: organizerDashboard.newQuotesWeek }) }}
                </p>
                <Button text class="metric-link" @click="goToQuotes">
                  {{ t('dashboard.seeAll') }}
                </Button>
              </div>
            </template>
          </Card>
        </section>

        <section v-else class="dashboard-loading">
          <Skeleton height="220px" class="mb-3" borderRadius="16px" />
        </section>

        <section class="content-grid">
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

          <aside class="messages-container">
            <h2 class="section-title">{{ t('dashboard.recentMessages.title') }}</h2>

            <Card
              v-if="organizerMessages.length === 0"
              class="message-card message-card--empty"
            >
              <template #content>
                <div class="message-content">
                  <i class="pi pi-inbox empty-icon"></i>
                  <p>{{ t('dashboard.recentMessages.empty') }}</p>
                </div>
              </template>
            </Card>

            <Card
              v-for="message in organizerMessages"
              :key="message.id"
              class="message-card"
            >
              <template #content>
                <div class="message-content">
                  <h4 class="message-sender">{{ message.sender }}</h4>
                  <p class="message-preview">{{ message.preview }}</p>
                  <small class="message-time">{{ message.time }}</small>
                </div>
              </template>
            </Card>

            <Button text class="messages-link" @click="router.push('/messages')">
              {{ t('dashboard.recentMessages.seeAll') }}
            </Button>
          </aside>
        </section>
      </template>
    </main>

    <Dialog
      v-model:visible="organizerDialogVisible"
      modal
      :style="{ width: '480px' }"
      :header="selectedOrganizer?.name || ''"
    >
      <template v-if="selectedOrganizer">
        <div class="organizer-dialog">
          <div class="organizer-dialog__header">
            <Avatar
              :image="selectedOrganizer.avatar"
              :label="selectedOrganizer.name.charAt(0)"
              size="xlarge"
              shape="circle"
            />
            <div>
              <h3>{{ selectedOrganizer.name }}</h3>
              <p>{{ selectedOrganizer.specialty }}</p>
              <div class="organizer-rating">
                <Rating :modelValue="selectedOrganizer.rating" :readonly="true" :cancel="false" />
                <span class="rating-value">{{ selectedOrganizer.rating.toFixed(1) }}</span>
              </div>
            </div>
          </div>

          <p class="organizer-dialog__description">{{ selectedOrganizer.description }}</p>

          <div class="organizer-dialog__section">
            <h4>{{ t('dashboard.host.organizerBrowser.details.eventTypes') }}</h4>
            <div class="organizer-tags">
              <Tag
                v-for="type in selectedOrganizer.eventTypes"
                :key="type"
                severity="info"
                :value="type"
                rounded
              />
            </div>
          </div>

          <div class="organizer-dialog__section" v-if="selectedOrganizer.location">
            <h4>{{ t('dashboard.host.organizerBrowser.details.location') }}</h4>
            <p>{{ selectedOrganizer.location }}</p>
          </div>

          <div class="organizer-dialog__section" v-if="selectedOrganizer.contact?.email || selectedOrganizer.contact?.phone">
            <h4>{{ t('dashboard.host.organizerBrowser.details.contact') }}</h4>
            <ul class="organizer-contact">
              <li v-if="selectedOrganizer.contact?.email">
                <i class="pi pi-envelope"></i>
                <span>{{ selectedOrganizer.contact.email }}</span>
              </li>
              <li v-if="selectedOrganizer.contact?.phone">
                <i class="pi pi-phone"></i>
                <span>{{ selectedOrganizer.contact.phone }}</span>
              </li>
            </ul>
          </div>

          <div class="organizer-dialog__section" v-if="selectedOrganizer.highlights?.length">
            <h4>{{ t('dashboard.host.organizerBrowser.details.highlights') }}</h4>
            <ul class="organizer-highlights">
              <li v-for="highlight in selectedOrganizer.highlights" :key="highlight">
                <i class="pi pi-check-circle"></i>
                <span>{{ highlight }}</span>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 70px);
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
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

.dashboard-loading {
  display: grid;
  gap: 1.5rem;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.metrics-section,
.host-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(28, 37, 65, 0.08);
  border: none;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1c2541;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
}

.metric-value--primary {
  color: #3a506b;
}

.metric-value--warning {
  color: #f59e0b;
}

.metric-value--success {
  color: #22c55e;
}

.metric-value--danger {
  color: #ef4444;
}

.metric-value--purple {
  color: #6b21a8;
}

.metric-value--orange {
  color: #f97316;
}

.metric-value--green {
  color: #15803d;
}

.metric-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.metric-link {
  align-self: flex-start;
  color: #3a506b;
  font-weight: 600;
  padding: 0;
}

.metric-link:hover {
  color: #5bc0be;
}

.organizer-browser {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.browser-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c2541;
  margin: 0;
}

.section-subtitle {
  color: #6b7280;
  margin: 0.25rem 0 0;
}

.browser-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-wrapper {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background-color: #ffffff;
  padding-left: 1rem;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.1);
}

.search-wrapper :deep(.p-inputtext) {
  border: none;
  background: transparent;
}

.category-dropdown {
  min-width: 180px;
}

.organizer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.organizer-card {
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(28, 37, 65, 0.08);
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.organizer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 50px rgba(28, 37, 65, 0.15);
}

.organizer-card__header {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.organizer-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #1c2541;
}

.organizer-specialty {
  margin: 0.15rem 0 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.organizer-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: #4b5563;
}

.organizer-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f59e0b;
}

.rating-value {
  font-weight: 600;
  color: #1c2541;
}

.organizer-description {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #4b5563;
}

.organizer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.organizer-card__footer {
  display: flex;
  justify-content: flex-end;
}

.view-profile-btn {
  background-color: #3a506b;
  border: none;
  color: #ffffff;
}

.view-profile-btn:hover {
  background-color: #5bc0be;
}

.empty-organizers {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 16px 32px rgba(28, 37, 65, 0.08);
  color: #6b7280;
  text-align: center;
}

.empty-organizers i {
  font-size: 2rem;
  color: #3a506b;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 1.5rem;
}

.calendar-card,
.messages-container {
  border-radius: 16px;
  box-shadow: 0 16px 32px rgba(28, 37, 65, 0.08);
  border: none;
  background: #ffffff;
}

.dashboard-calendar {
  width: 100%;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
}

.message-card {
  border: none;
  box-shadow: none;
  background-color: #f9fafb;
}

.message-card--empty {
  align-items: center;
  justify-content: center;
  text-align: center;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message-sender {
  font-weight: 600;
  color: #1c2541;
  margin: 0;
}

.message-preview {
  color: #4b5563;
  font-size: 0.95rem;
  margin: 0;
}

.message-time {
  color: #9ca3af;
  font-size: 0.85rem;
}

.messages-link {
  align-self: flex-start;
  color: #3a506b;
  font-weight: 600;
  padding: 0;
}

.messages-link:hover {
  color: #5bc0be;
}

.organizer-dialog {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.organizer-dialog__header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.organizer-dialog__description {
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

.organizer-dialog__section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.organizer-contact,
.organizer-highlights {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: #4b5563;
}

.organizer-contact i,
.organizer-highlights i {
  margin-right: 0.5rem;
  color: #3a506b;
}

@media (max-width: 992px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1.5rem;
  }

  .welcome-title {
    font-size: 1.8rem;
  }

  .metrics-section,
  .host-metrics {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
</style>
