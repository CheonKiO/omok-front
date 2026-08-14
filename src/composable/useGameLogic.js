// 렌주 금수/승리 판정 규칙 엔진 (백엔드 RenjuRuleEngine 미러).
// 좌표계: flat 1D board, index = y*SIZE + x. 흑=홀수, 백=짝수, 빈칸=null.
// board(int[][])·빈칸=0 인 백엔드와 달리 프론트는 flat·null-empty 이므로 어댑터로 흡수한다.

const SIZE = 15;

const directions = [
  [1, 0], // →
  [0, 1], // ↓
  [1, 1], // ↘
  [1, -1], // ↙
];

// 색 상수: 'empty' | 'black' | 'white'
function stoneAt(board, x, y) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return 'empty'; // 경계 밖 = 빈칸 취급
  const cell = board[y * SIZE + x];
  if (cell == null) return 'empty';
  return cell % 2 === 1 ? 'black' : 'white';
}

// center에서 (dx,dy) 축으로 양방향 확장하며 targetColor 연속 목수를 센다 (center 포함).
function countConsecutiveStones(board, x, y, dx, dy, targetColor) {
  let count = 1;
  for (const dir of [-1, 1]) {
    let nx = x + dx * dir;
    let ny = y + dy * dir;
    while (stoneAt(board, nx, ny) === targetColor) {
      count++;
      nx += dx * dir;
      ny += dy * dir;
    }
  }
  return count;
}

// 이 방향으로 '사(four)'가 성립하는지 검사.
// 사 = 빈 칸 하나를 채우면 '정확히 5목'이 되는 모양. 장목(6목)이 되는 갭이나
// 양끝이 막혀 오목이 될 수 없는 모양은 사가 아니다. 한 방향에 최대 1개로 센다.
function hasFourInDirection(board, x, y, dx, dy) {
  for (let d = -4; d <= 4; d++) {
    if (d === 0) continue;
    const ex = x + dx * d;
    const ey = y + dy * d;
    if (ex < 0 || ex >= SIZE || ey < 0 || ey >= SIZE) continue;
    if (stoneAt(board, ex, ey) !== 'empty') continue;

    // 빈 칸에 임시로 흑을 놓아 pos를 지나는 연속 목수를 센다.
    const original = board[ey * SIZE + ex];
    board[ey * SIZE + ex] = 1;
    const run = countConsecutiveStones(board, x, y, dx, dy, 'black');
    board[ey * SIZE + ex] = original;

    if (run === 5) return true; // 정확히 5목 완성 → 사
  }
  return false;
}

function countFour(board, x, y) {
  let fourCount = 0;
  for (const [dx, dy] of directions) {
    if (hasFourInDirection(board, x, y, dx, dy)) fourCount++;
  }
  return fourCount;
}

// pos를 지나는 연속 흑이 정확히 4목이고, 양끝(연속 바로 바깥)이 모두
// 판 안의 빈 칸이면 '열린 사'. 벽에 막힌 4는 열린 사가 아니다.
function formsOpenFour(board, x, y, dx, dy) {
  let count = 1;

  let fx = x + dx;
  let fy = y + dy;
  while (stoneAt(board, fx, fy) === 'black') {
    count++;
    fx += dx;
    fy += dy;
  }
  let bx = x - dx;
  let by = y - dy;
  while (stoneAt(board, bx, by) === 'black') {
    count++;
    bx -= dx;
    by -= dy;
  }

  if (count !== 4) return false;
  const forwardEmpty = fx >= 0 && fx < SIZE && fy >= 0 && fy < SIZE && stoneAt(board, fx, fy) === 'empty';
  const backwardEmpty = bx >= 0 && bx < SIZE && by >= 0 && by < SIZE && stoneAt(board, bx, by) === 'empty';
  return forwardEmpty && backwardEmpty;
}

// 이 방향으로 '열린 삼'이 성립하는지 검사.
// 열린 삼 = 빈 칸 하나를 채우면 '열린 사(_●●●●_)'가 되는 모양.
// 단, 이미 사(four)인 모양은 삼으로 세지 않는다(사 > 삼).
function hasOpenThreeInDirection(board, x, y, dx, dy) {
  if (hasFourInDirection(board, x, y, dx, dy)) return false;

  for (let d = -4; d <= 4; d++) {
    if (d === 0) continue;
    const ex = x + dx * d;
    const ey = y + dy * d;
    if (ex < 0 || ex >= SIZE || ey < 0 || ey >= SIZE) continue;
    if (stoneAt(board, ex, ey) !== 'empty') continue;

    const original = board[ey * SIZE + ex];
    board[ey * SIZE + ex] = 1;
    const openFour = formsOpenFour(board, x, y, dx, dy);
    board[ey * SIZE + ex] = original;

    if (openFour) return true;
  }
  return false;
}

function countOpenThrees(board, x, y) {
  let openThreeCount = 0;
  for (const [dx, dy] of directions) {
    if (hasOpenThreeInDirection(board, x, y, dx, dy)) openThreeCount++;
  }
  return openThreeCount;
}

function hasOverlineAfterMove(board, x, y) {
  for (const [dx, dy] of directions) {
    if (countConsecutiveStones(board, x, y, dx, dy, 'black') >= 6) return true;
  }
  return false;
}

function hasFiveAfterMove(board, x, y) {
  for (const [dx, dy] of directions) {
    if (countConsecutiveStones(board, x, y, dx, dy, 'black') === 5) return true;
  }
  return false;
}

// 흑 금수(4-4 / 3-3 / 장목) 판정. index에 임시로 흑을 놓고 판정한다.
// 단, 해당 수로 정확히 5목이 완성되면(hasFive) 승리 우선이므로 금수가 아니다.
function isForbidden(board, index) {
  const x = index % SIZE;
  const y = Math.floor(index / SIZE);

  // 임시로 흑 돌을 놓고 계산 후 원값으로 복원
  const original = board[index];
  board[index] = 1;
  try {
    const hasOverline = hasOverlineAfterMove(board, x, y);
    const hasFive = hasFiveAfterMove(board, x, y);
    const openThrees = countOpenThrees(board, x, y);
    const fours = countFour(board, x, y);
    return (hasOverline || openThrees >= 2 || fours >= 2) && !hasFive;
  } finally {
    board[index] = original;
  }
}

export { isForbidden };
