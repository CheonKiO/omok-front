import { defineStore } from 'pinia';
export const useServerStore = defineStore('server', () => {
  const BASEURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
  return { BASEURL };
});
