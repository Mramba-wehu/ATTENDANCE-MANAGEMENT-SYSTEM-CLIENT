<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const isSettingsPage = computed(() => route.path.includes('/settings'))

defineExpose({ isSettingsPage})
</script>

<template lang="pug">
footer.container-fluid
  .row
    .auto.text-center
      p(:class="{ 'text-muted-light': isSettingsPage, 'text-muted': !isSettingsPage }")
        | AMS © {{ new Date().getFullYear() }} All rights reserved.
</template>

<style scoped>
footer {
  position: fixed;
  bottom: 0;
  left: 0;
  height: fit-content;
}

footer .row {
  flex-wrap: nowrap;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

footer .row p {
  margin: 0;
  padding: 0.2rem;
  height: fit-content;
}
</style>

<style>
.text-muted-light {
  color: rgba(255, 255, 255, 0.6) !important;
}
</style>
