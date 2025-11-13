<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Skeleton from 'primevue/skeleton';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';

import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';
import { ProfileApiService } from '@/profile-management/application/profile-api.service.js';

import HostOrganizerDialog from './HostOrganizerDialog.vue';

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

const categoryLabel = (category) =>
  category === 'all'
    ? t('dashboard.host.organizerBrowser.allCategories')
    : category;

const openOrganizerProfile = (organizer) => {
  selectedOrganizer.value = organizer;
  organizerDialogVisible.value = true;
};

const loadHostDashboard = async () => {
  isLoading.value = true;
  hostDataLoaded.value = false;
  try {
    await ensureSession();

    const organizersResponse = await ProfileApiService.getAll();

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
</script>

<template>
  <div class="host-dashboard">
    <aside class="host-dashboard__sidebar">
      <div class="sidebar-brand">EVENTIFY</div>
      <nav class="sidebar-nav">
        <button class="sidebar-nav__item sidebar-nav__item--active" type="button">
          <i class="pi pi-search" />
          <span>{{ t('dashboard.host.sidebar.browseOrganizers') }}</span>
        </button>
        <button class="sidebar-nav__item" type="button">
          <i class="pi pi-calendar" />
          <span>{{ t('dashboard.host.sidebar.myEvents') }}</span>
        </button>
        <button class="sidebar-nav__item" type="button">
          <i class="pi pi-send" />
          <span>{{ t('dashboard.host.sidebar.quotes') }}</span>
        </button>
        <button class="sidebar-nav__item" type="button">
          <i class="pi pi-comments" />
          <span>{{ t('dashboard.host.sidebar.messages') }}</span>
        </button>
      </nav>
    </aside>

    <section class="host-dashboard__main">
      <div class="host-dashboard__hero">
        <div class="hero-copy">
          <h2>{{ t('dashboard.host.hero.title') }}</h2>
          <p>{{ t('dashboard.host.hero.subtitle') }}</p>
        </div>
        <div class="hero-search">
          <span class="p-input-icon-left search-input">
            <i class="pi pi-search" />
            <InputText
              :modelValue="searchTerm"
              :placeholder="t('dashboard.host.hero.searchPlaceholder')"
              @update:modelValue="(value) => (searchTerm.value = value)"
            />
          </span>
          <Button
            class="filters-toggle"
            outlined
            icon="pi pi-filter"
            :label="t('dashboard.host.hero.filters')"
            @click="toggleFilters"
          />
          <Button
            class="clear-filters"
            text
            icon="pi pi-times"
            :label="t('dashboard.host.hero.clearFilters')"
            :disabled="!canClearFilters"
            @click="resetFilters"
          />
        </div>
        <div
          :class="[
            'host-dashboard__filters',
            { 'host-dashboard__filters--collapsed': !filtersExpanded },
          ]"
        >
          <button
            v-for="category in hostCategories"
            :key="category"
            class="filters-chip"
            :class="{ 'filters-chip--active': selectedCategory === category }"
            type="button"
            @click="selectedCategory = category"
          >
            {{ categoryLabel(category) }}
          </button>
        </div>
      </div>

      <div class="host-dashboard__content">
        <div
          v-if="isLoading"
          class="host-dashboard__grid host-dashboard__grid--loading"
        >
          <Skeleton
            v-for="index in itemsPerPage"
            :key="`organizer-skeleton-${index}`"
            height="260px"
            borderRadius="20px"
          />
        </div>

        <div v-else-if="paginatedOrganizers.length" class="host-dashboard__grid">
          <Card
            v-for="organizer in paginatedOrganizers"
            :key="organizer.id"
            class="organizer-card"
          >
            <template #content>
              <div class="organizer-card__header">
                <Avatar
                  :image="organizer.avatar"
                  :label="organizer.name?.charAt(0)"
                  size="large"
                  shape="circle"
                />
                <div>
                  <h3 class="organizer-name">{{ organizer.name }}</h3>
                  <p v-if="organizer.location" class="organizer-location">
                    <i class="pi pi-map-marker" />
                    <span>{{ organizer.location }}</span>
                  </p>
                </div>
              </div>
              <div class="organizer-card__body">
                <p v-if="organizer.specialty" class="organizer-specialty">
                  {{ organizer.specialty }}
                </p>
                <div class="organizer-rating">
                  <i class="pi pi-star-fill" />
                  <span>{{ Number(organizer.rating || 0).toFixed(1) }}</span>
                </div>
                <p v-if="organizer.description" class="organizer-description">
                  {{ organizer.description }}
                </p>
                <div v-if="organizer.eventTypes?.length" class="organizer-tags">
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
                  class="view-profile-btn"
                  :label="t('dashboard.host.organizerBrowser.viewProfile')"
                  @click="openOrganizerProfile(organizer)"
                />
              </div>
            </template>
          </Card>
        </div>

        <div v-else-if="hostDataLoaded" class="host-dashboard__empty">
          <i class="pi pi-users" />
          <p>{{ t('dashboard.host.organizerBrowser.empty') }}</p>
        </div>
      </div>

      <div
        v-if="hostDataLoaded && filteredOrganizers.length > 0 && totalPages > 1"
        class="host-dashboard__pagination"
      >
        <Button
          icon="pi pi-chevron-left"
          rounded
          text
          :disabled="currentPage === 1"
          @click="goToPreviousPage"
        />
        <span class="pagination-label">
          {{ t('dashboard.host.pagination.label', { page: currentPage, total: totalPages }) }}
        </span>
        <Button
          icon="pi pi-chevron-right"
          rounded
          text
          :disabled="currentPage === totalPages"
          @click="goToNextPage"
        />
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

.host-dashboard__sidebar {
  width: 240px;
  background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
  color: #ffffff;
  border-radius: 24px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
}

.sidebar-brand {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-nav__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: #d1d5db;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.sidebar-nav__item i {
  font-size: 1.1rem;
}

.sidebar-nav__item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.sidebar-nav__item--active {
  background: rgba(99, 102, 241, 0.25);
  color: #ffffff;
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

.host-dashboard__hero {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-copy h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.hero-copy p {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
}

.hero-search {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.search-input {
  flex: 1 1 320px;
}

.search-input :deep(input) {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  font-size: 0.95rem;
}

.filters-toggle,
.clear-filters {
  white-space: nowrap;
}

.host-dashboard__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.host-dashboard__filters--collapsed {
  display: none;
}

.filters-chip {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #4b5563;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.filters-chip--active {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #ffffff;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.35);
}

.host-dashboard__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.host-dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.host-dashboard__grid--loading {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.organizer-card {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.12);
  border: none;
}

.organizer-card__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.organizer-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.organizer-location {
  margin: 0.25rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #6b7280;
  font-size: 0.95rem;
}

.organizer-location i {
  font-size: 0.9rem;
}

.organizer-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: #4b5563;
}

.organizer-specialty {
  margin: 0;
  font-weight: 600;
  color: #4f46e5;
}

.organizer-rating {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  color: #f59e0b;
}

.organizer-rating i {
  font-size: 1rem;
}

.organizer-description {
  margin: 0;
  line-height: 1.5;
}

.organizer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.organizer-card__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.25rem;
}

.view-profile-btn {
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: #ffffff;
  font-weight: 600;
}

.view-profile-btn:hover {
  background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
}

.host-dashboard__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  border-radius: 18px;
  background: #f9fafb;
  color: #6b7280;
  text-align: center;
}

.host-dashboard__empty i {
  font-size: 2rem;
  color: #4f46e5;
}

.host-dashboard__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.pagination-label {
  font-weight: 600;
  color: #4b5563;
}

@media (max-width: 1024px) {
  .host-dashboard {
    flex-direction: column;
  }

  .host-dashboard__sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .sidebar-nav__item {
    flex: 1 1 calc(50% - 0.5rem);
  }
}

@media (max-width: 768px) {
  .host-dashboard__main {
    padding: 1.5rem;
  }

  .hero-copy h2 {
    font-size: 1.6rem;
  }

  .filters-toggle {
    display: inline-flex;
  }

  .host-dashboard__filters--collapsed {
    display: none;
  }
}

@media (min-width: 769px) {
  .filters-toggle {
    display: none;
  }

  .host-dashboard__filters--collapsed {
    display: flex;
  }
}
</style>
