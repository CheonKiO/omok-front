const SIZE = 15;

const directions = [
  [1, 0], // →
  [0, 1], // ↓
  [1, 1], // ↘
  [1, -1], // ↙
];

const getCoord = (index) => {
  return [index % SIZE, Math.floor(index / SIZE)];
};

function getColor(cell) {
  if (cell == null) return null;
  return cell % 2 === 1 ? 'black' : 'white';
}

function isOverline(board, index) {
  const [x, y] = getCoord(index);
  const result = {
    hasOverline: false,
    hasFive: false,
  };
  for (const [dx, dy] of directions) {
    let count = 1;

    for (const dir of [-1, 1]) {
      let nx = x + dx * dir;
      let ny = y + dy * dir;

      while (
        nx >= 0 &&
        nx < SIZE &&
        ny >= 0 &&
        ny < SIZE &&
        getColor(board[ny * SIZE + nx]) === 'black'
      ) {
        count++;
        nx += dx * dir;
        ny += dy * dir;
      }
    }

    if (count >= 6) {
      result.hasOverline = true; // 육목이면 금수
    } else if (count == 5) {
      result.hasFive = true;
    }
  }

  return result;
}

function countFour(board, index) {
  let fourCount = 0;
  const [x, y] = getCoord(index);
  const getCell = (x, y) => {
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return 'OUT';
    return board[y * SIZE + x];
  };
  for (const [dx, dy] of directions) {
    //a o o o
    //a o x o o
    //a o o x o
    //a x o o o
    for (const dir of [-1, 1]) {
      let first = getCell(x + dir * dx, y + dir * dy);
      let second = getCell(x + 2 * dir * dx, y + 2 * dir * dy);
      let third = getCell(x + 3 * dir * dx, y + 3 * dir * dy);
      let fourth = getCell(x + 4 * dir * dx, y + 4 * dir * dy);
      if (first % 2 === 1 && second % 2 === 1 && third % 2 === 1) {
        fourCount++;
      } else if (first % 2 === 1 && second === null && third % 2 === 1 && fourth % 2 === 1) {
        fourCount++;
      } else if (first % 2 === 1 && second % 2 === 1 && third === null && fourth % 2 === 1) {
        fourCount++;
      } else if (first === null && second % 2 === 1 && third % 2 === 1 && fourth % 2 === 1) {
        fourCount++;
      }
    }
    //o a o o
    //o a x o o
    //o a o x o
    for (const dir of [-1, 1]) {
      let first = getCell(x - dir * dx, y - dir * dy);
      let second = getCell(x + dir * dx, y + dir * dy);
      let third = getCell(x + 2 * dir * dx, y + 2 * dir * dy);
      let fourth = getCell(x + 3 * dir * dx, y + 3 * dir * dy);
      if (first % 2 === 1 && second % 2 === 1 && third % 2 === 1) {
        fourCount++;
      } else if (first % 2 === 1 && second === null && third % 2 === 1 && fourth % 2 === 1) {
        fourCount++;
      } else if (first % 2 === 1 && second % 2 === 1 && third === null && fourth % 2 === 1) {
        fourCount++;
      }
    }
    //o o a x o
    for (const dir of [-1, 1]) {
      let first = getCell(x - 2 * dir * dx, y - 2 * dir * dy);
      let second = getCell(x - dir * dx, y - dir * dy);
      let third = getCell(x + dir * dx, y + dir * dy);
      let fourth = getCell(x + 2 * dir * dx, y + 2 * dir * dy);
      if (first % 2 === 1 && second % 2 === 1 && third === null && fourth % 2 === 1) {
        fourCount++;
      }
    }
  }
  return fourCount;
}
function countOpenThrees(board, index) {
  const [x, y] = getCoord(index);

  let openThreeCount = 0;
  const getCell = (x, y) => {
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return 'OUT';
    return board[y * SIZE + x];
  };
  for (const [dx, dy] of directions) {
    {
      //x o a o x 패턴 -  1가지
      let first = getCell(x - 2 * dx, y - 2 * dy);
      let second = getCell(x - dx, y - dy);
      let third = getCell(x + dx, y + dy);
      let fourth = getCell(x + 2 * dx, y + 2 * dy);
      let fifth;
      if (first === null && second % 2 === 1 && third % 2 === 1 && fourth == null) {
        openThreeCount++;
      }
      //x a o o x 패턴 - 2가지
      for (const dir of [-1, 1]) {
        first = getCell(x - dir * dx, y - dir * dy);
        second = getCell(x + dir * dx, y + dir * dy);
        third = getCell(x + 2 * dir * dx, y + 2 * dir * dy);
        fourth = getCell(x + 3 * dir * dx, y + 3 * dir * dy);
        if (first === null && fourth === null && second % 2 === 1 && third % 2 === 1) {
          openThreeCount++;
        }
      }
      //x a o x o x 패턴 - 2가지
      //x a x o o x 패턴 - 2가지
      for (const dir of [-1, 1]) {
        first = getCell(x - dir * dx, y - dir * dy);
        second = getCell(x + dir * dx, y + dir * dy);
        third = getCell(x + 2 * dir * dx, y + 2 * dir * dy);
        fourth = getCell(x + 3 * dir * dx, y + 3 * dir * dy);
        fifth = getCell(x + 4 * dir * dx, y + 4 * dir * dy);
        if (first === null && fifth === null) {
          if (second % 2 === 1 && third === null && fourth % 2 === 1) {
            openThreeCount++;
          }
          if (second === null && third % 2 === 1 && fourth % 2 === 1) {
            openThreeCount++;
          }
        }
      }

      //x o a x o x 패턴 - 2가지
      for (const dir of [-1, 1]) {
        first = getCell(x - 2 * dir * dx, y - 2 * dir * dy);
        second = getCell(x - dir * dx, y - dir * dy);
        third = getCell(x + dir * dx, y + dir * dy);
        fourth = getCell(x + 2 * dir * dx, y + 2 * dir * dy);
        fifth = getCell(x + 3 * dir * dx, y + 3 * dir * dy);
        if (
          first === null &&
          fifth === null &&
          second % 2 === 1 &&
          third === null &&
          fourth % 2 === 1
        ) {
          openThreeCount++;
        }
      }
    }
  }
  return openThreeCount;
}

function isForbidden(board, index) {
  const { hasOverline, hasFive } = isOverline(board, index);
  const openThrees = countOpenThrees(board, index);
  const fours = countFour(board, index);
  console.log(openThrees);
  return (hasOverline || openThrees >= 2 || fours >= 2) && !hasFive;
}

export { isForbidden };
