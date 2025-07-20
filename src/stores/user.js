import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    playerId: localStorage.getItem('playerId') || null,
    username: localStorage.getItem('username') || 'anonymous',
  }),
  actions: {
    regenerateId() {
      this.playerId = uuidv4();
      localStorage.setItem('playerId', this.playerId);
    },
    setUsername(name) {
      this.username = name;
      localStorage.setItem('username', name);
    },
    logout() {
      this.playerId = null;
      this.username = null;
      localStorage.removeItem('playerId');
      localStorage.removeItem('username');
    },
  },
});
