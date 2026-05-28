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
      <Timer v-if="room.isPlaying" :initialTime="10" :key="room.turn" @timeout="handleTimeout" />
      <div class="victory" v-if="!room.isPlaying">
        {{ room.board[lastIndex] % 2 == 1 ? '흑돌' : '백돌' }} 승리
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
        :disabled="player.ready"
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
import { ref, computed, onMounted, reactive } from 'vue';

import GameBoard from '@/components/GameBoard.vue';
import UserInfo from '@/components/UserInfo.vue';
import { useToast } from '@/composable/useToast';
import { isForbidden } from '@/composable/useGameLogic';
import { useRoute, useRouter } from 'vue-router';
import { useWebSocketStore } from '@/stores/websocket';
import { usePlayerStore } from '@/stores/user';
import { useServerStore } from '@/stores/server';
import Timer from '@/components/TimerComp.vue';
import axios from 'axios';

const router = useRouter();
const playerStore = usePlayerStore();
const player = reactive({
  id: playerStore.playerId,
  name: playerStore.username,
  ready: false,
});

const server = useServerStore();

const { show } = useToast();

const timerRef = ref(null);

const SIZE = 15;
const room = reactive({
  title: '',
  roomId: '',
  turn: 1,
  board: Array(SIZE * SIZE).fill(null),
  isPlaying: false,
});

const opponent = reactive({ id: null, name: null, ready: false });

const lastIndex = ref(null);
const moveHistory = ref([]); // 착수 인덱스들을 순서대로 기록
const myStoneIsBlack = ref(null);

const isMyTurn = computed(() => {
  const isBlackTurn = room.turn % 2 === 1;
  return myStoneIsBlack.value === isBlackTurn;
});

function handleClick(index) {
  if (!room.isPlaying || !isMyTurn.value) return;
  if (room.turn % 2 == 1) {
    // todo: 백엔드 로직 테스트 위해 막아놈. 나중에 풀어야함
    if (isForbidden(room.board, index) && false) {
      show('해당 위치는 금수입니다', 'error', 2000);
      return;
    }
  }

  // 여기서 웹소켓 메시지 발송
  ws.stompClient?.publish({
    destination: '/app/move', // 서버에서 받을 엔드포인트 맞게 수정
    body: JSON.stringify({
      type: 'ACTION',
      sender: player,
      roomId: room.roomId ?? route.params.roomNo,
      index: index,
    }),
  });
}

function handleSurrender() {
  ws.stompClient?.publish({
    destination: '/app/surrender',
    body: JSON.stringify({
      type: 'SURRENDER',
      sender: player,
      roomId: room.roomId ?? route.params.roomNo,
    }),
  });
}
function handleReady() {
  ws.stompClient?.publish({
    destination: '/app/ready',
    body: JSON.stringify({
      type: 'READY',
      sender: player,
      roomId: room.roomId ?? route.params.roomNo,
    }),
  });
}
function handleTimeout() {
  // 자신의 턴에 타임아웃이 발생한 경우만 전송. 2번 전송 방지
  if (!room.isPlaying || !isMyTurn.value) return;
  ws.stompClient?.publish({
    destination: '/app/timeout', // 서버에서 받을 엔드포인트 맞게 수정
    body: JSON.stringify({
      type: 'TIMEOUT',
      sender: player,
      roomId: room.roomId ?? route.params.roomNo,
    }),
  });
}

// todo: 서버 연동 후 수정 필요
// 무르기 요청 들어오면 타이머 일시정지
// 나중에는 요청과 수락 두가지 메서드로 나눠야함
function request() {
  if (room.turn <= 1 || moveHistory.value.length === 0) {
    show('더 이상 무를 수 없습니다.', 'error');
    return;
  }
  timerRef.value?.pause(); // 일단 멈춤

  const confirmed = confirm('한 수 무르기에 동의하시겠습니까?');
  if (confirmed) {
    // 서버로 무르기 요청 등 진행
    console.log('요청 전송');
    timerRef.value?.resume(); // 확인 누르면 재개 (혹은 응답 대기 후 재개)
    undoMove();
  } else {
    console.log('취소됨');
    timerRef.value?.resume(); // 취소해도 그냥 재개
  }
}

// todo: 서버 연동 후 수정 필요
function undoMove() {
  const removedIndex = moveHistory.value.pop(); // 마지막 착수 제거
  room.board[removedIndex] = null; // 돌 제거
  room.turn--;
  lastIndex.value =
    moveHistory.value.length > 0 ? moveHistory.value[moveHistory.value.length - 1] : null;
  show('한 수를 무르셨습니다.', 'info');
}

const route = useRoute();
const roomNo = route.params.roomNo;
console.log('room id = ', roomNo);
const ws = useWebSocketStore();

async function disconnect() {
  try {
    // http로 서버에 방 나감 알림
    await axios.post(`${server.BASEURL}/api/rooms/leave/${route.params.roomNo}`, null, {
      params: { playerId: player.id },
    });
    // websocket 연결 끊기
    ws.disconnect();
  } catch (e) {
    console.error('방 나가기 오류 발생:', e);
  } finally {
    // 이후 화면 이동 등 처리
    router.push({ name: 'Home' });
  }
}

async function load() {
  const { data } = await axios.get(`${server.BASEURL}/api/rooms/${roomNo}`);
  console.log(data);
  room.title = data.title;
  room.roomId = data.roomId;
  room.turn = data.turn;
  room.board.splice(0, room.board.length, ...data.board.flat().map((v) => (v === 0 ? null : v)));

  room.isPlaying = data.isPlaying;
  const opp = data.players.find((p) => p.id !== player.id);
  if (opp != null) {
    opponent.id = opp.id;
    opponent.name = opp.name;
  }
}

load();

function handleMessage(msg) {
  if (msg.type === 'JOIN') {
    console.log('join');
    if (msg.message === player.name) return;
    console.log(`📢 유저 입장 알림: ${msg.message}`);
    opponent.name = msg.message;
    opponent.id = msg.sender;
    show(`${msg.message}님이 입장하셨습니다`);
  } else if (msg.type === 'GAME_START') {
    console.log('🎮 게임 시작 메시지 수신됨!');
    room.isPlaying = true;
    room.turn = 1;
    room.board = Array(SIZE * SIZE).fill(null);
    player.ready = false;
    opponent.ready = false;
    lastIndex.value = null;
    moveHistory.value = [];
    myStoneIsBlack.value = msg.blackPlayer === player.id;
    console.log('my stone is black:', myStoneIsBlack.value);
    show('게임이 시작되었습니다.', 'info', 2000);
  } else if (msg.type === 'ACTION') {
    room.board[msg.index] = room.turn;
    room.turn = msg.turn;
    lastIndex.value = msg.index;
    moveHistory.value.push(lastIndex.value);
  } else if (msg.type === 'GAME_END') {
    room.board[msg.index] = room.turn;
    room.turn = msg.turn;
    if (msg.index != null) {
      lastIndex.value = msg.index;
    }
    moveHistory.value.push(lastIndex.value);
    room.isPlaying = false;
    show(msg.message, 'info');
  } else if (msg.type === 'LEAVE') {
    room.board = Array(SIZE * SIZE).fill(null);
    show(`${opponent.name} 님이 방을 나갔습니다`);
    opponent.id = null;
    opponent.name = null;
    opponent.ready = false;
    player.ready = false;
  } else if (msg.type === 'READY') {
    if (msg.message === player.name) {
      player.ready = true;
      return;
    }
    opponent.ready = true;
    show(msg.message + '님 준비 완료');
  }
}

onMounted(() => {
  ws.setHandler(handleMessage); // 메시지 수신시 자동 호출되도록 연결
  ws.connect(roomNo, player);
});
</script>

<style scoped>
.game-header {
  height: 80px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  background-image:
    /* 좌우 흐림 */
    linear-gradient(
      to right,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.3) 30%,
      rgba(255, 255, 255, 0.3) 70%,
      rgba(255, 255, 255, 0)
    ),
    /* 아래쪽 흐림 */
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
.turn {
  padding-top: 10px;
}
.victory {
  font-size: 2rem;
}
</style>
