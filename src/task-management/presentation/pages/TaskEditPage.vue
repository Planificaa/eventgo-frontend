<template>
  <task-form />
</template>

<script setup>
import TaskForm from '../components/task-form.vue';
defineProps({ id: { type: String, required: true } });
</script>
