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
  color: var(--ink);
  background: linear-gradient(160deg, #f4ead1 0%, #e8dcbe 100%);
  border: 1.5px solid var(--ink);
  box-shadow:
    0 0 0 3px var(--hanji),
    0 0 0 4px var(--gold),
    0 8px 24px rgba(20,8,0,0.3);
}

.toast.info { color: var(--ink); }

.toast.success {
  color: var(--win);
  box-shadow: 0 0 0 3px var(--hanji), 0 0 0 4px var(--win), 0 8px 24px rgba(20,8,0,0.25);
  border-color: var(--win);
}

.toast.error {
  color: var(--ju);
  box-shadow: 0 0 0 3px var(--hanji), 0 0 0 4px var(--ju), 0 8px 24px rgba(20,8,0,0.25);
  border-color: var(--ju);
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
