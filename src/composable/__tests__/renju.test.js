import { describe, it, expect } from 'vitest';
import { isForbidden } from '@/composable/useGameLogic';

const SIZE = 15;
const board = () => new Array(SIZE * SIZE).fill(null);
const black = (b, x, y) => {
  b[y * SIZE + x] = 1;
};
const idx = (x, y) => y * SIZE + x;

describe('렌주 금수 판정', () => {
  it('장목으로만 되는 갭은 4-4가 아니다', () => {
    const b = board();
    black(b, 4, 7);
    black(b, 6, 7);
    black(b, 8, 7);
    black(b, 9, 7);
    expect(isForbidden(b, idx(5, 7))).toBe(false);
  });
  it('진짜 4-4는 금수', () => {
    const b = board();
    black(b, 5, 7);
    black(b, 6, 7);
    black(b, 8, 7);
    black(b, 7, 5);
    black(b, 7, 6);
    black(b, 7, 8);
    expect(isForbidden(b, idx(7, 7))).toBe(true);
  });
  it('고립 착수는 합법', () => {
    const b = board();
    black(b, 7, 7);
    expect(isForbidden(b, idx(5, 5))).toBe(false);
  });
  it('진짜 3-3은 금수', () => {
    const b = board();
    black(b, 6, 7);
    black(b, 8, 7);
    black(b, 7, 6);
    black(b, 7, 8);
    expect(isForbidden(b, idx(7, 7))).toBe(true);
  });
  it('5목 완성수는 금수 아님(승리 우선)', () => {
    const b = board();
    black(b, 3, 7);
    black(b, 4, 7);
    black(b, 6, 7);
    black(b, 7, 7);
    expect(isForbidden(b, idx(5, 7))).toBe(false);
  });
  it('흑 6목(장목)은 금수', () => {
    const b = board();
    black(b, 2, 7);
    black(b, 3, 7);
    black(b, 4, 7);
    black(b, 6, 7);
    black(b, 7, 7);
    expect(isForbidden(b, idx(5, 7))).toBe(true);
  });
});
