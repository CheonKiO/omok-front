import { SIZE } from '@/composable/useGameState';

// STOMP 메시지(handleMessage switch)를 담당한다.
// state: useGameState() 반환, reconnect: useReconnectCountdown() 반환,
// player: 로컬 플레이어 reactive, show: 토스트 함수.
export function useGameMessages({ state, reconnect, player, show }) {
  const { room, opponent, lastIndex, moveHistory, myStoneIsBlack } = state;
  const { start, stop } = reconnect;

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
        // 서버 turn은 '다음 턴'이므로 방금 놓인 돌 번호는 turn - 1이다.
        // 로컬 turn으로 스탬프하면 ACTION 유실 시 돌 색이 어긋난다.
        room.board[msg.index] = msg.turn - 1;
        room.turn = msg.turn;
        lastIndex.value = msg.index;
        moveHistory.value.push(msg.index);
        break;

      case 'GAME_END':
        if (msg.index != null && msg.turn != null) {
          room.board[msg.index] = msg.turn - 1;
          room.turn = msg.turn;
          lastIndex.value = msg.index;
          moveHistory.value.push(msg.index);
        }
        room.isPlaying = false;
        show(msg.message, 'info');
        break;

      case 'DISCONNECTED':
        if (!opponent.id || msg.sender !== opponent.id) return;
        show(`${opponent.name}님 연결 끊김. 30초 내 재연결되지 않으면 게임이 종료됩니다.`, 'info', 4000);
        start();
        break;

      case 'RECONNECT':
        if (!opponent.id || msg.sender !== opponent.id) return;
        stop();
        show(`${opponent.name}님이 재연결되었습니다.`, 'info');
        break;

      case 'LEAVE':
        if (!opponent.id || msg.sender !== opponent.id) return;
        stop();
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

      default:
        // 미지의 메시지 타입이 조용히 유실되지 않도록 경고.
        console.warn(`[useGameMessages] 처리되지 않은 메시지 타입: ${msg?.type}`, msg);
    }
  }

  return { handleMessage };
}
