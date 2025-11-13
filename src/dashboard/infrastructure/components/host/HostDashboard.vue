<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Skeleton from 'primevue/skeleton';
import { useToast } from 'primevue/usetoast';

import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';
import { AuthApiService } from '@/auth-management/application/auth-api.service.js';
import { QuoteApiService } from '@/quote-management/application/services/quote-api.service.js';
import { QuoteOrder } from '@/quote-management/domain/model';
import { ProfileApiService } from '@/profile-management/application/profile-api.service.js';

import HostQuoteMetrics from './HostQuoteMetrics.vue';
import HostOrganizerBrowser from './HostOrganizerBrowser.vue';
import HostOrganizerDialog from './HostOrganizerDialog.vue';

const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const { user, restoreSession, isHost } = useAuth();

const isLoading = ref(false);
const hostOrganizers = ref([]);
const searchTerm = ref('');
const selectedCategory = ref('all');
const selectedOrganizer = ref(null);
const organizerDialogVisible = ref(false);
const hostQuoteStats = ref({
  total: 0,
  approved: 0,
  pending: 0,
  declined: 0,
});
const hostDataLoaded = ref(false);

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

const handleOrganizerProfile = (organizer) => {
  selectedOrganizer.value = organizer;
  organizerDialogVisible.value = true;
};

const goToQuotes = () => {
  router.push({ name: 'quotes' });
};

onMounted(() => {
  if (isHost.value) {
    loadHostDashboard();
  }
});

watch(isHost, (value) => {
  if (value) {
    loadHostDashboard();
  }
});

watch(organizerDialogVisible, (visible) => {
  if (!visible) {
    selectedOrganizer.value = null;
  }
});
</script>

<template>
  <div class="host-dashboard">
    <div v-if="isLoading" class="dashboard-loading">
      <Skeleton height="220px" class="mb-3" borderRadius="16px" />
      <Skeleton height="380px" borderRadius="16px" />
    </div>

    <template v-else>
      <HostQuoteMetrics :stats="hostQuoteStats" @view-quotes="goToQuotes" />

      <HostOrganizerBrowser
        :organizers="filteredOrganizers"
        :loading="isLoading"
        :data-loaded="hostDataLoaded"
        :categories="hostCategories"
        :search-term="searchTerm"
        :selected-category="selectedCategory"
        @update:search-term="(value) => (searchTerm.value = value)"
        @update:selected-category="(value) => (selectedCategory.value = value)"
        @view-profile="handleOrganizerProfile"
      />
    </template>

    <HostOrganizerDialog
      :organizer="selectedOrganizer"
      v-model:visible="organizerDialogVisible"
    />
  </div>
</template>

<style scoped>
.host-dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-loading {
  display: grid;
  gap: 1.5rem;
}

.mb-3 {
  margin-bottom: 1.5rem;
}
</style>
