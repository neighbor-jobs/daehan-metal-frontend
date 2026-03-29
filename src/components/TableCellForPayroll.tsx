import React, {memo, useMemo} from 'react';
import {SxProps, TableCell} from '@mui/material';
import {arrowNavAtRegister} from '../utils/arrowNavAtRegister.ts';

interface TableCellForPayroll {
  key?: string;
  disabled?: boolean;
  disabledTextColor?: string;
  value: any;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  colIdx?: number;
  rowIdx?: number;
  maxColLen?: number;
  maxRowLen?: number;
  align?: 'left' | 'center' | 'right';
  cellW?: number | string;
  validation?: boolean;
  fontSize?: number;
  cellSx?: SxProps;
}

const defaultCellSx: SxProps = {
  borderRight: '1px solid lightgray',
  py: '2.5px'
}

const TableCellForPayroll = memo(function TableCellForPayroll({
                                                                disabled,
                                                                disabledTextColor = 'gray',
                                                                value,
                                                                name,
                                                                onChange,
                                                                colIdx,
                                                                rowIdx,
                                                                maxColLen,
                                                                maxRowLen,
                                                                align = 'right',
                                                                cellW,
                                                                validation,
                                                                fontSize,
                                                                cellSx = defaultCellSx
                                                              }: TableCellForPayroll) {
  const isNegative = useMemo(() => {
    if (value === null || value === undefined || value === '') return false;

    // 콤마 제거 후 숫자로 변환
    const cleanValue = typeof value === 'string'
      ? value.replace(/,/g, '')
      : value;

    return Number(cleanValue) < 0;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!e.nativeEvent.isComposing) arrowNavAtRegister(e, maxColLen - 1, false, 'col', maxRowLen)
  };

  const inputStyle: React.CSSProperties = useMemo(() => ({
    textAlign: align,
    fontSize: fontSize,
    width: '100%',
    border: validation ? '1px solid red' : 'none',
    outline: 'none',
    backgroundColor: 'white',
    color: isNegative ? 'red' : (disabled ? disabledTextColor : 'black'),}), [align, fontSize, validation, disabled, disabledTextColor, isNegative]);

  return (
    <TableCell align={align}
               width={cellW}
               sx={cellSx}
    >
      <input type="text"
             disabled={disabled || false}
             name={name}
             value={value || ''}
             aria-invalid={validation}
             onChange={onChange}
             data-col-index={colIdx}
             data-row-index={rowIdx}
             onKeyDown={handleKeyDown}
             style={inputStyle}
      />
    </TableCell>
  );
});

export default TableCellForPayroll;