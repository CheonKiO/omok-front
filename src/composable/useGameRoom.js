import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useWebSocketStore } from '@/stores/websocket';
import { useServerStore } from '@/stores/server';
import { useToast } from '@/composable/useToast';
import { isForbidden } from '@/composable/useGameLogic';
import axios from 'axios';

const SIZE = 15;

export function useGameRoom(roomNo, player) {
  const router = useRouter();
  const ws = useWebSocketStore();
  const server = useServerStore();
  const { show } = useToast();

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
  const opponentDisconnected = ref(false);
  const reconnectCountdown = ref(30);
  let reconnectTimer = null;

  const isMyTurn = computed(() => {
    const isBlackTurn = room.turn % 2 === 1;
    return myStoneIsBlack.value === isBlackTurn;
  });

  // ── 데이터 로드 ────────────────────────────────────────────

  async function load() {
    const { data } = await axios.get(`${server.BASEURL}/api/rooms/${roomNo}`);
    room.title = data.title;
    room.roomId = data.roomId;
    room.turn = data.turn;
    room.board.splice(0, room.board.length, ...data.board.map((v) => (v === 0 ? null : v)));
    room.isPlaying = data.isPlaying;

    const opp = data.players.find((p) => p.id !== player.id);
    if (opp != null) {
      opponent.id = opp.id;
      opponent.name = opp.name;
    }
    if (data.isPlaying && data.blackPlayer) {
      myStoneIsBlack.value = data.blackPlayer === player.id;
    }
  }

  // ── 게임 액션 ─────────────────────────────────────────────

  function publish(destination, body) {
    ws.stompClient?.publish({ destination, body: JSON.stringify(body) });
  }

  function handleClick(index) {
    if (!room.isPlaying || !isMyTurn.value) return;
    if (room.turn % 2 === 1 && isForbidden(room.board, index)) {
      show('해당 위치는 금수입니다', 'error', 2000);
      return;
    }
    publish('/app/move', { type: 'ACTION', sender: player, roomId: room.roomId ?? roomNo, index });
  }

  function handleSurrender() {
    publish('/app/surrender', { type: 'SURRENDER', sender: player, roomId: room.roomId ?? roomNo });
  }

  function handleReady() {
    publish('/app/ready', { type: 'READY', sender: player, roomId: room.roomId ?? roomNo });
  }

  function handleTimeout() {
    if (!room.isPlaying || !isMyTurn.value) return;
    publish('/app/timeout', { type: 'TIMEOUT', sender: player, roomId: room.roomId ?? roomNo });
  }

  // ── 무르기 (서버 미연동, todo) ────────────────────────────

  function request() {
    if (room.turn <= 1 || moveHistory.value.length === 0) {
      show('더 이상 무를 수 없습니다.', 'error');
      return;
    }
    timerRef.value?.pause();
    const confirmed = confirm('한 수 무르기에 동의하시겠습니까?');
    timerRef.value?.resume();
    if (confirmed) undoMove();
  }

  function undoMove() {
    const removedIndex = moveHistory.value.pop();
    room.board[removedIndex] = null;
    room.turn--;
    lastIndex.value = moveHistory.value.at(-1) ?? null;
    show('한 수를 무르셨습니다.', 'info');
  }

  // ── 방 나가기 ─────────────────────────────────────────────

  async function disconnect() {
    try {
      await axios.post(`${server.BASEURL}/api/rooms/leave/${roomNo}`, null, {
        params: { playerId: player.id },
      });
    } catch (e) {
      console.error('방 나가기 오류 발생:', e);
    } finally {
      ws.disconnect();
      router.push({ name: 'Home' });
    }
  }

  // ── WebSocket 메시지 처리 ─────────────────────────────────

  function handleMessage(msg) {
    switch (msg.type) {
      case 'JOIN':
        if (msg.sender === player.id) return;
        opponent.name = msg.message;
        opponent.id = msg.sender;
        show(`${msg.message}님이 입장하셨습니다`);
        break;

      case 'GAME_START':
        room.isPlaying = true;
        room.turn = 1;
        room.board = Array(SIZE * SIZE).fill(null);
        player.ready = false;
        opponent.ready = false;
        lastIndex.value = null;
        moveHistory.value = [];
        myStoneIsBlack.value = msg.blackPlayer === player.id;
        show('게임이 시작되었습니다.', 'info', 2000);
        break;

      case 'ACTION':
        room.board[msg.index] = room.turn;
        room.turn = msg.turn;
        lastIndex.value = msg.index;
        moveHistory.value.push(msg.index);
        break;

      case 'GAME_END':
        if (msg.index != null && msg.turn != null) {
          room.board[msg.index] = room.turn;
          room.turn = msg.turn;
          lastIndex.value = msg.index;
          moveHistory.value.push(msg.index);
        }
        room.isPlaying = false;
        show(msg.message, 'info');
        break;

      case 'DISCONNECTED':
        if (!opponent.id || msg.sender !== opponent.id) return;
        opponentDisconnected.value = true;
        reconnectCountdown.value = 30;
        show(`${opponent.name}님 연결 끊김. 30초 내 재연결되지 않으면 게임이 종료됩니다.`, 'info', 4000);
        reconnectTimer = setInterval(() => {
          reconnectCountdown.value--;
          if (reconnectCountdown.value <= 0) clearInterval(reconnectTimer);
        }, 1000);
        break;

      case 'RECONNECT':
        if (!opponent.id || msg.sender !== opponent.id) return;
        opponentDisconnected.value = false;
        clearInterval(reconnectTimer);
        reconnectCountdown.value = 30;
        show(`${opponent.name}님이 재연결되었습니다.`, 'info');
        break;

      case 'LEAVE':
        if (!opponent.id || msg.sender !== opponent.id) return;
        opponentDisconnected.value = false;
        clearInterval(reconnectTimer);
        room.board = Array(SIZE * SIZE).fill(null);
        show(`${opponent.name} 님이 방을 나갔습니다`);
        opponent.id = null;
        opponent.name = null;
        opponent.ready = false;
        player.ready = false;
        break;

      case 'READY':
        if (msg.sender === player.id) { player.ready = true; return; }
        opponent.ready = true;
        show(msg.message + '님 준비 완료');
        break;

      case 'CANCEL':
        if (msg.sender === player.id) player.ready = false;
        else opponent.ready = false;
        show(msg.message + '님이 준비를 취소하셨습니다');
        break;
    }
  }

  return {
    room, opponent, lastIndex, myStoneIsBlack, timerRef,
    opponentDisconnected, reconnectCountdown, isMyTurn,
    load, handleMessage,
    handleClick, handleSurrender, handleReady, handleTimeout,
    request, disconnect,
  };
}
