import {MonthlyPurchaseColumn, TableColumns} from '../../types/tableColumns.ts';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';
import {
  Autocomplete,
  Box,
  Button, IconButton, InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow, TextField
} from '@mui/material';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import dayjs from 'dayjs';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';
import axiosInstance from '../../api/axios.ts';
import {AxiosResponse} from 'axios';
import PrintButton from '../../layout/PrintButton.tsx';
import {useAlertStore} from '../../stores/alertStore.ts';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import UpdateReceipt from './UpdateReceipt.tsx';

const columns: readonly TableColumns<MonthlyPurchaseColumn>[] = [
  {
    id: MonthlyPurchaseColumn.CREATED_AT,
    label: '날짜',
    minWidth: 100,
    format: (date: string) => date.split('T')[0],
  },
  {
    id: MonthlyPurchaseColumn.PRODUCT_NAME,
    label: '품명',
    minWidth: 170
  },
  {
    id: MonthlyPurchaseColumn.QUANTITY,
    label: '수량',
    minWidth: 100,
    align: 'right',
    format: formatDecimal
  },
  {
    id: MonthlyPurchaseColumn.UNIT_PRICE,
    label: '단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: MonthlyPurchaseColumn.TOTAL_SALES_AMOUNT,
    label: '매입금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: MonthlyPurchaseColumn.TOTAL_VAT_AMOUNT,
    label: '매입세액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: MonthlyPurchaseColumn.TOTAL_PRICE,
    label: '합계',
    minWidth: 110,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: MonthlyPurchaseColumn.PRODUCT_PRICE,
    label: '입금',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: MonthlyPurchaseColumn.PAYABLE_BALANCE,
    label: '잔액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  }
];


const MonthlyPurchase = (): React.JSX.Element => {
  const [formData, setFormData] = useState({
    standardDate: dayjs(),
    companyName: '',
  })
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState();
  const [purchaseCompanyList, setPurchaseCompanyList] = useState([]);
  const [monthlyPurchase, setMonthlyPurchase] = useState([]);
  const [selectedCompanyData, setSelectedCompanyData] = useState({});
  const [records, setRecords] = useState([]);
  const { showAlert } = useAlertStore();

  const totals = useMemo(() => {
    return records.reduce(
      (acc, r) => {
        acc.purchase += Number(r.totalSalesAmount ?? 0);
        acc.vat      += Number(r.totalVatPrice  ?? 0);
        acc.total    += Number(r.totalPrice     ?? 0);
        acc.paying   += Number(r.productPrice   ?? 0);
        return acc;
      },
      { purchase: 0, vat: 0, total: 0, paying: 0 }
    );
  }, [records]);

  const handleCompanyChange = useCallback((_event, newValue: string | null) => {
    const selectedCompany = purchaseCompanyList.find((company) => company?.name === newValue);
    if (!selectedCompany) {
      setFormData(prev => ({
        ...prev,
        companyName: newValue || '',
      }));
      setSelectedCompanyData({});
      return;
    }
    setFormData(prev => ({
      ...prev,
      companyName: selectedCompany.name,
    }));
    setSelectedCompanyData({
      companyName: selectedCompany.name,
      telNumber: selectedCompany.info?.telNumber || '',
      subTelNumber: selectedCompany.info?.subTelNumber || '',
      phoneNumber: selectedCompany.info?.phoneNumber || '',
      bankName: selectedCompany.bank?.bankName || '',
      accountNumber: selectedCompany.bank?.accountNumber || ''
    });
  }, [purchaseCompanyList]);

  // api
  const handleSearch = async () => {
    try {
      const res: AxiosResponse = await axiosInstance.get(`/vendor/receipt?companyName=${formData.companyName}&standardDate=${formData.standardDate.format('YYYY-MM')}`);
      setMonthlyPurchase(res.data.data);
      setRecords(res.data.data.map((item) => {
        return ({
          createdAt: item.createdAt.split('T')[0],
          productName: item.productName,
          vat: item.vat,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalSalesAmount: Number(item.totalRawMatAmount) + Number(item.totalManufactureAmount),
          totalVatPrice: item.totalVatPrice,
          totalPrice: item.totalPrice,
          productPrice: item.productPrice,
          payableBalance: item.payableBalance,
        });
      }))
    } catch (error) {
      showAlert('검색에 실패했습니다.', 'error');
    }
  }

  const deletePurchase = async (receiptId: string) => {
    try {
      await axiosInstance.delete(`/vendor/receipt?receiptId=${receiptId}`);
      await handleSearch();
    } catch (error) {
      showAlert('삭제에 실패했습니다', 'error');
    }
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get('/vendor/many?orderBy=asc');
        setPurchaseCompanyList(res.data.data);
      } catch (error) {
        showAlert('새로고침 요망', 'info');
      }
    }
    fetch();
  }, []);

  // debug
  // console.log('formData: ', formData);
  // console.log('selected: ', {...selectedCompanyData, records: records});
  return (
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginX: 3,
        marginY: 1,
      }}>
        {/* date picker */}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <InputLabel sx={{fontSize: 'small',}}>매입월</InputLabel>
            <DesktopDatePicker
              views={['year', 'month']}
              format="YYYY/MM"
              defaultValue={dayjs()}
              onChange={(value) => setFormData(prev => ({...prev, standardDate: value}))}
              slotProps={{
                textField: {size: 'small'},
              }}
            />
          </Box>
        </LocalizationProvider>
        <Autocomplete
          freeSolo
          options={purchaseCompanyList.map((option) => option.name)}
          onChange={handleCompanyChange}
          value={formData.companyName}
          renderInput={(params) =>
            <TextField {...params}
                       placeholder='거래처명' size='small'
                       sx={{minWidth: 150}}
            />
          }
        />
        <Button
          variant="outlined"
          onClick={handleSearch}
        >
          확인
        </Button>
      </Box>
      <Paper sx={{width: '100%', overflow: 'hidden', flexGrow: 1}}>
        <TableContainer>
          <Table stickyHeader aria-label="sticky table" size='small'>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{minWidth: column.minWidth}}
                  >
                    {column.label}
                  </TableCell>
                ))}
                <TableCell sx={{width: 2}}/>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlyPurchase &&
                monthlyPurchase.map((row, rowIndex) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                      <TableCell>{(row.createdAt).split('T')[0]}</TableCell>
                      <TableCell>{row.productName}</TableCell>
                      <TableCell align='right'>{row.quantity.toFixed(3)}</TableCell>
                      <TableCell align='right'>{formatCurrency(row.unitPrice)}</TableCell>
                      <TableCell
                        align='right'>{(Number(row.totalRawMatAmount) + Number(row.totalManufactureAmount)).toLocaleString()}</TableCell>
                      <TableCell align='right'>{formatCurrency(row.totalVatPrice)}</TableCell>
                      <TableCell align='right'>{formatCurrency(row.totalPrice)}</TableCell>
                      <TableCell align='right'>{formatCurrency(row.productPrice)}</TableCell>
                      <TableCell align='right'>{formatCurrency(row.payableBalance)}</TableCell>
                      <TableCell sx={{padding: 0}}>
                        <IconButton size='small'
                          onClick={() => {
                            setUpdateFormData(row);
                            setDialogOpen(true);
                          }}
                        >
                          <EditIcon fontSize='small'/>
                        </IconButton>
                        <IconButton color='error' size='small'
                                    onClick={() => deletePurchase(row.id)}
                        >
                          <CloseIcon fontSize='small'/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>합계</TableCell>
                <TableCell align='right'>{totals.purchase.toLocaleString()}</TableCell>
                <TableCell align='right'>{totals.vat.toLocaleString()}</TableCell>
                <TableCell align='right'>{totals.total.toLocaleString()}</TableCell>
                <TableCell align='right'>{totals.paying.toLocaleString()}</TableCell>
                <TableCell align='right'></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
      <UpdateReceipt isOpen={dialogOpen}
                     onClose={() => setDialogOpen(false)}
                     prevFormData={updateFormData}
                     companyName={formData.companyName}
                     onSuccess={async () => {
                       await handleSearch();
                     }}
      />
      <Box sx={{position: 'fixed', bottom: 16, right: 16, display: 'flex', gap: 2}}>
        <PrintButton printData={{...selectedCompanyData, records: records}} value='인쇄'/>
        {/* <PrintButton printData={paymentTestData} value='인쇄'/> */}
        {/* <PrintButton printData={docData} value='인쇄'/> */}
      </Box>
    </Box>
  )
}

/// 아래는 급여 대장 및 명세관련 테스트 데이터
import { IEmployeePayment, IPayrollRegister, IFinancialLedger, IIntegrationDoc } from '../../../electron/templetes.ts';

/** 급여명세서 테스트 데이터 */
const paymentTestData: IEmployeePayment = {
  id: "101bfcef-df7d-47e9-8683-99739c812be8",
  memo: "23/03/01퇴사",
  employeeName: "이우석",
  employeePosition: "생산직",
  paymentDetail: {
    pay: "2.000.000",
    workingDay: 209,
    hourlyWage: "14.388",
    mealAllowance: "9.000",
    extendWokringWage: "43.164",
    extendWorkingTime: 2,
    dayOffWorkingWage: "43.164",
    dayOffWorkingTime: 2,
    annualLeaveAllowance: "230.208",
  },
  deductionDetail: [
    {
      purpose: "근로 소득세",
      value: "12.678",
    },
    {
      purpose: "지방세",
      value: "1.260",
    },
    {
      purpose: "건강보험료",
      value: "71.060",
    },
    {
      purpose: "국민연금",
      value: "82.840",
    },
    {
      purpose: "경조사비",
      value: "20.000",
    },
    {
      purpose: "경로,가불",
      value: "104.240",
    },
  ],
  salary: "2,316,536",
  deduction: "292.078",
  totalSalary: "2,024,458",
}

/** 급여내역 테스트 데이터 */
const payrollRegisterData: IPayrollRegister = {
  id: "101bfcef-df7d-47e9-8683-99739c812be8",
  payments: [
    paymentTestData,
    paymentTestData,
    paymentTestData,
    paymentTestData,
    paymentTestData,
    paymentTestData,
    paymentTestData,
    paymentTestData,
  ],
  createdAt: new Date()
}

/** 지출내역 테스트 데이터 */
const financialLedgerData: IFinancialLedger = {
  id: "101bfcef-df7d-47e9-8683-99739c812be8",
  payingExpenses: [
    {
      purpose: "5월 급여",
      value: "10.000.000",
      group: "5일",
    },
    {
      purpose: "사장님 급여",
      value: "5.000.000",
      group: "5일",
    },
    {
      purpose: "회계사무실",
      value: "3.000.000",
      group: "5일",
    },
    {
      purpose: "식대",
      value: "800.000",
      group: "5일",
    },
    {
      purpose: "용달",
      value: "2.500.000",
      group: "5일",
    },
    {
      purpose: "현대보험",
      value: "250.000",
      group: "5일",
    },
    {
      purpose: "세콤",
      value: "200.000",
      group: "10일",
    },
    {
      purpose: "정수기",
      value: "300.000",
      group: "10일",
    },
    {
      purpose: "국민연금",
      value: "4.500.000",
      group: "10일",
    },
    {
      purpose: "고용산재",
      value: "200.000",
      group: "10일",
    },
    {
      purpose: "LIG암보험",
      value: "150.000",
      group: "10일",
    },
    {
      purpose: "화재보험",
      value: "300.000",
      group: "10일",
    },
    {
      purpose: "건강보험",
      value: "250.000",
      group: "10일",
    },
    {
      purpose: "출국만기보험",
      value: "300.000",
      group: "11~25일",
    },
    {
      purpose: "제네시스할부금",
      value: "1.250.000",
      group: "5일",
    },
    {
      purpose: "마이너스 통장",
      value: "12.500.000",
      group: "5일",
    },
    {
      purpose: "3.6.9.12월\n분기별 이자",
      value: "1.800.000",
      group: "5일",
    },
    {
      purpose: "대출이자",
      value: "1.500.000",
      group: "5일",
    },
    {
      purpose: "삼성화재",
      value: "500.000",
      group: "11~25일",
    },
    {
      purpose: "통신비",
      value: "50.000",
      group: "11~25일",
    },
    {
      purpose: "전기료",
      value: "1.000.000",
      group: "11~25일",
    },
    {
      purpose: "수도세",
      value: "200.000",
      group: "11~25일",
    },
    {
      purpose: "갑근세",
      value: "2.500.000",
      group: "5일",
    },
    {
      purpose: "경조사비",
      value: "500.000",
      group: "5일",
    },
    {
      purpose: "퇴직연금",
      value: "30.000.000",
      group: "5일",
    },
    {
      purpose: "공기청정기",
      value: "500.000",
      group: "5일",
    },
    {
      purpose: "카드값",
      value: "5.500.000",
      group: "카드값",
    },
  ],
  deductionExpenses: [],
  calcGroup: {
    "카드값": 5500000,
    "5일": 58100000,
    "10일": 5900000,
    "11~25일": 2050000,
  },
  createdAt: new Date(),
}

/** 급여대장 테스트 데이터 */
const docData: IIntegrationDoc = {
  payrollRegister: payrollRegisterData,
  financialLedger: financialLedgerData,
}

export default MonthlyPurchase;