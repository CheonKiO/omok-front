import { ref } from 'vue';

const message = ref('');
const type = ref('info');
const visible = ref(false);
let timeoutId = null;

export function useToast() {
  function show(msg, toastType = 'info', duration = 3000) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    message.value = msg;
    type.value = toastType;
    visible.value = true;

    timeoutId = setTimeout(() => {
      visible.value = false;
      timeoutId = null;
    }, duration);
  }

  return {
    message,
    type,
    visible,
    show,
  };
}
