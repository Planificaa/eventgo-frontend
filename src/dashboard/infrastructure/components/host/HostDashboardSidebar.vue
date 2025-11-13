<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  activeItem: {
    type: String,
    default: 'organizers',
  },
});

const emit = defineEmits(['select']);

const { t } = useI18n();

const navigationItems = computed(() => [
  {
    id: 'organizers',
    icon: 'pi pi-search',
    label: t('dashboard.host.sidebar.browseOrganizers'),
  },
  {
    id: 'events',
    icon: 'pi pi-calendar',
    label: t('dashboard.host.sidebar.myEvents'),
  },
  {
    id: 'quotes',
    icon: 'pi pi-send',
    label: t('dashboard.host.sidebar.quotes'),
  },
  {
    id: 'messages',
    icon: 'pi pi-comments',
    label: t('dashboard.host.sidebar.messages'),
  },
]);

const handleSelect = (itemId) => {
  emit('select', itemId);
};
</script>

<template>
  <aside class="host-sidebar">
    <div class="host-sidebar__brand">EVENTIFY</div>
    <nav class="host-sidebar__nav">
      <button
        v-for="item in navigationItems"
        :key="item.id"
        class="host-sidebar__item"
        :class="{ 'host-sidebar__item--active': props.activeItem === item.id }"
        type="button"
        @click="handleSelect(item.id)"
      >
        <i :class="item.icon" />
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.host-sidebar {
  width: 240px;
  background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
  color: #ffffff;
  border-radius: 24px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
}

.host-sidebar__brand {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.host-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.host-sidebar__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: #d1d5db;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.host-sidebar__item i {
  font-size: 1.1rem;
}

.host-sidebar__item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.host-sidebar__item--active {
  background: rgba(99, 102, 241, 0.25);
  color: #ffffff;
}

@media (max-width: 1024px) {
  .host-sidebar {
    display: none;
  }
}
</style>
