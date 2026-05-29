import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useServerStore } from './server';
export const useWebSocketStore = defineStore('websocket', () => {
  const stompClient = ref(null);
  const roomId = ref(null);

  let messageHandler = null;  // 메시지 처리 핸들러 (외부에서 주입)
  let connectHandler = null;  // 연결/재연결 시 호출할 핸들러

  function setHandler(handlerFn) {
    messageHandler = handlerFn;
  }

  function setConnectHandler(handlerFn) {
    connectHandler = handlerFn;
  }
  function connect(newRoomId, player) {
    const baseUrl = useServerStore().BASEURL;
    if (stompClient.value) return;
    roomId.value = newRoomId;
    saveRoomId(newRoomId); // 💾 저장

    stompClient.value = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/game`, null, { withCredentials: false }),
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.value.subscribe(`/topic/room/${newRoomId}`, (msg) => {
          if (!msg || !msg.body) return;
          try {
            const payload = JSON.parse(msg.body);
            console.log('📩 받은 메시지:', payload);
            if (messageHandler) {
              messageHandler(payload);
            }
          } catch (e) {
            console.error('❌ 메시지 파싱 오류:', e);
          }
        });

        // ✅ 입장 메시지 전송
        stompClient.value.publish({
          destination: `/app/room/${newRoomId}/join`,
          body: JSON.stringify({
            sender: player,
            roomId: newRoomId,
            type: 'JOIN',
          }),
        });

        // ✅ 연결/재연결 시 방 상태 갱신 (상대방 정보 복구)
        if (connectHandler) connectHandler();
      },
      onDisconnect: () => {
        console.log('🛑 웹소켓 연결 종료');
      },
      onStompError: (frame) => {
        console.error('❗ STOMP 오류:', frame.headers['message'], frame.body);
      },
    });

    stompClient.value.activate();
  }
  // ✅ 연결 종료 함수
  function disconnect() {
    if (stompClient.value) {
      stompClient.value.deactivate();
      stompClient.value = null;
      clearRoomId();
      roomId.value = null;
      connectHandler = null;
      messageHandler = null;
      console.log('🔌 연결 종료됨');
    }
  }

  function saveRoomId(id) {
    localStorage.setItem('ws_roomId', id);
  }

  function clearRoomId() {
    localStorage.removeItem('ws_roomId');
  }
  return {
    stompClient,
    roomId,
    connect,
    disconnect,
    setHandler,
    setConnectHandler,
  };
});
