<script setup>
import { useRouter } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import axios from 'axios';
import { errorMessages } from 'vue/compiler-sfc';
// import { useUserStore } from '../Store';
// import { useToastStore } from '@/stores/toastStore';

const router = useRouter();
// const userStore = useUserStore();
// const toastStore = useToastStore();

const login = async ({ loginId, password }) => {
  try {
    const res = await axios.get('http://localhost:3000/users', {
      params: { loginId: loginId },
    });
    if (res.data.length === 0) {
      // toastStore.showToast('존재하지 않는 아이디입니다.', 'error');
      errorMessages.value = '존재하지 않는 아이디입니다.';
      return;
    }
    const user = res.data[0];
    if (user.password !== password) {
      // toastStore.showToast('비밀번호가 일치하지 않습니다.', 'error');
      errorMessages.value = '비밀번호가 일치하지 않습니다.';
      return;
    }
    // 로그인 성공
    // userStore.loginUser(user);
    // toastStore.showToast('로그인 성공!', 'success');
    router.push(`/`);
  } catch (err) {
    console.log('로그인 오류', err);
    errorMessages.value = '로그인 중 오류가 발생했습니다.';
  }
};

const goToSignUp = () => {
  router.push('/signup');
};

const forgotPassword = () => {
  router.push('/find-password');
};
</script>

<template>
  <div class="login-container">
    <LoginForm @login="login" @signup="goToSignUp" @forgot="forgotPassword">
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
