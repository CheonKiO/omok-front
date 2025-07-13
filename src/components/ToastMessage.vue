<script setup>
import { useToast } from '@/composable/useToast';

const { message, type, visible } = useToast();
</script>

<template>
  <Transition name="slide-up">
    <div v-if="visible" class="toast" :class="type">{{ message }}</div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-family: var(--app-font);
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 280px;
  text-align: center;
  background-color: white;
}

/* 타입별 색상 */
.toast.info {
  border: 2px solid var(--mainColor);
  color: var(--mainColor);
}

.toast.success {
  border: 2px solid #2ecc71;
  color: #2ecc71;
}

.toast.error {
  border: 2px solid #e74c3c;
  color: #e74c3c;
}

/* 애니메이션 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10%);
}
</style>
