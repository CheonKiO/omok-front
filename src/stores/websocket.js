import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useServerStore } from './server';

export const useWebSocketStore = defineStore('websocket', () => {
  const stompClient = ref(null);
  const roomId = ref(null);
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

    stompClient.value = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/game`, null, { withCredentials: false }),
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
    isConnected,
    connect,
    disconnect,
    setHandler,
    setConnectHandler,
  };
});
