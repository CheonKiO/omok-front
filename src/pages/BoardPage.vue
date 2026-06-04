<template>
  <!-- ── 헤더 ─────────────────────────────────── -->
  <div class="game-header">
    <div class="header-left flex col-center">
      <!-- 한수 무르기: 서버 연동 미구현, 추후 활성화
      <button v-if="room.isPlaying" class="hbtn" @click="request">
        <font-awesome-icon :icon="['fas', 'hands-praying']" />
        <span>무르기</span>
      </button>
      -->
      <button class="hbtn" @click="disconnect">
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
        <span>나가기</span>
      </button>
    </div>

    <div class="header-mid flex dir-col row-center col-center">
      <div class="room-title-label" v-if="room.title">{{ room.title }}</div>
      <Timer
        v-if="room.isPlaying && !opponentDisconnected"
        ref="timerRef"
        :initialTime="30"
        :key="room.turn"
        @timeout="handleTimeout"
      />
      <div class="victory" v-if="!room.isPlaying && lastIndex != null">
        {{ room.board[lastIndex] % 2 == 1 ? '흑' : '백' }} 승리
      </div>
      <div v-if="!ws.isConnected" class="status connecting">연결 중…</div>
      <div v-if="opponentDisconnected" class="status reconnecting">
        상대 연결 끊김 ({{ reconnectCountdown }}초)
      </div>
      <div v-if="room.isPlaying && !opponentDisconnected" class="turn-label">
        제 {{ room.turn }} 수
      </div>
    </div>

    <div class="header-right flex row-end col-center">
      <button class="hbtn danger" v-if="room.isPlaying" @click="handleSurrender">
        <font-awesome-icon :icon="['far', 'flag']" />
        <span>기권</span>
      </button>
    </div>
  </div>

  <!-- ── 보드 스테이지 (수직 중앙 정렬) ────────── -->
  <div class="board-stage">
    <div class="game-board">

      <!-- 상대방: 왼쪽 열, 위쪽 정렬 → 보드 상단 라인에 맞춤 -->
      <div class="col-opponent player-slot">
        <UserInfo
          :name="opponent.name"
          :isBlack="!myStoneIsBlack"
          :isActive="(!isMyTurn && room.isPlaying) || (opponent.ready && !room.isPlaying)"
        />
        <div class="slot-name">{{ opponent.name ?? '대기 중' }}</div>
        <div class="slot-ready" v-if="opponent.ready">준비 완료</div>
      </div>

      <!-- 바둑판 -->
      <div class="col-board">
        <GameBoard
          :isBlackTurn="room.turn % 2 == 1"
          :isMyTurn="isMyTurn"
          :flatBoard="room.board"
          :lastIndex="!room.isPlaying ? null : lastIndex"
          :onCellClick="handleClick"
          :isGameOver="!room.isPlaying"
        />
      </div>

      <!-- 나: 오른쪽 열, 아래쪽 정렬 → 보드 하단 라인에 맞춤 -->
      <div class="col-player player-slot">
        <button
          v-if="!room.isPlaying && opponent.id != null"
          class="btn ready-btn"
          @click="handleReady"
          :disabled="player.ready || !ws.isConnected"
        >
          준비
        </button>
        <UserInfo
          :name="player.name"
          :isBlack="myStoneIsBlack"
          :isActive="(isMyTurn && room.isPlaying) || (player.ready && !room.isPlaying)"
        />
        <div class="slot-name">{{ player.name }}</div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, watch } from 'vue';
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

watch(() => room.title, (title) => {
  if (title) document.title = `${title} · 오목`;
}, { immediate: true });

onMounted(() => {
  ws.setHandler(handleMessage);
  ws.setConnectHandler(load);
  ws.connect(roomNo, player);
});
</script>

<style scoped>
/* ════════════════════════════════════
   헤더 — 다크 마호가니 목재 스타일
   ════════════════════════════════════ */
.game-header {
  position: relative;
  height: 72px;
  padding: 0 16px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  background: linear-gradient(180deg, #4e2412 0%, #2a1004 100%);
  z-index: 10;
}

/* 하단 골드→투명 그라데이션 */
.game-header::after {
  content: '';
  position: absolute;
  left: 0; right: 0;
  top: 100%;
  height: 28px;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgba(201, 160, 71, 0.45) 0%,
    rgba(201, 160, 71, 0.1) 50%,
    transparent 100%
  );
}

/* 헤더 좌우 셀: 높이 꽉 채우고 버튼을 수직 중앙 정렬 */
.header-left,
.header-right {
  display: flex;
  align-items: center;
  height: 100%;
}

/* 헤더 버튼 */
.hbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 14px;
  height: 36px;           /* 고정 높이로 패딩 영향 제거 */
  background: transparent;
  border: 1px solid rgba(201,160,71,0.4);
  border-radius: 3px;
  color: #f5e9ce;
  font-size: 0.82rem;
  font-family: var(--app-font);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  line-height: 1;
}
.hbtn:hover {
  background: rgba(201,160,71,0.15);
  border-color: var(--accentColor);
  color: var(--accentColor);
}
.hbtn:active { opacity: 0.7; }
.hbtn.danger:hover {
  background: rgba(185,64,64,0.2);
  border-color: #e08080;
  color: #e08080;
}

/* 헤더 중앙 */
.header-mid { gap: 1px; }

/* 방 이름 명패 */
.room-title-label {
  font-family: 'ChosunGs', serif;
  font-size: 0.8rem;
  color: var(--accentColor);
  letter-spacing: 0.2em;
  opacity: 0.85;
  line-height: 1;
  margin-bottom: 2px;
}

.victory {
  font-family: 'ChosunGs', serif;
  font-size: 1.3rem;
  color: var(--accentColor);
  letter-spacing: 0.2em;
}
.turn-label {
  font-size: 0.72rem;
  color: rgba(245,233,206,0.6);
  letter-spacing: 0.05em;
}
.status      { font-size: 0.75rem; }
.connecting  { color: #aaa; }
.reconnecting { color: #e88; font-weight: 600; }

/* ════════════════════════════════════
   보드 스테이지 — 남은 화면 수직 중앙
   ════════════════════════════════════ */
.board-stage {
  height: calc(100svh - 72px);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ════════════════════════════════════
   게임 보드 그리드
   — 높이는 보드 콘텐츠(aspect-ratio:1)가 결정
   — 사이드 열은 align-self:stretch로 보드와 같은 높이
   ════════════════════════════════════ */
.game-board {
  display: grid;
  grid-template-columns: clamp(100px, 14vw, 180px) 1fr clamp(100px, 14vw, 180px);
  width: 100%;
  align-items: stretch;
}

/* 상대방: 왼쪽 열, 위쪽 정렬 = 보드 상단 라인 */
.col-opponent {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 12px;
}

/* 보드 */
.col-board {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 나: 오른쪽 열, 아래쪽 정렬 = 보드 하단 라인 */
.col-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 12px;
}

/* 플레이어 슬롯 공통 */
.player-slot { gap: 4px; }

/* 데스크탑: 이름은 돌 안에 표시하므로 숨김 */
.slot-name { display: none; }
.slot-ready {
  font-size: 0.62rem;
  color: var(--accentColor);
  font-weight: 600;
}

/* 준비 버튼 */
.ready-btn {
  font-family: 'ChosunGs', serif;
  letter-spacing: 0.2em;
  margin-bottom: 8px;
}

/* ════════════════════════════════════
   모바일 (≤ 768px)
   수직 배치: 상대(보드 위) | 보드 | 나(보드 아래)
   ════════════════════════════════════ */
@media (max-width: 768px) {
  .game-header { height: 52px; padding: 0 10px; }
  .hbtn span   { display: none; }
  .hbtn        { padding: 5px 10px; }

  .board-stage {
    height: calc(100svh - 52px);
  }

  /* flex 컬럼: 상대 → 보드 → 나, 전체 수직 중앙 */
  .game-board {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: calc(100svh - 52px);
    gap: 4px;
  }

  /* 상대: 그룹은 왼쪽, 그룹 내부(돌↔이름)는 중앙 정렬 */
  .col-opponent {
    flex-direction: column;
    align-items: center;
    align-self: flex-start;
    padding: 0 8px;
    gap: 2px;
  }

  /* 나: 그룹은 오른쪽, 그룹 내부(돌↔이름)는 중앙 정렬 */
  .col-player {
    flex-direction: column;
    align-items: center;
    align-self: flex-end;
    padding: 0 8px;
    gap: 2px;
  }

  .ready-btn { font-size: 0.72rem; padding: 4px 8px; letter-spacing: 0.05em; margin-bottom: 2px; }

  /* 모바일: 이름을 돌 아래에 표시 */
  .slot-name {
    display: block;
    font-size: 0.62rem;
    color: var(--inkMid);
    font-weight: 600;
    max-width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
