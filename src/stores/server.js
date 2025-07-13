import { defineStore } from 'pinia';
export const useServerStore = defineStore('server', () => {
  const BASEURL = 'http://localhost:8080';
  return { BASEURL };
});
