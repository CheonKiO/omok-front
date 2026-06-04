<template>
  <div class="login-form-container">
    <form class="login-card" @submit.prevent="handleLogin">

      <div class="brand">
        <div class="stone-deco black-stone"></div>
        <h1 class="brand-title">오 목</h1>
        <div class="stone-deco white-stone"></div>
      </div>

      <div class="divider"><span>유저 등록</span></div>

      <p class="description">대국에 사용할 호칭을 입력하십시오</p>

      <div class="form-group">
        <label for="username">호칭 (닉네임)</label>
        <input
          type="text"
          id="username"
          v-model="username"
          placeholder="두 글자 이상"
          class="input-field"
          autocomplete="off"
        />
      </div>

      <button type="submit" class="login-button">입 장</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['login']);
const username = ref('');
const handleLogin = () => emit('login', { username: username.value });
</script>

<style scoped>
.login-form-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.login-card {
  background: linear-gradient(160deg, #fdf6e3 0%, #f0deb8 100%);
  border: 1px solid var(--borderColor);
  box-shadow:
    0 0 0 4px #f5e9ce,
    0 0 0 5px var(--borderColor),
    0 8px 32px rgba(44, 21, 5, 0.25);
  border-radius: 4px;
  padding: 2.8rem 3rem;
  width: 100%;
  max-width: 26rem;
  box-sizing: border-box;
  text-align: center;
}

/* 브랜드 영역 */
.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.4rem;
}

.brand-title {
  font-family: 'ChosunGs', serif;
  font-size: 2.6rem;
  color: var(--inkColor);
  letter-spacing: 0.4em;
  margin: 0;
  text-shadow: 1px 1px 0 rgba(255,255,255,0.5);
}

.stone-deco {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.black-stone {
  background: radial-gradient(circle at 35% 35%, #666, #111);
  box-shadow: 1px 2px 4px rgba(0,0,0,0.5), inset -1px -1px 3px rgba(255,255,255,0.1);
}

.white-stone {
  background: radial-gradient(circle at 35% 35%, #fff, #bbb);
  box-shadow: 1px 2px 4px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(0,0,0,0.05);
  border: 1px solid #aaa;
}

/* 구분선 */
.divider {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
  color: var(--inkMid);
  font-size: 0.85rem;
  font-family: 'ChosunGs', serif;
  letter-spacing: 0.15em;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--borderColor));
}
.divider::after {
  background: linear-gradient(to left, transparent, var(--borderColor));
}

.description {
  color: var(--inkMid);
  margin-bottom: 1.6rem;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
}

.form-group {
  margin-bottom: 1.2rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--inkMid);
  letter-spacing: 0.05em;
}

.input-field {
  width: 100%;
  padding: 0.65rem 0.9rem;
  border: 1px solid var(--borderColor);
  border-radius: 2px;
  font-size: 0.9rem;
  font-family: var(--app-font);
  background: rgba(255,255,255,0.7);
  color: var(--inkColor);
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  border-color: var(--mainColor);
  box-shadow: 0 0 0 2px rgba(92, 46, 14, 0.15);
  outline: none;
  background: rgba(255,255,255,0.9);
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(180deg, var(--inkMid) 0%, var(--mainColor) 100%);
  color: #f5e9ce;
  border: 1px solid var(--mainColor);
  border-radius: 3px;
  font-size: 1rem;
  font-family: 'ChosunGs', serif;
  font-weight: normal;
  letter-spacing: 0.3em;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(44,21,5,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
  transition: all 0.2s ease;
  margin-top: 0.4rem;
}

.login-button:hover {
  background: linear-gradient(180deg, #7c4a1e 0%, #3d1f0d 100%);
  box-shadow: 0 4px 12px rgba(44,21,5,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
}

.login-button:active {
  transform: translateY(1px);
  box-shadow: 0 1px 4px rgba(44,21,5,0.3);
}
</style>
