<!-- src/bounded-contexts/quote-management/presentation/components/create-and-edit-quotes.vue -->

<template>
  <div class="quote-form">
    <div class="quote-form__container">
      <!-- Contenido principal del formulario -->
      <div class="quote-form__main">
        <!-- Header -->
        <header class="quote-form__header">
          <h1 class="page-title">
            {{ isEditMode ? $t('quotes.form.editTitle') : $t('quotes.form.createTitle') }}
          </h1>
          <Button
            icon="pi pi-arrow-left"
            :label="$t('common.back')"
            text
            @click="handleBack"
            class="back-button"
          />
        </header>

        <!-- Basic Information -->
        <section class="form-section">
          <h2 class="section-title">{{ $t('quotes.form.basicInfo') }}</h2>

          <div class="form-grid">
            <!-- Customer -->
            <div class="form-field full-width">
              <label for="customer-name">{{ $t('quotes.form.customer') }}</label>
              <InputText
                id="customer-name"
                v-model="quote.customer.name"
                :placeholder="$t('quotes.form.customerPlaceholder')"
                class="w-full"
              />
            </div>

            <!-- Type of Event -->
            <div class="form-field">
              <label for="event-type">{{ $t('quotes.form.eventType') }}</label>
              <Dropdown
                id="event-type"
                v-model="quote.event.type"
                :options="eventTypes"
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('quotes.form.selectType')"
                class="w-full"
              />
            </div>

            <!-- Date of the Event -->
            <div class="form-field">
              <label for="event-date">{{ $t('quotes.form.eventDate') }}</label>
              <Calendar
                id="event-date"
                v-model="quote.event.date"
                :placeholder="$t('quotes.form.datePlaceholder')"
                dateFormat="dd/mm/yy"
                :showIcon="true"
                class="w-full"
              />
            </div>

            <!-- Number of Guests -->
            <div class="form-field">
              <label for="guests">{{ $t('quotes.form.numberOfGuests') }}</label>
              <InputNumber
                id="guests"
                v-model="quote.event.numberOfGuests"
                :min="1"
                :placeholder="$t('quotes.form.guestsPlaceholder')"
                class="w-full"
                showButtons
              />
            </div>

            <!-- Location -->
            <div class="form-field">
              <label for="location">{{ $t('quotes.form.location') }}</label>
              <InputText
                id="location"
                v-model="quote.event.location"
                :placeholder="$t('quotes.form.locationPlaceholder')"
                class="w-full"
              />
            </div>
          </div>
        </section>

        <!-- Services Table -->
        <section class="form-section">
          <ServicesTable
            :services="quote.services"
            :currency="quote.currency"
            @update:services="handleServicesUpdate"
            @service-added="handleServiceAdded"
            @service-removed="handleServiceRemoved"
          />
        </section>

        <!-- Financial Summary -->
        <section class="form-section">
          <FinancialSummary
            :subtotal="quote.subtotal"
            :vat="quote.vat"
            :total="quote.total"
            :vatPercentage="quote.vatPercentage"
            :currency="quote.currency"
            :serviceCount="quote.services.length"
            :showDetails="true"
          />
        </section>
      </div>

      <!-- Actions Sidebar -->
      <aside class="quote-form__sidebar">
        <ActionsQuotes
          :canSave="canSave"
          :canPreview="canPreview"
          :canSend="canSend"
          :isSaving="isSaving"
          :isSending="isSending"
          :quoteState="quote.state"
          :lastUpdate="quote.updatedAt"
          @save="handleSave"
          @preview="handlePreview"
          @send="handleSend"
          @cancel="handleCancel"
        />
      </aside>
    </div>

    <!-- Preview Modal -->
    <QuotePreviewModal
      v-model:visible="showPreviewModal"
      :quote="quote"
      @edit="closePreview"
      @save-and-send="handleSaveAndSend"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import { QuoteOrder, Customer, Event, Organizer } from '../../domain/model';
import ServicesTable from './services-table.vue';
import FinancialSummary from './financial-summary.vue';
import ActionsQuotes from './actions-quotes.vue';
import QuotePreviewModal from './QuotePreviewModal.vue';
import { QuoteApiService } from '../../application/services/quote-api.service.js';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();

// Estado reactivo
const quote = ref(new QuoteOrder({
  customer: new Customer({}),
  event: new Event({}),
  organizer: new Organizer({
    name: 'Andrea Ramirez',
    role: 'Event Organizer',
    phone: '+51 999 888 777',
    avatar: 'https://i.pravatar.cc/150?img=1'
  })
}));

const isSaving = ref(false);
const isSending = ref(false);
const showPreviewModal = ref(false);
const isLoadingQuote = ref(false);

// Computed
const isEditMode = computed(() => {
  return route.name === 'quote-edit' && route.params.id;
});

const eventTypes = computed(() => {
  return [
    { label: t('events.types.wedding'), value: 'WEDDING' },
    { label: t('events.types.conference'), value: 'CONFERENCE' },
    { label: t('events.types.corporate_party'), value: 'CORPORATE_PARTY' },
    { label: t('events.types.baby_shower'), value: 'BABY_SHOWER' },
    { label: t('events.types.graduation'), value: 'GRADUATION' },
    { label: t('events.types.birthday'), value: 'BIRTHDAY' },
    { label: t('events.types.fifteen_years'), value: 'FIFTEEN_YEARS' },
    { label: t('events.types.other'), value: 'OTHER' }
  ];
});

const canSave = computed(() => {
  return quote.value.customer.name.trim().length > 0 &&
    quote.value.event.type &&
    quote.value.event.date &&
    quote.value.services.length > 0;
});

const canPreview = computed(() => {
  return canSave.value;
});

const canSend = computed(() => {
  return canSave.value && quote.value.state !== 'DRAFT';
});

// Métodos
const handleServicesUpdate = (updatedServices) => {
  quote.value.services = updatedServices;
};

const handleServiceAdded = (service) => {
  console.log('Service added:', service);
};

const handleServiceRemoved = (service) => {
  console.log('Service removed:', service);
};

const handleSave = async () => {
  if (!canSave.value) return;

  isSaving.value = true;

  try {
    const quoteData = quote.value.toJSON();
    quoteData.updatedAt = new Date().toISOString();

    let savedQuote;
    if (isEditMode.value) {
      // Actualizar cotización existente
      savedQuote = await QuoteApiService.update(route.params.id, quoteData);
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('quotes.messages.updatedSuccessfully'),
        life: 3000
      });
    } else {
      // Crear nueva cotización
      savedQuote = await QuoteApiService.create(quoteData);
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('quotes.messages.createdSuccessfully'),
        life: 3000
      });
    }

    console.log('Quote saved:', savedQuote);

    // Navegar a la lista
    router.push({ name: 'quotes' });
  } catch (error) {
    console.error('Error saving quote:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('quotes.messages.saveError'),
      life: 5000
    });
  } finally {
    isSaving.value = false;
  }
};

const handlePreview = () => {
  if (!canPreview.value) return;
  showPreviewModal.value = true;
};

const closePreview = () => {
  showPreviewModal.value = false;
};

const handleSend = async () => {
  if (!canSend.value) return;

  isSending.value = true;

  try {
    // Primero guardar si hay cambios
    if (quote.value.state === 'DRAFT') {
      const quoteData = quote.value.toJSON();
      await QuoteApiService.update(quote.value.id, quoteData);
    }

    // Cambiar estado a PENDING
    await QuoteApiService.changeState(quote.value.id, 'PENDING');

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.sentSuccessfully'),
      life: 3000
    });

    router.push({ name: 'quotes' });
  } catch (error) {
    console.error('Error sending quote:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('quotes.messages.sendError'),
      life: 5000
    });
  } finally {
    isSending.value = false;
  }
};

const handleSaveAndSend = async () => {
  closePreview();
  await handleSave();
  if (quote.value.id) {
    await handleSend();
  }
};

const handleCancel = () => {
  router.push({ name: 'quotes' });
};

const handleBack = () => {
  router.push({ name: 'quotes' });
};

const loadQuote = async (quoteId) => {
  isLoadingQuote.value = true;
  try {
    const data = await QuoteApiService.getById(quoteId);
    quote.value = QuoteOrder.fromJSON(data);

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.loadedSuccessfully'),
      life: 2000
    });
  } catch (error) {
    console.error('Error loading quote:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('quotes.messages.loadError'),
      life: 5000
    });
    router.push({ name: 'quotes' });
  } finally {
    isLoadingQuote.value = false;
  }
};

// Lifecycle
onMounted(() => {
  if (isEditMode.value) {
    loadQuote(route.params.id);
  }
});
</script>

<style scoped>
.quote-form {
  min-height: 100vh;
  background-color: #F8F9FA;
  padding: 2rem;
}

.quote-form__container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 2rem;
}

.quote-form__main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Header */
.quote-form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color, #3A506B);
  margin: 0;
}

.back-button {
  color: #6C757D;
}

.back-button:hover {
  color: var(--primary-color, #3A506B);
}

/* Secciones del formulario */
.form-section {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color, #3A506B);
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--secondary-color, #5BC0BE);
}

/* Grid de formulario */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9375rem;
}

.w-full {
  width: 100%;
}

/* Sidebar */
.quote-form__sidebar {
  position: relative;
}

/* Responsive */
@media (max-width: 1024px) {
  .quote-form__container {
    grid-template-columns: 1fr;
  }

  .quote-form__sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .quote-form {
    padding: 1rem;
  }

  .quote-form__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-section {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
