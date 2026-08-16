<template>
  <header class="app-header">
    <RouterLink to="/" class="brand">
      <span class="stone black"></span>오목
    </RouterLink>

    <nav class="nav">
      <RouterLink to="/" class="nav-link" :class="{ on: isLobby }">대국실</RouterLink>
      <RouterLink v-if="!isGuest" to="/games" class="nav-link" :class="{ on: isKifu }">기보</RouterLink>
    </nav>

    <div class="right">
      <span class="who">
        <span class="stone" :class="isGuest ? 'guest' : 'black'"></span>
        {{ displayName }}
      </span>
      <button class="logout" @click="handleLogout">나가기</button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const displayName = computed(() => auth.nickname ?? '손님');
const isGuest = computed(() => auth.role === 'GUEST');
const isLobby = computed(() => route.path === '/');
const isKifu = computed(() => route.path.startsWith('/games'));

async function handleLogout() {
  await auth.logout();
  router.push('/login');
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  height: 60px;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 26px;
  border-bottom: 1.5px solid var(--ink);
  position: relative;
}
.app-header::after {
  content: '';
  position: absolute;
  left: 26px;
  bottom: -4px;
  width: 76px;
  height: 2.5px;
  background: var(--ju);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--display);
  font-size: 1.35rem;
  letter-spacing: 0.18em;
  color: var(--ink);
  text-decoration: none;
}

.stone {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.stone.black {
  background: radial-gradient(circle at 38% 34%, #4a453e, #17130e);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}
.stone.guest {
  background: radial-gradient(circle at 38% 34%, #fff, #cfc7b4);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2), inset 0 0 0 1px #b3a892;
}

.nav {
  display: flex;
  gap: 2px;
  margin-left: 30px;
}
.nav-link {
  font-family: var(--display);
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  padding: 8px 14px;
  color: var(--ink-soft);
  text-decoration: none;
  position: relative;
}
.nav-link.on { color: var(--ink); }
.nav-link.on::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 2px;
  height: 2px;
  background: var(--ju);
}

.right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 18px;
}
.who {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.85rem;
  color: var(--ink);
}
.logout {
  font-family: var(--display);
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  color: var(--ink-soft);
  background: none;
  border: none;
  border-bottom: 1px solid transparent;
  cursor: pointer;
  padding: 2px 0;
  transition: color 0.15s, border-color 0.15s;
}
.logout:hover {
  color: var(--ink);
  border-bottom-color: var(--ink-soft);
}
</style>
