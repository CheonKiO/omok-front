import { describe, it, expect, beforeEach } from 'vitest';
import { useGameState } from '@/composable/useGameState';
import { useGameMessages } from '@/composable/useGameMessages';

function setup() {
  const state = useGameState();
  const reconnect = { start() {}, stop() {}, clear() {} };
  const player = { id: 'me', name: '나', ready: false };
  const shown = [];
  const show = (msg, type, duration) => shown.push({ msg, type, duration });
  const { handleMessage } = useGameMessages({ state, reconnect, player, show });
  return { state, handleMessage, shown };
}

describe('useGameMessages — 착수번호', () => {
  let ctx;

  beforeEach(() => {
    ctx = setup();
    ctx.state.room.isPlaying = true;
    ctx.state.room.turn = 1;
  });

  it('돌 번호를 서버가 보낸 turn - 1로 스탬프한다', () => {
    ctx.handleMessage({ type: 'ACTION', index: 112, turn: 2 });

    expect(ctx.state.room.board[112]).toBe(1);
    expect(ctx.state.room.turn).toBe(2);
  });

  it('중간 ACTION을 놓쳐도 돌 색이 어긋나지 않는다', () => {
    // 1수(turn:2)만 받고 2수를 유실한 뒤 3수(turn:4)를 받는 상황
    ctx.handleMessage({ type: 'ACTION', index: 112, turn: 2 });
    ctx.handleMessage({ type: 'ACTION', index: 114, turn: 4 });

    expect(ctx.state.room.board[112]).toBe(1); // 흑
    expect(ctx.state.room.board[114]).toBe(3); // 흑 (홀수 = 흑)
  });
});
