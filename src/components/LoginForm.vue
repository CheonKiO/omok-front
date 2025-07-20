<template>
  <div class="login-form-container">
    <form class="login-card" @submit.prevent="handleLogin">
      <div class="logo-container">
        <div class="logo">
          <span class="logo-icon">
            <slot name="logo" />
          </span>
        </div>
      </div>

      <h1 class="title">유저 등록</h1>
      <p class="description">다른 유저에게 보일 닉네임을 입력해주세요.</p>

      <div class="form-group">
        <label for="username">닉네임</label>
        <input
          type="text"
          id="username"
          v-model="username"
          placeholder="닉네임을 입력하세요"
          class="input-field"
        />
      </div>

      <button type="submit" class="login-button">로그인</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['login', 'signup', 'forgot']);

const username = ref('');

const handleLogin = () => {
  emit('login', { username: username.value });
};
</script>

<style scoped>
.login-form-container {
  width: 100%;
}

.login-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* ✨ 그림자 추가 */
  border-radius: 0.75rem; /* 12px */
  padding: 2.5rem 3rem; /* 40px */
  width: 100%;
  box-sizing: border-box;
  max-width: 30rem; /* 400px */
  text-align: center;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem; /* 20px */
}

.logo {
  width: 5rem; /* 80px */
  height: 5rem; /* 80px */
  border-radius: 50%;
  background-color: var(--mainColor);
  display: flex;
  align-items: center;
  justify-content: center;
  color: wheat;
}

.logo-icon {
  font-size: 2rem; /* 32px */
}

.title {
  font-size: 1.5rem; /* 24px */
  font-weight: 700;
  margin-bottom: 0.5rem; /* 8px */
  color: var(--grey01);
}

.description {
  color: var(--grey02);
  margin-bottom: 1.875rem; /* 30px */
  font-size: 0.875rem; /* 14px */
}

.form-group {
  margin-bottom: 1.25rem; /* 20px */
  text-align: left;
}

label {
  display: block;
  margin-bottom: 0.375rem; /* 6px */
  font-size: 0.875rem; /* 14px */
  font-weight: 500;
  color: var(--grey01);
}

.input-field {
  width: 90%;
  padding: 0.75rem 1rem; /* 12px 16px */
  border: 1px solid #ddd;
  border-radius: 0.5rem; /* 8px */
  font-size: 0.875rem; /* 14px */
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: var(--mainColor);
  outline: none;
}

.login-button {
  width: 100%;
  padding: 0.75rem; /* 12px */
  background-color: var(--mainColor);
  color: wheat;
  border: none;
  border-radius: 0.5rem; /* 8px */
  font-size: 1rem; /* 16px */
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}
</style>
