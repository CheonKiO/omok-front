import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    playerId: uuidv4(), // 최초 생성 시 고유 ID 부여
  }),
  actions: {
    regenerateId() {
      this.playerId = uuidv4();
    },
  },
});

// 로컬 스토리지 사용. 테스트에서는 안씀
// export const usePlayerStore = defineStore('player', {
//   state: () => ({
//     playerId: localStorage.getItem('playerId') || uuidv4(),
//   }),
//   actions: {
//     regenerateId() {
//       this.playerId = uuidv4();
//       localStorage.setItem('playerId', this.playerId);
//     },
//   },
//   persist: true, // if using pinia-plugin-persistedstate
// });
