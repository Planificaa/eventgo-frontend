<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Rating from 'primevue/rating';
import Tag from 'primevue/tag';

const props = defineProps({
  organizer: {
    type: Object,
    default: null,
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:visible']);

const { t } = useI18n();

const dialogHeader = computed(() => props.organizer?.name ?? '');
</script>

<template>
  <Dialog
    :visible="props.visible"
    modal
    :style="{ width: '480px' }"
    :header="dialogHeader"
    @update:visible="(value) => emit('update:visible', value)"
  >
    <template v-if="props.organizer">
      <div class="organizer-dialog">
        <div class="organizer-dialog__header">
          <Avatar
            :image="props.organizer.avatar"
            :label="props.organizer.name.charAt(0)"
            size="xlarge"
            shape="circle"
          />
          <div>
            <h3>{{ props.organizer.name }}</h3>
            <p>{{ props.organizer.specialty }}</p>
            <div class="organizer-rating">
              <Rating :modelValue="props.organizer.rating" :readonly="true" :cancel="false" />
              <span class="rating-value">{{ props.organizer.rating.toFixed(1) }}</span>
            </div>
          </div>
        </div>

        <p class="organizer-dialog__description">{{ props.organizer.description }}</p>

        <div class="organizer-dialog__section">
          <h4>{{ t('dashboard.host.organizerBrowser.details.eventTypes') }}</h4>
          <div class="organizer-tags">
            <Tag
              v-for="type in props.organizer.eventTypes"
              :key="type"
              severity="info"
              :value="type"
              rounded
            />
          </div>
        </div>

        <div class="organizer-dialog__section" v-if="props.organizer.location">
          <h4>{{ t('dashboard.host.organizerBrowser.details.location') }}</h4>
          <p>{{ props.organizer.location }}</p>
        </div>

        <div class="organizer-dialog__section" v-if="props.organizer.contact?.email || props.organizer.contact?.phone">
          <h4>{{ t('dashboard.host.organizerBrowser.details.contact') }}</h4>
          <ul class="organizer-contact">
            <li v-if="props.organizer.contact?.email">
              <i class="pi pi-envelope"></i>
              <span>{{ props.organizer.contact.email }}</span>
            </li>
            <li v-if="props.organizer.contact?.phone">
              <i class="pi pi-phone"></i>
              <span>{{ props.organizer.contact.phone }}</span>
            </li>
          </ul>
        </div>

        <div class="organizer-dialog__section" v-if="props.organizer.highlights?.length">
          <h4>{{ t('dashboard.host.organizerBrowser.details.highlights') }}</h4>
          <ul class="organizer-highlights">
            <li v-for="highlight in props.organizer.highlights" :key="highlight">
              <i class="pi pi-check-circle"></i>
              <span>{{ highlight }}</span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.organizer-dialog {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.organizer-dialog__header {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.organizer-dialog__header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c2541;
}

.organizer-dialog__header p {
  margin: 0.25rem 0 0;
  color: #6366f1;
  font-weight: 600;
}

.organizer-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.rating-value {
  font-weight: 600;
  color: #1c2541;
}

.organizer-dialog__description {
  margin: 0;
  line-height: 1.6;
  color: #4b5563;
}

.organizer-dialog__section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.organizer-dialog__section h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1c2541;
}

.organizer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.organizer-contact,
.organizer-highlights {
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: #4b5563;
}

.organizer-contact i,
.organizer-highlights i {
  color: #6366f1;
}

.organizer-contact li,
.organizer-highlights li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
