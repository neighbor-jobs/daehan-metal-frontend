// UI
import {
  Box,
  Button,
  IconButton,
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
import CloseIcon from '@mui/icons-material/Close';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';

// project
import React, {Fragment, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import dayjs from 'dayjs';
import {Employee} from '../../types/employeeRes.ts';
import axiosInstance from '../../api/axios.ts';
import {PatchPayment, PostPayment, PostPaymentDetail} from '../../types/payrollReq.ts';
import {defaultDeductionList, PaymentTableRow, TableColumns, TOTAL_DEDUCTION_ROWS} from '../../types/tableColumns.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {useLocation, useNavigate} from 'react-router-dom';
import {Payment} from '../../types/payrollRes.ts';
import {Deduction, PatchLedger, Paying, PostLedger} from '../../types/ledger.ts';
import {cacheManager} from '../../utils/cacheManager.ts';
import {formatCurrency, formatInputPrice, formatInputQuality} from '../../utils/format.ts';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog.tsx';
import TableCellForPayroll from '../../components/TableCellForPayroll.tsx';
import AssignEmployees from './AssignEmployees.tsx';
import {tableSelectedRowWithoutDesign} from '../../utils/tableDisignSx.ts';
import {
  getByteLength,
  getLineCount,
  getValueWithNewLine,
  isCaretAtEnd,
  isCaretAtStart
} from '../../utils/basicHandler.ts';
import {arrowNavAtRegister} from '../../utils/arrowNavAtRegister.ts';
import {normalizePostPayments} from '../../utils/normalize.ts';
import {updateCacheAfterCreate} from '../../api/cache.ts';
import {CacheEmployee} from '../../../electron/store/employeeStore.ts';

const defaultPayment: PostPaymentDetail = {
  pay: '0',
  latestPay: '0',
  workingDay: '209',
  extendWorkingTime: '0',
  extendWorkingMulti: 1.5,
  dayOffWorkingTime: '0',
  dayOffWorkingMulti: 1.5,
  annualLeaveAllowanceMulti: 2,
  mealAllowance: '0',
  unusedAnnualLeaveAllowance: '0',
}
const leftRows: readonly TableColumns<PaymentTableRow>[] = [
  {
    id: PaymentTableRow.LATEST_PAY,
    label: '기본급',
    minWidth: 100,
    format: formatCurrency,
  },
  {
    id: PaymentTableRow.PAY,
    label: '기본급(시급계산용)',
    minWidth: 100,
    format: formatCurrency,
  },
  {
    id: PaymentTableRow.WORKING_DAY,
    label: '월평균 근로시간',
    minWidth: 100,
    disabled: true,
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
    id: PaymentTableRow.UNUSED_ANNUAL_LEAVE_ALLOWANCE,
    label: '미사용 연차',
    minWidth: 100,
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

const NewPayrollLedger = (): React.JSX.Element => {
  const location = useLocation();
  const {
    payrollId,
    payments: initialPayments,
    ledger: initialLedger,
    standardAt: prevStandardAt
  } = location.state || {};
  const navigate = useNavigate();
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const {showAlert} = useAlertStore();

  const [formData, setFormData] = useState<PostPayment[] | PatchPayment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deduction, setDeduction] = useState<Deduction[]>([]);
  const [standardAt, setStandardAt] = useState<string>(prevStandardAt || dayjs().format('YYYY-MM-DD'));
  const [mode, setMode] = useState<'create' | 'edit'>(initialPayments ? 'edit' : 'create');
  const [ledger, setLedger] = useState<PostLedger | PatchLedger>();
  const [leftLedger, setLeftLedger] = useState<Paying[]>([]);
  const [rightLedger, setRightLedger] = useState<Paying[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memo, setMemo] = useState<string>(initialLedger?.deductionExpenses[0]?.memo || '');
  const [activeRowIdx, setActiveRowIdx] = useState(0);

  const calculatedWages = useMemo(() => {
    const newWages = {};
    formData.forEach((item, idx) => {
      // payments calc
      const hw = Number(item.paymentDetail.workingDay) === 0 ? 0 : Math.ceil((Number(item.paymentDetail.pay) / Number(item.paymentDetail.workingDay)) / 10) * 10;
      const ew = (hw * Number(item.paymentDetail.extendWorkingMulti) * Number(item.paymentDetail.extendWorkingTime));
      const dw = (hw * Number(item.paymentDetail.dayOffWorkingMulti) * Number(item.paymentDetail.dayOffWorkingTime));
      const al = (hw * 8 * Number(item.paymentDetail.annualLeaveAllowanceMulti));
      const totalPayments = Number(item.paymentDetail.latestPay) + ew + dw + al + Number(item.paymentDetail.unusedAnnualLeaveAllowance) + Number(item.paymentDetail.mealAllowance);

      // deductions calc
      const totalDeductions = item.deductionDetail.reduce((acc, curr) => acc + Number(curr.value || 0), 0);

      newWages[idx] = {
        hourlyWage: hw,
        extendWokringWage: ew,
        dayOffWorkingWage: dw,
        annualLeaveAllowance: al,
        totalPayment: Math.ceil(totalPayments / 10) * 10,                    // RoundUp
        totalDeductions: totalDeductions,
        totalSalary: Math.ceil((totalPayments - totalDeductions) / 10) * 10  // RoundUp
      };
    });
    return newWages;
  }, [formData])

  const listToPaymentRender = mode === 'create' ? employees : formData;
  const totalPaymentSum = Object.values(calculatedWages).reduce(
    (acc, cur: any) => acc + (cur?.totalPayment || 0), 0
  );
  const totalDeductionSum = Object.values(calculatedWages).reduce(
    (acc, cur: any) => acc + (cur?.totalDeductions || 0), 0
  );
  const totalSalarySum = Object.values(calculatedWages).reduce(
    (acc, cur: any) => acc + (cur?.totalSalary || 0), 0
  );

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

  const handleAllWorkingDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 0) value = String(Number(value)); // 앞자리 0 방지
    setFormData(prev =>
      prev.map(item => ({
        ...item,
        paymentDetail: {
          ...item.paymentDetail,
          workingDay: value,
        }
      }))
    );
  };

  const handleRemoveEmployee = (id: string) => {
    if (mode === 'create') {
      // 사원 id로 구분
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setFormData((prev: PostPayment[]) => prev.filter((item: PostPayment) => item.employeeId !== id));
    } else {
      // paymentId로 구분
      setFormData((prev: PatchPayment[]) => prev.filter((item: PatchPayment) => item.id !== id));
    }
  };

  const reorderByEmployeeIds = (orderedIds: string[]) => {
    setEmployees(prev =>
      orderedIds
        .map(id => prev.find(e => e.id === id))
        .filter(Boolean)
    );

    setFormData((prev: any) =>
      orderedIds
        .map(id => prev.find((p: any) => p.employeeId === id))
        .filter(Boolean)
    );
  };

  const handleMemoInputByEmployee = useCallback((newMemo, id) => {
    if (getLineCount(newMemo) > 2) return;

    if (getByteLength(newMemo) > 50) return;

    setFormData((prev) =>
      prev.map(item => {
        const key: string = mode === 'create' ? item.employeeId : item.id;
        return key === id ? {
          ...item,
          memo: newMemo,
        } : item
      })
    )
  }, [mode])

  const handlePaymentInput = useCallback((
    name: string,
    value: string,
    id: string,
  ) => {
    let onlyNums: string = value;

    if (name === PaymentTableRow.EXTEND_WORKING_TIME
      || name === PaymentTableRow.EXTEND_WORKING_MULTI
      || name === PaymentTableRow.DAY_OFF_WORKING_TIME
      || name === PaymentTableRow.DAY_OFF_WORKING_MULTI
      || name === PaymentTableRow.ANNUAL_LEAVE_ALLOWANCE_MULTI
    ) onlyNums = formatInputQuality(value, 0);
    else if (name === PaymentTableRow.PAY
      || name === PaymentTableRow.MEAL_ALLOWANCE
      || name === PaymentTableRow.LATEST_PAY
      || name === PaymentTableRow.UNUSED_ANNUAL_LEAVE_ALLOWANCE
    ) onlyNums = formatInputPrice(value, 0);

    setFormData(prev =>
      prev.map(item => {
        const key: string = mode === 'create' ? item.employeeId : item.id;
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
  }, [mode]);

  // 기존 handleDeductionChange 대신 사용
  const handleDeductionChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: string,
    decIdx: number
  ) => {
    const onlyNums = formatInputPrice(e.target.value, 0);

    setFormData(prev =>
      prev.map(item => {
        const key = mode === 'create' ? item.employeeId : item.id;
        if (key !== id) return item;

        const next = [...(item.deductionDetail ?? [])];

        // 해당 index가 없을 수도 있으니 안전하게 초기화
        if (!next[decIdx]) {
          next[decIdx] = {
            purpose: deduction[decIdx]?.purpose ?? '',
            value: '0',
          };
        }

        next[decIdx] = {
          ...next[decIdx],
          value: onlyNums,
        };

        return {
          ...item,
          deductionDetail: next,
        };
      })
    );
  }, [mode, deduction]);

  // 공제 항목명(purpose) 편집: 좌측 컬럼에서 변경 → 모든 사원의 동일 index purpose 동기화
  const handleDeductionPurposeChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    decIdx: number
  ) => {
    const newPurpose = e.target.value ?? '';

    // deduction(좌측 제목 열) 업데이트
    setDeduction(prev =>
      prev.map((row, i) => (i === decIdx ? {...row, purpose: newPurpose} : row))
    );

    // 모든 사원의 동일 인덱스 deductionDetail purpose 동기화
    setFormData(prev =>
      prev.map(item => ({
        ...item,
        deductionDetail: (item.deductionDetail ?? []).map((d, i) =>
          i === decIdx ? {...d, purpose: newPurpose} : d
        ),
      }))
    );
  }, []);

  const handleLedgerInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    side: 'left' | 'right',
    idx: number
  ) => {
    const name = e.target.name;
    let value = e.target.value;
    if (name === 'value') {
      value = formatInputPrice(value, 1);
      // value = value.length > 0 ? String(Number(value)) : ''
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
  }, []);

  // api
  const submitCreatePayroll = async (data) => {
    const [payrollRes, ledgerRes] = await Promise.all([
      axiosInstance.post('/payroll', {payments: data, standardAt}),
      axiosInstance.post('/ledger', {
        paying: [...leftLedger, ...rightLedger],
        deduction: [{
          memo,
          group: '',
          value: '',
          purpose: '메모',
        }],
        createdAt: standardAt,
      }),
    ]);

    if (payrollRes.data.statusCode === 409 || ledgerRes.data.statusCode === 409) {
      throw new Error('DUPLICATE');
    }
  };

  const submitEditPayroll = async (data) => {
    await Promise.all(
      data.map((p) =>
        axiosInstance.delete(`/payroll/payment?id=${p.id}`)
      )
    );

    await Promise.all(
      data.map(({ id, ...payment }) =>
        axiosInstance.post('/payroll/payment', payment)
      )
    );

    await axiosInstance.patch('/ledger', {
      ...ledger,
      paying: [...leftLedger, ...rightLedger],
      deduction: [{
        memo,
        group: '',
        value: '',
        purpose: '메모',
      }],
    });
  };

  const submitPayroll = async () => {
    const data = normalizePostPayments(formData);
    try {
      if (mode === 'create') {
        await submitCreatePayroll(data);
        navigate(`/account/payroll`, {
          state: standardAt
        });
      } else {  // 수정
        await submitEditPayroll(data);
        navigate(`/account/payroll`, {
          state: standardAt
        });
      }

      showAlert('등록 성공', 'success');
      await updateCacheAfterCreate({
        formData: data,
        standardAt: standardAt,
        totalMemo: memo,
        leftLedger: leftLedger,
        rightLedger: rightLedger,
      });
    } catch {
      showAlert('등록 실패', 'error');
    }
  }

  const deletePayment = async () => {
    try {
      await axiosInstance.delete(`/payroll/payment?id=${selectedPaymentId}`)
      setFormData((prev: PatchPayment[]) =>
        prev.filter((item) => item.id !== selectedPaymentId)
      );

      setIsConfirmDialogOpen(false);
      setSelectedPaymentId(null);
      showAlert('해당 사원의 급여내역을 삭제했습니다.', 'success');
    } catch {
      showAlert('해당 사원 급여내역 삭제 실패', 'error')
    }
  }


  useEffect(() => {
    if (mode === 'create') {
      setMode('create');
      (async () => {
        let list: string;
        let payMap = new Map<string, CacheEmployee>();
        let deductionRes: Deduction[];

        // 1. 기본 공제 정보 설정
        try {
          const res = await cacheManager.getDeductions();
          deductionRes = res.map((item: string) => ({
            purpose: item,
            value: '0',
          }));
        } catch {
          deductionRes = defaultDeductionList.map((item) => ({
            purpose: item,
            value: '0',
          }));
        }
        const extra = Array.from(
          {length: TOTAL_DEDUCTION_ROWS - deductionRes?.length},
          () => ({purpose: '', value: '0'}))
        ;
        const mergedDedRows = [...deductionRes, ...extra];
        setDeduction(mergedDedRows);

        // 2. 직원 기본 데이터 설정
        try {
          const cache: CacheEmployee[] = await cacheManager.getEmployees();
          list = cache.map(e => e.id).join(',');
          payMap = new Map(cache.map(e => [e.id, e]));
        } catch {
          list = '';
        }

        try {
          const employees = await axiosInstance.get(`/employee?includesRetirement=true&orderIds=${list}&includesPayment=false`);
          setEmployees(employees.data.data);
          setFormData(
            employees.data.data.map((emp: Employee) => {
              const cachedEmployee = payMap.get(emp.id);

              const cachedDeductionMap = new Map(
                (cachedEmployee?.deductions ?? []).map(d => [d.purpose, d.value])
              );

              return {
                employeeId: emp.id,
                employeeName: emp.info.name,
                employeePosition: emp.info.position,
                startWorkingAt: emp.startWorkingAt?.split('T')[0],
                paymentDetail: {
                  ...defaultPayment,
                  pay: cachedEmployee?.pay ?? defaultPayment.pay,
                  latestPay: cachedEmployee?.pay ?? defaultPayment.pay,
                },
                deductionDetail: mergedDedRows.map(d => ({
                  ...d,
                  value: d.purpose === "건강보험료" || d.purpose === "국민연금"
                    ? cachedDeductionMap.get(d.purpose) : '0',
                })),
                memo: cachedEmployee?.memo ?? '',
              };
            })
          );
        } catch {
          showAlert('사원 정보를 불러오지 못했습니다. 새로고침 해주세요.', 'error');
        }

        // 3. ledger 불러오기
        try {
          const ledgers = await cacheManager.getLedgers();
          const mid = Math.ceil(ledgers.length / 2);
          setLedger({
            paying: ledgers,
            deduction: [],
            createdAt: standardAt,
          });
          setLeftLedger(ledgers.slice(0, mid));
          setRightLedger(ledgers.slice(mid));
        } catch {
          const emptyLedgers: Paying[] = Array.from({length: 30}, () => ({
            purpose: '',
            value: '0',
            group: '',
            memo: ''
          }))
          setLedger({
            paying: emptyLedgers,
            deduction: [],
            createdAt: standardAt,
          })
          setLeftLedger(emptyLedgers.slice(0, 15));
          setRightLedger(emptyLedgers.slice(15));
        }

        // 4. 이전 메모 불러오기 (지출 내역 밑에)
        try {
          const prevMemo = await cacheManager.getPayrollMemo();
          setMemo(prevMemo?.memo);
        } catch (err) {
          console.error(err);
        }
      })();
    } else {
      setMode('edit');
      // 공제칸 가공
      const baseRows = initialPayments?.[0]?.deductionDetail ?? [];
      const extra = Array.from(
        {length: TOTAL_DEDUCTION_ROWS - baseRows?.length},
        () => ({purpose: '', value: '0'})
      );
      setDeduction([...baseRows, ...extra]);

      /* form data setting */
      const prevData: PatchPayment[] = initialPayments.map((payment: Payment) => {
        const detail = payment.paymentDetail;
        return ({
          id: payment.id,
          payrollRegisterId: payrollId,
          employeeId: payment.employeeId,
          employeeName: payment.employeeName,
          employeePosition: payment.employeePosition,
          paymentDetail: {
            pay: detail.pay,
            latestPay: detail.latestPay ?? detail.pay,
            workingDay: detail.workingDay,
            extendWorkingTime: String(detail.extendWorkingTime),
            dayOffWorkingTime: String(detail.dayOffWorkingTime),
            extendWorkingMulti: detail.multis.extendWorkingMulti,
            dayOffWorkingMulti: detail.multis.dayOffWorkingMulti,
            annualLeaveAllowanceMulti: detail.multis.annualLeaveAllowanceMulti,
            unusedAnnualLeaveAllowance: detail.unusedAnnualLeaveAllowance,
            mealAllowance: detail.mealAllowance
          },
          deductionDetail: [...payment.deductionDetail, ...extra],
          startWorkingAt: payment.startWorkingAt.split('T')[0],
          memo: payment.memo ?? "",
        })
      });
      setFormData(prevData);

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
  }, [showAlert, mode, initialPayments, payrollId, initialLedger]);

  useEffect(() => {
    setLeftLedger(prev =>
      prev.map(item =>
        item.purpose === '급여'
          ? {...item, value: String(totalSalarySum)}
          : item
      )
    );
    setRightLedger(prev =>
      prev.map(item =>
        item.purpose === '급여'
          ? {...item, value: String(totalSalarySum)}
          : item
      )
    );
  }, [totalSalarySum]);

  /* table 내부 scroll 이벤트 제어 */
  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    if (activeRowIdx === 0) {
      el.scrollTop = 0;
    }
    if (activeRowIdx === leftRows.length + deduction.length) {
      el.scrollTop = el.scrollHeight;
    }
  }, [activeRowIdx, deduction.length]);

  // debug
  // console.log(formData);

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
            {/* 날짜 선택 */}
            <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
              <InputLabel sx={{fontSize: 'small',}}>작성일</InputLabel>
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

            <Box sx={{display: 'flex', gap: 2}}>
              {/* 사원 순서 변경 */}
              <Box>
                <Button variant='outlined'
                        size='small'
                        onClick={() => setDialogOpen(true)}
                        disabled={mode === 'edit'}
                >
                  사원 순서 변경
                </Button>
              </Box>

              {/* 전체 workingDay 수정 */}
              <Box sx={{display: 'flex', alignItems: 'center'}}>
                <InputLabel sx={{fontSize: 'small', mx: 1}}>월평균 근로시간:</InputLabel>
                <Input disableUnderline
                       onChange={handleAllWorkingDayChange}
                       inputProps={{
                         sx: {textAlign: 'center', width: 50}
                       }}
                       value={formData[0]?.paymentDetail?.workingDay || '0'}/>
              </Box>
            </Box>
          </Box>
        </LocalizationProvider>
      </Box>

      <AssignEmployees isOpened={dialogOpen}
                       onClose={() => setDialogOpen(false)}
                       employees={employees}
                       onApply={(orderedEmployees) => {
                         const orderedIds = orderedEmployees.map(e => e.id);
                         reorderByEmployeeIds(orderedIds);
                       }}
      />

      <Paper sx={{paddingBottom: 1, px: 2}}>
        {/* 급여대장 */}
        <Box sx={{mt: 1}}>
          <TableContainer
            component={Box}
            ref={tableScrollRef}
            sx={{
              maxHeight: '72vh',
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'lightgray',
              borderRadius: 1,
            }}
          >
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      borderRight: '1px solid lightgray',
                      backgroundColor: 'background.paper',
                      zIndex: 2,
                    }}
                  />
                  {mode === 'create' ? employees?.map((employee, index) => (
                    /* CREATE MODE */
                    <TableCell align='center'
                               key={employee.id}
                               sx={{
                                 backgroundColor: 'background.paper',
                                 zIndex: 2,
                                 // position: 'relative',
                                 borderRight: '1px solid lightgray',
                                 minWidth: 100,
                                 py: 0.5,
                                 px: 1,
                               }}>
                      <Input disableUnderline
                             multiline
                             name="memo"
                             sx={{marginRight: 1, fontSize: 11}}
                             onClick={() => setActiveRowIdx(0)}
                             inputProps={{
                               'data-row-index': 0,
                               'data-col-index': index + 1,
                               onKeyDown: (e: any) => {
                                 if (e.altKey && e.key === "Enter") {
                                   const newValue = getValueWithNewLine(e);
                                   handleMemoInputByEmployee(newValue, employee.id)
                                   return;
                                 }
                                 const caretEnd = isCaretAtEnd(e), caretStart = isCaretAtStart(e);
                                 if (!e.nativeEvent.isComposing) {
                                   if (e.key === 'Enter') {
                                     arrowNavAtRegister(e, employees?.length + 1, false, "col", 1);
                                     setActiveRowIdx(1);
                                   } else if (caretEnd && e.key === 'ArrowDown') {
                                     arrowNavAtRegister(e, employees?.length + 1, false, "col", 1);
                                     setActiveRowIdx(1);
                                   } else if ((caretStart && e.key === 'ArrowLeft')
                                     || (caretEnd && e.key === 'ArrowRight'))
                                     arrowNavAtRegister(e, employees?.length + 1, false, "col", 1);
                                 }
                               }
                             }}
                             onChange={(e) => handleMemoInputByEmployee(e.target.value, employee.id)}
                      />
                      <Typography variant='body2' sx={{mx: 1.5}}>
                        {employee.info.name}
                      </Typography>
                      <IconButton color='error' size='small'
                                  onClick={() => handleRemoveEmployee(employee.id)}
                                  sx={{
                                    position: 'absolute',
                                    top: '0.1rem',
                                    right: '0.1rem',
                                    padding: '1px',
                                  }}>
                        <CloseIcon fontSize='inherit'/>
                      </IconButton>
                      <Typography sx={{m: 0, fontSize: 11}}>{employee.info.position}</Typography>
                    </TableCell>
                  )) : formData?.map((item, index) => ( // EDIT MODE
                    <TableCell align='center'
                               key={`${item.employeeName}-${index}`}
                               sx={{
                                 backgroundColor: 'background.paper',
                                 zIndex: 2,
                                 // position: 'relative',
                                 borderRight: '1px solid lightgray', minWidth: 100,
                                 py: 0.5,
                                 px: 1
                               }}>
                      <Input disableUnderline
                             multiline
                             name="memo"
                             value={formData[index].memo}
                             sx={{marginRight: 1, fontSize: 11}}
                             onClick={() => setActiveRowIdx(0)}
                             inputProps={{
                               'data-row-index': 0,
                               'data-col-index': index + 1,
                               onKeyDown: (e: any) => {
                                 if (e.altKey && e.key === "Enter") {
                                   const newValue = getValueWithNewLine(e);
                                   handleMemoInputByEmployee(newValue, item.id)
                                   return;
                                 }
                                 const caretEnd = isCaretAtEnd(e), caretStart = isCaretAtStart(e);
                                 if (!e.nativeEvent.isComposing) {
                                   if (e.key === 'Enter') {
                                     arrowNavAtRegister(e, employees?.length + 1, false, "col", 1);
                                     setActiveRowIdx(1);
                                   } else if (caretEnd && e.key === 'ArrowDown') {
                                     arrowNavAtRegister(e, employees?.length + 1, false, "col", 1);
                                     setActiveRowIdx(1);
                                   } else if ((caretStart && e.key === 'ArrowLeft')
                                     || (caretEnd && e.key === 'ArrowRight'))
                                     arrowNavAtRegister(e, employees?.length + 1, false, "col", 1);
                                 }
                               }
                             }}
                             onChange={(e) => handleMemoInputByEmployee(e.target.value, item.id)}
                      />
                      <Typography variant='body2' sx={{mx: 1.5}}>
                        {item.employeeName}
                      </Typography>
                      <IconButton color='error' size='small'
                                  onClick={() => {
                                    setSelectedPaymentId(item.id);
                                    setIsConfirmDialogOpen(true)
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    top: '0.1rem',
                                    right: '0.1rem',
                                    padding: '1px',
                                  }}>
                        <CloseIcon fontSize='inherit'/>
                      </IconButton>
                      <Typography sx={{m: 0, fontSize: 11}}>{item.employeePosition}</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* payment */}
                {leftRows.map((row, rowIdx) => {
                  let delta = 0
                  if (row.id === PaymentTableRow.EXTEND_WORKING_TIME
                    || row.id === PaymentTableRow.EXTEND_WORKING_MULTI) delta = -2
                  else if (row.id === PaymentTableRow.DAY_OFF_WORKING_TIME
                    || row.id === PaymentTableRow.DAY_OFF_WORKING_MULTI) delta = -3
                  else if (row.id === PaymentTableRow.ANNUAL_LEAVE_ALLOWANCE_MULTI) delta = -4
                  else if (row.id === PaymentTableRow.UNUSED_ANNUAL_LEAVE_ALLOWANCE
                    || row.id === PaymentTableRow.MEAL_ALLOWANCE) delta = -5

                  return (
                    <TableRow key={rowIdx + 1}
                              selected={row.disabled ? undefined : rowIdx + 1 + delta === activeRowIdx}
                              sx={tableSelectedRowWithoutDesign}
                              onClick={() => !row.disabled && setActiveRowIdx(rowIdx + delta + 1)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'ArrowDown') {
                                  setActiveRowIdx(rowIdx + delta + 2);
                                } else if (e.key === 'ArrowUp') {
                                  setActiveRowIdx(rowIdx + delta);
                                }
                              }}
                    >
                      <TableCell
                        sx={{borderRight: '1px solid lightgray', py: 0}}
                        width={row.minWidth}
                      >
                        {row.label}
                      </TableCell>
                      {listToPaymentRender.map((item, colIdx: number) => {
                        let value = formData[colIdx]?.paymentDetail[row.id];
                        if (row.id === PaymentTableRow.HOURLY_WAGE
                          || row.id === PaymentTableRow.EXTEND_WORKING_WAGE
                          || row.id === PaymentTableRow.DAY_OFF_WORKING_WAGE
                          || row.id === PaymentTableRow.ANNUAL_LEAVE_ALLOWANCE
                          || row.id === PaymentTableRow.TOTAL_PAYMENT
                        ) {
                          value = calculatedWages[colIdx]?.[row.id];
                        }
                        return (
                          <TableCellForPayroll value={row.format ? row.format(value) : value || ''}
                                               validation={value === '-'}
                                               disabled={row.disabled || false}
                                               disabledTextColor='black'
                                               name={row.id}
                                               onChange={(e) => handlePaymentInput(e.target.name, e.target.value, item.id)}
                                               colIdx={colIdx + 1}
                                               rowIdx={row.disabled ? undefined : rowIdx + delta + 1}
                                               maxColLen={listToPaymentRender.length}
                                               maxRowLen={15}
                                               key={`${item.id}-${colIdx}`}
                          />
                        )
                      })}
                    </TableRow>
                  )
                })}
                {/* deduction */}
                {deduction?.map((dec, decIdx) => (
                  <TableRow key={`purpose-${decIdx}`}
                            selected={decIdx + 10 === activeRowIdx}
                            sx={tableSelectedRowWithoutDesign}
                            onClick={() => setActiveRowIdx(decIdx + 10)}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowDown')
                                decIdx === deduction.length - 1 ? setActiveRowIdx(decIdx + 10) : setActiveRowIdx(decIdx + 11);
                              else if (e.key === 'Enter')
                                decIdx === deduction.length - 1 ? setActiveRowIdx(0) : setActiveRowIdx(decIdx + 11);
                              else if (e.key === 'ArrowUp')
                                setActiveRowIdx(decIdx + 9);
                            }}
                  >
                    <TableCellForPayroll value={dec.purpose}
                                         align='left'
                                         onChange={(e) => handleDeductionPurposeChange(e, decIdx)}
                                         colIdx={0}
                                         rowIdx={decIdx + 10}
                                         maxColLen={listToPaymentRender.length}
                                         maxRowLen={18}
                    />
                    {listToPaymentRender.map((item, colIdx: number) => (
                      <TableCellForPayroll key={`${item.id}-${colIdx + 100}`}
                                           value={formatCurrency(formData[colIdx]?.deductionDetail[decIdx]?.value) ?? ''}
                                           validation={formData[colIdx]?.deductionDetail[decIdx]?.value === '-'}
                                           name={dec.purpose}
                                           onChange={(e) => handleDeductionChange(e, item.id, decIdx)}
                                           colIdx={colIdx + 1}
                                           rowIdx={decIdx + 10}
                                           maxColLen={listToPaymentRender.length}
                                           maxRowLen={18}
                      />
                    ))}
                  </TableRow>
                ))}
                {/* 지급액계 */}
                <TableRow>
                  <TableCell
                    sx={{borderRight: '1px solid lightgray', py: 0, my: 0}}
                  >
                    지급액계
                  </TableCell>
                  {listToPaymentRender?.map((_item, colIdx: number) => (
                    <TableCellForPayroll value={calculatedWages[colIdx]?.totalDeductions.toLocaleString() || '0'}
                                         key={`지급액계-${colIdx + 100}`}
                                         disabled={true}
                                         disabledTextColor='black'
                                         maxRowLen={19}

                    />
                  ))}
                </TableRow>

                {/* 수령액 */}
                <TableRow>
                  <TableCell
                    sx={{borderRight: '1px solid lightgray', py: 0}}
                  >
                    수령액
                  </TableCell>
                  {listToPaymentRender?.map((_item, colIdx: number) => (
                    <TableCellForPayroll value={calculatedWages[colIdx]?.totalSalary.toLocaleString() || '0'}
                                         key={`수령액-${colIdx + 100}`}
                                         disabled={true}
                                         disabledTextColor='black'
                    />
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <DeleteConfirmDialog isOpen={isConfirmDialogOpen}
          // paymentId={selectedPaymentId}
          // payrollRegisterId={payrollId}
                             dialogContentText='정말 해당 사원의 급여내역을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
                             onSuccess={() => handleRemoveEmployee(selectedPaymentId)}
                             onClose={() => setIsConfirmDialogOpen(false)}
                             onClick={deletePayment}
        />

        {/* 합산 */}
        <Box sx={{mt: 1}}>
          <TableContainer sx={{border: '1px solid lightgray'}}>
            <Table size="small" sx={{tableLayout: 'fixed', width: '100%'}}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{py: 0, borderRight: '1px solid lightgray'}}>
                    지급액 합계: {totalPaymentSum.toLocaleString() || '0'}
                  </TableCell>
                  <TableCell sx={{py: 0, borderRight: '1px solid lightgray'}}>
                    공제액 합계: {totalDeductionSum.toLocaleString() || '0'}
                  </TableCell>
                  <TableCell sx={{py: 0, borderRight: '1px solid lightgray'}}>
                    수령액 합계: {totalSalarySum.toLocaleString() || '0'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* 지출 내역 */}
        <Box sx={{mt: 2}}>
          <Box>
            <Box sx={{display: 'flex', alignItems: 'end', gap: 1}}>
              <Typography variant='h6'>지출 내역</Typography>
              <Typography variant='caption'>*수령액 합계는 항목명이 '급여' 여야만 자동합산됩니다.</Typography>
            </Box>
            {/* 메모 입력 */}
            <Box sx={{display: 'flex', justifyItems: 'center', alignItems: 'center'}}>
              <Typography variant="caption" width={30}>메모: </Typography>
              <Input size="small"
                     disableUnderline
                     multiline
                     fullWidth
                     value={memo}
                     onChange={(e) => setMemo(e.target.value)}
                     sx={{border: '1px solid lightgray'}}
              />
            </Box>
          </Box>
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
                      {/* 항목 */}
                      <TableCellForPayroll name='purpose'
                                           value={(item).purpose || ''}
                                           align='left'
                                           onChange={(e) => handleLedgerInputChange(e, 'left', idx)}
                                           colIdx={0}
                                           rowIdx={100 + idx}
                                           maxColLen={8}
                      />
                      {/* 금액 */}
                      <TableCellForPayroll value={formatCurrency((item).value) ?? ''}
                                           validation={(item).value === '-'}
                                           name='value'
                                           onChange={(e) => handleLedgerInputChange(e, 'left', idx)}
                                           colIdx={1}
                                           rowIdx={100 + idx}
                                           maxColLen={8}
                      />
                      {/* 지출일 */}
                      <TableCellForPayroll value={(item).group ?? '-'}
                                           name='group'
                                           onChange={(e) => handleLedgerInputChange(e, 'left', idx)}
                                           colIdx={2}
                                           rowIdx={100 + idx}
                                           maxColLen={8}
                                           align='center'
                                           cellW='20%'
                      />
                      {/* 메모 */}
                      <TableCellForPayroll value={(item).memo ?? '-'}
                                           name='memo'
                                           onChange={(e) => handleLedgerInputChange(e, 'left', idx)}
                                           colIdx={3}
                                           rowIdx={100 + idx}
                                           maxColLen={8}
                                           align='center'
                                           cellW='20%'
                      />
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
                      {/* 항목 */}
                      <TableCellForPayroll name='purpose'
                                           value={(item).purpose || ''}
                                           align='left'
                                           onChange={(e) => handleLedgerInputChange(e, 'right', idx)}
                                           colIdx={4}
                                           rowIdx={100 + idx}
                                           maxColLen={8}
                      />
                      {/* 금액 */}
                      <TableCellForPayroll value={formatCurrency((item).value) ?? ''}
                                           validation={item.value === '-'}
                                           name='value'
                                           onChange={(e) => handleLedgerInputChange(e, 'right', idx)}
                                           colIdx={5}
                                           rowIdx={100 + idx}
                                           maxColLen={8}
                      />
                      {/* 지출일 */}
                      <TableCellForPayroll value={(item).group ?? '-'}
                                           name='group'
                                           onChange={(e) => handleLedgerInputChange(e, 'right', idx)}
                                           colIdx={6}
                                           rowIdx={100 + idx}
                                           maxColLen={8}
                                           align='center'
                                           cellW='20%'
                      />
                      {/* 메모 */}
                      <TableCellForPayroll value={(item).memo ?? '-'}
                                           name='memo'
                                           onChange={(e) => handleLedgerInputChange(e, 'right', idx)}
                                           colIdx={7}
                                           rowIdx={100 + idx}
                                           maxColLen={8}
                                           align='center'
                                           cellW='20%'
                      />
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
          {mode === 'create' ? '등록' : '수정'}
        </Button>
      </Box>
    </Box>
  )
}

export default NewPayrollLedger;