import axios from 'axios';
import { useServerStore } from '@/stores/server';

// 방 관련 REST 호출을 한 곳에 모은다. auth 헤더는 interceptors.js가 전역 부착하므로
// 여기서는 호출 응집만 담당한다.
function baseUrl() {
  return useServerStore().BASEURL;
}

export function createRoom(params) {
  return axios.post(`${baseUrl()}/api/rooms/create`, null, { params });
}

export function joinRoom(roomId, player, params = {}) {
  return axios.post(`${baseUrl()}/api/rooms/join/${roomId}`, player, { params });
}

export function fetchRooms() {
  return axios.get(`${baseUrl()}/api/rooms`);
}

export function getRoom(roomNo) {
  return axios.get(`${baseUrl()}/api/rooms/${roomNo}`);
}

export function leaveRoom(roomNo, playerId) {
  return axios.post(`${baseUrl()}/api/rooms/leave/${roomNo}`, null, {
    params: { playerId },
  });
}
