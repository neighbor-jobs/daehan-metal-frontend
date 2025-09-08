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
import React, {Fragment, useEffect, useMemo, useRef, useState} from 'react';
import {DeductionTableRow, PaymentTableRow} from '../../types/tableColumns.ts';
import axiosInstance from '../../api/axios.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {Payment} from '../../types/payrollRes.ts';
import {formatCurrency} from '../../utils/format.ts';
import {useLocation, useNavigate} from 'react-router-dom';
import {Ledger, Paying} from '../../types/ledger.ts';
import PrintButton from '../../layout/PrintButton.tsx';
import {AccountingManageMenuType} from '../../types/headerMenu.ts';
import AddPayment from './AddPayment.tsx';
import TableCellForPayroll from '../../components/TableCellForPayroll.tsx';
import cacheManager from '../../utils/cacheManager.ts';

const paymentRows = [
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
    id: PaymentTableRow.SALARY,
    label: '합계',
    minWidth: 100,
    format: formatCurrency
  },
];
const tailRows = [
  {
    id: DeductionTableRow.DEDUCTION,
    label: '지급액계',
    minWidth: 100,
    format: formatCurrency
  },
  {
    id: PaymentTableRow.TOTAL_SALARY,
    label: '수령액',
    minWidth: 100,
    format: formatCurrency
  }
];


const PayrollLedger = (): React.JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const paramStandardAt = location.state;

  const [payrollId, setPayrollId] = useState<string>();
  const [createdAtPayroll, setCreatedAtPayroll] = useState<string>(''); // 급여대장 작성일자
  const [payments, setPayments] = useState<Payment[]>([]);
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [leftLedger, setLeftLedger] = useState<Paying[]>([]);
  const [rightLedger, setRightLedger] = useState<Paying[]>([]);
  const [standardAt, setStandardAt] = useState<string>(paramStandardAt || dayjs().format('YYYY-MM-01'));
  const [isOpenedAddPayments, setIsOpenedAddPayments] = useState<boolean>(false)

  const refreshKeyRef = useRef(0);
  const {showAlert} = useAlertStore();

  // api
  const getPayroll = async (date: string = standardAt) => {
    let list: string;
    try {
      const cache = await cacheManager.getEmployees();
      list = cache.map(e => e.id).join(',');
    } catch {
      list = '';
    }

    try {
      const payroll = await axiosInstance.get(`/payroll/monthly/sales/report?standardAt=${date}&orderIds=${list}`);
      const l = await axiosInstance.get(`/ledger/monthly?standardAt=${date}`);
      setPayrollId(payroll.data.data.id);
      setCreatedAtPayroll(payroll.data.data.createdAt);
      setPayments(payroll.data.data.payments);
      setLedger(l.data.data);
      const arr = l.data.data.payingExpenses;
      const midIndex = Math.ceil(arr.length / 2);
      setLeftLedger(arr.slice(0, midIndex));
      setRightLedger(arr.slice(midIndex));
    } catch {
      showAlert('해당 월 급여대장 정보가 없습니다.', 'error');
      setCreatedAtPayroll('');
      setPayments([]);
      setLedger(null);
      setLeftLedger([]);
      setRightLedger([]);
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
      setCreatedAtPayroll('');
      setPayments([]);
      setLedger(null);
      setLeftLedger([]);
      setRightLedger([]);
      showAlert('삭제 완료', 'success');
    } catch {
      showAlert('급여대장 삭제 실패. 다시 시도해 주세요.', 'error');
    }
  }

  const buildRowsFromPayments = (payments: Payment[]) => {
    let deductionRows = [];
    if (payments && payments.length > 0) {
      const rep = payments.reduce((acc, p) =>
        (p.deductionDetail?.length ?? 0) > (acc?.deductionDetail?.length ?? 0) ? p : acc, payments[0]);
      deductionRows = (rep.deductionDetail ?? []).map((d) => ({
        id: `DEDUCTION`,
        label: d.purpose,
        minWidth: 100,
        format: formatCurrency,
      }));
    }
    return deductionRows;
  }
  const decRows = useMemo(() => {
    return buildRowsFromPayments(payments);
  }, [payments]);

  useEffect(() => {
    if (paramStandardAt)
      getPayroll(paramStandardAt);
    else
      getPayroll(standardAt)
  }, []);

  // debug
  // console.log(payments);
  // console.log('ledger: ', ledger, ', 왼: ', leftLedger, ', 오: ', rightLedger);

  return (
    <Box>
      {/* 검색 */}
      <Box sx={{
        mx: 3,
        my: 1,
        display: 'flex',
        justifyContent: 'space-between',
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
                    onClick={() => getPayroll()}
            >
              검색
            </Button>
          </Box>
          <Box>
            <Button variant='outlined'
                    onClick={() => {
                      refreshKeyRef.current += 1;  // 강제 리마운트
                      setIsOpenedAddPayments(true)
                    }}
                    disabled={payments.length === 0}   // 급여명세가 없으면 disabled = true
            >
              급여명세 내역 추가
            </Button>
          </Box>
        </LocalizationProvider>
      </Box>

      <Paper sx={{paddingBottom: 1, px: 2}}>
        {/* 급여대장 */}
        <Box sx={{mt: 1}}>
          <Typography>작성일자: {createdAtPayroll ? createdAtPayroll.split('T')[0] : ''}</Typography>
          <TableContainer
            component={Box}
            sx={{
              maxHeight: '70vh',
              border: '1px solid',
              borderColor: 'lightgray',
              borderRadius: 1,
            }}
          >
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{borderRight: '1px solid lightgray'}}/>
                  {payments.map((p) => (
                    <TableCell sx={{borderRight: '1px solid lightgray', minWidth: 100}}
                               align='center'
                               key={p.id}
                    >
                      {p.employeeName}
                      <Typography sx={{m: 0, fontSize: 11}}>{p.employeePosition}</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* payment */}
                {[...paymentRows, ...decRows, ...tailRows]?.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    <TableCell
                      sx={{borderRight: '1px solid lightgray', py: 0.5}}
                      width={row.minWidth}
                    >
                      <Typography fontSize={13}>{row.label}</Typography>
                    </TableCell>
                    {payments.map((payment, colIdx) => {
                      let value = payment.paymentDetail[row.id];
                      if (row.id === DeductionTableRow.DEDUCTION)
                        value = payment[row.id];
                      else if (row.id === PaymentTableRow.TOTAL_SALARY || row.id === PaymentTableRow.SALARY)
                        value = Math.ceil((Number(payment[row.id]) / 10)) * 10;
                      else if (row.id === 'DEDUCTION')
                        value = payment.deductionDetail[rowIdx - 9]?.['value'];
                      return (
                        <TableCellForPayroll value={row.format ? row.format(value) : String(value)}
                                             key={`${payment.id}-${colIdx}`}
                                             disabled={true}
                                             disabledTextColor='black'
                        />
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* 지출 내역 */}
        <Box sx={{mt: 2}}>
          <Typography variant='h6'>지출 내역</Typography>
          <Box sx={{display: 'flex', mt: 1}}>
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
                    <TableCell align='center'>메모</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leftLedger.map((item, idx) => (
                    <TableRow key={`left-${idx}`}>
                      <TableCell sx={{borderRight: '1px solid lightgray', py: 0}}>
                        <Input disableUnderline
                               value={(item).purpose}
                               sx={{py: 0, my: 0,}}
                               inputProps={{
                                 disabled: true,
                               }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{borderRight: '1px solid lightgray', py: 0}}>
                        <Input disableUnderline
                               value={formatCurrency((item).value) ?? '-'}
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
                               value={(item).group ?? '-'}
                               sx={{py: 0, my: 0, '& input': {textAlign: 'center'}}}
                               inputProps={{
                                 disabled: true,
                               }}
                        />
                      </TableCell>
                      <TableCell align="center"
                                 width='20%'
                                 sx={{borderRight: '1px solid lightgray', py: 0}}>
                        <Input disableUnderline
                               value={item.memo ?? '-'}
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
                    <TableCell align='center'>메모</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rightLedger.map((item: Paying, idx) => (
                    <TableRow key={`right-${idx}`}>
                      <TableCell sx={{borderRight: '1px solid lightgray', py: 0}}>
                        <Input disableUnderline
                               value={item.purpose}
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
                               value={formatCurrency((item).value) ?? '-'}
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
                               value={item.group ?? '-'}
                               sx={{py: 0, my: 0, '& input': {textAlign: 'center'}}}
                               inputProps={{
                                 disabled: true,
                               }}
                        />
                      </TableCell>
                      <TableCell align="center"
                                 width='20%'
                                 sx={{borderRight: '1px solid lightgray', py: 0}}>
                        <Input disableUnderline
                               value={item.memo ?? '-'}
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
          <Box sx={{mt: 1}}>
            <TableContainer sx={{border: '1px solid lightgray'}}>
              <Table size="small" sx={{tableLayout: 'fixed', width: '100%'}}>
                <TableBody>
                  <TableRow>
                    {ledger?.calcGroups && Object.entries(ledger?.calcGroups).map(([date, total]) => (
                      <Fragment key={`${date}-${total}`}>
                        <TableCell sx={{py: 0, borderRight: '1px solid lightgray'}}
                                   align="center"
                        >
                          {date || '-'}
                        </TableCell>
                        <TableCell sx={{py: 0, borderRight: '1px solid lightgray'}}
                                   align="right"
                        >
                          {total.toLocaleString()}
                        </TableCell>
                      </Fragment>
                    ))}

                  </TableRow>
                  <TableRow>
                    <TableCell sx={{py: 0}} align='right'>
                      {/* 합산 */}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Paper>

      {/* 개별 급여명세 추가 */}
      <AddPayment
        key={refreshKeyRef.current}
        isOpened={isOpenedAddPayments}
        onClose={() => setIsOpenedAddPayments(false)}
        onSuccess={async () => await getPayroll()}
        payrollRegisterId={payrollId}
        payments={payments}
        prevLedger={ledger}
        prevDeduction={decRows?.map(d => ({
          purpose: d.label,
          value: '0'
        }))}
      />

      {/* 버튼들 */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        my: 1,
        mx: 2
      }}
      >
        <Box>
          <Button variant='contained'
                  color='error'
                  onClick={deletePayroll}
                  sx={{mr: 2}}
          >
            삭제
          </Button>
          <Button variant='contained'
                  onClick={handleEditPayroll}
          >
            수정
          </Button>
        </Box>
        <Box sx={{display: 'flex', gap: 2}}>
          <PrintButton printData={payments}
                       value='급여명세서 인쇄'
                       propType={AccountingManageMenuType.EmployeeManage}
          />
          <PrintButton
            printData={{
              payrollRegister: {
                id: payrollId,
                payments: payments,
                createdAt: createdAtPayroll
              },
              financialLedger: ledger,
            }}
            propType={AccountingManageMenuType.PayrollDetail}
            value='급여대장 인쇄'
          />
        </Box>
      </Box>
    </Box>
  )
}

export default PayrollLedger;