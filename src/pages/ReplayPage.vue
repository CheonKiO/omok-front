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
  // 리스너는 await 앞에서 등록한다. await getGame 도중 언마운트되면 onUnmounted가 먼저
  // 돌아 removeEventListener가 무효화되고, 이후 resolve된 콜백이 등록하면 죽은 컴포넌트의
  // 리스너가 영구 잔존한다. (등록 시점엔 moves가 비어 키 입력이 무해하다.)
  window.addEventListener('keydown', onKey);
  try {
    const { data } = await getGame(route.params.id);
    game.value = data;
    moves.value = data.moves ?? [];
    step.value = moves.value.length; // 처음엔 최종 국면
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
    <button class="back" @click="router.push('/games')">← 기록부</button>
    <h1 class="rtitle">복기</h1>

    <div v-if="game" class="matchup">
      <span class="side" :class="{ won: game.winner === 'BLACK' }">
        <span class="stone black"></span>{{ game.blackName }}
      </span>
      <span class="vs">대</span>
      <span class="side" :class="{ won: game.winner === 'WHITE' }">
        {{ game.whiteName }}<span class="stone white"></span>
      </span>
    </div>
    <p v-if="game" class="verdict">
      <b>{{ game.winner === 'BLACK' ? '흑' : '백' }} 승</b>
      · {{ REASON_LABEL[game.endReason] ?? game.endReason }}
    </p>

    <GameBoard
      :flatBoard="flatBoard"
      :lastIndex="lastIndex"
      :isGameOver="true"
    />

    <div class="controls" v-if="!isLoading">
      <button class="step" @click="first" :disabled="step === 0" title="처음">«</button>
      <button class="step" @click="prev" :disabled="step === 0" title="이전">‹</button>
      <span class="counter"><b class="num">{{ step }}</b> / <b class="num">{{ total }}</b>수</span>
      <button class="step" @click="next" :disabled="step === total" title="다음">›</button>
      <button class="step" @click="last" :disabled="step === total" title="끝">»</button>
    </div>
    <p class="hint">← → 키로도 넘길 수 있습니다</p>
  </div>
</template>

<style scoped>
.replay {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0.75rem 1rem 1rem;
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 뒤로가기 — 절대배치라 중앙정렬에 영향 없음 */
.back {
  position: absolute;
  top: 14px;
  left: 18px;
  z-index: 5;
  font-family: var(--display);
  font-size: 0.88rem;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 2px;
  transition: color 0.15s;
}
.back:hover { color: var(--ink); }

/* 복기 보드: 몰입(전역헤더 없음) — 대진+컨트롤만 제외하고 최대한 크게. 무스크롤. */
.replay :deep(.board-wrapper) {
  width: min(100%, calc(100svh - 250px));
  margin: 0.3rem auto;
}

.rtitle {
  text-align: center;
  font-family: var(--display);
  font-size: 1.4rem;
  color: var(--ink);
  letter-spacing: 0.32em;
  margin: 0 0 0.5rem;
}

.matchup {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  margin-bottom: 0.25rem;
  font-family: var(--display);
  font-size: 1rem;
  color: var(--ink-soft);
}
.side { display: inline-flex; align-items: center; gap: 0.4rem; opacity: 0.6; }
.side.won { opacity: 1; color: var(--ink); }
.vs { font-size: 0.78rem; color: var(--ink-soft); }
.stone { width: 0.85rem; height: 0.85rem; border-radius: 50%; flex-shrink: 0; display: inline-block; box-sizing: border-box; }
.stone.black { background: radial-gradient(circle at 38% 34%, #4a453e, #17130e); box-shadow: 0 1px 2px rgba(0,0,0,0.35); }
.stone.white { background: radial-gradient(circle at 38% 34%, #fff, #cfc7b4); box-shadow: inset 0 0 0 1px #b3a892; }

.verdict {
  text-align: center;
  font-size: 0.85rem;
  color: var(--ink-soft);
  margin: 0 0 0.5rem;
  letter-spacing: 0.03em;
}
.verdict b { font-family: var(--display); color: var(--win); font-weight: 600; letter-spacing: 0.06em; }

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.7rem;
}
.step {
  font-size: 0.95rem;
  min-width: 2.6rem;
  padding: 8px 14px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  color: #f2e8d4;
  background: linear-gradient(180deg, #2c261a 0%, #1a150d 100%);
  box-shadow: 0 2px 4px rgba(20, 12, 4, 0.28), inset 0 1px 0 rgba(255, 240, 220, 0.08);
  transition: background 0.15s;
}
.step:hover:not(:disabled) { background: linear-gradient(180deg, #3a3122 0%, #241d12 100%); }
.step:disabled {
  background: transparent;
  color: var(--ink-soft);
  border: 1px solid rgba(33, 28, 22, 0.22);
  box-shadow: none;
  opacity: 0.7;
  cursor: default;
}
.counter {
  min-width: 5.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--ink-soft);
  letter-spacing: 0.03em;
}
.counter b { font-family: var(--mono); color: var(--ink); font-weight: 600; }
.hint {
  text-align: center;
  font-size: 0.72rem;
  color: var(--ink-soft);
  opacity: 0.65;
  margin-top: 0.8rem;
}
</style>
