/**
 * @param currentId  현재 포커스를 가진 input의 data-input-id
 * @param direction  'next' | 'prev'  (기본값: 'next')
 */

export const moveFocus = (
  currentId: string,
  direction: 'next' | 'prev' = 'next',
): void => {
  const inputs = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      '[data-input-id]',
    ),
  );

  const currentIndex = inputs.findIndex((input) => input.dataset.inputId === currentId,);

  if (currentIndex === -1) return;

  const offset = direction === 'next' ? 1 : -1;
  const targetIndex = currentIndex + offset;

  if (targetIndex >= 0 && targetIndex < inputs.length) {
    inputs[targetIndex].focus();
  }
};

export const moveFocusToNextInput = (id: string) => moveFocus(id, 'next');
export const moveFocusToPrevInput = (id: string) => moveFocus(id, 'prev');