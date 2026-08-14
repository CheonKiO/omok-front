import { ref, reactive, computed } from 'vue';

export const SIZE = 15;

// 보드/턴/플레이어 관련 반응형 상태만 담당한다.
export function useGameState() {
  const timerRef = ref(null);

  const room = reactive({
    title: '',
    roomId: '',
    turn: 1,
    board: Array(SIZE * SIZE).fill(null),
    isPlaying: false,
  });

  const opponent = reactive({ id: null, name: null, ready: false });
  const lastIndex = ref(null);
  const moveHistory = ref([]);
  const myStoneIsBlack = ref(null);

  const isMyTurn = computed(() => {
    const isBlackTurn = room.turn % 2 === 1;
    return myStoneIsBlack.value === isBlackTurn;
  });

  return {
    room, opponent, lastIndex, moveHistory, myStoneIsBlack, timerRef, isMyTurn,
  };
}
