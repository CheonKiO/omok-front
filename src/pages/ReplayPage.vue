<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GameBoard from '@/components/GameBoard.vue';
import { getGame } from '@/api/games';
import { useToast } from '@/composable/useToast';

const SIZE = 15;
const route = useRoute();
const router = useRouter();
const { show } = useToast();

const game = ref(null);
const moves = ref([]);
const step = ref(0); // 보여줄 착수 개수(0 = 빈 판)
const isLoading = ref(true);

const REASON_LABEL = {
  WIN_5: '5목',
  SURRENDER: '기권',
  TIMEOUT: '시간초과',
  DISCONNECT: '연결 끊김',
};

// 현재 step까지의 착수를 놓인 판. cell 값 = 수 번호(홀=흑, 짝=백) → GameBoard가 색·번호 렌더.
const flatBoard = computed(() => {
  const b = new Array(SIZE * SIZE).fill(null);
  for (let i = 0; i < step.value; i++) b[moves.value[i]] = i + 1;
  return b;
});
const lastIndex = computed(() => (step.value > 0 ? moves.value[step.value - 1] : null));
const total = computed(() => moves.value.length);

function first() { step.value = 0; }
function prev() { if (step.value > 0) step.value--; }
function next() { if (step.value < total.value) step.value++; }
function last() { step.value = total.value; }

function onKey(e) {
  if (e.key === 'ArrowLeft') prev();
  else if (e.key === 'ArrowRight') next();
  else if (e.key === 'Home') first();
  else if (e.key === 'End') last();
}

onMounted(async () => {
  try {
    const { data } = await getGame(route.params.id);
    game.value = data;
    moves.value = data.moves ?? [];
    step.value = moves.value.length; // 처음엔 최종 국면
    window.addEventListener('keydown', onKey);
  } catch (e) {
    show(e.response?.status === 404 ? '기보를 찾을 수 없습니다' : '기보를 불러오지 못했습니다', 'error', 1500);
    router.push('/games');
  } finally {
    isLoading.value = false;
  }
});
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div class="replay">
    <header class="replay-header">
      <button class="btn back-btn" @click="router.push('/games')">← 기록부</button>
      <h1 class="replay-title">복 기</h1>
      <span class="spacer"></span>
    </header>

    <div v-if="game" class="matchup">
      <span class="side" :class="{ won: game.winner === 'BLACK' }">
        <span class="stone-dot black"></span>{{ game.blackName }}
      </span>
      <span class="vs">대</span>
      <span class="side" :class="{ won: game.winner === 'WHITE' }">
        {{ game.whiteName }}<span class="stone-dot white"></span>
      </span>
    </div>
    <p v-if="game" class="verdict">
      {{ game.winner === 'BLACK' ? '흑' : '백' }} 승 · {{ REASON_LABEL[game.endReason] ?? game.endReason }}
    </p>

    <GameBoard
      :flatBoard="flatBoard"
      :lastIndex="lastIndex"
      :isGameOver="true"
    />

    <div class="controls" v-if="!isLoading">
      <button class="btn step-btn" @click="first" :disabled="step === 0" title="처음">⏮</button>
      <button class="btn step-btn" @click="prev" :disabled="step === 0" title="이전">◂</button>
      <span class="counter">{{ step }} / {{ total }}수</span>
      <button class="btn step-btn" @click="next" :disabled="step === total" title="다음">▸</button>
      <button class="btn step-btn" @click="last" :disabled="step === total" title="끝">⏭</button>
    </div>
    <p class="hint">← → 키로도 넘길 수 있습니다</p>
  </div>
</template>

<style scoped>
.replay {
  max-width: 640px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  min-height: 100svh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 복기 보드: 대국 화면용 폭 공식 대신 복기 컨테이너/화면높이에 맞춰 축소 → 스크롤 방지·중앙 정렬 */
.replay :deep(.board-wrapper) {
  width: min(100%, calc(100svh - 320px));
  margin: 0.5rem auto;
}

.replay-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.back-btn { font-size: 0.8rem; padding: 5px 12px; margin: 0; white-space: nowrap; }
.spacer { width: 4.5rem; } /* back-btn 폭 상쇄로 제목 중앙 */
.replay-title {
  flex: 1;
  text-align: center;
  font-family: 'ChosunGs', serif;
  font-size: 1.6rem;
  color: var(--inkColor);
  letter-spacing: 0.4em;
  margin: 0;
}

.matchup {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  margin-bottom: 0.3rem;
  font-size: 0.95rem;
  color: var(--inkColor);
}
.side {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  opacity: 0.7;
}
.side.won {
  opacity: 1;
  font-weight: 600;
  font-family: 'ChosunGs', serif;
}
.vs {
  font-size: 0.78rem;
  color: var(--inkMid);
  font-family: 'ChosunGs', serif;
}
.stone-dot {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 50%;
  flex-shrink: 0;
}
.stone-dot.black { background: radial-gradient(circle at 35% 35%, #666, #111); box-shadow: 1px 1px 2px rgba(0,0,0,0.4); }
.stone-dot.white { background: radial-gradient(circle at 35% 35%, #fff, #bbb); border: 1px solid #aaa; }

.verdict {
  text-align: center;
  font-size: 0.8rem;
  color: var(--inkMid);
  margin: 0 0 1rem;
  letter-spacing: 0.04em;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.2rem;
}
.step-btn {
  font-size: 1rem;
  padding: 6px 14px;
  margin: 0;
  min-width: 2.6rem;
}
.step-btn:disabled { opacity: 0.35; cursor: default; }
.counter {
  min-width: 5.5rem;
  text-align: center;
  font-family: 'ChosunGs', serif;
  font-size: 0.9rem;
  color: var(--inkColor);
  letter-spacing: 0.05em;
}
.hint {
  text-align: center;
  font-size: 0.72rem;
  color: var(--inkMid);
  opacity: 0.6;
  margin-top: 0.8rem;
}
</style>
