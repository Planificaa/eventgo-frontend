<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import Paginator from 'primevue/paginator';
import ProgressSpinner from 'primevue/progressspinner';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

// Local Components
import EventCard from '../../presentation/components/event-card.component.vue';

// Services
import EventService from '../../../../social-event-management/application/services/event.service.js';

// Composables
const router = useRouter();
const { t } = useI18n();

// Reactive State
const events = ref([]);
const selectedEvents = ref([]);
const selectAll = ref(false);
const searchQuery = ref('');
const selectedFilter = ref('all');
const selectedSort = ref('recent');
const currentPage = ref(1);
const pageSize = ref(5);
const showDeleteConfirmation = ref(false);
const loading = ref(false);

// Filter Options
const filterOptions = computed(() => [
  { label: t('eventManagement.filters.all'), value: 'all' },
  { label: t('eventManagement.filters.active'), value: 'active' },
  { label: t('eventManagement.filters.pending'), value: 'pending' },
  { label: t('eventManagement.filters.cancelled'), value: 'cancelled' }
]);

// Sort Options
const sortOptions = computed(() => [
  { label: t('eventManagement.sort.recent'), value: 'recent' },
  { label: t('eventManagement.sort.oldest'), value: 'oldest' },
  { label: t('eventManagement.sort.title'), value: 'title' }
]);

// Computed Properties
const filteredEvents = computed(() => {
  let filtered = [...events.value];

  // Search Filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(event =>
      event.title.toLowerCase().includes(query) ||
      event.customerName.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  }

  // Status Filter
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(event => {
      if (selectedFilter.value === 'active') return event.status === t('eventManagement.status.active');
      if (selectedFilter.value === 'pending') return event.status === t('eventManagement.status.toBeConfirmed');
      if (selectedFilter.value === 'cancelled') return event.status === t('eventManagement.status.cancelled');
      return true;
    });
  }

  // Sorting
  if (selectedSort.value === 'recent') {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (selectedSort.value === 'oldest') {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (selectedSort.value === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Pagination
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filtered.slice(startIndex, endIndex);
});

const totalEvents = computed(() => events.value.length);
const totalPages = computed(() => Math.ceil(totalEvents.value / pageSize.value));
const startItem = computed(() => {
  if (totalEvents.value === 0) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});
const endItem = computed(() => {
  if (totalEvents.value === 0) return 0;
  return Math.min(currentPage.value * pageSize.value, totalEvents.value);
});

// Methods
const fetchEvents = async () => {
  loading.value = true;
  try {
    const response = await EventService.getEvents();
    events.value = response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
  } finally {
    loading.value = false;
  }
};

const isSelected = (eventId) => {
  return selectedEvents.value.includes(eventId);
};

const toggleEventSelection = (eventId) => {
  const index = selectedEvents.value.indexOf(eventId);
  if (index === -1) {
    selectedEvents.value.push(eventId);
  } else {
    selectedEvents.value.splice(index, 1);
  }
  selectAll.value = selectedEvents.value.length === events.value.length;
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedEvents.value = events.value.map(event => event.id);
  } else {
    selectedEvents.value = [];
  }
};

const deleteSelectedEvents = async () => {
  loading.value = true;
  try {
    await EventService.deleteMultipleEvents(selectedEvents.value);
    selectedEvents.value = [];
    showDeleteConfirmation.value = false;
    await fetchEvents();
  } catch (error) {
    console.error('Error deleting events:', error);
  } finally {
    loading.value = false;
  }
};

const onPageChange = (event) => {
  currentPage.value = event.page + 1;
};

const navigateToCreateEvent = () => {
  router.push('/events/create');
};

const navigateToEditEvent = (eventId) => {
  router.push(`/events/${eventId}/edit`);
};

// Lifecycle
onMounted(() => {
  fetchEvents();
});
</script>

<template>
  <div class="event-management-container">
    <!-- Header Section -->
    <header class="page-header">
      <h1 class="page-title">{{ $t('eventManagement.pageTitle') }}</h1>
    </header>

    <!-- Actions Bar -->
    <section class="actions-section">
      <!-- Selection Bar (visible when items are selected) -->
      <div v-if="selectedEvents.length > 0" class="selection-bar">
        <Checkbox
          v-model="selectAll"
          :binary="true"
          @change="toggleSelectAll"
        />
        <span class="selection-text">
          {{ $t('eventManagement.actions.selectAll') }}
        </span>
        <Button
          :label="$t('eventManagement.actions.deleteSelected', { count: selectedEvents.length })"
          icon="pi pi-trash"
          severity="danger"
          @click="showDeleteConfirmation = true"
          class="delete-selected-btn"
        />
      </div>

      <!-- Search and Filter Bar (visible when no items selected) -->
      <div v-else class="search-filter-bar">
        <IconField iconPosition="left" class="search-field">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            :placeholder="$t('eventManagement.actions.search')"
          />
        </IconField>

        <div class="filters-group">
          <Dropdown
            v-model="selectedFilter"
            :options="filterOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('eventManagement.filters.all')"
            class="filter-dropdown"
          />

          <Dropdown
            v-model="selectedSort"
            :options="sortOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('eventManagement.sort.recent')"
            class="sort-dropdown"
          />
        </div>

        <Button
          :label="$t('eventManagement.actions.newEvent')"
          icon="pi pi-plus"
          @click="navigateToCreateEvent"
          class="new-event-btn"
        />
      </div>
    </section>

    <!-- Events List Section -->
    <section class="events-list-section">
      <ProgressSpinner v-if="loading" class="loading-spinner" />

      <div v-else-if="filteredEvents.length === 0" class="no-events-message">
        <i class="pi pi-calendar-times"></i>
        <p>{{ $t('eventManagement.messages.noEvents') }}</p>
      </div>

      <div v-else class="events-grid">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="event-item"
          :class="{ 'selected': isSelected(event.id) }"
        >
          <Checkbox
            :modelValue="isSelected(event.id)"
            :binary="true"
            @change="toggleEventSelection(event.id)"
            class="event-checkbox"
          />

          <EventCard
            :event="event"
            :selected="isSelected(event.id)"
            @edit="navigateToEditEvent(event.id)"
          />
        </div>
      </div>
    </section>

    <!-- Pagination Section -->
    <footer class="pagination-section">
      <span class="pagination-info">
        {{ $t('eventManagement.pagination.showing') }} {{ startItem }}-{{ endItem }}
        {{ $t('eventManagement.pagination.of') }} {{ totalEvents }}
      </span>

      <Paginator
        :rows="pageSize"
        :totalRecords="totalEvents"
        @page="onPageChange"
        :first="(currentPage - 1) * pageSize"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      />
    </footer>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteConfirmation"
      :header="$t('eventManagement.confirmation.title')"
      :modal="true"
      :closable="true"
      class="delete-confirmation-dialog"
    >
      <p>{{ $t('eventManagement.confirmation.message', { count: selectedEvents.length }) }}</p>

      <template #footer>
        <Button
          :label="$t('eventManagement.actions.cancel')"
          @click="showDeleteConfirmation = false"
          text
        />
        <Button
          :label="$t('eventManagement.actions.delete')"
          severity="danger"
          @click="deleteSelectedEvents"
          :loading="loading"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* Variables CSS del proyecto */
.event-management-container {
  --primary-bg: #3A506B;
  --primary-text: #6FFFE9;
  --hover-text: #FFFFFF;
  --accent-color: #5BC0BE;
  --dark-bg: #1C2541;
  --border-color: #e0e0e0;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Container Principal */
.event-management-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 120px);
}

/* Header Section */
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--primary-bg);
  margin: 0;
}

/* Actions Section */
.actions-section {
  margin-bottom: 2rem;
}

.selection-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.selection-text {
  font-weight: 500;
  color: var(--primary-bg);
  margin-right: auto;
}

.search-filter-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-field {
  flex: 1;
  min-width: 250px;
}

.filters-group {
  display: flex;
  gap: 0.5rem;
}

.filter-dropdown,
.sort-dropdown {
  min-width: 150px;
}

.new-event-btn {
  background-color: var(--primary-bg);
  border-color: var(--primary-bg);
}

.new-event-btn:hover {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

/* Events List Section */
.events-list-section {
  min-height: 400px;
  position: relative;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.no-events-message {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.no-events-message i {
  font-size: 3rem;
  color: var(--border-color);
  margin-bottom: 1rem;
}

.events-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.event-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.event-item.selected {
  background-color: #f0f9ff;
  border-color: var(--accent-color);
}

.event-checkbox {
  margin-top: 0.5rem;
}

/* Pagination Section */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  color: #666;
  font-size: 0.95rem;
}

/* Dialog Customization */
:deep(.delete-confirmation-dialog) {
  max-width: 500px;
}

:deep(.delete-confirmation-dialog .p-dialog-header) {
  background-color: var(--primary-bg);
  color: var(--primary-text);
}

/* PrimeVue Component Overrides */
:deep(.p-button) {
  font-weight: 500;
}

:deep(.p-paginator) {
  background-color: transparent;
  border: none;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  background-color: var(--primary-bg);
  border-color: var(--primary-bg);
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .event-management-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .search-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field {
    width: 100%;
  }

  .filters-group {
    flex-direction: column;
  }

  .filter-dropdown,
  .sort-dropdown {
    width: 100%;
  }

  .new-event-btn {
    width: 100%;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }

  .pagination-section {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .selection-bar {
    flex-wrap: wrap;
  }

  .delete-selected-btn {
    width: 100%;
  }
}
</style>
