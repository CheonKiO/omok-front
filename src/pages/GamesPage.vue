<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchMyGames } from '@/api/games';
import { useToast } from '@/composable/useToast';

const router = useRouter();
const { show } = useToast();

const games = ref([]);
const isLoading = ref(true);

const REASON_LABEL = {
  WIN_5: '5목',
  SURRENDER: '기권',
  TIMEOUT: '시간초과',
  DISCONNECT: '연결 끊김',
};

function reasonLabel(r) {
  return REASON_LABEL[r] ?? r;
}

function formatDate(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
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
    <header class="archive-header">
      <button class="btn back-btn" @click="router.push('/')">← 대국실</button>
      <h1 class="archive-title">대 국 기 록 부</h1>
      <span class="archive-count" v-if="!isLoading">{{ games.length }}판</span>
    </header>

    <div class="record-panel">
      <div v-if="isLoading" class="empty-state">불러오는 중…</div>

      <div v-else-if="games.length === 0" class="empty-state">
        <span class="empty-icon">⊙</span>
        <p>아직 둔 기보가 없습니다</p>
        <p class="empty-hint">대국을 마치면 여기 쌓입니다</p>
      </div>

      <ul v-else class="record-list">
        <li
          v-for="g in games"
          :key="g.id"
          class="record-row"
          @click="router.push(`/games/${g.id}`)"
        >
          <span class="result-mark" :class="g.result === 'WIN' ? 'win' : 'loss'">
            {{ g.result === 'WIN' ? '승' : '패' }}
          </span>
          <span class="opponent">
            <span class="stone-dot" :class="g.myColor === 'BLACK' ? 'white' : 'black'"></span>
            {{ g.opponentName }}
          </span>
          <span class="reason">{{ reasonLabel(g.endReason) }}</span>
          <span class="date">{{ formatDate(g.createdAt) }}</span>
          <span class="chevron">›</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.archive {
  max-width: 640px;
  margin: 0 auto;
  padding: 2.4rem 1.5rem 4rem;
  min-height: 100svh;
  box-sizing: border-box;
}

.archive-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.8rem;
}

.back-btn {
  font-size: 0.8rem;
  padding: 5px 12px;
  margin: 0;
  white-space: nowrap;
}

.archive-title {
  flex: 1;
  text-align: center;
  font-family: 'ChosunGs', serif;
  font-size: 1.7rem;
  color: var(--inkColor);
  letter-spacing: 0.3em;
  margin: 0;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.4);
}

.archive-count {
  font-size: 0.8rem;
  color: var(--inkMid);
  font-family: 'ChosunGs', serif;
  white-space: nowrap;
}

.record-panel {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(44, 21, 5, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5);
  overflow: hidden;
  min-height: 140px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--inkMid);
  font-size: 0.9rem;
}
.empty-icon {
  display: block;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.4;
}
.empty-hint {
  font-size: 0.78rem;
  opacity: 0.6;
  margin-top: 0.3rem;
}

.record-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.record-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem 1.2rem;
  border-bottom: 1px solid rgba(92, 46, 14, 0.12);
  cursor: pointer;
  transition: background 0.15s;
}
.record-row:last-child {
  border-bottom: none;
}
.record-row:hover {
  background: rgba(201, 160, 71, 0.12);
}

.result-mark {
  flex-shrink: 0;
  width: 1.7rem;
  height: 1.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-family: 'ChosunGs', serif;
  font-size: 0.85rem;
  color: #f5e9ce;
}
.result-mark.win {
  background: linear-gradient(145deg, #6b8f3d, #3f5f22);
}
.result-mark.loss {
  background: linear-gradient(145deg, #9a9088, #6a6058);
}

.opponent {
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.92rem;
  color: var(--inkColor);
  min-width: 0;
}
.opponent > :last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stone-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  flex-shrink: 0;
}
.stone-dot.black {
  background: radial-gradient(circle at 35% 35%, #666, #111);
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
}
.stone-dot.white {
  background: radial-gradient(circle at 35% 35%, #fff, #bbb);
  border: 1px solid #aaa;
}

.reason {
  flex-shrink: 0;
  font-size: 0.76rem;
  color: var(--inkMid);
  padding: 2px 8px;
  border: 1px solid var(--borderColor);
  border-radius: 2px;
}

.date {
  flex-shrink: 0;
  font-size: 0.74rem;
  color: var(--inkMid);
  opacity: 0.75;
}

.chevron {
  color: var(--inkMid);
  opacity: 0.5;
  font-size: 1.1rem;
}

@media (max-width: 520px) {
  .date { display: none; }
  .archive-title { font-size: 1.4rem; letter-spacing: 0.2em; }
}
</style>
