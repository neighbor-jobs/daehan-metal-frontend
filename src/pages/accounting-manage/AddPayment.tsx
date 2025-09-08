import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Input,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React, {useCallback, useEffect, useState} from 'react';
import {Employee} from '../../types/employeeRes.ts';
import {Payment} from '../../types/payrollRes.ts';
import axiosInstance from '../../api/axios.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {PostDeductionDetail, PostPayment, PostPaymentDetail} from '../../types/payrollReq.ts';
import {defaultDeductionList, PaymentTableRow, TableColumns} from '../../types/tableColumns.ts';
import {formatCurrency, formatInputPrice, formatInputQuality} from '../../utils/format.ts';
import {arrowNavAtRegister} from '../../utils/arrowNavAtRegister.ts';
import {Ledger, PatchLedger} from '../../types/ledger.ts';

/**
 * POST payroll/payment
 * */
interface AddPaymentProps {
  isOpened: boolean;
  payments?: Payment[];
  payrollRegisterId?: string;
  prevLedger?: Ledger;
  prevDeduction?: PostDeductionDetail[];
  onClose: () => void;
  onSuccess?: () => void;
}

const defaultPaymentDetail: PostPaymentDetail = {
  pay: '0',
  workingDay: '209',
  extendWorkingTime: '0',
  extendWorkingMulti: 1.5,
  dayOffWorkingTime: '0',
  dayOffWorkingMulti: 1.5,
  annualLeaveAllowanceMulti: 2,
  mealAllowance: '0',
}
const defaultDeductionDetail: PostDeductionDetail[] = defaultDeductionList.map((item) => ({
  purpose: item,
  value: '0',
}))
const leftRows: readonly TableColumns<PaymentTableRow>[] = [
  {
    id: PaymentTableRow.PAY,
    label: '기본급',
    minWidth: 100,
    format: formatCurrency,
  },
  {
    id: PaymentTableRow.WORKING_DAY,
    label: '월평균 근로시간',
    minWidth: 100,
  },
  {
    id: PaymentTableRow.HOURLY_WAGE,
    label: '시급',
    minWidth: 100,
    disabled: true,
    format: formatCurrency,
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
    format: formatCurrency,
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
    format: formatCurrency
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
    format: formatCurrency,
  },
  {
    id: PaymentTableRow.MEAL_ALLOWANCE,
    label: '식대',
    minWidth: 100,
    format: formatCurrency,
  },
  {
    id: PaymentTableRow.TOTAL_PAYMENT,
    label: '합계',
    minWidth: 100,
    disabled: true,
    format: formatCurrency,
  }
]

const AddPayment = ({
                      isOpened,
                      payments,
                      prevLedger,
                      prevDeduction,
                      payrollRegisterId,
                      onClose,
                      onSuccess,
                    }: AddPaymentProps): React.JSX.Element => {
  /*
          "payments": [
            {
                "id": "1eea8b4b-b4ae-4532-9010-c145762b67e9",
                "employeeName": "나나나",
                "employeePosition": "사무직",
                "memo": "",
                "paymentDetail": {
                    "id": "061c7789-a6f6-400d-bd03-c47a79f2b69d",
                    "pay": "3000000",
                    "workingDay": 209,
                    "hourlyWage": "14354",
                    "extendWorkingTime": 0,
                    "dayOffWorkingTime": 0,
                    "extendWokringWage": "0",
                    "dayOffWorkingWage": "0",
                    "annualLeaveAllowance": "229664",
                    "mealAllowance": "0",
                    "multis": {
                        "dayOffWorkingMulti": 1.5,
                        "extendWorkingMulti": 1.5,
                        "annualLeaveAllowanceMulti": 2
                    },
                    "createdAt": "2025-07-08T18:48:50.296Z"
                },
                "deductionDetail": [
                    {
                        "value": "0",
                        "purpose": "소득세"
                    },
                    {
                        "value": "20000",
                        "purpose": "주민세"
                    },
                    {
                        "value": "0",
                        "purpose": "건강보험료(요양포함)"
                    },
                    {
                        "value": "0",
                        "purpose": "국민연금"
                    },
                    {
                        "value": "0",
                        "purpose": "고용보험"
                    },
                    {
                        "value": "0",
                        "purpose": "작년연말정산"
                    }
                ],
                "salary": "3229664",
                "deduction": "20000",
                "totalSalary": "3209664",
                "createdAt": "2025-07-08T18:48:50.296Z",
                "startWorkingAt": "2025-07-08T00:00:00.000Z"
            },
  * */
  const [restEmployee, setRestEmployee] = useState<Employee[] | null>(null);
  const [formData, setFormData] = useState<PostPayment>({
    employeeId: '',
    employeePosition: '',
    employeeName: '',
    startWorkingAt: '',
    paymentDetail: defaultPaymentDetail,
    deductionDetail: prevDeduction || defaultDeductionDetail,
    payrollRegisterId: payrollRegisterId,
  });
  const [calculatedWages, setCalculatedWages] = useState<any>({});

  const {showAlert} = useAlertStore();

  const handleEmployeeChange = useCallback((_event, newValue: Employee) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        employeeId: newValue.id,
        employeeName: newValue.info.name,
        employeePosition: newValue.info.position,
        startWorkingAt: newValue.startWorkingAt?.split('T')[0]
      }));
    }
  }, []);

  const handlePaymentInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    let onlyNums: string;

    if (name === PaymentTableRow.EXTEND_WORKING_TIME
      || name === PaymentTableRow.EXTEND_WORKING_MULTI
      || name === PaymentTableRow.DAY_OFF_WORKING_TIME
      || name === PaymentTableRow.DAY_OFF_WORKING_MULTI
      || name === PaymentTableRow.ANNUAL_LEAVE_ALLOWANCE_MULTI
    ) onlyNums = formatInputQuality(value, 0);
    else if (name === PaymentTableRow.PAY
      || name === PaymentTableRow.MEAL_ALLOWANCE
    ) onlyNums = formatInputPrice(value, 0);

    setFormData(prev => ({
      ...prev,
      paymentDetail: {
        ...prev.paymentDetail,
        [name]: onlyNums,
      }
    }))
  }

  const handleDeductionInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    const onlyNums = formatInputPrice(value, 1)

    setFormData(prev => ({
      ...prev,
      deductionDetail: prev.deductionDetail.map((d) =>
        d.purpose === name ? {...d, value: onlyNums} : d
      )
    }));
  }

  const submitAddPayment = async () => {
    const updateFormData = {
      ...formData,
      paymentDetail: {
        ...formData.paymentDetail,
        workingDay: Number(formData.paymentDetail.workingDay) || 0,
        extendWorkingTime: Number(formData.paymentDetail.extendWorkingTime) || 0,
        extendWorkingMulti: Number(formData.paymentDetail.extendWorkingMulti) || 0,
        dayOffWorkingTime: Number(formData.paymentDetail.dayOffWorkingTime) || 0,
        dayOffWorkingMulti: Number(formData.paymentDetail.dayOffWorkingMulti) || 0,
        annualLeaveAllowanceMulti: Number(formData.paymentDetail.annualLeaveAllowanceMulti) || 0,
      }
    }

    try {
      const res = await axiosInstance.post('/payroll/payment', updateFormData);

      if (res.data.statusCode === 409) {
        showAlert('이미 존재하는 데이터입니다.', 'error');
        onClose();
        return;
      }
      if (prevLedger) {
        const addedSalary = Number(calculatedWages.totalSalary);

        const patchLedger: PatchLedger = {
          id: prevLedger.id,
          deduction: [],
          paying: prevLedger.payingExpenses.map(item =>
            item.purpose === '급여'
              ? {
                ...item,
                value: String(Number(item.value) + addedSalary),
              }
              : item
          ),
        };

        await axiosInstance.patch('/ledger', patchLedger);
      }

      if (onSuccess) onSuccess();
      setFormData({
        employeeId: '',
        employeePosition: '',
        employeeName: '',
        startWorkingAt: '',
        payrollRegisterId: payrollRegisterId,
        paymentDetail: defaultPaymentDetail,
        deductionDetail: defaultDeductionDetail,
      })
      onClose();
    } catch {
      showAlert('급여명세 추가 실패', 'error');
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const employees = await axiosInstance.get(`/employee?includesRetirement=true&orderIds=&includesPayment=false`);
        setRestEmployee(employees?.data.data.filter((emp: Employee) => {
          const hasMatchedPayment = payments?.some(pay => {
            const nameMatch = pay.employeeName === emp.info.name;
            const positionMatch = pay.employeePosition === emp.info.position;
            const dateMatch = emp.startWorkingAt === pay.startWorkingAt;
            return nameMatch && positionMatch && dateMatch;
          })
          return !hasMatchedPayment;
        }));
      } catch {
        setRestEmployee([]);
        showAlert('전체 사원 정보 조회에 실패했습니다. 재시도 해주세요.', 'error');
        onClose();
      }
    })();
  }, [payments]);

  useEffect(() => {
    const hw = Number(formData.paymentDetail.workingDay) === 0 ? 0 : Math.ceil((Number(formData.paymentDetail.pay) / Number(formData.paymentDetail.workingDay)) / 10) * 10;
    const ew = Math.round(hw * Number(formData.paymentDetail.extendWorkingMulti) * Number(formData.paymentDetail.extendWorkingTime));
    const dw = Math.round(hw * Number(formData.paymentDetail.dayOffWorkingMulti) * Number(formData.paymentDetail.dayOffWorkingTime));
    const al = Math.round(hw * 8 * Number(formData.paymentDetail.annualLeaveAllowanceMulti));
    const totalPayments = Number(formData.paymentDetail.pay) + ew + dw + al + Number(formData.paymentDetail.mealAllowance);

    // deductions calc
    const totalDeductions = formData.deductionDetail.reduce((acc, curr) => acc + Number(curr.value || 0), 0);

    const newWages = {
      hourlyWage: hw,
      extendWokringWage: ew,
      dayOffWorkingWage: dw,
      annualLeaveAllowance: al,
      totalPayment: Math.ceil(totalPayments / 10) * 10,
      totalDeductions: totalDeductions,
      totalSalary: Math.ceil((totalPayments - totalDeductions) / 10) * 10
    };
    setCalculatedWages(newWages);
  }, [formData])

  useEffect(() => {
    if (payrollRegisterId) {
      setFormData(prev => ({
        ...prev,
        payrollRegisterId
      }));
    }
  }, [payrollRegisterId]);

  // debug
  // console.log(payrollRegisterId);

  return (
    <Dialog open={isOpened}
            onClose={onClose}
    >
      <IconButton onClick={onClose} size='small'
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                  }}
      >
        <CloseIcon/>
      </IconButton>
      <DialogTitle variant='body1'>급여명세 관리</DialogTitle>
      <DialogContent>
        {/* 사원 선택 */}
        {restEmployee ?
          <Box>
            <InputLabel>사원 선택</InputLabel>
            <Autocomplete options={restEmployee}
                          getOptionLabel={option => option.info.name}
                          noOptionsText='등록된 모든 사원에 대하여 급여내역이 존재합니다.'
                          value={restEmployee.find(emp => emp.id === formData?.employeeId) || null}
                          renderInput={(params) =>
                            <TextField {...params}
                                       size='small'
                                       sx={{minWidth: 150}}
                            />
                          }
                          onChange={handleEmployeeChange}
            />
          </Box> :
          <Typography variant='body2'>
            모든 사원의 급여명세가 존재합니다.
          </Typography>
        }

        {/* 급여명세 입력 */}
        <TableContainer component={Box} sx={{mt: 2}}>
          <Table size='small'>
            <TableBody>
              {/* payment */}
              {leftRows.map((row, rowIdx) => {
                let delta = 0
                let value = formData?.paymentDetail[row.id];
                if (row.id === PaymentTableRow.EXTEND_WORKING_TIME
                  || row.id === PaymentTableRow.EXTEND_WORKING_MULTI) delta = -1
                else if (row.id === PaymentTableRow.DAY_OFF_WORKING_TIME
                  || row.id === PaymentTableRow.DAY_OFF_WORKING_MULTI) delta = -2
                else if (row.id === PaymentTableRow.ANNUAL_LEAVE_ALLOWANCE_MULTI) delta = -3
                else if (row.id === PaymentTableRow.MEAL_ALLOWANCE) delta = -4

                if (row.id === PaymentTableRow.HOURLY_WAGE
                  || row.id === PaymentTableRow.EXTEND_WORKING_WAGE
                  || row.id === PaymentTableRow.DAY_OFF_WORKING_WAGE
                  || row.id === PaymentTableRow.ANNUAL_LEAVE_ALLOWANCE
                  || row.id === PaymentTableRow.TOTAL_PAYMENT
                ) {
                  value = calculatedWages?.[row.id];
                }

                return (
                  <TableRow key={rowIdx}>
                    <TableCell
                      sx={{border: '1px solid lightgray', py: 0}}
                      width={row.minWidth}
                    >
                      {row.label}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{border: '1px solid lightgray', py: 0}}
                    >
                      <Input disableUnderline
                             disabled={row.disabled || false}
                             name={row.id}
                             value={row.format ? row.format(value) : value || ''}
                             onChange={(e) => handlePaymentInput(e)}
                             sx={{
                               py: 0,
                               my: 0,
                               '& input': {
                                 textAlign: 'right',
                               }
                             }}
                             inputProps={{
                               'data-col-index': 0,
                               'data-row-index': row.disabled ? undefined : rowIdx + delta,
                               onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                 arrowNavAtRegister(e, 0, false)
                               }
                             }}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
              {/* deduction */}
              {formData?.deductionDetail?.map((dec, decIdx) => {
                return (
                  <TableRow key={decIdx + 100}>
                    <TableCell
                      key={dec.purpose}
                      sx={{border: '1px solid lightgray', py: 0}}
                    >
                      {dec.purpose}
                    </TableCell>

                    <TableCell key={`${dec.purpose}-${decIdx}`} align="right"
                               sx={{borderRight: '1px solid lightgray', py: 0}}
                    >
                      <Input disableUnderline
                             name={dec.purpose}
                             inputProps={{
                               'data-col-index': 0,
                               'data-row-index': decIdx + 8,
                               onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                 arrowNavAtRegister(e, 0, false)
                               }
                             }}
                             onChange={(e) => handleDeductionInput(e)}
                             value={formatCurrency(formData?.deductionDetail[decIdx]?.value) ?? ''}
                             sx={{
                               py: 0, my: 0,
                               '& input':
                                 {textAlign: 'right'}
                             }}
                      ></Input>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{mt: 1}}>
          <TableContainer sx={{border: '1px solid lightgray'}}>
            <Table size="small" sx={{tableLayout: 'fixed', width: '100%'}}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{py: 0, borderRight: '1px solid lightgray'}}>
                    지급액 합계: {calculatedWages?.totalPayment?.toLocaleString() || '0'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{py: 0, borderRight: '1px solid lightgray'}}>
                    공제액 합계: {calculatedWages?.totalDeductions?.toLocaleString() || '0'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{py: 0, borderRight: '1px solid lightgray'}}>
                    수령액 합계: {calculatedWages?.totalSalary?.toLocaleString() || '0'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined'
                onClick={submitAddPayment}
        >
          추가
        </Button>
        <Button variant='outlined'
                color='error'
                onClick={onClose}
        >
          취소
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddPayment;