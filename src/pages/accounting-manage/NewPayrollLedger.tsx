import React, {useEffect, useState} from 'react';
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
  // TODO: 공제 항목 추가/삭제할 수 있도록 UI 추가
  // TODO: 입력 시 number 만 받을 수 있도록 입력 제한 추가
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
  const {payrollId, standardAt, payments: initialPayments} = location.state || {};
  const [mode, setMode] = useState<'create' | 'edit'>(
    initialPayments ? 'edit' : 'create'
  );
  const listToPaymentRender = mode === 'create' ? employees : formData;

  const handlePaymentInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: string
  ) => {
    const {name, value} = e.target;

    // 숫자로 저장할 필드 목록
    /*
        const numericFields: PaymentTableRow[] = [
          PaymentTableRow.WORKING_DAY,
          PaymentTableRow.EXTEND_WORKING_TIME,
          PaymentTableRow.EXTEND_WORKING_MULTI,
          PaymentTableRow.DAY_OFF_WORKING_TIME,
          PaymentTableRow.DAY_OFF_WORKING_MULTI,
          PaymentTableRow.ANNUAL_LEAVE_ALLOWANCE,
        ];
    */

    /*
        const parsedValue = value === ''
          ? ''
          : numericFields.includes(name as PaymentTableRow)
            ? Number(value)
            : value;
    */

    setFormData(prev =>
      prev.map(item => {
        const key = mode === 'create' ? item.employeeId : item.id;
        return (key === id
            ? {
              ...item,
              paymentDetail: {
                ...item.paymentDetail,
                [name]: value,
              },
            }
            : item
        )
      })
    );
  };

  const handleDeductionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: string
  ) => {
    const {name, value} = e.target;
    setFormData(prev =>
      prev.map((item) => {
        const key = mode === 'create' ? item.employeeId : item.id
        return (
          key === id
          ? {
            ...item,
            deductionDetail: item.deductionDetail.map((d) =>
              d.purpose === name ? {...d, value} : d
            ),
          }
          : item
)}      )
    );
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
        await axiosInstance.post('/payroll', {payments: data})
      } else {
        data.map(async (p) => {
          await axiosInstance.patch('/payroll/payment', p);
        })
      }
    } catch {
      showAlert('payroll 등록 실패', 'error');
    }
  }

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
          memo: ''
        })));
      } catch {
        showAlert('사원 정보를 불러오지 못했습니다. 새로고침 해주세요.', 'error');
      }
    }
    if (mode === 'create') {
      setMode('create');
      getEmployees();
    } else {
      setMode('edit');
      const prevData: PatchPayment[] = initialPayments.map((payment: Payment) => {
        const detail = payment.paymentDetail;
        return ({
          id: detail.id,
          payrollRegisterId: payrollId,
          employeeName: payment.employeeName,
          employeePosition: payment.employeePosition,
          paymentDetail: {
            pay: detail.pay,
            workingDay: detail.workingDay,
            extendWorkingTime: detail.extendWorkingTime,
            dayOffWorkingTime: detail.dayOffWorkingTime,
            extendWorkingMulti: detail.extendWorkingTime === 0 ? 0 : Number(detail.extendWokringWage) / (Number(detail.hourlyWage) * detail.extendWorkingTime),
            dayOffWorkingMulti: detail.dayOffWorkingTime === 0 ? 0 :Number(detail.dayOffWorkingWage) / (Number(detail.hourlyWage) * detail.dayOffWorkingTime),
            annualLeaveAllowanceMulti: Number(detail.annualLeaveAllowance) / (Number(detail.hourlyWage) * 8),
            mealAllowance: detail.mealAllowance
          },
          deductionDetail: payment.deductionDetail,
          memo: payment.memo || undefined,
        })
      });
      setFormData(prevData);
      setDeduction(initialPayments[0].deductionDetail);
    }
  }, [showAlert, deduction, mode, initialPayments, payrollId]);

  // debug
  console.log('mode: ', mode, ', formData: ', formData);

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
            alignItems: 'center',
            gap: 2,
          }}>
            <InputLabel sx={{fontSize: 'small',}}>작성월</InputLabel>
            <DesktopDatePicker
              views={['day']}
              format="YYYY/MM"
              defaultValue={dayjs()}
              // value={dayjs(formData.startAt)}
              // onChange={(value) => setFormData(prev => ({...prev, startAt: value.format('YYYY-MM-DD')}))}
              slotProps={{
                textField: {size: 'small'},
                calendarHeader: {format: 'YYYY/MM'},
              }}
            />
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
                    sx={{
                      borderRight: '1px solid lightgray',
                    }}/>
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
                      if (row.id === PaymentTableRow.DAY_OFF_WORKING_TIME || row.id === PaymentTableRow.DAY_OFF_WORKING_MULTI) delta = -1
                      else if (row.id === PaymentTableRow.ANNUAL_LEAVE_ALLOWANCE_MULTI) delta = -2
                      else if (row.id === PaymentTableRow.MEAL_ALLOWANCE) delta = -3
                      return (
                        <TableCell key={`${item.id}-${colIdx}`} align="right"
                                   sx={{borderRight: '1px solid lightgray', py: 0}}
                        >
                          <Input disableUnderline
                                 disabled={row.disabled || false}
                                 name={row.id}
                                 value={formData[colIdx]?.paymentDetail[row.id] ?? ''}
                                 onChange={(e) => handlePaymentInput(e, item.id)}
                                 sx={{py: 0, my: 0, '& input': {textAlign: 'right'}}}
                                 inputProps={{
                                   'data-col-index': colIdx,
                                   'data-row-index': row.disabled ? undefined : rowIdx + delta,
                                   onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                     arrowNavAtRegister(e, employees.length - 1, false)
                                   }
                                 }}
                          ></Input>
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