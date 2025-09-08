import React, {memo} from 'react';
import {TableCell} from '@mui/material';
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
                                                                fontSize
                                                              }: TableCellForPayroll) {
  return (
    <TableCell align={align}
               width={cellW}
               sx={{borderRight: '1px solid lightgray', py: '1px'}}
    >
      {/*<Input
        disableUnderline
        disabled={disabled || false}
        name={name}
        value={value || ''}
        onChange={onChange}
        sx={{
          py: 0,
          my: 0,
          '& input': {textAlign: align}
        }}
        inputProps={{
          'data-col-index': colIdx,
          'data-row-index': rowIdx,
          onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
            arrowNavAtRegister(e, maxColLen - 1, false)
          }
        }}
      />*/}
      <input type="text"
             disabled={disabled || false}
             name={name}
             value={value || ''}
             aria-invalid={validation}
             onChange={onChange}
             data-col-index={colIdx}
             data-row-index={rowIdx}
             onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
               if (!e.nativeEvent.isComposing) arrowNavAtRegister(e, maxColLen - 1, false, 'col', maxRowLen)
             }}
             style={{
               textAlign: align,
               fontSize: fontSize,
               width: '100%',
               border: validation ? '1px solid red' : 'none',
               outline: 'none',
               backgroundColor: 'white',
               color: disabled ? disabledTextColor : 'black'
             }}
      />
    </TableCell>
  );
});

export default TableCellForPayroll;