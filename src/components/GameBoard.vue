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
  min-width: 490px;
  max-width: calc(100vh - 150px);
  width: 80%;
  aspect-ratio: 1;
  display: grid;
  grid-template-columns: 20px calc(100% - 40px) 20px;
  grid-template-rows: 20px calc(100% - 40px) 20px;
  background-color: var(--boardColor);
  border: 2px solid black;
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
  background-image:
    linear-gradient(to left, black 1px, transparent 1px),
    linear-gradient(to bottom, black 1px, transparent 1px);
  background-origin: content-box;
  background-size: 6.6667% 6.6667%;
  background-position: 3.3333% 3.3333%;
}

/* 삐져나온 선 정리용 */
.board::after {
  content: '';
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background:
    /* 위쪽 잘라내기 */
    linear-gradient(to bottom, rgba(205, 160, 90, 1) 0 90%, transparent 90%) top,
    /* 아래쪽 잘라내기 */ linear-gradient(to top, rgba(205, 160, 90, 1) 0 90%, transparent 90%)
      bottom,
    /* 왼쪽 잘라내기 */ linear-gradient(to right, rgba(205, 160, 90, 1) 0 90%, transparent 90%) left,
    /* 오른쪽 잘라내기 */ linear-gradient(to left, rgba(205, 160, 90, 1) 0 90%, transparent 90%)
      right;
  background-repeat: no-repeat;
  background-size:
    100% 3.4%,
    100% 3.7%,
    3.3% 100%,
    4% 100%;
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
