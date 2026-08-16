<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchMyGames } from '@/api/games';
import { useToast } from '@/composable/useToast';

const router = useRouter();
const { show } = useToast();

const games = ref([]);
const isLoading = ref(true);

const wins = computed(() => games.value.filter((g) => g.result === 'WIN').length);
const losses = computed(() => games.value.length - wins.value);

const REASON_LABEL = {
  WIN_5: '5목 완성',
  SURRENDER: '기권',
  TIMEOUT: '시간 초과',
  DISCONNECT: '연결 끊김',
};

function reasonLabel(r) {
  return REASON_LABEL[r] ?? r;
}

function formatDate(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

onMounted(async () => {
  try {
    const { data } = await fetchMyGames();
    games.value = data;
  } catch {
    show('기보를 불러오지 못했습니다', 'error', 1500);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="archive">
    <div class="archive-main">
      <div class="listhead">
        <h1 class="t">기보<span class="cnt" v-if="!isLoading"> · <b class="num">{{ games.length }}</b>판</span></h1>
        <span class="wl" v-if="!isLoading && games.length">
          <span class="w"><b class="num">{{ wins }}</b>승</span>
          <span class="l"><b class="num">{{ losses }}</b>패</span>
        </span>
      </div>

      <div v-if="isLoading" class="empty">불러오는 중…</div>

      <div v-else-if="games.length === 0" class="empty">
        <span class="empty-mark"></span>
        <p>아직 둔 기보가 없습니다</p>
        <p class="hint">대국을 마치면 여기 쌓입니다</p>
      </div>

      <div v-else class="log">
        <div class="rowh">
          <span>결과</span><span>상대</span><span>종국</span><span>일시</span>
        </div>
        <div
          v-for="g in games"
          :key="g.id"
          class="row"
          @click="router.push(`/games/${g.id}`)"
        >
          <span class="res" :class="g.result === 'WIN' ? 'win' : 'loss'">
            {{ g.result === 'WIN' ? '승' : '패' }}
          </span>
          <span class="opp">
            <span class="stone" :class="g.myColor === 'BLACK' ? 'white' : 'black'"></span>
            {{ g.opponentName }}
          </span>
          <span class="reason">{{ reasonLabel(g.endReason) }}</span>
          <span class="date">{{ formatDate(g.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.archive {
  max-width: 720px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 1.25rem;
  height: calc(100svh - 61px); /* 전역 헤더 제외 — 페이지 자체는 스크롤 안 함 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
/* 명패 상단 고정, 목록만 내부 스크롤 (대국실과 동일) */
.archive-main { flex: 1; min-height: 0; display: flex; flex-direction: column; }

/* 명패 */
.listhead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-shrink: 0;
}
.t {
  font-family: var(--display);
  font-size: 1.9rem;
  letter-spacing: 0.14em;
  color: var(--ink);
  margin: 0;
}
.t .cnt { font-size: 0.9rem; color: var(--ink-soft); letter-spacing: 0.02em; }
.t .cnt b { color: var(--ju); font-weight: 600; }
.wl { font-size: 0.85rem; color: var(--ink-soft); display: flex; gap: 12px; }
.wl b { font-weight: 600; }
.wl .w b { color: var(--ju); }
.wl .l b { color: var(--cheong); }

/* 빈 상태 */
.empty {
  flex: 1;
  min-height: 0;
  border-top: 1.5px solid var(--ink);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.empty-mark { width: 12px; height: 12px; border-radius: 50%; background: var(--ink); opacity: 0.22; margin-bottom: 0.4rem; }
.empty .hint { font-size: 0.8rem; opacity: 0.7; }

/* 대장(ledger) — 목록만 내부 스크롤 */
.log { flex: 1; min-height: 0; overflow-y: auto; border-top: 1.5px solid var(--ink); }
.log .rowh { position: sticky; top: 0; background: #ece2c8; z-index: 1; }
.rowh, .row {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 110px 116px;
  gap: 16px;
  align-items: center;
}
.rowh {
  padding: 9px 6px;
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
  border-bottom: 1px solid rgba(33, 28, 22, 0.2);
}
.row {
  padding: 14px 6px;
  border-bottom: 1px solid rgba(33, 28, 22, 0.14);
  cursor: pointer;
  transition: background 0.15s;
}
.row:hover { background: rgba(154, 58, 45, 0.05); }

.res {
  width: 30px; height: 30px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--display); font-size: 0.9rem; color: #f3e2cf;
}
.res.win { background: var(--ju); box-shadow: 0 1px 3px rgba(70, 20, 12, 0.35); }
.res.loss { background: #6f6a5e; }

.opp {
  display: flex; align-items: center; gap: 9px;
  font-family: var(--display); font-size: 1.05rem; color: var(--ink);
  min-width: 0;
}
.opp { overflow: hidden; }
.opp > :last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.stone { width: 13px; height: 13px; border-radius: 50%; flex-shrink: 0; display: inline-block; box-sizing: border-box; }
.stone.black { background: radial-gradient(circle at 38% 34%, #4a453e, #17130e); }
.stone.white { background: radial-gradient(circle at 38% 34%, #fff, #cfc7b4); box-shadow: inset 0 0 0 1px #b3a892; }

.reason { font-size: 0.88rem; color: var(--ink-soft); }
.date { font-family: var(--mono); font-size: 0.8rem; color: var(--ink-soft); }

@media (max-width: 560px) {
  .rowh, .row { grid-template-columns: 44px minmax(0, 1fr) auto; }
  .rowh span:nth-child(3), .reason { display: none; }
  .t { font-size: 1.5rem; }
}
</style>
