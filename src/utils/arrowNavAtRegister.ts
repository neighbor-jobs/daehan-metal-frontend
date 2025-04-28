export const arrowNavAtRegister = (e: React.KeyboardEvent<HTMLInputElement>, maxCols: number ) => {
  const input = e.currentTarget;
  // Autocomplete 목록 열려 있으면 기본 동작
  if (input.getAttribute('aria-expanded') === 'true') {
    return;
  }

  const { selectionStart, selectionEnd, value } = input;
  const row = Number(input.dataset.rowIndex);
  const col = Number(input.dataset.colIndex);
  let newRow = row;
  let newCol = col;

  switch (e.key) {
    /*case 'ArrowUp':
      newRow = row - 1;
      break;
    case 'ArrowDown':
      newRow = row + 1;
      break;*/
    case 'ArrowLeft':
      // 커서가 맨 앞이 아닐 땐 내부 이동
      if ((selectionStart ?? 0) > 0 || selectionStart !== selectionEnd) {
        return;
      }
      newCol = col - 1;
      break;
    case 'ArrowRight' :
      // 커서가 맨 뒤가 아닐 땐 내부 이동
      if ((selectionStart ?? 0) < value.length || selectionStart !== selectionEnd) {
        return;
      }
      newCol = col + 1;
      break;
    case 'Enter' :
      if (col >= maxCols) {
        newRow = row + 1;
        newCol = 0;
      } else {
        newCol = col + 1;
      }
      break;
    default:
      return;
  }

  e.preventDefault();
  focusByCell(newRow, newCol);
}

export const focusByCell = (row: number, col: number) => {
  const selector = `[data-row-index="${row}"][data-col-index="${col}"]`;
  const nextEl = document.querySelector<HTMLElement>(selector);
  if (nextEl) nextEl.focus();
}