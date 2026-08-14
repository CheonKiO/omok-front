import { defineStore } from 'pinia';
import axios from 'axios';
import { useServerStore } from '@/stores/server';
import { usePlayerStore } from '@/stores/user';

// 인증 상태 및 토큰 관리 스토어.
// 게임 로직은 usePlayerStore(playerId/username)를 계속 사용하므로,
// 로그인/게스트/회원가입 성공 시 닉네임을 player 스토어에도 반영한다.
export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: JSON.parse(localStorage.getItem('authUser') || 'null'), // { subject, role, nickname }
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    role: (state) => state.user?.role ?? null,
    nickname: (state) => state.user?.nickname ?? null,
  },
  actions: {
    _base() {
      return useServerStore().BASEURL;
    },
    _persist() {
      if (this.accessToken) localStorage.setItem('accessToken', this.accessToken);
      else localStorage.removeItem('accessToken');
      if (this.refreshToken) localStorage.setItem('refreshToken', this.refreshToken);
      else localStorage.removeItem('refreshToken');
      if (this.user) localStorage.setItem('authUser', JSON.stringify(this.user));
      else localStorage.removeItem('authUser');
    },
    // 게임 로직이 쓰는 player 스토어에 신원 반영
    _applyIdentity(nickname) {
      const player = usePlayerStore();
      player.setUsername(nickname);
      if (!player.playerId) player.regenerateId();
    },

    async signup({ username, password, nickname }) {
      // 201, body 없음. 중복 아이디 → 409
      await axios.post(`${this._base()}/api/auth/signup`, { username, password, nickname });
      // 가입 직후 자동 로그인 (login 응답에는 nickname이 없으므로 가입 닉네임을 넘겨 표시에 사용)
      await this.login({ username, password, nickname });
    },

    async login({ username, password, nickname = null }) {
      const { data } = await axios.post(`${this._base()}/api/auth/login`, { username, password });
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      // 로그인 응답/`/users/me`에는 nickname이 없으므로 없으면 username(subject)으로 대체
      this.user = { subject: username, role: 'USER', nickname: nickname ?? username };
      this._persist();
      this._applyIdentity(this.user.nickname);
    },

    async guest({ nickname }) {
      // 게스트는 refreshToken: null, DB 미저장
      const { data } = await axios.post(`${this._base()}/api/auth/guest`, { nickname });
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken; // null
      this.user = { subject: nickname, role: 'GUEST', nickname };
      this._persist();
      this._applyIdentity(nickname);
    },

    async refresh() {
      if (!this.refreshToken) throw new Error('no refresh token');
      const { data } = await axios.post(`${this._base()}/api/auth/refresh`, {
        refreshToken: this.refreshToken,
      });
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this._persist();
    },

    async fetchMe() {
      const { data } = await axios.get(`${this._base()}/api/users/me`);
      this.user = { ...(this.user ?? {}), subject: data.subject, role: data.role };
      if (!this.user.nickname) this.user.nickname = data.subject;
      this._persist();
      return data;
    },

    async logout() {
      try {
        if (this.refreshToken) {
          await axios.post(`${this._base()}/api/auth/logout`, { refreshToken: this.refreshToken });
        }
      } catch {
        // 서버 로그아웃 실패해도 로컬 정리는 진행
      }
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      this._persist();
      usePlayerStore().logout();
    },
  },
});
