<template>
  <div class="timer" :class="{ urgent: time <= 10 }">
    <span class="timer-label">남은 시간</span>
    <span class="timer-value">{{ time }}</span>
    <span class="timer-unit">초</span>
    <div class="timer-bar-wrap">
      <div class="timer-bar" :style="{ width: barWidth }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({ initialTime: Number });
const emit = defineEmits(['timeout']);

const time = ref(props.initialTime);
let intervalId = null;

const barWidth = computed(() => `${(time.value / props.initialTime) * 100}%`);

function startTimer() {
  stopTimer();
  time.value = props.initialTime;
  intervalId = setInterval(() => {
    if (time.value > 0) {
      time.value--;
      if (time.value === 0) {
        emit('timeout');
        stopTimer();
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(intervalId);
  intervalId = null;
}

function pause() { stopTimer(); }
function resume() { if (!intervalId && time.value > 0) startTimer(); }

onMounted(startTimer);
onUnmounted(stopTimer);
watch(() => props.initialTime, startTimer);
defineExpose({ pause, resume });
</script>

<style scoped>
.timer {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  padding: 4px 14px 6px;
  background: linear-gradient(180deg, rgba(253,246,227,0.9) 0%, rgba(232,212,154,0.85) 100%);
  border: 1px solid var(--borderColor);
  border-radius: 3px;
  box-shadow: 0 2px 6px rgba(44,21,5,0.15);
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  min-width: 130px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.timer.urgent {
  border-color: #b94040;
  box-shadow: 0 0 8px rgba(185,64,64,0.4);
  animation: pulse-red 1s infinite;
}

@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 6px rgba(185,64,64,0.3); }
  50%       { box-shadow: 0 0 14px rgba(185,64,64,0.6); }
}

.timer-label {
  font-size: 0.7rem;
  color: var(--inkMid);
  letter-spacing: 0.05em;
}

.timer-value {
  font-family: 'ChosunGs', serif;
  font-size: 1.6rem;
  color: var(--inkColor);
  line-height: 1;
  min-width: 2ch;
  text-align: right;
  transition: color 0.3s;
}

.timer.urgent .timer-value {
  color: #b94040;
}

.timer-unit {
  font-size: 0.75rem;
  color: var(--inkMid);
}

/* 진행바 */
.timer-bar-wrap {
  width: 100%;
  height: 3px;
  background: rgba(155,122,48,0.2);
  border-radius: 2px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
}

.timer-bar {
  height: 100%;
  background: linear-gradient(to right, var(--accentColor), var(--mainColor));
  transition: width 1s linear;
  border-radius: 2px;
}

.timer.urgent .timer-bar {
  background: linear-gradient(to right, #e8a040, #b94040);
}
</style>
