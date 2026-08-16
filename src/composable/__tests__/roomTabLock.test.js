import { describe, it, expect, afterEach } from 'vitest';
import { useRoomTabLock } from '@/composable/useRoomTabLock';

const locks = [];

function makeLock(roomId) {
  const lock = useRoomTabLock(roomId);
  locks.push(lock);
  return lock;
}

afterEach(() => {
  while (locks.length) locks.pop().release();
});

describe('useRoomTabLock', () => {
  it('첫 번째 탭은 점유에 성공한다', async () => {
    const first = makeLock('room-1');

    expect(await first.acquire()).toBe(true);
  });

  it('같은 방의 두 번째 탭은 점유에 실패한다', async () => {
    const first = makeLock('room-1');
    await first.acquire();

    const second = makeLock('room-1');

    expect(await second.acquire()).toBe(false);
  });

  it('다른 방이면 서로 막지 않는다', async () => {
    const a = makeLock('room-1');
    await a.acquire();

    const b = makeLock('room-2');

    expect(await b.acquire()).toBe(true);
  });

  it('점유를 해제하면 다음 탭이 다시 점유할 수 있다', async () => {
    const first = makeLock('room-1');
    await first.acquire();
    first.release();

    const second = makeLock('room-1');

    expect(await second.acquire()).toBe(true);
  });
});
