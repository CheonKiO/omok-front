import axios from 'axios';
import { useServerStore } from '@/stores/server';

// 기보(종료된 대국) REST 호출. auth 헤더는 interceptors.js가 전역 부착.
function baseUrl() {
  return useServerStore().BASEURL;
}

// 내 기보 목록(최신순). 회원만 데이터 있음.
export function fetchMyGames() {
  return axios.get(`${baseUrl()}/api/games`);
}

// 기보 상세(복기용 moves 포함). 참가자 본인만.
export function getGame(id) {
  return axios.get(`${baseUrl()}/api/games/${id}`);
}
