import { ref, onUnmounted } from 'vue';

// 상대방 연결 끊김 시 재접속 카운트다운/interval을 담당한다.
export function useReconnectCountdown() {
  const opponentDisconnected = ref(false);
  const reconnectCountdown = ref(30);
  let reconnectTimer = null;

  function clear() {
    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }
  }

  // 카운트다운 시작. 이전 interval을 먼저 정리해 중복 interval 누수를 막는다.
  function start() {
    clear();
    opponentDisconnected.value = true;
    reconnectCountdown.value = 30;
    reconnectTimer = setInterval(() => {
      reconnectCountdown.value--;
      if (reconnectCountdown.value <= 0) clear();
    }, 1000);
  }

  // 카운트다운 중단(재연결/퇴장 등).
  function stop() {
    clear();
    opponentDisconnected.value = false;
    reconnectCountdown.value = 30;
  }

  // 컴포넌트 언마운트 시 interval 정리.
  onUnmounted(clear);

  return { opponentDisconnected, reconnectCountdown, start, stop, clear };
}
