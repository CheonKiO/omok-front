<template>
  <div class="signup-container">
    <SignUpForm @submit="signUp" @login="goToLogin">
      <template #logo>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="lucide lucide-user-plus"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M7 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      </template>
    </SignUpForm>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import axios from 'axios';
import SignUpForm from '../components/SignUpForm.vue';
const router = useRouter();

const signUp = async (formData) => {
  const { loginId, password, confirmPassword, email, birthdate, profileImg, name } = formData;

  if (!loginId || !password || !confirmPassword || !email || !birthdate || !name) {
    alert('모든 필드를 입력해주세요.');
    return;
  }

  if (password !== confirmPassword) {
    alert('비밀번호가 일치하지 않습니다.');
    return;
  }

  try {
    const { data } = await axios.get('http://localhost:3000/users', {
      params: { loginId },
    });

    if (data.length > 0) {
      alert('이미 존재하는 아이디입니다.');
      return;
    }

    await axios.post('http://localhost:3000/users', {
      loginId,
      password,
      name,
      email,
      birthdate,
      profileImg,
      frontSize: 12,
      homeColor: 'light',
      chartType: 'circle',
    });

    alert('회원가입 완료!');
    router.push('/login');
  } catch (err) {
    console.error('회원가입 실패:', err);
    alert('회원가입 중 오류가 발생했습니다.');
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.signup-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--white);
  padding: 20px;
}
</style>
