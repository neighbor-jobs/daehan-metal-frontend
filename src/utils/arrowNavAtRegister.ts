export const arrowNavAtRegister = (
    e: React.KeyboardEvent<HTMLInputElement>,
    maxCols: number,
    isAutoComplete?: boolean,
    directionEnter?: 'col' | 'row',
    maxRows?: number,
  ) => {
  const input = e.currentTarget;
  // Autocomplete 목록 열려 있으면 기본 동작
  if (input.getAttribute('aria-expanded') === 'true') return;

  const { selectionStart, selectionEnd, value } = input;
  const row = Number(input.dataset.rowIndex);
  const col = Number(input.dataset.colIndex);
  let newRow = row;
  let newCol = col;

  switch (e.key) {
    case 'ArrowUp':
      if (isAutoComplete) return;
      newRow = row - 1;
      break;
    case 'ArrowDown':
      if (isAutoComplete) return;
      newRow = row + 1;
      break;
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
      if (directionEnter === 'col') {
        if (row >= maxRows) {
          newCol = col + 1;
          newRow = 0;
        } else {
          newRow = row + 1;
        }
      } else {
        if (col >= maxCols) {
          newRow = row + 1;
          newCol = 0;
        } else {
          newCol = col + 1;
        }
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
  // const nextEl = document.querySelector<HTMLElement>(selector);
  const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
  if (!el) return;

  // 스크롤 튐 방지
  el.focus();
  const len = el.value?.length ?? 0;
  const placeCaret = () => el.setSelectionRange(len, len);

  // 포커스 직후 같은 프레임에 selectionRange가 먹지 않는 경우가 있어
  // 다음 페인트 타이밍에 커서를 이동시킵니다.
  if ('requestAnimationFrame' in window) {
    requestAnimationFrame(placeCaret);
  } else {
    setTimeout(placeCaret, 0);
  }
  // if (nextEl) nextEl.focus();
}