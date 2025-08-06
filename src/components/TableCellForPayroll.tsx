import React, {memo} from 'react';
import {Input, TableCell} from '@mui/material';
import {arrowNavAtRegister} from '../utils/arrowNavAtRegister.ts';

interface TableCellForPayroll {
  key?: string;
  disabled?: boolean;
  value: any;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  colIdx: number;
  rowIdx?: number;
  maxColLen: number;
  align?: 'left' | 'center' | 'right';
  cellW?: number | string;
}

const TableCellForPayroll = memo(function TableCellForPayroll({
                                                                disabled,
                                                                value,
                                                                name,
                                                                onChange,
                                                                colIdx,
                                                                rowIdx,
                                                                maxColLen,
                                                                align='right',
                                                                cellW
                                                              }: TableCellForPayroll) {
  return (
    <TableCell align={align}
               width={cellW}
               sx={{borderRight: '1px solid lightgray', py: 0}}
    >
      <Input
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
      />
    </TableCell>
  );
});

export default TableCellForPayroll;