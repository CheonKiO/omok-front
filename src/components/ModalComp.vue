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
      <button class="apply-btn" @click="applyFunction">{{ applyContent }}</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  headerContent: String,
  applyContent: String,
  applyFunction: Function,
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
  background: linear-gradient(180deg, var(--inkMid) 0%, var(--mainColor) 100%);
  color: #f5e9ce;
  padding: 10px;
  border: 1px solid var(--mainColor);
  border-radius: 3px;
  font-size: 0.95rem;
  font-family: 'ChosunGs', serif;
  letter-spacing: 0.2em;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(44,21,5,0.25);
  transition: all 0.15s ease;
}

.apply-btn:hover {
  background: linear-gradient(180deg, #7c4a1e 0%, #3d1f0d 100%);
  box-shadow: 0 3px 10px rgba(44,21,5,0.35);
}

.apply-btn:active {
  transform: translateY(1px);
}
</style>
