import { createRouter, createWebHistory } from 'vue-router';

//지연로딩
const Room = () => import('@/pages/BoardPage.vue');
const Login = () => import('@/pages/LoginPage.vue');
const Signup = () => import('@/pages/SignupPage.vue');
const Home = () => import('@/pages/HomePage.vue');
// const NotFound = () => import('');
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), //라이팅 모드설정
  routes: [
    //라우트 :path는 /소문자, component는 대문자로 시작하는 카멜케이스
    { name: 'Home', path: '/', component: Home },
    { name: 'Room', path: '/room/:roomNo', component: Room },
    { path: '/login', component: Login },
    { path: '/signup', component: Signup },
    // { path: '/:paths(.*)*', name: 'NotFound', component: NotFound },
  ],
});
export default router;
