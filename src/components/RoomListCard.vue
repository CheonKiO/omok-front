<template>
  <div class="room-card flex between col-center">
    <div class="room-info flex col-center gap">
      <span class="room-icon">棋</span>
      <div>
        <div class="room-title">{{ props.title }}</div>
        <div class="room-personnel">{{ props.personnel }} / 2 명</div>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps(['title', 'personnel', 'button']);
</script>

<style scoped>
.room-card {
  background: linear-gradient(160deg, #fdf6e3 0%, #f0deb8 100%);
  border: 1px solid var(--borderColor);
  box-shadow: 0 2px 8px rgba(44,21,5,0.12), inset 0 1px 0 rgba(255,255,255,0.6);
  border-radius: 3px;
  padding: 1rem 1.4rem;
  margin-bottom: 0.75rem;
  transition: box-shadow 0.2s, transform 0.15s;
}

.room-card:hover {
  box-shadow: 0 4px 14px rgba(44,21,5,0.2), inset 0 1px 0 rgba(255,255,255,0.6);
  transform: translateY(-1px);
}

.room-info {
  gap: 0.9rem;
}

.gap { gap: 0.9rem; }

.room-icon {
  font-family: serif;
  font-size: 1.6rem;
  color: var(--borderColor);
  line-height: 1;
  opacity: 0.7;
}

.room-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--inkColor);
  letter-spacing: 0.02em;
}

.room-personnel {
  font-size: 0.75rem;
  color: var(--inkMid);
  margin-top: 0.15rem;
  letter-spacing: 0.03em;
}
</style>
