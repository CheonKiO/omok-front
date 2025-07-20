import { createRouter, createWebHistory } from 'vue-router';
import { usePlayerStore } from '@/stores/user.js';
import { useToast } from '@/composable/useToast';
import { useWebSocketStore } from '@/stores/websocket';
//지연로딩
const Room = () => import('@/pages/BoardPage.vue');
const Login = () => import('@/pages/LoginPage.vue');
const Home = () => import('@/pages/HomePage.vue');
// const NotFound = () => import('');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), //라이팅 모드설정
  routes: [
    //라우트 :path는 /소문자, component는 대문자로 시작하는 카멜케이스
    { name: 'Home', path: '/', component: Home },
    { name: 'Room', path: '/room/:roomNo', component: Room },
    { name: 'Login', path: '/login', component: Login },
    // { path: '/:paths(.*)*', name: 'NotFound', component: NotFound },
  ],
});

router.beforeEach((to, from, next) => {
  const playerStore = usePlayerStore();
  const isLoggedIn = !!playerStore.playerId && !!playerStore.username;
  const goingToLogin = to.path === '/login';
  const { show } = useToast();

  const savedRoomId = useWebSocketStore().roomId;
  // ✅ 1. roomId가 있고, 현재 경로가 해당 방이 아니라면 → 강제 이동
  if (savedRoomId && to.path !== `/room/${savedRoomId}`) {
    return next(`/room/${savedRoomId}`);
  }
  if (!isLoggedIn && !goingToLogin) {
    // 로그인 안 했고 로그인 페이지가 아니라면 → 로그인으로 리다이렉트
    show('로그인을 먼저 해야 합니다', 1500);
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
