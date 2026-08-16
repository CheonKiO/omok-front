import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composable/useToast';
import { useWebSocketStore } from '@/stores/websocket';
import { getRoom } from '@/api/rooms';
import { shouldReturnToRoom } from '@/router/guard';
//지연로딩
const Room = () => import('@/pages/BoardPage.vue');
const Login = () => import('@/pages/LoginPage.vue');
const Home = () => import('@/pages/HomePage.vue');
const Games = () => import('@/pages/GamesPage.vue');
const Replay = () => import('@/pages/ReplayPage.vue');
// const NotFound = () => import('');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), //라이팅 모드설정
  routes: [
    //라우트 :path는 /소문자, component는 대문자로 시작하는 카멜케이스
    { name: 'Home', path: '/', component: Home },
    { name: 'Room', path: '/room/:roomNo', component: Room },
    { name: 'Games', path: '/games', component: Games },
    { name: 'Replay', path: '/games/:id', component: Replay },
    { name: 'Login', path: '/login', component: Login },
    // { path: '/:paths(.*)*', name: 'NotFound', component: NotFound },
  ],
});

router.beforeEach(async (to, from, next) => {
  const isLoggedIn = useAuthStore().isAuthenticated;
  const goingToLogin = to.path === '/login';
  const { show } = useToast();

  const ws = useWebSocketStore();
  const savedRoomId = ws.roomId;
  // 방 복귀는 인증된 사용자만. 미인증인데 저장값이 남아있으면(토큰 만료된 이전 세션 잔재)
  // 방으로 되돌려도 WS CONNECT가 실패하고, GET /api/rooms/**가 permitAll이라
  // getRoom이 성공해 /login ↔ /room/X 무한 리다이렉트가 된다 → 정리하고 통과시킨다.
  if (savedRoomId && !isLoggedIn) {
    ws.clearRoomId();
    ws.roomId = null;
  } else if (shouldReturnToRoom(isLoggedIn, savedRoomId, to.path)) {
    try {
      await getRoom(savedRoomId);
      return next(`/room/${savedRoomId}`);
    } catch {
      ws.clearRoomId();
      ws.roomId = null;
    }
  }

  if (!isLoggedIn && !goingToLogin) {
    // 로그인 안 했고 로그인 페이지가 아니라면 → 로그인으로 리다이렉트
    show('로그인을 먼저 해야 합니다', 'error', 1500);
    next('/login');
  } else if (isLoggedIn && goingToLogin) {
    // 로그인 했는데 로그인 페이지 접근하면 → 홈으로 리다이렉트
    next('/');
  } else {
    // 그 외에는 정상 이동
    next();
  }
});
export default router;
