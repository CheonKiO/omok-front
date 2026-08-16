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
        <span class="uname">{{ displayName }}</span>
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
  flex-shrink: 0;
  width: 80vw;
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 26px;
  border-bottom: 1.5px solid var(--ink);
  position: relative;
  box-sizing: border-box;
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
  min-width: 0;
}
.who {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.85rem;
  color: var(--ink);
  min-width: 0;
}
.uname {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

/* 좁은 폭: 헤더 넓히고 유저명 숨김·여백 축소로 밀림 방지 */
@media (max-width: 680px) {
  .app-header { width: 92vw; padding: 0 16px; }
  .brand { font-size: 1.2rem; letter-spacing: 0.1em; gap: 8px; }
  .nav { margin-left: 14px; gap: 0; }
  .nav-link { padding: 8px 9px; font-size: 0.9rem; }
  .nav-link.on::after { left: 9px; right: 9px; }
  .right { gap: 12px; }
  .uname { display: none; }
}
</style>
