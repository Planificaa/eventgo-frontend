<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';
import { ProfileApiService } from '@/profile-management/application/profile-api.service.js';
import { QuoteApiService } from '@/quote-management/application/services/quote-api.service.js';
import { QuoteOrder } from '@/quote-management/domain/model';

import HostDashboardSidebar from './HostDashboardSidebar.vue';
import HostHeroFilters from './HostHeroFilters.vue';
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
const currentPage = ref(1);
const itemsPerPage = 6;
const filtersExpanded = ref(true);
const selectedOrganizer = ref(null);
const organizerDialogVisible = ref(false);
const hostDataLoaded = ref(false);
const quoteStats = ref({ total: 0, approved: 0, pending: 0, declined: 0 });
const activeSidebarItem = ref('organizers');

const ensureSession = async () => {
  if (!user.value) {
    await restoreSession();
  }
};

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
      organizer.location,
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

const totalPages = computed(() => {
  const total = filteredOrganizers.value.length;
  return total > 0 ? Math.ceil(total / itemsPerPage) : 1;
});

const paginatedOrganizers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredOrganizers.value.slice(start, end);
});

const canClearFilters = computed(
  () => selectedCategory.value !== 'all' || searchTerm.value.trim().length > 0,
);

const toggleFilters = () => {
  filtersExpanded.value = !filtersExpanded.value;
};

const resetFilters = () => {
  searchTerm.value = '';
  selectedCategory.value = 'all';
};

const openOrganizerProfile = (organizer) => {
  selectedOrganizer.value = organizer;
  organizerDialogVisible.value = true;
};

const navigateToQuotes = () => {
  router.push({ name: 'quotes' }).catch(() => {
    toast.add({
      severity: 'warn',
      summary: t('common.warning'),
      detail: t('dashboard.host.messages.unableToNavigateQuotes'),
      life: 3000,
    });
  });
};

const deriveQuoteStats = (quotes = []) => {
  const stats = quotes.reduce(
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

  quoteStats.value = stats;
};

const loadHostDashboard = async () => {
  isLoading.value = true;
  hostDataLoaded.value = false;
  try {
    await ensureSession();

    const [organizersResponse, quotesResponse] = await Promise.all([
      ProfileApiService.getAll(),
      QuoteApiService.getAll(),
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
    currentPage.value = 1;

    const hostId = user.value?.id ? String(user.value.id) : null;
    const hostQuotes = Array.isArray(quotesResponse)
      ? quotesResponse
          .map((data) => QuoteOrder.fromJSON(data))
          .filter((quoteOrder) => {
            const ownerId = quoteOrder.ownerId ? String(quoteOrder.ownerId) : null;
            return ownerId && hostId && ownerId === hostId;
          })
      : [];

    deriveQuoteStats(hostQuotes);

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

watch([searchTerm, selectedCategory], () => {
  currentPage.value = 1;
});

watch(
  () => filteredOrganizers.value.length,
  (length) => {
    const maxPage = Math.max(1, Math.ceil(length / itemsPerPage));
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage;
    }
  },
);

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
  }
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
  }
};

const handleSidebarSelection = (itemId) => {
  activeSidebarItem.value = itemId;
  if (itemId === 'quotes') {
    navigateToQuotes();
  }
};
</script>

<template>
  <div class="host-dashboard">
    <HostDashboardSidebar
      :active-item="activeSidebarItem"
      @select="handleSidebarSelection"
    />

    <section class="host-dashboard__main">
      <HostHeroFilters
        :search-term="searchTerm"
        :selected-category="selectedCategory"
        :categories="hostCategories"
        :filters-expanded="filtersExpanded"
        :can-clear-filters="canClearFilters"
        @update:searchTerm="(value) => (searchTerm.value = value)"
        @update:selectedCategory="(value) => (selectedCategory.value = value)"
        @toggle-filters="toggleFilters"
        @reset-filters="resetFilters"
      />

      <HostQuoteMetrics :stats="quoteStats" @view-quotes="navigateToQuotes" />

      <HostOrganizerBrowser
        :organizers="paginatedOrganizers"
        :loading="isLoading"
        :data-loaded="hostDataLoaded"
        :skeleton-count="itemsPerPage"
        @view-profile="openOrganizerProfile"
      />

      <div
        v-if="hostDataLoaded && filteredOrganizers.length > 0 && totalPages > 1"
        class="host-dashboard__pagination"
      >
        <button
          class="pagination-button"
          type="button"
          :disabled="currentPage === 1"
          @click="goToPreviousPage"
        >
          <i class="pi pi-chevron-left" />
        </button>
        <span class="pagination-label">
          {{ t('dashboard.host.pagination.label', { page: currentPage, total: totalPages }) }}
        </span>
        <button
          class="pagination-button"
          type="button"
          :disabled="currentPage === totalPages"
          @click="goToNextPage"
        >
          <i class="pi pi-chevron-right" />
        </button>
      </div>
    </section>

    <HostOrganizerDialog
      :organizer="selectedOrganizer"
      v-model:visible="organizerDialogVisible"
    />
  </div>
</template>

<style scoped>
.host-dashboard {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.host-dashboard__main {
  flex: 1;
  background: #ffffff;
  border-radius: 24px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
}

.host-dashboard__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.pagination-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.pagination-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover {
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
}

.pagination-label {
  font-weight: 600;
  color: #1f2937;
}

@media (max-width: 1024px) {
  .host-dashboard {
    flex-direction: column;
  }

  .host-dashboard__main {
    padding: 1.5rem;
  }
}
</style>
