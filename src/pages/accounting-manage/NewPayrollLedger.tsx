import React, {Fragment, useEffect, useMemo, useState} from 'react';
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
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {Employee} from '../../types/employeeRes.ts';
import axiosInstance from '../../api/axios.ts';
import {PatchPayment, PostPayment, PostPaymentDetail} from '../../types/payrollReq.ts';
import {defaultDeductionList, PaymentTableRow, TableColumns} from '../../types/tableColumns.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {arrowNavAtRegister} from '../../utils/arrowNavAtRegister.ts';
import {useLocation} from 'react-router-dom';
import {Payment} from '../../types/payrollRes.ts';
import {PatchLedger, Paying, PostLedger} from '../../types/ledger.ts';
import {cacheManager} from '../../utils/cacheManager.ts';
import {formatCurrency} from '../../utils/format.ts';

const defaultPayment: PostPaymentDetail = {
  // 기본값
  pay: '0',
  workingDay: '0',
  extendWorkingTime: '0',
  extendWorkingMulti: 1.5,
  dayOffWorkingTime: '0',
  dayOffWorkingMulti: 1.5,
  annualLeaveAllowanceMulti: 2,
  mealAllowance: '0',
}
const leftRows: readonly TableColumns<PaymentTableRow>[] = [
  {
    id: PaymentTableRow.PAY,
    label: '기본급',
    minWidth: 100,
  },
  {
    id: PaymentTableRow.WORKING_DAY,
    label: '근무일수',
    minWidth: 100,
  },
  {
    id: PaymentTableRow.EXTEND_WORKING_TIME,
    label: '연장근무시간',
    minWidth: 100,
  },
  {
    id: PaymentTableRow.EXTEND_WORKING_MULTI,
    label: '연장수당배율',
    minWidth: 100,
  },
  {
    id: PaymentTableRow.EXTEND_WORKING_WAGE,
    label: '연장수당',
    minWidth: 100,
    disabled: true,
  },
  {
    id: PaymentTableRow.DAY_OFF_WORKING_TIME,
    label: '휴일근무시간',
    minWidth: 100,
  },
  {
    id: PaymentTableRow.DAY_OFF_WORKING_MULTI,
    label: '휴일수당배율',
    minWidth: 100,
  },
  {
    id: PaymentTableRow.DAY_OFF_WORKING_WAGE,
    label: '휴일근무수당',
    minWidth: 100,
    disabled: true,
  },
  {
    id: PaymentTableRow.ANNUAL_LEAVE_ALLOWANCE_MULTI,
    label: '연차수당배율',
    minWidth: 100,
  },
  {
    id: PaymentTableRow.ANNUAL_LEAVE_ALLOWANCE,
    label: '연차수당',
    minWidth: 100,
    disabled: true,
  },
  {
    id: PaymentTableRow.MEAL_ALLOWANCE,
    label: '식대',
    minWidth: 100,
  },
  {
    id: PaymentTableRow.TOTAL_PAYMENT,
    label: '합계',
    minWidth: 100,
    disabled: true,
  }
]

const NewPayrollLedger = (): React.JSX.Element => {
  const location = useLocation();
  const {showAlert} = useAlertStore();
  const [formData, setFormData] = useState<PostPayment[] | PatchPayment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deduction, setDeduction] = useState(
    defaultDeductionList.map((item) => ({
      purpose: item,
      value: '0',
    }))
  );
  const [standardAt, setStandardAt] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const {payrollId, payments: initialPayments, ledger: initialLedger} = location.state || {};
  const [mode, setMode] = useState<'create' | 'edit'>(initialPayments ? 'edit' : 'create');
  const listToPaymentRender = mode === 'create' ? employees : formData;
  const [ledger, setLedger] = useState<PostLedger | PatchLedger>();
  const [leftLedger, setLeftLedger] = useState<Paying[]>([]);
  const [rightLedger, setRightLedger] = useState<Paying[]>([]);
  const [calculatedWages, setCalculatedWages] = useState({});

  const {sumByDate, ledgerSum} = useMemo(() => {
    const allLedger = [...(leftLedger ?? []), ...(rightLedger ?? [])];
    let totalSum = 0;

    const dateSum = allLedger.reduce((acc, item) => {
      const date = item.group?.toString() || '-';
      const value = Number(item.value) || 0;

      acc[date] = (acc[date] || 0) + value;
      totalSum += value;
      return acc;
    }, {} as Record<string, number>);

    return {sumByDate: dateSum, ledgerSum: totalSum};
  }, [leftLedger, rightLedger]);

  const handlePaymentInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: string
  ) => {
    const {name, value} = e.target;
    let onlyNums = value.replace(/[^0-9]/g, '');
    if (onlyNums.length > 0) {
      onlyNums = String(Number(onlyNums));
    }
    setFormData(prev =>
      prev.map(item => {
        const key = mode === 'create' ? item.employeeId : item.id;
        return (
          key === id ? {
            ...item,
            paymentDetail: {
              ...item.paymentDetail,
              [name]: onlyNums,
            },
          } : item
        )
      })
    );
  };

  const handleDeductionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: string
  ) => {
    const {name, value} = e.target;
    let onlyNums = value.replace(/[^0-9]/g, '');
    if (onlyNums.length > 0) {
      onlyNums = String(Number(onlyNums));
    }
    setFormData(prev =>
      prev.map((item) => {
        const key = mode === 'create' ? item.employeeId : item.id
        return (
          key === id ? {
            ...item,
            deductionDetail: item.deductionDetail.map((d) =>
              d.purpose === name ? {...d, value: onlyNums} : d
            ),
          } : item
        )
      })
    );
  };

  const handleLedgerInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    side: 'left' | 'right',
    idx: number
  ) => {
    const name = e.target.name;
    let value = e.target.value;
    if (name === 'value') {
      value = value.replace(/[^0-9]/g, '');
      value = value.length > 0 ? String(Number(value)) : ''
    }
    if (side === 'left') {
      setLeftLedger(prev =>
        prev.map((item, i) =>
          i === idx ? {...item, [name]: value} : item
        )
      );
    } else {
      setRightLedger(prev =>
        prev.map((item, i) =>
          i === idx ? {...item, [name]: value} : item
        )
      );
    }
  };

  const submitPayroll = async () => {
    const data = formData.map((p) => ({
      ...p,
      paymentDetail: {
        ...p.paymentDetail,
        workingDay: Number(p.paymentDetail.workingDay) || 0,
        extendWorkingTime: Number(p.paymentDetail.extendWorkingTime) || 0,
        extendWorkingMulti: Number(p.paymentDetail.extendWorkingMulti) || 0,
        dayOffWorkingTime: Number(p.paymentDetail.dayOffWorkingTime) || 0,
        dayOffWorkingMulti: Number(p.paymentDetail.dayOffWorkingMulti) || 0,
        annualLeaveAllowanceMulti: Number(p.paymentDetail.annualLeaveAllowanceMulti) || 0,
      }
    }))
    try {
      if (mode === 'create') {
        await axiosInstance.post('/payroll', {payments: data, standardAt: standardAt})
        await axiosInstance.post('/ledger', {
          paying: [...leftLedger, ...rightLedger],
          deduction: [],
          createdAt: standardAt
        });
      } else {
        data.map(async (p) => {
          await axiosInstance.patch('/payroll/payment', p);
        });
        await axiosInstance.patch('/ledger', {
          ...ledger,
          paying: [...leftLedger, ...rightLedger],
        });
      }
      await cacheManager.replaceLedgers([...leftLedger, ...rightLedger]);
    } catch {
      showAlert('payroll 등록 실패', 'error');
    }
  }

  useEffect(() => {
    if (mode === 'create') {
      const newWages = {};
      formData.forEach((item, idx) => {
        console.log(item)
        const hw = Number(item.paymentDetail.workingDay) === 0 ? 0 : Number(item.paymentDetail.pay) / Number(item.paymentDetail.workingDay);
        newWages[idx] = {
          hourlyWage: hw,
          extendWokringWage: hw * Number(item.paymentDetail.extendWorkingMulti) * Number(item.paymentDetail.extendWorkingTime),
          dayOffWorkingWage: hw * Number(item.paymentDetail.dayOffWorkingMulti) * Number(item.paymentDetail.extendWorkingTime),
          annualLeaveAllowance: hw * 8 * item.paymentDetail.annualLeaveAllowanceMulti,
        };
      });
      setCalculatedWages(newWages);
    }
  }, [formData]);

  useEffect(() => {
    const getEmployees = async () => {
      try {
        const employees = await axiosInstance.get(`/employee?includesRetirement=true&orderBy=asc&includesPayment=false`);
        setEmployees(employees.data.data);
        setFormData(employees.data.data.map((employee: Employee) => ({
          employeeId: employee.id,
          employeeName: employee.info.name,
          employeePosition: employee.info.position,
          paymentDetail: defaultPayment,
          deductionDetail: deduction,
          memo: '',
        })));
      } catch {
        showAlert('사원 정보를 불러오지 못했습니다. 새로고침 해주세요.', 'error');
      }
    }
    if (mode === 'create') {
      setMode('create');
      getEmployees();
      cacheManager.getLedgers().then((ledgers) => {
        const mid = Math.ceil(ledgers.length / 2);
        setLedger({
          paying: ledgers,
          deduction: [],
          createdAt: standardAt,
        });
        setLeftLedger(ledgers.slice(0, mid));
        setRightLedger(ledgers.slice(mid));
      });
    } else {
      setMode('edit');
      /* form data setting */
      const prevData: PatchPayment[] = initialPayments.map((payment: Payment) => {
        const detail = payment.paymentDetail;
        return ({
          id: payment.id,
          payrollRegisterId: undefined,
          employeeName: payment.employeeName,
          employeePosition: payment.employeePosition,
          paymentDetail: {
            pay: detail.pay,
            workingDay: detail.workingDay,
            extendWorkingTime: detail.extendWorkingTime,
            dayOffWorkingTime: detail.dayOffWorkingTime,
            extendWorkingMulti: detail.multis.extendWorkingMulti,
            dayOffWorkingMulti: detail.multis.dayOffWorkingMulti,
            annualLeaveAllowanceMulti: detail.multis.annualLeaveAllowanceMulti,
            mealAllowance: detail.mealAllowance
          },
          deductionDetail: payment.deductionDetail,
          memo: payment.memo || undefined,
        })
      });
      setFormData(prevData);
      setDeduction(initialPayments[0].deductionDetail);

      /* ledger setting */
      const prevLedger: PatchLedger = {
        id: initialLedger?.id,
        paying: initialLedger?.payingExpenses,
        deduction: [],
      }
      const arr = initialLedger?.payingExpenses;
      const midIndex = Math.ceil(arr?.length / 2) || 0;
      setLedger(prevLedger);
      setLeftLedger(arr?.slice(0, midIndex) || []);
      setRightLedger(arr?.slice(midIndex) || []);
    }
  }, [showAlert, deduction, mode, initialPayments, payrollId, initialLedger]);

  // debug

  return (
    <Box>
      {/* 검색 */}
      <Box sx={{
        mx: 3,
        my: 1,
      }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}>
            <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
              <InputLabel sx={{fontSize: 'small',}}>작성월</InputLabel>
              <DesktopDatePicker
                views={['day']}
                format="YYYY/MM/DD"
                defaultValue={dayjs()}
                value={dayjs(standardAt)}
                onChange={(value) => setStandardAt(value.format('YYYY-MM-DD'))}
                slotProps={{
                  textField: {size: 'small'},
                  calendarHeader: {format: 'YYYY/MM'},
                }}
              />
            </Box>
            <Button variant='outlined'>공제 항목 관리</Button>
          </Box>
        </LocalizationProvider>
      </Box>

      <Paper sx={{paddingBottom: 1, px: 2}}>
        {/* 급여대장 */}
        <Box sx={{mt: 1}}>
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
                  <TableCell
                    sx={{borderRight: '1px solid lightgray',}}
                  />
                  {mode === 'create' ? employees.map((employee) => (
                    <TableCell align='center'
                               key={employee.id}
                               sx={{
                                 borderRight: '1px solid lightgray', minWidth: 100,
                                 py: 0.5,
                                 px: 1
                               }}>
                      {employee.info.name}
                      <Typography sx={{m: 0, fontSize: 11}}>{employee.info.position}</Typography>
                    </TableCell>
                  )) : formData?.map((item, idx) => (
                    <TableCell align='center'
                               key={`${item.employeeName}-${idx}`}
                               sx={{
                                 borderRight: '1px solid lightgray', minWidth: 100,
                                 py: 0.5,
                                 px: 1
                               }}>
                      {item.employeeName}
                      <Typography sx={{m: 0, fontSize: 11}}>{item.employeePosition}</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* payment */}
                {leftRows.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    <TableCell
                      sx={{borderRight: '1px solid lightgray', py: 0}}
                      width={row.minWidth}
                    >
                      {row.label}
                    </TableCell>
                    {listToPaymentRender.map((item, colIdx) => {
                      let delta = 0
                      let value = formData[colIdx]?.paymentDetail[row.id];
                      if (row.id === PaymentTableRow.DAY_OFF_WORKING_TIME || row.id === PaymentTableRow.DAY_OFF_WORKING_MULTI) delta = -1
                      else if (row.id === PaymentTableRow.ANNUAL_LEAVE_ALLOWANCE_MULTI) delta = -2
                      else if (row.id === PaymentTableRow.MEAL_ALLOWANCE) delta = -3

                      if (row.id === PaymentTableRow.EXTEND_WORKING_WAGE
                        || row.id === PaymentTableRow.DAY_OFF_WORKING_WAGE
                        || row.id === PaymentTableRow.ANNUAL_LEAVE_ALLOWANCE
                      ) {
                        value = calculatedWages[colIdx]?.[row.id];
                      }
                      return (
                        <TableCell key={`${item.id}-${colIdx}`} align="right"
                                   sx={{borderRight: '1px solid lightgray', py: 0}}
                        >
                          <Input disableUnderline
                                 disabled={row.disabled || false}
                                 name={row.id}
                                 value={value ?? ''}
                                 onChange={(e) => handlePaymentInput(e, item.id)}
                                 sx={{
                                   py: 0,
                                   my: 0,
                                   '& input': {
                                     textAlign: 'right',
                                   }
                                 }}
                                 inputProps={{
                                   'data-col-index': colIdx,
                                   'data-row-index': row.disabled ? undefined : rowIdx + delta,
                                   onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                     arrowNavAtRegister(e, employees.length - 1, false)
                                   }
                                 }}
                          />
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
                {/* deduction */}
                {deduction.map((dec, decIdx) => (
                  <TableRow key={`${dec.purpose}-${decIdx}`}>
                    <TableCell
                      key={dec.purpose}
                      sx={{borderRight: '1px solid lightgray', py: 0}}
                    >
                      {dec.purpose}
                    </TableCell>
                    {listToPaymentRender.map((item, colIdx) => (
                      <TableCell key={`${item.id}-${colIdx + 100}`} align="right"
                                 sx={{borderRight: '1px solid lightgray', py: 0}}
                      >
                        <Input disableUnderline
                               name={dec.purpose}
                               inputProps={{
                                 'data-col-index': colIdx,
                                 'data-row-index': decIdx + 8,
                                 onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                   arrowNavAtRegister(e, employees.length - 1, false)
                                 }
                               }}
                               onChange={(e) => handleDeductionChange(e, item.id)}
                               value={formData[colIdx]?.deductionDetail[decIdx]?.value ?? ''}
                               sx={{py: 0, my: 0, '& input': {textAlign: 'right'}}}
                        ></Input>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* 지급액계 */}
                <TableRow>
                  <TableCell
                    sx={{borderRight: '1px solid lightgray', py: 0.5}}
                  >
                    지급액계
                  </TableCell>
                  {listToPaymentRender?.map((item, colIdx) => (
                    <TableCell key={`지급액계-${colIdx + 100}`} align="center"
                               sx={{borderRight: '1px solid lightgray', py: 0}}
                    >
                      <Input fullWidth
                             disableUnderline
                             sx={{py: 0, my: 0}}
                      >

                      </Input>
                    </TableCell>
                  ))}
                </TableRow>

                {/* 수령액 */}
                <TableRow>
                  <TableCell
                    sx={{borderRight: '1px solid lightgray', py: 0.5}}
                  >
                    수령액
                  </TableCell>
                  {listToPaymentRender.map((item, colIdx) => (
                    <TableCell key={`수령액-${colIdx + 100}`} align="center"
                               sx={{borderRight: '1px solid lightgray', py: 0}}
                    >
                      <Input fullWidth
                             disableUnderline
                             sx={{py: 0, my: 0}}
                      >
                      </Input>
                    </TableCell>
                  ))}
                </TableRow>
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
                  {leftLedger?.map((item, idx) => (
                    <TableRow key={`left-${idx}`}>
                      <TableCell sx={{borderRight: '1px solid lightgray', py: 0,}}>
                        <Input disableUnderline
                               name='purpose'
                               value={(item).purpose || ''}
                               onChange={(e) => handleLedgerInputChange(e, 'left', idx)}
                               onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 7, false)}
                               sx={{
                                 py: 0, my: 0,
                                 width: 130,
                                 '& input': {color: 'black'},
                               }}
                               inputProps={{
                                 'data-col-index': 0,
                                 'data-row-index': 100 + idx,
                               }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{borderRight: '1px solid lightgray', py: 0}}>
                        <Input disableUnderline
                               name='value'
                               value={formatCurrency((item).value) ?? '-'}
                               onChange={(e) => handleLedgerInputChange(e, 'left', idx)}
                               onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 7, false)}
                               sx={{py: 0, my: 0, '& input': {textAlign: 'right'}}}
                               inputProps={{
                                 'data-col-index': 1,
                                 'data-row-index': 100 + idx,
                               }}
                        />
                      </TableCell>
                      <TableCell align="center"
                                 width='20%'
                                 sx={{borderRight: '1px solid lightgray', py: 0}}
                      >
                        <Input disableUnderline
                               name='group'
                               value={(item).group ?? '-'}
                               onChange={(e) => handleLedgerInputChange(e, 'left', idx)}
                               onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 7, false)}
                               sx={{py: 0, my: 0, '& input': {textAlign: 'center'}}}
                               inputProps={{
                                 'data-col-index': 2,
                                 'data-row-index': 100 + idx,
                               }}
                        />
                      </TableCell>
                      <TableCell align="center"
                                 width='20%'
                                 sx={{borderRight: '1px solid lightgray', py: 0}}
                      >
                        <Input disableUnderline
                               name='memo'
                               value={(item).memo ?? '-'}
                               onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 7, false)}
                               onChange={(e) => handleLedgerInputChange(e, 'left', idx)}
                               sx={{py: 0, my: 0, '& input': {textAlign: 'center'}}}
                               inputProps={{
                                 'data-col-index': 3,
                                 'data-row-index': 100 + idx,
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
                  {rightLedger?.map((item, idx) => (
                    <TableRow key={`right-${idx}`}>
                      <TableCell sx={{borderRight: '1px solid lightgray', py: 0}}
                      >
                        <Input disableUnderline
                               name='purpose'
                               onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 7, false)}
                               onChange={(e) => handleLedgerInputChange(e, 'right', idx)}
                               value={(item).purpose || ""}
                               sx={{py: 0, my: 0, width: 130}}
                               inputProps={{
                                 'data-col-index': 4,
                                 'data-row-index': 100 + idx,
                               }}
                        />
                      </TableCell>
                      <TableCell align="right"
                                 sx={{borderRight: '1px solid lightgray', py: 0}}
                      >
                        <Input disableUnderline
                               name='value'
                               value={formatCurrency((item).value) ?? '-'}
                               onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 7, false)}
                               onChange={(e) => handleLedgerInputChange(e, 'right', idx)}
                               sx={{py: 0, my: 0, '& input': {textAlign: 'right'}}}
                               inputProps={{
                                 'data-col-index': 5,
                                 'data-row-index': 100 + idx,

                               }}
                        />
                      </TableCell>
                      <TableCell align="center"
                                 width='20%'
                                 sx={{borderRight: '1px solid lightgray', py: 0}}>
                        <Input disableUnderline
                               name='group'
                               value={(item).group ?? '-'}
                               onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 7, false)}
                               onChange={(e) => handleLedgerInputChange(e, 'right', idx)}
                               sx={{py: 0, my: 0, '& input': {textAlign: 'center'}}}
                               inputProps={{
                                 'data-col-index': 6,
                                 'data-row-index': 100 + idx,
                               }}
                        />
                      </TableCell>
                      <TableCell align="center"
                                 width='20%'
                                 sx={{borderRight: '1px solid lightgray', py: 0}}>
                        <Input disableUnderline
                               name='memo'
                               value={(item).memo ?? ''}
                               onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 7, false)}
                               onChange={(e) => handleLedgerInputChange(e, 'right', idx)}
                               sx={{py: 0, my: 0, '& input': {textAlign: 'center'}}}
                               inputProps={{
                                 'data-col-index': 7,
                                 'data-row-index': 100 + idx,
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
                    {Object.entries(sumByDate).map(([date, total]) => (
                      <Fragment key={`${date}-${total}`}>
                        <TableCell sx={{py: 0, borderRight: '1px solid lightgray'}}
                                   align="center"
                        >
                          {date}
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
                    <TableCell colSpan={Object.keys(sumByDate).length * 2} sx={{py: 0}} align='right'>
                      합산: {ledgerSum.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

      </Paper>

      {/* 버튼들 */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'right',
        gap: 2,
        my: 1,
        mx: 2
      }}
      >
        <Button variant='contained'
                onClick={submitPayroll}
        >
          등록
        </Button>
        <Button variant='contained'>인쇄</Button>
      </Box>
    </Box>
  )
}

export default NewPayrollLedger;