import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useServerStore } from './server';
import { useAuthStore } from './auth';

// 방 복귀 가드용 방 id. sessionStorage라 새로고침은 견디고, 탭별로 격리되며,
// 탭을 닫으면 자동 소멸한다(localStorage였을 때의 영구 잔존·타 탭 오염 제거).
const ROOM_ID_KEY = 'ws_roomId';

export const useWebSocketStore = defineStore('websocket', () => {
  const stompClient = ref(null);
  const roomId = ref(readRoomId());
  const isConnected = ref(false); // 실제 STOMP 연결 완료 여부

  let messageHandler = null;
  let connectHandler = null;

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
    saveRoomId(newRoomId);

    const accessToken = useAuthStore().accessToken;

    stompClient.value = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/game`, null, { withCredentials: false }),
      // CONNECT 프레임 네이티브 헤더로 JWT 전달 → 서버 principal 바인딩 (게스트도 토큰 있음)
      connectHeaders: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ STOMP 연결 완료');
        isConnected.value = true;

        stompClient.value.subscribe(`/topic/room/${newRoomId}`, (msg) => {
          if (!msg || !msg.body) return;
          try {
            const payload = JSON.parse(msg.body);
            console.log('📩 받은 메시지:', payload);
            if (messageHandler) messageHandler(payload);
          } catch (e) {
            console.error('❌ 메시지 파싱 오류:', e);
          }
        });

        stompClient.value.publish({
          destination: `/app/room/${newRoomId}/join`,
          body: JSON.stringify({
            sender: player,
            roomId: newRoomId,
            type: 'JOIN',
          }),
        });

        if (connectHandler) connectHandler();
      },
      onDisconnect: () => {
        console.log('🛑 STOMP 연결 종료');
        isConnected.value = false;
      },
      onStompError: (frame) => {
        console.error('❗ STOMP 오류:', frame.headers['message'], frame.body);
        isConnected.value = false;
      },
      onWebSocketError: (event) => {
        console.error('❗ WebSocket 연결 오류:', event);
        isConnected.value = false;
      },
    });

    stompClient.value.activate();
  }

  function disconnect() {
    if (stompClient.value) {
      stompClient.value.deactivate();
      stompClient.value = null;
      isConnected.value = false;
      connectHandler = null;
      messageHandler = null;
      console.log('🔌 연결 종료됨');
    }
    // client 유무와 무관하게 방 상태는 항상 정리한다.
    // (connect 전 load 실패 시에도 sessionStorage/ref에 죽은 roomId가 남지 않도록)
    clearRoomId();
    roomId.value = null;
  }

  function readRoomId() {
    try {
      return sessionStorage.getItem(ROOM_ID_KEY);
    } catch {
      return null;
    }
  }

  function saveRoomId(id) {
    sessionStorage.setItem(ROOM_ID_KEY, id);
  }

  function clearRoomId() {
    sessionStorage.removeItem(ROOM_ID_KEY);
  }

  return {
    stompClient,
    roomId,
    isConnected,
    connect,
    disconnect,
    setHandler,
    setConnectHandler,
    clearRoomId,
  };
});
