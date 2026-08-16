import { useRouter } from 'vue-router';
import { useWebSocketStore } from '@/stores/websocket';
import { useToast } from '@/composable/useToast';
import { isForbidden } from '@/composable/useGameLogic';
import { useGameState } from '@/composable/useGameState';
import { useReconnectCountdown } from '@/composable/useReconnectCountdown';
import { useGameMessages } from '@/composable/useGameMessages';
import { getRoom, leaveRoom } from '@/api/rooms';

// 상태(useGameState) / 메시지(useGameMessages) / 재접속(useReconnectCountdown)을
// 조합하는 오케스트레이터. 게임 액션·REST 로드·방 나가기를 담당한다.
export function useGameRoom(roomNo, player) {
  const router = useRouter();
  const ws = useWebSocketStore();
  const { show } = useToast();

  const state = useGameState();
  const { room, opponent, lastIndex, moveHistory, myStoneIsBlack, winner, timerRef, isMyTurn } = state;

  const reconnect = useReconnectCountdown();
  const { opponentDisconnected, reconnectCountdown } = reconnect;

  const { handleMessage } = useGameMessages({ state, reconnect, player, show });

  // ── 데이터 로드 ────────────────────────────────────────────

  async function load() {
    let data;
    try {
      ({ data } = await getRoom(roomNo));
    } catch (e) {
      // 없는 방/권한 없음 → 소켓을 완전히 내리고(잔존 client가 다음 방 입장을 막지 않도록)
      // 로비로 돌려보낸다. clearRoomId만으로는 stompClient가 활성 잔존한다.
      console.error('방 정보를 불러오지 못했습니다:', e);
      show('방을 찾을 수 없습니다', 'error', 2000);
      ws.disconnect();
      router.push({ name: 'Home' });
      return false;
    }

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
    return true;
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

  function handleCancel() {
    publish('/app/cancel', { type: 'CANCEL', sender: player, roomId: room.roomId ?? roomNo });
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
      await leaveRoom(roomNo, player.id);
    } catch (e) {
      console.error('방 나가기 오류 발생:', e);
    } finally {
      reconnect.clear();
      ws.disconnect();
      router.push({ name: 'Home' });
    }
  }

  return {
    room, opponent, lastIndex, myStoneIsBlack, winner, timerRef,
    opponentDisconnected, reconnectCountdown, isMyTurn,
    load, handleMessage,
    handleClick, handleSurrender, handleReady, handleCancel, handleTimeout,
    request, disconnect,
  };
}
