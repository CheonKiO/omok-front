<template>
  <main class="main">
    <router-view />
  </main>
  <Toast />
</template>

<script setup>
import '@/assets/main.css';
import Toast from '@/components/ToastMessage.vue';
</script>
<style scoped>
.main {
  padding: 0;
  font-family: 'ChosunGs';
  min-height: 100svh;
  background-image: url('./assets/images/background.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}
</style>
