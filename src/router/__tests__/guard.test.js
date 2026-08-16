import { describe, it, expect } from 'vitest';
import { shouldReturnToRoom } from '@/router/guard';

describe('shouldReturnToRoom — 방 복귀 판정', () => {
  it('인증 + savedRoomId + 다른 경로 → true', () => {
    expect(shouldReturnToRoom(true, 'room-42', '/')).toBe(true);
  });

  it('인증 + savedRoomId + 같은 방 경로 → false (이미 그 방이면 재이동 안 함)', () => {
    expect(shouldReturnToRoom(true, 'room-42', '/room/room-42')).toBe(false);
  });

  it('미인증 + savedRoomId + /login → false (핑퐁 방지 핵심 케이스)', () => {
    expect(shouldReturnToRoom(false, 'room-42', '/login')).toBe(false);
  });

  it('savedRoomId 없음 → false', () => {
    expect(shouldReturnToRoom(true, null, '/')).toBe(false);
  });
});
