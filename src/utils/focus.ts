export const moveFocusToNextInput = (currentId: string) => {
  const inputs = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-input-id]'));
  const currentIndex = inputs.findIndex(input => input.dataset.inputId === currentId);

  if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
    const nextInput = inputs[currentIndex + 1];
    nextInput?.focus();
  }
};