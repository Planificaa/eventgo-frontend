<script setup>
import AppHeader from '@/shared/infrastructure/components/AppHeader.vue'
</script>

<template>
<div id="app">
  <AppHeader/>
  <main class="main-content">
    <router-view/>
  </main>
</div>
</template>

<style>
/* Reset y estilos globales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background-color: #f8fafc;
}

.main-content {
  padding: 2rem;
  min-height: calc(100vh - 80px);
}
</style>

