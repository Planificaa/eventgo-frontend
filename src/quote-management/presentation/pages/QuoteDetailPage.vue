
<template>
  <div class="quote-detail-page">
    <div class="quote-detail__container">
      <!-- Header -->
      <header class="quote-detail__header">
        <div class="header-content">
          <Button
            icon="pi pi-arrow-left"
            :label="$t('common.back')"
            text
            @click="handleBack"
            class="back-button"
          />
          <h1 class="page-title">{{ $t('quotes.detail.title') }}</h1>
        </div>

        <div class="header-actions" v-if="quote && !loading">
          <Button
            :label="$t('common.edit')"
            icon="pi pi-pencil"
            @click="handleEdit"
            outlined
            class="edit-btn"
          />
          <Button
            :label="$t('quotes.actions.send')"
            icon="pi pi-send"
            @click="handleSend"
            v-if="quote.state === 'DRAFT'"
            class="send-btn"
          />
        </div>
      </header>

      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <ProgressSpinner />
        <p>{{ $t('common.loading') }}</p>
      </div>

      <!-- Quote content -->
      <div v-else-if="quote" class="quote-detail__content">
        <!-- Client and Event Info -->
        <section class="detail-section info-section">
          <div class="section-header">
            <h2 class="section-title">{{ $t('quotes.detail.information') }}</h2>
            <QuoteStateBadge :state="quote.state" />
          </div>

          <div class="info-grid">
            <!-- Customer Card -->
            <div class="info-card customer-card">
              <div class="card-header">
                <i class="pi pi-user card-icon"></i>
                <h3 class="info-title">{{ $t('quotes.form.customer') }}</h3>
              </div>
              <div class="card-content">
                <p class="info-text">{{ quote.customer.name }}</p>
                <p class="info-subtext" v-if="quote.customer.email">
                  <i class="pi pi-envelope"></i>
                  {{ quote.customer.email }}
                </p>
                <p class="info-subtext" v-if="quote.customer.phone">
                  <i class="pi pi-phone"></i>
                  {{ quote.customer.phone }}
                </p>
              </div>
            </div>

            <!-- Event Card -->
            <div class="info-card event-card">
              <div class="card-header">
                <i class="pi pi-calendar-plus card-icon"></i>
                <h3 class="info-title">{{ $t('quotes.preview.event') }}</h3>
              </div>
              <div class="card-content">
                <p class="info-text">{{ $t(`events.types.${quote.event.type.toLowerCase()}`) }}</p>
                <p class="info-subtext event-name" v-if="quote.event.name">
                  {{ quote.event.name }}
                </p>
                <div class="event-details">
                  <p class="info-subtext">
                    <i class="pi pi-calendar"></i>
                    {{ formatDate(quote.event.date) }}
                  </p>
                  <p class="info-subtext">
                    <i class="pi pi-map-marker"></i>
                    {{ quote.event.location }}
                  </p>
                  <p class="info-subtext">
                    <i class="pi pi-users"></i>
                    {{ quote.event.numberOfGuests }} {{ $t('quotes.preview.guests') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Organizer Card -->
            <div class="info-card organizer-card">
              <div class="card-header">
                <i class="pi pi-briefcase card-icon"></i>
                <h3 class="info-title">{{ $t('quotes.detail.organizer') }}</h3>
              </div>
              <div class="card-content organizer-content">
                <Avatar
                  :image="quote.organizer.avatar"
                  :label="quote.organizer.name.charAt(0)"
                  size="large"
                  shape="circle"
                  class="organizer-avatar"
                />
                <div class="organizer-info">
                  <p class="info-text">{{ quote.organizer.name }}</p>
                  <p class="info-subtext organizer-role">{{ quote.organizer.role }}</p>
                  <p class="info-subtext" v-if="quote.organizer.phone">
                    <i class="pi pi-phone"></i>
                    {{ quote.organizer.phone }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Services -->
        <section class="detail-section services-section">
          <div class="section-header">
            <h2 class="section-title">{{ $t('quotes.services.title') }}</h2>
            <span class="service-count">
              {{ quote.services.length }} {{ $t('quotes.services.services') }}
            </span>
          </div>

          <DataTable :value="quote.services" class="services-table" stripedRows>
            <Column field="description" :header="$t('quotes.services.description')">
              <template #body="{ data }">
                <span class="service-description">{{ data.description }}</span>
              </template>
            </Column>

            <Column field="quantity" :header="$t('quotes.services.quantity')" style="width: 120px">
              <template #body="{ data }">
                <span class="service-quantity">{{ data.quantity }}</span>
              </template>
            </Column>

            <Column field="unitPrice" :header="$t('quotes.services.unitPrice')" style="width: 150px">
              <template #body="{ data }">
                <span class="service-price">{{ data.getFormattedUnitPrice() }}</span>
              </template>
            </Column>

            <Column field="total" :header="$t('quotes.services.total')" style="width: 150px">
              <template #body="{ data }">
                <span class="service-total">{{ data.getFormattedTotal() }}</span>
              </template>
            </Column>
          </DataTable>
        </section>

        <!-- Financial Summary -->
        <section class="detail-section financial-section">
          <FinancialSummary
            :subtotal="quote.subtotal"
            :vat="quote.vat"
            :total="quote.total"
            :vatPercentage="quote.vatPercentage"
            :currency="quote.currency"
            :serviceCount="quote.services.length"
            :showDetails="true"
            :showPaymentTerms="true"
          />
        </section>

        <!-- Metadata Section -->
        <section class="detail-section metadata-section">
          <div class="metadata-grid">
            <div class="metadata-item">
              <i class="pi pi-clock"></i>
              <div class="metadata-content">
                <span class="metadata-label">{{ $t('quotes.detail.created') }}</span>
                <span class="metadata-value">{{ formatDateTime(quote.createdAt) }}</span>
              </div>
            </div>

            <div class="metadata-item">
              <i class="pi pi-pencil"></i>
              <div class="metadata-content">
                <span class="metadata-label">{{ $t('quotes.detail.lastUpdate') }}</span>
                <span class="metadata-value">{{ formatDateTime(quote.updatedAt) }}</span>
              </div>
            </div>

            <div class="metadata-item">
              <i class="pi pi-hashtag"></i>
              <div class="metadata-content">
                <span class="metadata-label">{{ $t('quotes.detail.quoteId') }}</span>
                <span class="metadata-value quote-id">{{ quote.id }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Error state -->
      <div v-else class="error-state">
        <i class="pi pi-exclamation-circle error-icon"></i>
        <h2 class="error-title">{{ $t('quotes.detail.notFound') }}</h2>
        <p class="error-message">{{ $t('quotes.detail.notFoundMessage') }}</p>
        <Button
          :label="$t('common.backToList')"
          icon="pi pi-arrow-left"
          @click="handleBack"
          class="back-to-list-btn"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';
import QuoteStateBadge from '/src/quote-management/presentation/pages/QuoteStateBadge.vue';
import FinancialSummary from '../components/financial-summary.vue';
import { QuoteApiService } from '/src/quote-management/application/services/quote-api.service.js';
import { QuoteOrder } from '/src/quote-management/domain/model';

const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const quote = ref(null);
const loading = ref(true);

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const handleBack = () => {
  router.push({ name: 'quotes' });
};

const handleEdit = () => {
  router.push({ name: 'quote-edit', params: { id: props.id } });
};

const handleSend = async () => {
  try {
    await QuoteApiService.changeState(props.id, 'PENDING');

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.sentSuccessfully'),
      life: 3000
    });

    // Recargar datos
    await loadQuote();
  } catch (error) {
    console.error('Error sending quote:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('quotes.messages.sendError'),
      life: 5000
    });
  }
};

const loadQuote = async () => {
  loading.value = true;
  try {
    const data = await QuoteApiService.getById(props.id);
    quote.value = QuoteOrder.fromJSON(data);
  } catch (error) {
    console.error('Error loading quote:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('quotes.messages.loadError'),
      life: 5000
    });

    // Redirigir a la lista después de un breve delay
    setTimeout(() => {
      router.push({ name: 'quotes' });
    }, 2000);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadQuote();
});
</script>

<style scoped>
.quote-detail-page {
  min-height: 100vh;
  background-color: #F8F9FA;
  padding: 2rem;
}

.quote-detail__container {
  max-width: 1200px;
  margin: 0 auto;
}

.quote-detail__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color, #3A506B);
  margin: 0;
}

.temp-content {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
