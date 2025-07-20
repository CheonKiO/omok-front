<script setup>
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/user';
import LoginForm from '../components/LoginForm.vue';
import { useToast } from '@/composable/useToast';

const router = useRouter();
const store = usePlayerStore();
const { show } = useToast();
const login = async ({ username }) => {
  const trimmedName = username.trim();

  if (trimmedName.length < 2) {
    show('닉네임은 최소 2글자 이상이어야 합니다', 1000);
    return; // 함수 종료, 로그인 처리 안 함
  }

  store.setUsername(trimmedName); // 유저명 저장
  store.regenerateId();
  router.push({ name: 'Home' });
};
</script>

<template>
  <div class="login-container">
    <LoginForm @login="login">
      <template #logo>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-calendar"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      </template>
    </LoginForm>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-self: center;
  align-self: center;
  min-height: 70vh;
  background-color: var(--white);
  padding-top: 10rem;
}
</style>
