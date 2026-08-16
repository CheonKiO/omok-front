<template>
  <div class="board-wrapper">
    <!-- 1행 1열: 빈칸 -->
    <div class="empty"></div>

    <!-- 1행 2열: 위쪽 라인 넘버 -->
    <div class="empty"></div>

    <!-- 1행 3열: 우측 여백 -->
    <div class="empty"></div>

    <!-- 2행 1열: 왼쪽 라인 넘버 -->
    <div class="line-num left">
      <div v-for="y in 15" :key="'left' + y">{{ 16 - y }}</div>
    </div>

    <!-- 2행 2열: 바둑판 -->
    <div
      class="board"
      :class="{
        'game-over': isGameOver,
        'my-turn': isMyTurn,
        turnB: isBlackTurn,
        turnW: !isBlackTurn,
      }"
    >
      <div
        v-for="(cell, index) in flatBoard"
        :key="index"
        class="cell"
        :class="{
          'has-stone': cell !== null,
          'last-stone': lastIndex !== undefined && index === lastIndex,
        }"
        @click="() => onCellClick?.(index)"
      >
        <div v-if="cell !== null" class="stone" :class="cell % 2 === 1 ? 'black' : 'white'">
          <span v-if="isGameOver" class="move-number">
            {{ cell }}
          </span>
        </div>
      </div>
    </div>

    <!-- 2행 3열: 오른쪽 여백 -->
    <div class="empty"></div>

    <!-- 3행 1열: 아래 여백 -->
    <div class="empty"></div>

    <!-- 3행 2열: 아래 라인 넘버 -->
    <div class="line-num bottom">
      <div v-for="x in 15" :key="'bottom' + x">
        {{ String.fromCharCode(64 + x) }}
      </div>
    </div>

    <!-- 3행 3열: 오른쪽 아래 여백 -->
    <div class="empty"></div>
  </div>
</template>

<script setup>
defineProps({
  flatBoard: Array,
  lastIndex: Number,
  onCellClick: Function,
  isGameOver: Boolean,
  isBlackTurn: Boolean,
  isMyTurn: Boolean,
});
</script>

<style scoped>
.board-wrapper {
  width: min(calc(100vw - clamp(200px, 28vw, 360px)), calc(100svh - 72px - 40px));
  aspect-ratio: 1;
  display: grid;
  grid-template-columns: 20px calc(100% - 40px) 20px;
  grid-template-rows: 20px calc(100% - 40px) 20px;
  background-color: var(--boardColor);
  border: 2px solid var(--mainColor);
  box-shadow: 0 4px 16px rgba(44,21,5,0.25);
}

@media (max-width: 520px) {
  /* 모바일: 거의 전체 너비, 세로는 헤더 + 위아래 유저정보(~140px) 제외 */
  .board-wrapper {
    width: min(calc(100vw - 16px), calc(100svh - 52px - 140px));
  }
}

/* 아래 라인 넘버 */
.line-num.bottom {
  grid-column: 2 / 3;
  grid-row: 3 / 4;
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  justify-items: center;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #444;
}

/* 왼쪽 라인 넘버 */
.line-num.left {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  display: grid;
  grid-template-rows: repeat(15, 1fr);
  justify-items: center;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #444;
}

/* 바둑판 */
.board {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  grid-template-rows: repeat(15, 1fr);
  width: 100%;
  height: 100%;
  position: relative;
}

/* 격자선 — 교차점(첫~마지막) 범위에만 정확히 15줄. 가장자리 삐져나옴 없음.
   inset 3.3333%(= 반 칸 = 1/30)로 셀 중심에 맞추고,
   size (100%-1px)/14 로 양 끝 선이 안쪽 박스 경계에 딱 붙게 한다. */
.board::before {
  content: '';
  position: absolute;
  inset: 3.3333%;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(black 1px, transparent 1px),
    linear-gradient(90deg, black 1px, transparent 1px);
  background-size: calc((100% - 1px) / 14) calc((100% - 1px) / 14);
}
.cell {
  position: relative;
  border-radius: 50%;
  z-index: 2;
}
.my-turn.turnB .cell:hover {
  opacity: 0.4;
  background-color: #000; /* 살짝 어둡게 */
}

.my-turn.turnW .cell:hover {
  opacity: 0.4;
  background-color: #fff;
}

.board.game-over .cell {
  pointer-events: none; /* 클릭/호버 이벤트 모두 차단 */
}
.cell.has-stone {
  pointer-events: none;
}
.stone {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90%;
  height: 90%;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.4),
    /* 바깥 그림자 */ inset 0 1px 2px rgba(255, 255, 255, 0.3),
    /* 안쪽 빛 */ inset 0 -2px 3px rgba(0, 0, 0, 0.4); /* 안쪽 그림자 */
}

/* 검은 돌 */
.stone.black {
  background: radial-gradient(circle at 30% 30%, #555, #000);
}

/* 흰 돌 */
.stone.white {
  background: radial-gradient(circle at 30% 30%, #fff, #ccc);
  border: 1px solid #666;
}

.cell.last-stone .stone::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-bottom: 7px solid yellow;
}

/* 기보 순서용 */
.move-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  pointer-events: none;
}
.stone.black .move-number {
  color: white;
}
.stone.white .move-number {
  color: black;
}
</style>
