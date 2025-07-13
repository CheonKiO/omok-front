// src/stores/websocket.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocketStore = defineStore('websocket', () => {
  const stompClient = ref(null);
  const isConnected = ref(false);
  const messages = ref([]);

  function connect(roomId, playerId, baseUrl) {
    // if (stompClient.value && isConnected.value) return;

    stompClient.value = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/game`),
      reconnectDelay: 5000,
      onConnect: () => {
        isConnected.value = true;

        // 연결 완료된 후에 실행
        stompClient.value.subscribe(`/topic/room/${roomId}`, (msg) => {
          if (!msg || !msg.body) return;
          try {
            const payload = JSON.parse(msg.body);
            messages.value.push(payload);
            console.log('📩 받은 메시지:', payload);
          } catch (e) {
            console.error('❌ 메시지 파싱 오류:', e);
          }
        });

        stompClient.value.publish({
          destination: `/app/room/${roomId}/join`,
          body: JSON.stringify({
            sender: playerId,
            roomId: roomId,
            type: 'JOIN',
          }),
        });
      },
      onDisconnect: () => {
        isConnected.value = false;
        console.log('🛑 웹소켓 연결 종료');
      },
    });

    stompClient.value.activate();
  }
  // ✅ 연결 종료 함수
  function disconnect() {
    if (stompClient.value && isConnected.value) {
      stompClient.value.deactivate(); // 또는 .disconnect(callback)
      isConnected.value = false;
      console.log('🔌 연결 종료됨');
    }
  }
  return {
    stompClient,
    isConnected,
    messages,
    connect,
    disconnect,
  };
});
