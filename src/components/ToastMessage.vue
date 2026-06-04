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
  top: 4.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.7rem 1.8rem;
  border-radius: 3px;
  font-weight: 600;
  font-family: var(--app-font);
  font-size: 0.88rem;
  z-index: 9999;
  min-width: 220px;
  text-align: center;
  letter-spacing: 0.03em;
  background: linear-gradient(160deg, #fdf6e3 0%, #f0deb8 100%);
  border: 1px solid var(--borderColor);
  box-shadow:
    0 0 0 3px #f5e9ce,
    0 0 0 4px var(--borderColor),
    0 6px 20px rgba(20,8,0,0.25);
}

.toast.info {
  border-color: var(--borderColor);
  color: var(--inkColor);
}

.toast.success {
  border-color: #5a8a4a;
  box-shadow: 0 0 0 3px #f5e9ce, 0 0 0 4px #5a8a4a, 0 6px 20px rgba(20,8,0,0.2);
  color: #3a6a2a;
}

.toast.error {
  border-color: #b94040;
  box-shadow: 0 0 0 3px #f5e9ce, 0 0 0 4px #b94040, 0 6px 20px rgba(20,8,0,0.2);
  color: #8b2020;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}
</style>
