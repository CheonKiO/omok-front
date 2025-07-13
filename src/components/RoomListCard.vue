<template>
  <div class="card flex between">
    <div class="flex">
      <div class="card__title">{{ props.title }}</div>
      <div>({{ props.personnel }}/2명)</div>
    </div>
    <slot></slot>
  </div>
</template>
<script setup>
const props = defineProps(['title', 'personnel', 'button']);
</script>
<style scoped>
.card {
  box-sizing: border-box;
  background-color: white;
  width: 100%;
  padding: 1.5rem;
  border-radius: 0.75rem; /* 더 부드럽게 */
  margin-bottom: 1rem;
  /* 그림자 추가 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* 전환 효과 */
  transition:
    box-shadow 0.3s ease,
    transform 0.2s ease;
}
.card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
.card__title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-right: 1rem;
}
</style>
