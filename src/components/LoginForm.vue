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

      <h1 class="title">로그인</h1>
      <p class="description">로그인 하기 위해 아이디와 비밀번호를 입력하세요.</p>

      <div class="form-group">
        <label for="loginId">아이디</label>
        <input
          type="text"
          id="loginId"
          v-model="loginId"
          placeholder="아이디를 입력하세요"
          class="input-field"
        />
      </div>

      <div class="form-group">
        <label for="password">비밀번호</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="비밀번호를 입력하세요"
          class="input-field"
        />
      </div>

      <button type="submit" class="login-button">로그인</button>

      <div class="links">
        <a href="#" @click.prevent="$emit('signup')">회원가입</a>
        <a href="#" @click.prevent="$emit('forgot')">비밀번호 찾기</a>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login', 'signup', 'forgot'])

const loginId = ref('')
const password = ref('')

const handleLogin = () => {
  emit('login', { loginId: loginId.value, password: password.value })
}
</script>

<style scoped>
.login-form-container {
  width: 100%;
}

.login-card {
  background-color: var(--white);
  border-radius: 0.75rem; /* 12px */
  box-shadow: 0 0.75rem 1.5rem rgba(var(--black), 0.1); /* 12px 24px */
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
  color: var(--white);
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
  color: var(--white);
  border: none;
  border-radius: 0.5rem; /* 8px */
  font-size: 1rem; /* 16px */
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #6d28d9;
}

.links {
  margin-top: 1.25rem; /* 20px */
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem; /* 14px */
}

.links a {
  color: var(--mainColor);
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>
