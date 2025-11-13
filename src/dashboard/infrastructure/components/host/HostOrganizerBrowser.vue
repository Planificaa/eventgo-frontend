<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';

const props = defineProps({
  organizers: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  dataLoaded: {
    type: Boolean,
    default: false,
  },
  skeletonCount: {
    type: Number,
    default: 6,
  },
});

const emit = defineEmits(['view-profile']);

const { t } = useI18n();

const showEmptyState = computed(
  () => props.dataLoaded && !props.loading && props.organizers.length === 0,
);
</script>

<template>
  <section class="organizer-browser">
    <div
      v-if="props.loading"
      class="organizer-browser__grid organizer-browser__grid--loading"
    >
      <Skeleton
        v-for="index in props.skeletonCount"
        :key="`organizer-skeleton-${index}`"
        height="260px"
        borderRadius="20px"
      />
    </div>

    <div v-else-if="props.organizers.length" class="organizer-browser__grid">
      <Card
        v-for="organizer in props.organizers"
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
              @click="emit('view-profile', organizer)"
            />
          </div>
        </template>
      </Card>
    </div>

    <div v-else-if="showEmptyState" class="organizer-browser__empty">
      <i class="pi pi-users" />
      <p>{{ t('dashboard.host.organizerBrowser.empty') }}</p>
    </div>
  </section>
</template>

<style scoped>
.organizer-browser {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.organizer-browser__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.organizer-browser__grid--loading {
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

.organizer-browser__empty {
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

.organizer-browser__empty i {
  font-size: 2rem;
  color: #4f46e5;
}
</style>
