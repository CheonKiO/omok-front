<template>
  <div class="user-info stone" :class="{ active: isActive, black: isBlack, white: !isBlack }">
    <div class="info">
      <p class="name" v-if="name?.trim()">닉네임 : {{ name }}</p>
      <p calss="name" v-else>상대가 없습니다</p>
      <!-- <p>통산 전적: {{ record }}</p> -->
    </div>
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
.user-info.black {
  color: #f0f0f0;
}
.user-info.white {
  color: #000;
}
.user-info {
  width: 80%;
  aspect-ratio: 1;
  padding: 7.5%;
  margin: 2.5%;
  transition: box-shadow 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-info.active {
  box-shadow: 0 0 10px 3px gold;
  animation: glow 1.5s infinite alternate;
}

.stone {
  border-radius: 50%;
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.4),
    /* 바깥 그림자 */ inset 0 1px 2px rgba(255, 255, 255, 0.3),
    /* 안쪽 빛 */ inset 0 -2px 3px rgba(0, 0, 0, 0.4); /* 안쪽 그림자 */
}

/* 검은 돌 */
.stone.black {
  background: radial-gradient(circle at 30% 30%, #555, #000);
}

/* 흰 돌 */
.stone.white {
  background: radial-gradient(circle at 30% 30%, #fff, #ccc);
  border: 1px solid #666;
}

.name {
  text-align: center;
}
@keyframes glow {
  from {
    box-shadow: 0 0 5px 1px gold;
  }
  to {
    box-shadow: 0 0 20px 6px gold;
  }
}
</style>
