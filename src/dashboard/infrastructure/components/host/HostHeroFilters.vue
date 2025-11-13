<script setup>
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  searchTerm: {
    type: String,
    default: '',
  },
  selectedCategory: {
    type: String,
    default: 'all',
  },
  categories: {
    type: Array,
    default: () => [],
  },
  filtersExpanded: {
    type: Boolean,
    default: true,
  },
  canClearFilters: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:searchTerm',
  'update:selectedCategory',
  'toggle-filters',
  'reset-filters',
]);

const { t } = useI18n();

const categoryLabel = (category) =>
  category === 'all'
    ? t('dashboard.host.organizerBrowser.allCategories')
    : category;
</script>

<template>
  <div class="host-hero">
    <div class="host-hero__copy">
      <h2>{{ t('dashboard.host.hero.title') }}</h2>
      <p>{{ t('dashboard.host.hero.subtitle') }}</p>
    </div>
    <div class="host-hero__actions">
      <span class="p-input-icon-left host-hero__search">
        <i class="pi pi-search" />
        <InputText
          :modelValue="props.searchTerm"
          :placeholder="t('dashboard.host.hero.searchPlaceholder')"
          @update:modelValue="(value) => emit('update:searchTerm', value)"
        />
      </span>
      <Button
        class="filters-toggle"
        outlined
        icon="pi pi-filter"
        :label="t('dashboard.host.hero.filters')"
        @click="emit('toggle-filters')"
      />
      <Button
        class="clear-filters"
        text
        icon="pi pi-times"
        :label="t('dashboard.host.hero.clearFilters')"
        :disabled="!props.canClearFilters"
        @click="emit('reset-filters')"
      />
    </div>
    <div
      :class="[
        'host-hero__filters',
        { 'host-hero__filters--collapsed': !props.filtersExpanded },
      ]"
    >
      <button
        v-for="category in props.categories"
        :key="category"
        class="filters-chip"
        :class="{ 'filters-chip--active': props.selectedCategory === category }"
        type="button"
        @click="emit('update:selectedCategory', category)"
      >
        {{ categoryLabel(category) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.host-hero {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.host-hero__copy h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.host-hero__copy p {
  margin: 0.5rem 0 0;
  color: #4b5563;
  font-size: 1rem;
}

.host-hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.host-hero__search {
  flex: 1 1 260px;
}

.host-hero__search input {
  width: 100%;
  padding-left: 2.5rem;
}

.filters-toggle {
  border-color: #d1d5db;
  color: #1f2937;
}

.clear-filters {
  color: #6b7280;
}

.host-hero__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  transition: max-height 0.25s ease;
  max-height: 260px;
  overflow: hidden;
}

.host-hero__filters--collapsed {
  max-height: 0;
}

.filters-chip {
  border: none;
  background: #f3f4f6;
  color: #4b5563;
  padding: 0.55rem 1.25rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.filters-chip--active {
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
}
</style>
