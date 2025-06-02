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

// 지출내역
interface ExpenseItem {
  leftTitle?: string;
  leftNote?: string;
  rightTitle?: string;
  rightNote?: string;
  result?: string;
}

/*const expenseData: ExpenseItem[] = [
  {leftTitle: '사장님 급여', rightTitle: '대출이자'},
  {leftTitle: '식대', rightTitle: '삼성화재'},
  {leftTitle: '용달', rightTitle: '통신비'},
  {leftTitle: '현대보험', rightTitle: '전기료'},
  {leftTitle: '국민연금', rightNote: '경조사비\n24.3월부터', rightTitle: '수도세'},
  {leftTitle: '건강보험', rightNote: '퇴직연금\n311 059245 94 001', rightTitle: '갑근세'},
  {leftTitle: '고용산재', rightTitle: '사장님 상해보험'},
  {leftTitle: '세콤', rightTitle: '공기청정기'},
  {leftTitle: '정수기'},
  {leftTitle: 'LIG암보험', rightTitle: '5일'},
  {leftTitle: '화재보험', rightTitle: '10일'},
  {leftTitle: '마이너스 통장', rightTitle: '11~25일'},
  {leftTitle: '출국만기보험', rightTitle: '카드값'},
  {leftTitle: '3.6.9.12월 분기별 이자', rightTitle: '합계'},
  {leftTitle: '제네시스 할부금'},
];*/

const PayrollLedger = (): React.JSX.Element => {
  const [payrollId, setPayrollId] = useState<string>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [standardAt, setStandardAt] = React.useState<string>(dayjs().format('YYYY-MM-01'));
  const navigate = useNavigate();
  const {showAlert} = useAlertStore();

  const getPayroll = async () => {
    try {
      const res = await axiosInstance.get(`/payroll/monthly/sales/report?standardAt=${standardAt}`);
      setPayrollId(res.data.data.id);
      setPayments(res.data.data.payments);
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
      },
    });
  };

  const deletePayroll = async () => {
    try {
      await axiosInstance.delete(`/payroll?id=${payrollId}`);
    } catch {
      showAlert('급여대장 삭제 실패. 다시 시도해 주세요.', 'error');
    }
  }

  // debug
  // console.log(payments);

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
        {/*<Box sx={{mt: 2}}>
          <Typography variant='h6'>지출 내역</Typography>
          <TableContainer
            component={Box}
            sx={{
              border: '1px solid',
              borderColor: 'lightgray',
              borderRadius: 1,
              mt: 1
            }}
          >
            <Table size="small">
              <TableBody>
                {expenseData.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{
                      whiteSpace: 'pre-line',
                      borderRight: '1px solid lightgray',
                      width: 1 / 4
                    }}>
                      {item.leftTitle || ''}
                      <Typography sx={{m: 0, fontSize: 10, whiteSpace: 'pre-line'}}>
                        {item.leftNote && `${item.leftNote}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{
                      borderRight: '1px solid lightgray',
                      width: 1 / 4
                    }}>
                      -
                    </TableCell>
                    <TableCell sx={{
                      whiteSpace: 'pre-line',
                      borderRight: '1px solid lightgray',
                      width: 1 / 4
                    }}>
                      {item.rightTitle || ''}
                      <Typography sx={{m: 0, fontSize: 10, whiteSpace: 'pre-line'}}>
                        {item.rightNote && item.rightNote || ''}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{width: 50}} align="center">-</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>*/}
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