<template>
  <div class="game-header">
    <div class="header-left flex col-center">
      <button v-if="room.isPlaying" class="btn rollback-btn" @click="request">
        <font-awesome-icon :icon="['fas', 'hands-praying']" />
        <div>한수 무르기</div>
      </button>
      <div v-else>
        <button class="btn out-btn" @click="disconnect">
          <font-awesome-icon :icon="['fas', 'arrow-left']" />나가기
        </button>
      </div>
    </div>
    <div class="header-mid flex dir-col row-center col-center">
      <Timer v-if="room.isPlaying && !opponentDisconnected" ref="timerRef" :initialTime="10" :key="room.turn" @timeout="handleTimeout" />
      <div class="victory" v-if="!room.isPlaying && lastIndex != null">
        {{ room.board[lastIndex] % 2 == 1 ? '흑돌' : '백돌' }} 승리
      </div>
      <div v-if="!ws.isConnected" class="connecting">🔄 연결 중...</div>
      <div v-if="opponentDisconnected" class="reconnecting">
        ⚠️ 상대방 연결 끊김 ({{ reconnectCountdown }}초 대기)
      </div>
      <div v-if="room.isPlaying" class="turn">제 {{ room.turn }} 수</div>
    </div>
    <div class="header-right flex row-end col-center">
      <button class="btn" v-if="room.isPlaying" @click="handleSurrender">
        <font-awesome-icon :icon="['far', 'flag']" />
        기권
      </button>
    </div>
  </div>
  <div class="game-board">
    <div class="flex dir-col center">
      <UserInfo
        class="opponent"
        :name="opponent.name"
        :isBlack="!myStoneIsBlack"
        :isActive="(!isMyTurn && room.isPlaying) || (opponent.ready && !room.isPlaying)"
      />
      <div class="margin-center">{{ opponent.ready ? '준비 완료' : '' }}</div>
    </div>

    <div class="board-con flex row-center col-center">
      <GameBoard
        :isBlackTurn="room.turn % 2 == 1"
        :isMyTurn="isMyTurn"
        :flatBoard="room.board"
        :lastIndex="!room.isPlaying ? null : lastIndex"
        :onCellClick="handleClick"
        :isGameOver="!room.isPlaying"
      />
    </div>
    <div class="flex dir-col row-end">
      <button
        v-if="!room.isPlaying && opponent.id != null"
        class="btn"
        @click="handleReady"
        :disabled="player.ready || !ws.isConnected"
      >
        준비
      </button>
      <UserInfo
        class="me"
        :name="player.name"
        :isBlack="myStoneIsBlack"
        :isActive="(isMyTurn && room.isPlaying) || (player.ready && !room.isPlaying)"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePlayerStore } from '@/stores/user';
import { useWebSocketStore } from '@/stores/websocket';
import { useGameRoom } from '@/composable/useGameRoom';
import GameBoard from '@/components/GameBoard.vue';
import UserInfo from '@/components/UserInfo.vue';
import Timer from '@/components/TimerComp.vue';

const route = useRoute();
const roomNo = route.params.roomNo;
const ws = useWebSocketStore();

const playerStore = usePlayerStore();
const player = reactive({
  id: playerStore.playerId,
  name: playerStore.username,
  ready: false,
});

const {
  room, opponent, lastIndex, myStoneIsBlack, timerRef,
  opponentDisconnected, reconnectCountdown, isMyTurn,
  load, handleMessage,
  handleClick, handleSurrender, handleReady, handleTimeout,
  request, disconnect,
} = useGameRoom(roomNo, player);

load();

onMounted(() => {
  ws.setHandler(handleMessage);
  ws.setConnectHandler(load);
  ws.connect(roomNo, player);
});
</script>

<style scoped>
.game-header {
  height: 80px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  background-image:
    linear-gradient(
      to right,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.3) 30%,
      rgba(255, 255, 255, 0.3) 70%,
      rgba(255, 255, 255, 0)
    ),
    linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.3) 30%,
      rgba(255, 255, 255, 0.3) 70%,
      rgba(255, 255, 255, 0)
    );
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border-radius: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
.game-board {
  margin-top: 10px;
  height: 100%;
  display: grid;
  grid-template-columns: 13% 1fr 13%;
}
.board-con {
  width: 100%;
  height: 100%;
}
.turn { padding-top: 10px; }
.victory { font-size: 2rem; }
.connecting { font-size: 0.85rem; color: #888; }
.reconnecting { font-size: 0.85rem; color: #c0392b; font-weight: 600; }
</style>
