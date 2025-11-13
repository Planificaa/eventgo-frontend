<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Rating from 'primevue/rating';
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
  categories: {
    type: Array,
    default: () => [],
  },
  searchTerm: {
    type: String,
    default: '',
  },
  selectedCategory: {
    type: String,
    default: 'all',
  },
});

const emit = defineEmits([
  'update:searchTerm',
  'update:selectedCategory',
  'view-profile',
]);

const { t } = useI18n();

const hasOrganizers = computed(
  () => props.dataLoaded && props.organizers.length > 0,
);
</script>

<template>
  <section class="organizer-browser">
    <div class="browser-header">
      <div>
        <h2 class="section-title">{{ t('dashboard.host.organizerBrowser.title') }}</h2>
        <p class="section-subtitle">{{ t('dashboard.host.organizerBrowser.subtitle') }}</p>
      </div>
      <div class="browser-filters">
        <span class="p-input-icon-left search-wrapper">
          <i class="pi pi-search" />
          <InputText
            :modelValue="props.searchTerm"
            :placeholder="t('dashboard.host.organizerBrowser.search')"
            @update:modelValue="(value) => emit('update:searchTerm', value)"
          />
        </span>
        <Dropdown
          :modelValue="props.selectedCategory"
          :options="props.categories"
          :placeholder="t('dashboard.host.organizerBrowser.filterPlaceholder')"
          optionLabel=""
          class="category-dropdown"
          @update:modelValue="(value) => emit('update:selectedCategory', value)"
        >
          <template #value="{ value }">
            <span>{{ value === 'all' ? t('dashboard.host.organizerBrowser.allCategories') : value }}</span>
          </template>
          <template #option="{ option }">
            <span>{{ option === 'all' ? t('dashboard.host.organizerBrowser.allCategories') : option }}</span>
          </template>
        </Dropdown>
      </div>
    </div>

    <div v-if="props.loading" class="organizer-grid organizer-grid--loading">
      <Skeleton
        v-for="index in 3"
        :key="`organizer-skeleton-${index}`"
        height="260px"
        borderRadius="16px"
      />
    </div>

    <div v-else-if="hasOrganizers" class="organizer-grid">
      <Card
        v-for="organizer in props.organizers"
        :key="organizer.id"
        class="organizer-card"
      >
        <template #content>
          <div class="organizer-card__header">
            <Avatar
              :image="organizer.avatar"
              :label="organizer.name.charAt(0)"
              size="large"
              shape="circle"
            />
            <div>
              <h3 class="organizer-name">{{ organizer.name }}</h3>
              <p class="organizer-specialty">{{ organizer.specialty }}</p>
            </div>
          </div>
          <div class="organizer-card__body">
            <div class="organizer-rating">
              <Rating :modelValue="organizer.rating" :readonly="true" :cancel="false" />
              <span class="rating-value">{{ organizer.rating.toFixed(1) }}</span>
            </div>
            <p class="organizer-description">{{ organizer.description }}</p>
            <div class="organizer-tags">
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
              :label="t('dashboard.host.organizerBrowser.viewProfile')"
              class="view-profile-btn"
              @click="emit('view-profile', organizer)"
            />
          </div>
        </template>
      </Card>
    </div>

    <div v-else-if="props.dataLoaded" class="empty-organizers">
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

.browser-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .browser-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c2541;
}

.section-subtitle {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 1rem;
}

.browser-filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .browser-filters {
    flex-direction: row;
    align-items: center;
  }
}

.search-wrapper {
  width: 100%;
}

.search-wrapper input {
  width: 100%;
}

.category-dropdown {
  min-width: 200px;
}

.organizer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.organizer-grid--loading {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.organizer-card {
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  background-color: #ffffff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.organizer-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.18);
}

.organizer-card__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.organizer-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1c2541;
}

.organizer-specialty {
  margin: 0.25rem 0 0;
  color: #6366f1;
  font-weight: 600;
}

.organizer-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: #4b5563;
}

.organizer-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-value {
  font-weight: 600;
  color: #1c2541;
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
  margin-top: 1.5rem;
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

.empty-organizers {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  border-radius: 16px;
  background: #ffffff;
  color: #6b7280;
  text-align: center;
}

.empty-organizers i {
  font-size: 2rem;
  color: #6366f1;
}
</style>
