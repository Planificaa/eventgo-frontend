<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import QuoteStateBadge from '/src/quote-management/presentation/pages/QuoteStateBadge.vue'
import { QuoteApiService } from '../../application/services/quote-api.service.js';
import { QuoteOrder } from '../../domain/model';

const router = useRouter();
const { t } = useI18n();
const toast = useToast();

// Estado reactivo
const quotes = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedFilter = ref('ALL');
const selectedSort = ref('RECENT');

// Opciones de filtros
const filterOptions = computed(() => [
  { label: t('quotes.filters.all'), value: 'ALL' },
  { label: t('quotes.filters.approved'), value: 'APPROVED' },
  { label: t('quotes.filters.pending'), value: 'PENDING' },
  { label: t('quotes.filters.declined'), value: 'DECLINED' },
  { label: t('quotes.filters.draft'), value: 'DRAFT' }
]);

const sortOptions = computed(() => [
  { label: t('quotes.sort.recent'), value: 'RECENT' },
  { label: t('quotes.sort.oldest'), value: 'OLDEST' },
  { label: t('quotes.sort.amountHigh'), value: 'AMOUNT_HIGH' },
  { label: t('quotes.sort.amountLow'), value: 'AMOUNT_LOW' }
]);

// Computed - Filtrar cotizaciones
const filteredQuotes = computed(() => {
  let result = [...quotes.value];

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(quote =>
      quote.customer.name.toLowerCase().includes(query) ||
      quote.event.type.toLowerCase().includes(query) ||
      (quote.event.name && quote.event.name.toLowerCase().includes(query))
    );
  }

  // Filtrar por estado
  if (selectedFilter.value !== 'ALL') {
    result = result.filter(quote => quote.state === selectedFilter.value);
  }

  // Ordenar
  switch (selectedSort.value) {
    case 'RECENT':
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'OLDEST':
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'AMOUNT_HIGH':
      result.sort((a, b) => b.total - a.total);
      break;
    case 'AMOUNT_LOW':
      result.sort((a, b) => a.total - b.total);
      break;
  }

  return result;
});

// Métodos
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const handleNewQuote = () => {
  router.push({ name: 'quote-create' });
};

const handleView = (quoteId) => {
  router.push({ name: 'quote-detail', params: { id: quoteId } });
};

const handleEdit = (quoteId) => {
  router.push({ name: 'quote-edit', params: { id: quoteId } });
};

const loadQuotes = async () => {
  loading.value = true;
  try {
    const data = await QuoteApiService.getAll();
    quotes.value = data.map(q => QuoteOrder.fromJSON(q));

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.loadedSuccessfully'),
      life: 3000
    });
  } catch (error) {
    console.error('Error loading quotes:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('quotes.messages.loadError'),
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadQuotes();
});
</script>
<template>
  <section class="quotes-list">
    <!-- Filtros y búsqueda -->
    <div class="quotes-list__filters">
      <div class="search-container">
        <IconField iconPosition="left">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            :placeholder="$t('quotes.list.searchPlaceholder')"
            class="search-input"
          />
        </IconField>
      </div>

      <div class="filter-controls">
        <Dropdown
          v-model="selectedFilter"
          :options="filterOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('quotes.list.filterAll')"
          class="filter-dropdown"
        />

        <Dropdown
          v-model="selectedSort"
          :options="sortOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('quotes.list.sortRecent')"
          class="filter-dropdown"
        />

        <Button
          :label="$t('quotes.list.newQuote')"
          icon="pi pi-plus"
          @click="handleNewQuote"
          class="new-quote-btn"
        />
      </div>
    </div>

    <!-- Tabla de cotizaciones -->
    <DataTable
      :value="filteredQuotes"
      :loading="loading"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      responsiveLayout="scroll"
      class="quotes-table"
      stripedRows
    >
      <Column field="customer.name" :header="$t('quotes.list.customer')" sortable>
        <template #body="{ data }">
          <span class="customer-name">{{ data.customer.name }}</span>
        </template>
      </Column>

      <Column field="event.type" :header="$t('quotes.list.event')" sortable>
        <template #body="{ data }">
          <div class="event-info">
            <span class="event-type">{{ $t(`events.types.${data.event.type.toLowerCase()}`) }}</span>
          </div>
        </template>
      </Column>

      <Column field="event.date" :header="$t('quotes.list.date')" sortable>
        <template #body="{ data }">
          <span class="event-date">{{ formatDate(data.event.date) }}</span>
        </template>
      </Column>

      <Column field="total" :header="$t('quotes.list.amount')" sortable>
        <template #body="{ data }">
          <span class="quote-amount">{{ data.getFormattedTotal() }}</span>
        </template>
      </Column>

      <Column field="state" :header="$t('quotes.list.state')" sortable>
        <template #body="{ data }">
          <QuoteStateBadge :state="data.state" />
        </template>
      </Column>

      <Column :header="$t('quotes.list.actions')" class="actions-column">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              :label="$t('quotes.list.view')"
              icon="pi pi-eye"
              text
              @click="handleView(data.id)"
              class="action-btn view-btn"
            />
            <Button
              :label="$t('quotes.list.edit')"
              icon="pi pi-pencil"
              text
              @click="handleEdit(data.id)"
              class="action-btn edit-btn"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox empty-icon"></i>
          <p>{{ $t('quotes.list.noQuotes') }}</p>
        </div>
      </template>
    </DataTable>
  </section>
</template>
<style scoped>
.quotes-list {
  width: 100%;
  padding: 2rem;
}

/* Filtros */
.quotes-list__filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-container {
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.search-input {
  width: 100%;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-dropdown {
  min-width: 150px;
}

.new-quote-btn {
  background-color: var(--primary-color, #3A506B);
  border-color: var(--primary-color, #3A506B);
  color: var(--accent-color, #6FFFE9);
  font-weight: 600;
  white-space: nowrap;
}

.new-quote-btn:hover {
  background-color: var(--secondary-color, #5BC0BE);
  border-color: var(--secondary-color, #5BC0BE);
  color: #FFFFFF;
}

/* Tabla */
.quotes-table {
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.p-datatable-thead > tr > th) {
  background-color: #F8F9FA;
  color: #495057;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.customer-name {
  font-weight: 600;
  color: #212529;
}

.event-info {
  display: flex;
  flex-direction: column;
}

.event-type {
  font-weight: 500;
  color: #495057;
}

.event-date {
  color: #6C757D;
}

.quote-amount {
  font-weight: 600;
  color: #28A745;
  font-size: 1rem;
}

/* Acciones */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  font-size: 0.875rem;
}

.view-btn {
  color: var(--secondary-color, #5BC0BE);
}

.view-btn:hover {
  color: var(--primary-color, #3A506B);
}

.edit-btn {
  color: #6C757D;
}

.edit-btn:hover {
  color: var(--primary-color, #3A506B);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6C757D;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .quotes-list {
    padding: 1rem;
  }

  .quotes-list__filters {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: 100%;
  }

  .filter-controls {
    flex-direction: column;
    width: 100%;
  }

  .filter-dropdown,
  .new-quote-btn {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
