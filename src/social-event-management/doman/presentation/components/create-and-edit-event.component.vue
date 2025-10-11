<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

// Servicios
import EventService from '@/social-event-management/application/services/event.service.js';

// Composables
const router = useRouter();
const { t } = useI18n();

// Props
const props = defineProps({
  id: {
    type: [String, Number],
    default: null
  }
});

// Estado reactivo
const eventData = ref({
  title: '',
  date: '',
  customerName: '',
  location: '',
  status: 'Active',
  userId: 1 // Fixed user for demonstration
});

const loading = ref(false);

// Opciones para el dropdown de status
const statusOptions = computed(() => [
  { label: t('events.status.active'), value: 'Active' },
  { label: t('events.status.toBeConfirmed'), value: 'To be confirmed' },
  { label: t('events.status.cancelled'), value: 'Cancelled' }
]);

// Computed: verificar si estamos en modo edición
const isEditMode = computed(() => !!props.id);

// Métodos
const fetchEvent = async () => {
  if (!isEditMode.value) return;

  loading.value = true;
  try {
    const response = await EventService.getEventById(props.id);
    // Convertir la fecha del backend al formato de Calendar
    const eventDataFromServer = { ...response.data };

    // Si la fecha viene como string, convertirla a objeto Date
    if (eventDataFromServer.date && typeof eventDataFromServer.date === 'string') {
      eventDataFromServer.date = new Date(eventDataFromServer.date);
    }

    eventData.value = eventDataFromServer;
  } catch (error) {
    console.error('Error fetching event:', error);
    router.push('/events');
  } finally {
    loading.value = false;
  }
};

const saveEvent = async () => {
  loading.value = true;
  try {
    // Preparar datos para enviar al backend
    const dataToSend = { ...eventData.value };

    // Convertir Date object a string si es necesario
    if (dataToSend.date instanceof Date) {
      dataToSend.date = dataToSend.date.toISOString().split('T')[0];
    }

    if (isEditMode.value) {
      await EventService.updateEvent(props.id, dataToSend);
    } else {
      await EventService.createEvent(dataToSend);
    }

    // Redirect to events list after saving
    router.push('/events');
  } catch (error) {
    console.error('Error saving event:', error);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push('/events');
};

// Lifecycle: cargar datos si estamos en modo edición
onMounted(() => {
  fetchEvent();
});
</script>

<template>

  <div class="event-form-container">
    <div class="form-header">
      <h1>{{ isEditMode ? 'Edit Event' : 'Create New Event' }}</h1>
    </div>

    <form @submit.prevent="saveEvent" class="event-form">
      <div class="form-group">
        <label for="title">Event Title</label>
        <input
          type="text"
          id="title"
          v-model="eventData.title"
          required
          placeholder="Enter event title"
        >
      </div>

      <div class="form-group">
        <label for="date">Event Date</label>
        <input
          type="date"
          id="date"
          v-model="eventData.date"
          required
        >
      </div>

      <div class="form-group">
        <label for="customerName">Customer Name</label>
        <input
          type="text"
          id="customerName"
          v-model="eventData.customerName"
          required
          placeholder="Enter customer name"
        >
      </div>

      <div class="form-group">
        <label for="location">Location</label>
        <input
          type="text"
          id="location"
          v-model="eventData.location"
          required
          placeholder="Enter event location"
        >
      </div>

      <div class="form-group">
        <label for="status">Status</label>
        <select id="status" v-model="eventData.status" required>
          <option value="Active">Active</option>
          <option value="To be confirmed">To be confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" @click="goBack" class="cancel-btn">Cancel</button>
        <button type="submit" class="save-btn">{{ isEditMode ? 'Update Event' : 'Create Event' }}</button>
      </div>
    </form>
  </div>

</template>

<style scoped>
/* Contenedor principal */
.event-form-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

/* Card del formulario */
.event-form-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Header del formulario */
.form-header {
  padding: 1.5rem;
  background: var(--primary-color, #3A506B);
  color: var(--primary-color-text, #6FFFE9);
  border-radius: 6px 6px 0 0;
}

.form-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
}

/* Formulario */
.event-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Grupos de formulario */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #3A506B;
  font-size: 0.95rem;
}

/* Personalización de componentes PrimeVue */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-calendar) {
  font-size: 1rem;
}

:deep(.p-inputtext:enabled:focus),
:deep(.p-dropdown:not(.p-disabled):focus),
:deep(.p-calendar:not(.p-disabled) .p-inputtext:enabled:focus) {
  border-color: #5BC0BE;
  box-shadow: 0 0 0 0.2rem rgba(91, 192, 190, 0.25);
}

/* Acciones del formulario */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.cancel-btn {
  min-width: 120px;
}

.save-btn {
  min-width: 150px;
  background-color: #5BC0BE;
  border-color: #5BC0BE;
}

.save-btn:hover {
  background-color: #4aa9a7;
  border-color: #4aa9a7;
}

/* Responsive */
@media (max-width: 768px) {
  .event-form-container {
    margin: 1rem auto;
    padding: 0 0.5rem;
  }

  .form-header h1 {
    font-size: 1.5rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
    min-width: unset;
  }
}

/* Estado de carga */
:deep(.p-button-loading) {
  opacity: 0.7;
}
</style>
