<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composable/useToast';
import AuthPanel from '@/components/AuthPanel.vue';

const router = useRouter();
const auth = useAuthStore();
const { show } = useToast();
const loading = ref(false);

async function onSubmit({ mode, payload }) {
  if (loading.value) return;
  loading.value = true;
  try {
    if (mode === 'login') {
      await auth.login(payload);
    } else if (mode === 'signup') {
      await auth.signup(payload);
    } else {
      await auth.guest(payload);
    }
    router.push({ name: 'Home' });
  } catch (error) {
    show(errorMessage(mode, error), 'error', 2000);
  } finally {
    loading.value = false;
  }
}

function errorMessage(mode, error) {
  const status = error.response?.status;
  if (mode === 'signup' && status === 409) return '이미 사용 중인 아이디입니다';
  if (mode === 'login' && status === 401) return '아이디 또는 비밀번호가 올바르지 않습니다';
  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요';
}
</script>

<template>
  <div class="login-container">
    <AuthPanel :loading="loading" @submit="onSubmit" />
  </div>
</template>

<style scoped>
.login-container {
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
  overflow: auto;
}
</style>
