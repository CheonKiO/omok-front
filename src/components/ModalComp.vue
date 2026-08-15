<template>
  <div v-if="visible" class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ headerContent }}</h3>
        <button class="close-btn" @click="close">✕</button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <button class="apply-btn" :class="applyVariant" @click="applyFunction">{{ applyContent }}</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  headerContent: String,
  applyContent: String,
  applyFunction: Function,
  applyVariant: { type: String, default: 'create' }, // 'create'(군청) | 'join'(주홍)
});
const emit = defineEmits(['close']);
const close = () => emit('close');
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(20, 8, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(160deg, #fdf6e3 0%, #f0deb8 100%);
  border: 1px solid var(--borderColor);
  box-shadow:
    0 0 0 4px #f5e9ce,
    0 0 0 5px var(--borderColor),
    0 12px 40px rgba(20,8,0,0.35);
  border-radius: 4px;
  padding: 1.6rem 1.8rem;
  min-width: 280px;
  max-width: 380px;
  width: 90vw;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid var(--borderColor);
}

.modal-header h3 {
  font-family: 'ChosunGs', serif;
  font-weight: normal;
  font-size: 1.05rem;
  color: var(--inkColor);
  letter-spacing: 0.12em;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--inkMid);
  padding: 2px 6px;
  border-radius: 2px;
  transition: color 0.15s;
}

.close-btn:hover {
  color: var(--mainColor);
}

.modal-body {
  margin-bottom: 0.4rem;
}

.apply-btn {
  margin-top: 1rem;
  width: 100%;
  color: #f3ecd6;
  padding: 10px;
  border: none;
  border-radius: 3px;
  font-size: 0.95rem;
  font-family: 'ChosunGs', serif;
  letter-spacing: 0.2em;
  cursor: pointer;
  text-shadow: 0 1px 0 rgba(0,0,0,0.25);
  box-shadow: 0 2px 5px rgba(44,21,5,0.2);
  transition: background 0.15s ease, transform 0.1s ease;
  /* 기본(개설) = 군청, 로비 '대국방 개설' 버튼과 동일 반투명 톤. 변형 미적용 시에도 색 보장 */
  background: linear-gradient(180deg, rgba(63,81,112,0.82) 0%, rgba(43,58,85,0.86) 100%);
}

.apply-btn.create:hover { background: linear-gradient(180deg, rgba(78,98,132,0.9) 0%, rgba(54,72,102,0.92) 100%); }

/* 입장 = 주홍 (로비 '입장' 버튼과 동일 반투명 톤) */
.apply-btn.join { background: linear-gradient(180deg, rgba(154,68,54,0.85) 0%, rgba(122,47,36,0.88) 100%); }
.apply-btn.join:hover { background: linear-gradient(180deg, rgba(168,80,64,0.92) 0%, rgba(136,56,44,0.94) 100%); }

.apply-btn:active {
  transform: translateY(1px);
  box-shadow: inset 0 1px 3px rgba(20,10,0,0.3);
}
</style>
