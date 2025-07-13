<template>
  <div class="timer">
    <p>착수 제한: {{ time }}초</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
const props = defineProps({ initialTime: Number });
const emit = defineEmits(['timeout']);

const time = ref(props.initialTime);
let intervalId = null;

function startTimer() {
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

function pause() {
  stopTimer();
}

function resume() {
  if (!intervalId && time.value > 0) {
    startTimer();
  }
}
onMounted(startTimer);
onUnmounted(stopTimer);

watch(
  () => props.initialTime,
  () => {
    startTimer(); // initialTime 바뀌면 다시 시작
  },
);

defineExpose({
  pause,
  resume,
});
</script>

<style scoped>
.timer {
  font-size: 1.5em;
}
</style>
