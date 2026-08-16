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
  background: linear-gradient(160deg, #f4ead1 0%, #e8dcbe 100%);
  border: 1.5px solid var(--ink);
  box-shadow:
    0 0 0 4px var(--hanji),
    0 0 0 5px var(--gold),
    0 14px 44px rgba(20,8,0,0.4);
  border-radius: 3px;
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
  border-bottom: 1.5px solid var(--ink);
}

.modal-header h3 {
  font-family: var(--display);
  font-weight: normal;
  font-size: 1.1rem;
  color: var(--ink);
  letter-spacing: 0.12em;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--ink-soft);
  padding: 2px 6px;
  border-radius: 2px;
  transition: color 0.15s;
}

.close-btn:hover {
  color: var(--ju);
}

.modal-body {
  margin-bottom: 0.4rem;
}

.apply-btn {
  margin-top: 1rem;
  width: 100%;
  color: #f2e4cf;
  padding: 11px;
  border: none;
  border-radius: 3px;
  font-size: 0.95rem;
  font-family: var(--display);
  letter-spacing: 0.2em;
  cursor: pointer;
  text-shadow: 0 1px 0 rgba(0,0,0,0.28);
  box-shadow: 0 2px 4px rgba(60,20,12,0.3), inset 0 1px 0 rgba(255,240,220,0.15);
  transition: background 0.15s ease, transform 0.1s ease;
  /* 기본(개설) = 주칠. 변형 미적용 시에도 색 보장 */
  background: linear-gradient(180deg, #a4402f 0%, #872f24 100%);
}

.apply-btn.create:hover { background: linear-gradient(180deg, #b0472f 0%, #93332a 100%); }

/* 입장 = ink (로비 '입장' 버튼과 동일) */
.apply-btn.join {
  color: #f2e8d4;
  background: linear-gradient(180deg, #2c261a 0%, #1a150d 100%);
  box-shadow: 0 2px 4px rgba(20,12,4,0.28), inset 0 1px 0 rgba(255,240,220,0.08);
}
.apply-btn.join:hover { background: linear-gradient(180deg, #3a3122 0%, #241d12 100%); }

.apply-btn:active {
  transform: translateY(1px);
  box-shadow: inset 0 1px 3px rgba(20,10,0,0.3);
}
</style>
