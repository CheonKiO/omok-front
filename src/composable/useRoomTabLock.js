// 같은 방을 여러 탭에서 여는 것을 막는다(front #2).
// 두 탭이 같은 방에 붙으면 JOIN이 두 번 나가고, 한 탭만 닫아도 상대에게
// 연결 끊김으로 보인다. 서버에도 안전망이 있지만 여기서 먼저 차단한다.
const PING = 'omok:tab-ping';
const PONG = 'omok:tab-pong';
const WAIT_MS = 120;

export function useRoomTabLock(roomId) {
  let channel = null;
  let held = false;

  function acquire() {
    if (typeof BroadcastChannel === 'undefined') return Promise.resolve(true);

    channel = new BroadcastChannel(`omok-room-${roomId}`);
    // 이미 점유 중인 탭이 있으면 PING에 PONG으로 답한다.
    channel.onmessage = (event) => {
      if (event.data === PING && held) channel.postMessage(PONG);
    };

    return new Promise((resolve) => {
      let answered = false;
      const onAnswer = (event) => {
        if (event.data !== PONG || answered) return;
        answered = true;
        clearTimeout(timer);
        channel.removeEventListener('message', onAnswer);
        resolve(false);
      };
      channel.addEventListener('message', onAnswer);
      channel.postMessage(PING);

      const timer = setTimeout(() => {
        if (answered) return;
        answered = true;
        channel.removeEventListener('message', onAnswer);
        held = true;
        resolve(true);
      }, WAIT_MS);
    });
  }

  function release() {
    held = false;
    if (channel) {
      channel.close();
      channel = null;
    }
  }

  return { acquire, release };
}
