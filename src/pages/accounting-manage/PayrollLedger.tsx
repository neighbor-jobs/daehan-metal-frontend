import {
  Box,
  Button,
  Input,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import React, {useState} from 'react';
import {PaymentTableRow, TableColumns} from '../../types/tableColumns.ts';
import axiosInstance from '../../api/axios.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {Payment} from '../../types/payrollRes.ts';
import {formatCurrency} from '../../utils/format.ts';
import {useNavigate} from 'react-router-dom';
import {Ledger, Paying} from '../../types/ledger.ts';

const leftRows: readonly TableColumns<PaymentTableRow>[] = [
  {
    id: PaymentTableRow.PAY,
    label: '기본급',
    minWidth: 100,
    format: formatCurrency
  },
  {
    id: PaymentTableRow.HOURLY_WAGE,
    label: '시급1시간',
    minWidth: 100,
    format: formatCurrency
  },
  {
    id: PaymentTableRow.EXTEND_WORKING_TIME,
    label: '연장근무시간',
    minWidth: 100,
  },
  {
    id: PaymentTableRow.EXTEND_WORKING_WAGE,
    label: '연장수당',
    minWidth: 100,
    format: formatCurrency
  },
  {
    id: PaymentTableRow.DAY_OFF_WORKING_TIME,
    label: '휴일근무시간',
    minWidth: 100,
  },
  {
    id: PaymentTableRow.DAY_OFF_WORKING_WAGE,
    label: '휴일근무수당',
    minWidth: 100,
    format: formatCurrency
  },
  {
    id: PaymentTableRow.ANNUAL_LEAVE_ALLOWANCE,
    label: '연차수당',
    minWidth: 100,
    format: formatCurrency
  },
  {
    id: PaymentTableRow.MEAL_ALLOWANCE,
    label: '식대',
    minWidth: 100,
    format: formatCurrency
  },
  {
    id: PaymentTableRow.TOTAL_PAYMENT,
    label: '합계',
    minWidth: 100,
  }
];

const PayrollLedger = (): React.JSX.Element => {
  const [payrollId, setPayrollId] = useState<string>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [leftLedger, setLeftLedger] = useState<Paying[]>([]);
  const [rightLedger, setRightLedger] = useState<Paying[]>([]);
  const [standardAt, setStandardAt] = useState<string>(dayjs().format('YYYY-MM-01'));
  const navigate = useNavigate();
  const {showAlert} = useAlertStore();

  const getPayroll = async () => {
    try {
      const payroll = await axiosInstance.get(`/payroll/monthly/sales/report?standardAt=${standardAt}`);
      const l = await axiosInstance.get(`/ledger/monthly?standardAt=${standardAt}`);
      setPayrollId(payroll.data.data.id);
      setPayments(payroll.data.data.payments);
      setLedger(l.data.data);
      const arr = l.data.data.payingExpenses;
      const midIndex = Math.ceil(arr.length / 2);
      setLeftLedger(arr.slice(0, midIndex));
      setRightLedger(arr.slice(midIndex));
    } catch {
      showAlert('해당 월 급여대장 정보가 없습니다.', 'error');
    }
  }

  const handleEditPayroll = () => {
    if (!payments || payments.length === 0) {
      showAlert('수정할 급여대장을 먼저 불러와 주세요', 'warning');
      return;
    }
    navigate('/account/payroll-new', {
      state: {
        payrollId,
        standardAt,
        payments,
        ledger,
      },
    });
  };

  const deletePayroll = async () => {
    try {
      await axiosInstance.delete(`/payroll?id=${payrollId}`);
      await axiosInstance.delete(`/ledger?id=${ledger.id}`)
      showAlert('삭제 완료', 'success');
    } catch {
      showAlert('급여대장 삭제 실패. 다시 시도해 주세요.', 'error');
    }
  }

  // debug
  // console.log(payments);
  // console.log('ledger: ', ledger, ', 왼: ', leftLedger, ', 오: ', rightLedger);

  return (
    <Box>
      {/* 검색 */}
      <Box sx={{
        mx: 3,
        my: 1,
      }}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <InputLabel sx={{fontSize: 'small',}}>검색일</InputLabel>
            <DesktopDatePicker
              views={['month', 'year']}
              format="YYYY/MM"
              defaultValue={dayjs()}
              value={dayjs(standardAt)}
              onChange={(value) => setStandardAt(value.format('YYYY-MM-01'))}
              slotProps={{
                textField: {size: 'small'},
              }}
            />
            <Button variant='outlined'
                    onClick={getPayroll}
            >
              검색
            </Button>
          </Box>
        </LocalizationProvider>
      </Box>

      <Paper sx={{paddingBottom: 1, px: 2}}>
        {/* 급여대장 */}
        <Box sx={{mt: 1}}>
          <Typography>작성일자:</Typography>
          <TableContainer
            component={Box}
            sx={{
              border: '1px solid',
              borderColor: 'lightgray',
              borderRadius: 1,
            }}
          >
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{borderRight: '1px solid lightgray'}}/>
                  {payments.map((p) => (
                    <TableCell sx={{borderRight: '1px solid lightgray', minWidth: 100}}
                               align='center'
                               key={p.id}
                    >
                      {p.employeeName}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {leftRows.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    <TableCell
                      sx={{borderRight: '1px solid lightgray', py: 0.5}}
                      width={row.minWidth}
                    >
                      {row.label}
                    </TableCell>
                    {payments.map((payment, colIdx) => (
                      <TableCell key={`${payment.id}-${colIdx}`} align="right"
                                 sx={{borderRight: '1px solid lightgray', py: 0}}
                      >
                        <Input disableUnderline
                               value={row.format ? row.format(payment.paymentDetail[row.id]) : payment.paymentDetail[row.id]}
                               sx={{py: 0, my: 0, '& input': {textAlign: 'right'}}}
                               inputProps={{
                                 disabled: true,
                                 color: 'black'
                               }}
                        >
                        </Input>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* 지출 내역 */}
        <Box sx={{ mt: 2 }}>
          <Typography variant='h6'>지출 내역</Typography>
          <Box sx={{ display: 'flex', mt: 1 }}>
            {/* 왼쪽 table */}
            <TableContainer
              component={Box}
              sx={{
                border: '1px solid',
                borderColor: 'lightgray',
                flex: 1,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>항목</TableCell>
                    <TableCell align="right">금액</TableCell>
                    <TableCell align='center'>지출일</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leftLedger.map((item, idx) => (
                    <TableRow key={`left-${idx}`}>
                      <TableCell sx={{borderRight: '1px solid lightgray', py: 0}}>
                        <Input disableUnderline
                               value={(item as any).purpose || String(item)}
                               sx={{py: 0, my: 0,}}
                               inputProps={{
                                 disabled: true,
                               }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{borderRight: '1px solid lightgray', py: 0}}>
                        <Input disableUnderline
                               value={(item as any).value ?? '-'}
                               sx={{py: 0, my: 0, '& input': {textAlign: 'right'}}}
                               inputProps={{
                                 disabled: true,
                               }}
                        />
                      </TableCell>
                      <TableCell align="center"
                                 width='20%'
                                 sx={{borderRight: '1px solid lightgray', py: 0}}
                      >
                        <Input disableUnderline
                               value={(item as any).group ?? '-'}
                               sx={{py: 0, my: 0, '& input': {textAlign: 'center'}}}
                               inputProps={{
                                 disabled: true,
                               }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 오른쪽 table */}
            <TableContainer
              component={Box}
              sx={{
                border: '1px solid',
                borderColor: 'lightgray',
                flex: 1,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>항목</TableCell>
                    <TableCell align="right">금액</TableCell>
                    <TableCell align='center'>지출일</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rightLedger.map((item, idx) => (
                    <TableRow key={`right-${idx}`}>
                      <TableCell sx={{borderRight: '1px solid lightgray', py: 0}}
                      >
                        <Input disableUnderline
                               value={(item as any).purpose || String(item)}
                               sx={{py: 0, my: 0,}}
                               inputProps={{
                                 disabled: true,
                               }}
                        />
                      </TableCell>
                      <TableCell align="right"
                                 sx={{borderRight: '1px solid lightgray', py: 0}}
                      >
                        <Input disableUnderline
                               value={(item as any).value ?? '-'}
                               sx={{py: 0, my: 0, '& input': {textAlign: 'right'}}}
                               inputProps={{
                                 disabled: true,
                               }}
                        />
                      </TableCell>
                      <TableCell align="center"
                                 width='20%'
                                 sx={{borderRight: '1px solid lightgray', py: 0}}>
                        <Input disableUnderline
                               value={(item as any).group ?? '-'}
                               sx={{py: 0, my: 0, '& input': {textAlign: 'center'}}}
                               inputProps={{
                                 disabled: true,
                               }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Paper>

      {/* 버튼들 */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        my: 1,
        mx: 2
      }}
      >
        <Button variant='contained'
                color='error'
                onClick={deletePayroll}
        >
          삭제
        </Button>
        <Box>
          <Button variant='contained'
                  onClick={handleEditPayroll}
                  sx={{marginRight: 2}}
          >
            수정
          </Button>
          <Button variant='contained'>인쇄</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default PayrollLedger;