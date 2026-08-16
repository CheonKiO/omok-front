import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// node 환경이므로 sessionStorage를 직접 만들어 준다.
function installSessionStorage() {
  const store = new Map();
  globalThis.sessionStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
  return store;
}

describe('websocket store — 방 복귀 가드 저장소', () => {
  let store;

  beforeEach(() => {
    store = installSessionStorage();
    vi.resetModules();
    setActivePinia(createPinia());
  });

  it('sessionStorage에 남은 ws_roomId로 roomId를 초기화한다', async () => {
    store.set('ws_roomId', 'room-42');
    const { useWebSocketStore } = await import('@/stores/websocket');

    expect(useWebSocketStore().roomId).toBe('room-42');
  });

  it('저장된 값이 없으면 roomId는 null이다', async () => {
    const { useWebSocketStore } = await import('@/stores/websocket');

    expect(useWebSocketStore().roomId).toBe(null);
  });
});
