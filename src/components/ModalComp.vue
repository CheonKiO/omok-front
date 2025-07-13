<template>
  <div v-if="visible" class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ headerContent }}</h3>
        <button class="close-btn" @click="close">✕</button>
      </div>
      <slot> </slot>
      <!-- 적용 버튼 -->
      <button class="apply-btn" @click="applyFunction">{{ applyContent }}</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  visible: Boolean,
  headerContent: String,
  applyContent: String,
  applyFunction: Function,
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
}

/* 헤더 스타일 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  font-weight: 700;
  font-size: 1.1rem;
}

/* 닫기 버튼 (✕)에 색상 적용 */
.close-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--mainColor);
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

/* 날짜 인풋 영역 */
.date-range {
  margin-top: 16px;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.date-inputs input {
  flex: 1;
  min-width: 40%;
  padding: 8px;
  font-size: 0.95rem;
  border: 1px solid var(--grey03);
  border-radius: 6px;
}

/* 카테고리 */
.category-select {
  margin-top: 16px;
}

select {
  width: 100%;
  padding: 8px;
  font-size: 0.95rem;
  border: 1px solid var(--grey03);
  border-radius: 6px;
  margin-top: 6px;
}

/* 적용 버튼 */
.apply-btn {
  margin-top: 20px;
  width: 100%;
  background-color: var(--mainColor);
  color: white;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
}

.apply-btn:hover {
  background-color: var(--mainColor);
  filter: brightness(90%);
}

@media (max-width: 768px) {
  .modal-content {
    margin: 0;
    max-height: 70%;
    padding: 1rem;
  }

  .modal-header h3 {
    font-size: 1rem;
  }

  .close-btn {
    font-size: 1rem;
  }

  .date-inputs input,
  select {
    font-size: 0.9rem;
    padding: 6px;
  }

  .apply-btn {
    font-size: 0.95rem;
    padding: 10px;
  }
}
</style>
