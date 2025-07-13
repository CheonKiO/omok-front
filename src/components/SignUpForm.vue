<template>
  <div class="signup-container">
    <div class="signup-card">
      <div class="logo-container">
        <div class="logo">
          <span class="logo-icon">
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
          </span>
        </div>
      </div>
      <h1 class="title">회원가입</h1>
      <p class="description">회원가입 양식을 작성해주세요.</p>

      <div class="form-group">
        <label for="loginId">아이디</label>
        <div class="input-with-button">
          <input
            type="text"
            id="loginId"
            v-model="loginId"
            placeholder="아이디를 입력하세요"
            class="input-field"
          />
          <button class="check-button" @click="checkloginId">중복확인</button>
        </div>
        <span v-if="loginIdError" class="validation-message">{{ loginIdError }}</span>
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
        <span v-if="passwordError" class="validation-message">{{ passwordError }}</span>
      </div>

      <div class="form-group">
        <label for="confirmPassword">비밀번호 확인</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          placeholder="비밀번호를 다시 입력하세요"
          class="input-field"
        />
        <span v-if="passwordMismatch" class="error-message">비밀번호가 일치하지 않습니다.</span>
      </div>

      <div class="form-group">
        <label for="name">이름</label>
        <input
          type="name"
          id="name"
          v-model="name"
          placeholder="이름을 입력하세요"
          class="input-field"
        />
        <span v-if="nameError" class="validation-message">{{ nameError }}</span>
      </div>

      <div class="form-group">
        <label for="email">이메일</label>
        <div class="email-input-wrapper">
          <input
            type="text"
            id="emailId"
            v-model="emailId"
            placeholder="이메일 아이디"
            class="input-field"
          />
          <span class="at-sign">@</span>
          <input
            v-if="emailDomain === 'custom'"
            type="text"
            v-model="customDomain"
            placeholder="도메인 입력"
            class="input-field"
          />
          <select v-else v-model="emailDomain" class="select-domain">
            <option disabled value="">도메인 선택</option>
            <option value="gmail.com">gmail.com</option>
            <option value="naver.com">naver.com</option>
            <option value="daum.net">daum.net</option>
            <option value="custom">직접 입력</option>
          </select>
        </div>
        <span v-if="emailError" class="validation-message">{{ emailError }}</span>
      </div>

      <div class="form-group">
        <label for="birthdate">생년월일</label>
        <input type="date" id="birthdate" v-model="birthdate" class="input-field" />
        <span v-if="birthdateError" class="validation-message">{{ birthdateError }}</span>
      </div>

      <div class="form-group">
        <label>프로필 사진</label>
        <div class="profile-upload">
          <div class="profile-preview" v-if="profilePreview">
            <img :src="profilePreview" alt="프로필 미리보기" />
          </div>
          <div class="profile-placeholder" v-else>
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
              class="lucide lucide-user"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <input
            type="file"
            id="profileImg"
            @change="handleImageUpload"
            accept="image/*"
            class="file-input"
          />
          <label for="profileImg" class="upload-button">사진 선택</label>
        </div>
      </div>
      <button class="signup-button" @click="signUp">회원가입</button>

      <div class="login-link">
        이미 계정이 있으신가요?
        <a href="#" @click.prevent="goToLogin">로그인</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
// import {
//   isValidLoginId,
//   isValidPassword,
//   isValidEmailId,
//   isValidDomain,
//   isValidBirthdate,
//   isValidName,
// } from '../Validators.js';

const router = useRouter()
const loginId = ref('')
const password = ref('')
const confirmPassword = ref('')
const emailId = ref('')
const emailDomain = ref('')
const customDomain = ref('')
const birthdate = ref('')
const profileImg = ref(null)
const profilePreview = ref('')
const name = ref('')

// 유효성 메시지
const loginIdError = ref('')
const passwordError = ref('')
const emailError = ref('')
const birthdateError = ref('')
const nameError = ref('')

const isIdChecked = ref(false)

const passwordMismatch = computed(() => {
  return password.value && confirmPassword.value && password.value !== confirmPassword.value
})

const checkloginId = async () => {
  if (!loginId.value) {
    alert('아이디를 입력해주세요.')
    return
  }

  const res = await axios.get(`http://localhost:3000/users`, {
    params: { loginId: loginId.value },
  })

  if (res.data.length > 0) {
    alert('이미 사용중인 아이디입니다.')
    isIdChecked.value = false
  } else {
    alert('사용 가능한 아이디입니다.')
    isIdChecked.value = true
  }
}

const email = computed(() => {
  return emailDomain.value === 'custom'
    ? `${emailId.value}@${customDomain.value}`
    : `${emailId.value}@${emailDomain.value}`
})

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    profileImg.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      profilePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}
const signUp = async () => {
  if (!isIdChecked.value) {
    alert('아이디 중복 확인을 해주세요.')
    return
  }
  if (
    !loginId.value ||
    !password.value ||
    !confirmPassword.value ||
    !emailId.value ||
    !emailDomain.value ||
    !birthdate.value ||
    !name.value
  ) {
    alert('모든 필수 항목을 입력해주세요.')
    return
  }

  if (password.value !== confirmPassword.value) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  try {
    // 중복 체크
    const res = await axios.get(`http://localhost:3000/users`, {
      params: { loginId: loginId.value },
    })

    if (res.data.length > 0) {
      alert('이미 사용중인 아이디입니다.')
      return
    }

    // 새 사용자 정보
    const newUser = {
      loginId: loginId.value,
      password: password.value,
      name: name.value,
      email: email.value,
      birthdate: birthdate.value,
      profileImg: profilePreview.value || '',

      homeColor: 'light',
      chartType1: 'pie',
      chartType2: 'bar',
    }

    await axios.post(`http://localhost:3000/users`, newUser)

    alert('회원가입이 완료되었습니다!')
    router.push('/login')
  } catch (err) {
    console.error('회원가입 오류:', err)
    alert('회원가입 중 오류가 발생했습니다.')
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 1.25rem; /* 20px */
}

.signup-card {
  background-color: var(--white);
  border-radius: 0.75rem; /* 12px */
  box-shadow: 0 0.75rem 1.5rem rgba(var(--black), 0.1); /* 12px 24px */
  padding: 2.5rem; /* 40px */
  width: 100%;
  max-width: 31.25rem; /* 500px */
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
  color: var(--black);
  text-align: center;
}

.description {
  color: var(--grey01);
  margin-bottom: 1.875rem; /* 30px */
  font-size: 0.875rem; /* 14px */
  text-align: center;
}

.form-group {
  margin-bottom: 1.25rem; /* 20px */
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
  border: 1px solid var(--grey05);
  border-radius: 0.5rem; /* 8px */
  font-size: 0.875rem; /* 14px */
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: var(--mainColor);
  outline: none;
}

.input-with-button {
  display: flex;
  gap: 0.5rem; /* 8px */
}

.input-with-button .input-field {
  flex: 1;
}

.check-button {
  padding: 0 1rem; /* 0 16px */
  background-color: var(--mainColor);
  color: var(--white);
  border: none;
  border-radius: 0.5rem; /* 8px */
  font-size: 0.875rem; /* 14px */
  cursor: pointer;
  white-space: nowrap;
}

.check-button:hover {
  background-color: #6d28d9;
}

.email-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* 8px */
  flex-wrap: wrap;
}

.email-input-wrapper .input-field {
  flex: 1;
  min-width: 7.5rem; /* 120px */
}

.at-sign {
  font-size: 0.875rem; /* 14px */
  color: var(--grey01);
}

.select-domain {
  padding: 0.75rem 1rem; /* 12px 16px */
  border: 1px solid var(--grey05);
  border-radius: 0.5rem; /* 8px */
  font-size: 0.875rem; /* 14px */
  background-color: var(--white);
  min-width: 8.75rem; /* 140px */
}

.error-message {
  color: #e53e3e;
  font-size: 0.75rem; /* 12px */
  margin-top: 0.25rem; /* 4px */
  display: block;
}

.profile-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem; /* 12px */
}

.profile-preview,
.profile-placeholder {
  width: 6.25rem; /* 100px */
  height: 6.25rem; /* 100px */
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--grey05);
}

.profile-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-placeholder {
  color: var(--grey01);
}

.file-input {
  display: none;
}

.upload-button {
  padding: 0.5rem 1rem; /* 8px 16px */
  background-color: var(--grey05);
  color: var(--grey01);
  border: 1px solid var(--grey04);
  border-radius: 0.5rem; /* 8px */
  font-size: 0.875rem; /* 14px */
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-button:hover {
  background-color: var(--grey04);
}

.signup-button {
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
  margin-top: 0.625rem; /* 10px */
}

.signup-button:hover {
  background-color: #6d28d9;
}

.login-link {
  margin-top: 1.25rem; /* 20px */
  text-align: center;
  font-size: 0.875rem; /* 14px */
  color: var(--grey01);
}

.login-link a {
  color: var(--mainColor);
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

.validation-message {
  color: #e53e3e;
  font-size: 0.75rem; /* 12px */
  margin-top: 0.25rem;
  display: block;
}
</style>
