<script>
export default {
  name: "EventCard",
  props: {
    event: {
      type: Object,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    // Mapear fecha
    formattedDate() {
      if (!this.event.date) return "";

      return new Date(this.event.date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    // 1️⃣ Normalizar ESTADO desde JSON Server
    // (convertimos ES → internal)
    normalizedStatus() {
      const raw = (this.event.status || "").toLowerCase();

      if (raw === "activo") return "active";
      if (raw === "pendiente") return "pending";
      if (raw === "cancelado") return "cancelled";

      return raw;
    },

    // 2️⃣ Convertir el estado normalizado → texto traducido con i18n
    translatedStatus() {
      return this.$t(`eventManagement.status.${this.normalizedStatus}`);
    },

    // 3️⃣ Clases CSS según estado interno
    headerClass() {
      return {
        "header-active": this.normalizedStatus === "active",
        "header-pending": this.normalizedStatus === "pending",
        "header-cancelled": this.normalizedStatus === "cancelled",
      };
    },

    statusClass() {
      return {
        "status-active": this.normalizedStatus === "active",
        "status-pending": this.normalizedStatus === "pending",
        "status-cancelled": this.normalizedStatus === "cancelled",
      };
    },
  },
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
        <span class="detail-label">{{ $t('eventManagement.labels.customer') }}:</span>
        <span class="detail-value">{{ event.customerName }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">{{ $t('eventManagement.labels.location') }}:</span>
        <span class="detail-value">{{ event.location }}</span>
      </div>

      <div class="status-row">
        <span class="event-status" :class="statusClass">
          {{ translatedStatus }}
        </span>

        <button class="edit-btn" @click="$emit('edit')">
          {{ $t('eventManagement.actions.edit') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tus estilos pueden ir aquí */
</style>
