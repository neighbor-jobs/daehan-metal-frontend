import React from 'react';

export const handleBasicInputChange = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setter: React.Dispatch<React.SetStateAction<any>>
): void => {
  const { name, value } = event.target;
  setter((prev) => ({ ...prev, [name]: value }));
};

/** input text에 개행문자 삽입해주는 함수 **/
export const getValueWithNewLine = (e: React.KeyboardEvent<HTMLInputElement>): string => {
  const target = e.currentTarget;
  const {selectionStart = 0, selectionEnd = 0, value} = target;
  return value.slice(0, selectionStart) + '\n' + value.slice(selectionEnd);
}

/** 캐럿 위치가 맨 끝인지 파악하는 함수 **/
export const isCaretAtEnd = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const target = e.currentTarget;
  const {selectionStart = 0, selectionEnd = 0, value = ''} = target;
  return selectionStart === selectionEnd && selectionStart === value.length;
}

export const isCaretAtStart = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const target = e.currentTarget;
  const {selectionStart = 0, selectionEnd = 0} = target;
  return selectionStart === selectionEnd && selectionStart === 0;
}
