<template>
  <div class="login-form-container">
    <div class="login-card">
      <div class="brand">
        <div class="stone-deco black-stone"></div>
        <h1 class="brand-title">오 목</h1>
        <div class="stone-deco white-stone"></div>
      </div>

      <div class="tabs">
        <button
          type="button"
          class="tab"
          :class="{ active: mode === 'login' }"
          @click="mode = 'login'"
        >
          로그인
        </button>
        <button
          type="button"
          class="tab"
          :class="{ active: mode === 'signup' }"
          @click="mode = 'signup'"
        >
          회원가입
        </button>
        <button
          type="button"
          class="tab"
          :class="{ active: mode === 'guest' }"
          @click="mode = 'guest'"
        >
          게스트
        </button>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <!-- 로그인 -->
        <template v-if="mode === 'login'">
          <div class="form-group">
            <label for="login-username">아이디</label>
            <input
              id="login-username"
              v-model="username"
              type="text"
              class="input-field"
              autocomplete="username"
            />
          </div>
          <div class="form-group">
            <label for="login-password">비밀번호</label>
            <input
              id="login-password"
              v-model="password"
              type="password"
              class="input-field"
              autocomplete="current-password"
            />
          </div>
        </template>

        <!-- 회원가입 -->
        <template v-else-if="mode === 'signup'">
          <div class="form-group">
            <label for="signup-username">아이디</label>
            <input
              id="signup-username"
              v-model="username"
              type="text"
              class="input-field"
              placeholder="4~50자"
              autocomplete="username"
            />
          </div>
          <div class="form-group">
            <label for="signup-password">비밀번호</label>
            <input
              id="signup-password"
              v-model="password"
              type="password"
              class="input-field"
              placeholder="8~100자"
              autocomplete="new-password"
            />
          </div>
          <div class="form-group">
            <label for="signup-nickname">호칭 (닉네임)</label>
            <input
              id="signup-nickname"
              v-model="nickname"
              type="text"
              class="input-field"
              placeholder="2~20자"
              autocomplete="off"
            />
          </div>
        </template>

        <!-- 게스트 -->
        <template v-else>
          <p class="description">대국에 사용할 호칭을 입력하십시오</p>
          <div class="form-group">
            <label for="guest-nickname">호칭 (닉네임)</label>
            <input
              id="guest-nickname"
              v-model="nickname"
              type="text"
              class="input-field"
              placeholder="2~20자"
              autocomplete="off"
            />
          </div>
        </template>

        <button type="submit" class="login-button" :disabled="loading">
          {{ submitLabel }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from '@/composable/useToast';

defineProps({
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(['submit']);
const { show } = useToast();

const mode = ref('login');
const username = ref('');
const password = ref('');
const nickname = ref('');

const submitLabel = computed(() =>
  mode.value === 'login' ? '로그인' : mode.value === 'signup' ? '가입하기' : '입 장',
);

function inRange(v, min, max) {
  return v.length >= min && v.length <= max;
}

// 백엔드 validation 제약을 프론트에서도 안내
function validate() {
  const u = username.value.trim();
  const p = password.value;
  const n = nickname.value.trim();

  if (mode.value === 'login') {
    if (!u || !p) {
      show('아이디와 비밀번호를 입력하세요', 'error', 1500);
      return null;
    }
    return { username: u, password: p };
  }

  if (mode.value === 'signup') {
    if (!inRange(u, 4, 50)) {
      show('아이디는 4~50자여야 합니다', 'error', 1500);
      return null;
    }
    if (!inRange(p, 8, 100)) {
      show('비밀번호는 8~100자여야 합니다', 'error', 1500);
      return null;
    }
    if (!inRange(n, 2, 20)) {
      show('닉네임은 2~20자여야 합니다', 'error', 1500);
      return null;
    }
    return { username: u, password: p, nickname: n };
  }

  // guest
  if (!inRange(n, 2, 20)) {
    show('닉네임은 2~20자여야 합니다', 'error', 1500);
    return null;
  }
  return { nickname: n };
}

function handleSubmit() {
  const payload = validate();
  if (!payload) return;
  emit('submit', { mode: mode.value, payload });
}
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
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
}

.stone-deco {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.black-stone {
  background: radial-gradient(circle at 35% 35%, #666, #111);
  box-shadow:
    1px 2px 4px rgba(0, 0, 0, 0.5),
    inset -1px -1px 3px rgba(255, 255, 255, 0.1);
}

.white-stone {
  background: radial-gradient(circle at 35% 35%, #fff, #bbb);
  box-shadow:
    1px 2px 4px rgba(0, 0, 0, 0.3),
    inset -1px -1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #aaa;
}

.tabs {
  display: flex;
  margin-bottom: 1.6rem;
  border: 1px solid var(--borderColor);
  border-radius: 2px;
  overflow: hidden;
}

.tab {
  flex: 1;
  padding: 0.5rem 0;
  font-size: 0.85rem;
  font-family: 'ChosunGs', serif;
  letter-spacing: 0.08em;
  background: transparent;
  border: none;
  color: var(--inkMid);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.tab.active {
  background: var(--mainColor);
  color: #f5e9ce;
  font-weight: 600;
}

.tab:not(.active):hover {
  background: rgba(92, 46, 14, 0.06);
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
  background: rgba(255, 255, 255, 0.7);
  color: var(--inkColor);
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input-field:focus {
  border-color: var(--mainColor);
  box-shadow: 0 0 0 2px rgba(92, 46, 14, 0.15);
  outline: none;
  background: rgba(255, 255, 255, 0.9);
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(180deg, #6b3a1f 0%, #4a2410 100%);
  color: #f3ecd6;
  border: none;
  border-radius: 3px;
  font-size: 1rem;
  font-family: 'ChosunGs', serif;
  font-weight: normal;
  letter-spacing: 0.3em;
  cursor: pointer;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
  box-shadow: 0 2px 5px rgba(44, 21, 5, 0.22);
  transition: background 0.2s ease, transform 0.1s ease;
  margin-top: 0.4rem;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(180deg, #7c4a2a 0%, #5c2e0e 100%);
}

.login-button:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: inset 0 1px 3px rgba(20, 10, 0, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
