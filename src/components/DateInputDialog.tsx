import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import PrintButton from '../layout/PrintButton.tsx';
import {AccountingManageMenuType} from '../types/headerMenu.ts';
import dayjs, {Dayjs} from 'dayjs';

export const DateInputDialog = ({
                           isOpened,
                           onClose,
                           payments,
                         }): React.JSX.Element => {
  const [date, setDate] = useState<Dayjs>(dayjs());
  return (
    <Dialog
      open={isOpened}
      onClose={onClose}
    >
      <DialogTitle>급여일자</DialogTitle>

      <DialogContent sx={{mt: 2}}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
          <DesktopDatePicker
            format="YYYY-MM-DD"
            value={date}
            onChange={(v) => setDate(v)}
          />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <PrintButton printData={{payments: payments, date: date.toDate()}}
                     value='확인'
                     propType={AccountingManageMenuType.EmployeeManage}
        />
        <Button onClick={onClose}
                variant='outlined'
                color='error'
        >
          취소
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DateInputDialog;