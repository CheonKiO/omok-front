import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

// 동시에 여러 요청이 401을 받아도 refresh는 1회만 수행 (single-flight)
let refreshPromise = null;

// 기본 axios 인스턴스에 인증 헤더 부착 + 401 자동 refresh 재시도를 설치한다.
// 기존 코드가 전역 axios를 그대로 사용하므로 별도 인스턴스 대신 전역에 등록한다.
export function setupInterceptors(router) {
  axios.interceptors.request.use((config) => {
    const auth = useAuthStore();
    if (auth.accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }
    return config;
  });

  axios.interceptors.response.use(
    (res) => res,
    async (error) => {
      const auth = useAuthStore();
      const original = error.config;
      const status = error.response?.status;
      const url = original?.url ?? '';

      // 401이 아니거나, 인증 엔드포인트 자체의 실패거나, 이미 재시도한 요청이면 그대로 반환
      if (status !== 401 || url.includes('/api/auth/') || original?._retry) {
        return Promise.reject(error);
      }

      // refresh 토큰이 없으면(게스트 등) 바로 로그아웃
      if (!auth.refreshToken) {
        await auth.logout();
        redirectToLogin(router);
        return Promise.reject(error);
      }

      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = auth.refresh().finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
      } catch (e) {
        await auth.logout();
        redirectToLogin(router);
        return Promise.reject(e);
      }

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${auth.accessToken}`;
      return axios(original);
    },
  );
}

function redirectToLogin(router) {
  if (router.currentRoute.value.path !== '/login') {
    router.push('/login');
  }
}
