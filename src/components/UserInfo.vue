<template>
  <div class="user-info stone" :class="{ active: isActive, black: isBlack, white: !isBlack }">
    <span class="name-inside">{{ name?.trim() || '대기 중' }}</span>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  isBlack: Boolean,
  record: String,
  isActive: Boolean,
});
</script>

<style scoped>
.user-info {
  width: clamp(48px, 72%, 96px);
  aspect-ratio: 1;
  transition: box-shadow 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.user-info.black { color: #f0f0f0; }
.user-info.white { color: #1a1a1a; }

.name-inside {
  font-size: 0.6rem;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
  line-height: 1.2;
}

@media (max-width: 520px) {
  .user-info {
    width: 44px;
    flex-shrink: 0;
  }
  .name-inside { display: none; }
}

.user-info.active {
  box-shadow: 0 0 10px 3px gold;
  animation: glow 1.5s infinite alternate;
}

.stone {
  border-radius: 50%;
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -2px 3px rgba(0, 0, 0, 0.4);
}

.stone.black {
  background: radial-gradient(circle at 30% 30%, #555, #000);
}

.stone.white {
  background: radial-gradient(circle at 30% 30%, #fff, #ccc);
  border: 1px solid #666;
}

@keyframes glow {
  from { box-shadow: 0 0 5px 1px gold; }
  to   { box-shadow: 0 0 20px 6px gold; }
}
</style>
