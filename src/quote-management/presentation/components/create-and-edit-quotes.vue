<!-- src/bounded-contexts/quote-management/presentation/components/create-and-edit-quotes.vue -->
<script setup>
/* ------------------------------------------------------
   IMPORTS
------------------------------------------------------ */
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';

import ServicesTable from './services-table.vue';
import FinancialSummary from './financial-summary.vue';
import ActionsQuotes from './actions-quotes.vue';
import QuotePreviewModal from './QuotePreviewModal.vue';

import { QuoteOrder, Customer, Event, Organizer } from '../../domain/model';
import { QuoteApiService } from '../../application/services/quote-api.service.js';
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';

/* ------------------------------------------------------
   PROPS (AQUI RECIBIMOS EL organizerId DEL DASHBOARD)
------------------------------------------------------ */
const props = defineProps({
  organizerId: {
    type: String,
    default: null
  }
});

/* ------------------------------------------------------
   SETUP
------------------------------------------------------ */
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();

const { user, restoreSession, isOrganizer } = useAuth();

/* ------------------------------------------------------
   HELPERS
------------------------------------------------------ */
const currentUserId = computed(() => user.value?.id ? String(user.value.id) : null);

const buildOrganizerForUser = () => {
  if (!isOrganizer.value || !user.value) return new Organizer({});

  return new Organizer({
    id: String(user.value.id),
    name: user.value.name,
    role: user.value.role,
    phone: user.value.phone,
    avatar: user.value.profileImage
  });
};

/* ------------------------------------------------------
   FORM STATE
------------------------------------------------------ */
const quote = ref(new QuoteOrder({
  customer: new Customer({}),
  event: new Event({}),
  organizer: buildOrganizerForUser(),
  ownerId: currentUserId.value
}));

/* ------------------------------------------------------
   APPLY USER CONTEXT (HOST vs ORGANIZER)
------------------------------------------------------ */
const applyUserContextToQuote = () => {
  if (!currentUserId.value) return;

  quote.value.ownerId = currentUserId.value;

  // Si es organizador llenamos organizador
  if (isOrganizer.value) {
    quote.value.organizer = buildOrganizerForUser();
    return;
  }

  // Si es host → se llena como cliente
  quote.value.customer = new Customer({
    id: currentUserId.value,
    name: user.value?.name || '',
    email: user.value?.email || '',
    phone: user.value?.phone || ''
  });
};

/* ------------------------------------------------------
   ESTADOS
------------------------------------------------------ */
const isSaving = ref(false);
const isSending = ref(false);
const showPreviewModal = ref(false);
const isLoadingQuote = ref(false);

/* ------------------------------------------------------
   MODO EDICIÓN
------------------------------------------------------ */
const isEditMode = computed(() => route.name === 'quote-edit');

/* ------------------------------------------------------
   EVENT TYPES
------------------------------------------------------ */
const eventTypes = computed(() => [
  { label: t('events.types.wedding'), value: 'WEDDING' },
  { label: t('events.types.conference'), value: 'CONFERENCE' },
  { label: t('events.types.baby_shower'), value: 'BABY_SHOWER' },
  { label: t('events.types.birthday'), value: 'BIRTHDAY' },
  { label: t('events.types.other'), value: 'OTHER' }
]);

/* ------------------------------------------------------
   VALIDATIONS
------------------------------------------------------ */
const canSave = computed(() =>
  quote.value.customer.name.trim().length > 0 &&
  quote.value.event.type &&
  quote.value.event.date &&
  quote.value.services.length > 0
);

const canPreview = computed(() => canSave.value);

const canSend = computed(() =>
  canSave.value && quote.value.state !== 'DRAFT'
);

/* ------------------------------------------------------
   SERVICES HANDLERS
------------------------------------------------------ */
const handleServicesUpdate = updated => quote.value.services = updated;

/* ------------------------------------------------------
   SAVE
------------------------------------------------------ */
const handleSave = async () => {
  if (!canSave.value) return;

  isSaving.value = true;

  try {
    const data = quote.value.toJSON();

    data.ownerId = currentUserId.value;

    // SI ES HOST Y TRAJO organizerId → asignar organizador correcto
    if (!isOrganizer.value && props.organizerId) {
      data.organizer = { id: props.organizerId };
    }

    let saved;

    if (isEditMode.value) {
      saved = await QuoteApiService.update(route.params.id, data);
    } else {
      saved = await QuoteApiService.create(data);
    }

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.updatedSuccessfully'),
    });

    router.push({ name: 'quotes' });

  } catch (err) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: err.message
    });
  } finally {
    isSaving.value = false;
  }
};

/* ------------------------------------------------------
   SEND
------------------------------------------------------ */
const handleSend = async () => {
  if (!canSend.value) return;

  isSending.value = true;

  try {
    // Guardar si era draft
    if (quote.value.state === 'DRAFT') {
      const data = quote.value.toJSON();

      // Asignar organizador si viene desde host
      if (!isOrganizer.value && props.organizerId) {
        data.organizer = { id: props.organizerId };
      }

      await QuoteApiService.update(quote.value.id, data);
    }

    await QuoteApiService.changeState(quote.value.id, "PENDING");

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.sentSuccessfully'),
    });

    router.push({ name: 'quotes' });

  } catch (err) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: err.message
    });
  } finally {
    isSending.value = false;
  }
};

const handleSaveAndSend = async () => {
  await handleSave();
  if (quote.value.id) await handleSend();
};

const handlePreview = () => { if (canPreview.value) showPreviewModal.value = true; };

const closePreview = () => showPreviewModal.value = false;

const handleCancel = () => router.push({ name: 'quotes' });

const handleBack = () => router.push({ name: 'quotes' });

/* ------------------------------------------------------
   LOAD QUOTE (edit mode)
------------------------------------------------------ */
const loadQuote = async id => {
  isLoadingQuote.value = true;

  try {
    const data = await QuoteApiService.getById(id);
    quote.value = QuoteOrder.fromJSON(data);

  } catch (err) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: err.message
    });
    router.push({ name: 'quotes' });
  } finally {
    isLoadingQuote.value = false;
  }
};

/* ------------------------------------------------------
   ON MOUNT
------------------------------------------------------ */
onMounted(async () => {
  await restoreSession();

  applyUserContextToQuote();

  // SI ES HOST Y VIENE organizerId → asignarlo
  if (!isEditMode.value && props.organizerId && !isOrganizer.value) {
    quote.value.organizer = new Organizer({
      id: props.organizerId,
      role: "organizer"
    });
  }

  if (isEditMode.value) await loadQuote(route.params.id);
});
</script>

<template>
  <div class="quote-form">
    <div class="quote-form__container">
      <!-- Contenido principal -->
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

        <!-- Basic Info -->
        <section class="form-section">
          <h2 class="section-title">{{ $t('quotes.form.basicInfo') }}</h2>

          <div class="form-grid">

            <!-- Customer -->
            <div class="form-field full-width">
              <label>{{ $t('quotes.form.customer') }}</label>
              <InputText
                v-model="quote.customer.name"
                :placeholder="$t('quotes.form.customerPlaceholder')"
                class="w-full"
              />
            </div>

            <!-- Event type -->
            <div class="form-field">
              <label>{{ $t('quotes.form.eventType') }}</label>
              <Dropdown
                v-model="quote.event.type"
                :options="eventTypes"
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('quotes.form.selectType')"
                class="w-full"
              />
            </div>

            <!-- Date -->
            <div class="form-field">
              <label>{{ $t('quotes.form.eventDate') }}</label>
              <Calendar
                v-model="quote.event.date"
                :placeholder="$t('quotes.form.datePlaceholder')"
                dateFormat="dd/mm/yy"
                :showIcon="true"
                class="w-full"
              />
            </div>

            <!-- Guests -->
            <div class="form-field">
              <label>{{ $t('quotes.form.numberOfGuests') }}</label>
              <InputNumber
                v-model="quote.event.numberOfGuests"
                :min="1"
                :placeholder="$t('quotes.form.guestsPlaceholder')"
                class="w-full"
                showButtons
              />
            </div>

            <!-- Location -->
            <div class="form-field">
              <label>{{ $t('quotes.form.location') }}</label>
              <InputText
                v-model="quote.event.location"
                :placeholder="$t('quotes.form.locationPlaceholder')"
                class="w-full"
              />
            </div>

          </div>
        </section>

        <!-- Services -->
        <section class="form-section">
          <ServicesTable
            :services="quote.services"
            :currency="quote.currency"
            @update:services="handleServicesUpdate"
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

      <!-- Sidebar Actions -->
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


<style scoped>
/* ------------ ESTILOS (NO CAMBIADOS) ------------ */
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

.quote-form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #3A506B;
}

.form-section {
  background: #FFF;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.section-title {
  border-bottom: 2px solid #5BC0BE;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  color: #3A506B;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 1.5rem;
}

.full-width {
  grid-column: span 2;
}

.quote-form__sidebar {
  position: sticky;
  top: 20px;
}

@media (max-width: 900px) {
  .quote-form__container {
    grid-template-columns: 1fr;
  }
}
</style>
