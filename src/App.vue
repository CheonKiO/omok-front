<template>
  <main class="main">
    <AppHeader v-if="showHeader" />
    <router-view />
  </main>
  <Toast />
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import '@/assets/main.css';
import Toast from '@/components/ToastMessage.vue';
import AppHeader from '@/components/AppHeader.vue';

const route = useRoute();
// 대국·복기(몰입)·로그인 화면은 전역 헤더 제외
const showHeader = computed(() => !['Room', 'Login', 'Replay'].includes(route.name));
</script>
<style scoped>
.main {
  padding: 0;
  font-family: var(--app-font);
  color: var(--ink);
  height: 100svh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 기존 한지 텍스처 + 은은한 반상 격자 오버레이 */
  background:
    linear-gradient(rgba(40, 30, 16, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(40, 30, 16, 0.06) 1px, transparent 1px),
    url('./assets/images/background.jpg') center / cover,
    #e9dcbf;
  background-size: 40px 40px, 40px 40px, cover, auto;
  background-position: center, center, center, center;
  background-attachment: fixed, fixed, fixed, fixed;
}
</style>
