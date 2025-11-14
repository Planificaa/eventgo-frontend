<script setup>
import { computed } from 'vue'
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js'
import AppHeaderOrganizer from './AppHeaderOrganizer.vue'
import AppHeaderHost from './AppHeaderHost.vue'

const { user } = useAuth()
const userRole = computed(() => user.value?.role ?? null)
</script>

<template>
  <AppHeaderOrganizer v-if="userRole === 'organizer'" />
  <AppHeaderHost v-else-if="userRole === 'host'" />
  <AppHeaderOrganizer v-else />
</template>
