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
  padding: 0 15px;
  font-family: 'ChosunGs';
  height: 100%;
  background-image: url('./assets/images/background.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  min-height: 100vh;
}
</style>
