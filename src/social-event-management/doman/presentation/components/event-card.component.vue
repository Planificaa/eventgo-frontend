<script>
export default {
  name: 'EventCard',
  props: {
    event: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    formattedDate() {
      if (!this.event.date) return '';

      const date = new Date(this.event.date);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    headerClass() {
      return {
        'header-active': this.event.status === 'Active',
        'header-pending': this.event.status === 'To be confirmed',
        'header-cancelled': this.event.status === 'Cancelled',
        'header-new': this.event.isNew // Clase para eventos nuevos
      };
    }
  }
};


</script>

<template>
  <div class="event-card" :class="{ 'event-card-selected': selected }">
    <div class="event-header" :class="headerClass">
      <h3 class="event-title">{{ event.title }}</h3>
      <span class="event-date">{{ formattedDate }}</span>
    </div>

    <div class="event-details">
      <div class="detail-row">
        <span class="detail-label">Customer:</span>
        <span class="detail-value">{{ event.customer }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Place:</span>
        <span class="detail-value">{{ event.location }}</span>
      </div>

      <div class="status-row">
        <span
          class="event-status"
          :class="{
            'status-active': event.status === 'Active',
            'status-pending': event.status === 'To be confirmed',
            'status-cancelled': event.status === 'Cancelled'
          }"
        >
          {{ event.status }}
        </span>
        <button class="edit-btn" @click="$emit('edit')">Edit</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
