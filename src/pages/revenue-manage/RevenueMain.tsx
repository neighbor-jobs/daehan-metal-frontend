// UI
import {
  Autocomplete,
  Box,
  Button,
  InputLabel,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';

// project
import {RevenueMainColumn, TableColumns} from '../../types/tableColumns';
import {formatCurrency, formatDecimal} from '../../utils/format';
import React, {useCallback, useEffect, useState} from 'react';
import TransactionRegister from './TransactionRegister.tsx';
import dayjs from 'dayjs';
import {AxiosResponse} from 'axios';
import axiosInstance from '../../api/axios.ts';
import PrintButton from '../../layout/PrintButton.tsx';
import getAllProducts from '../../api/getAllProducts.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {Choice} from '../../types/transactionRegisterTypes.ts';

const columns: readonly TableColumns<RevenueMainColumn>[] = [
  {
    id: RevenueMainColumn.PRODUCT_NAME,
    label: '품명',
    minWidth: 140,
  },
  {
    id: RevenueMainColumn.SCALE,
    label: '규격',
    minWidth: 140,
  },
  {
    id: RevenueMainColumn.LOCATION_NAMES,
    label: '현장명',
    minWidth: 140,
    format: (value: string[] | undefined) => value?.length > 0 ? value.join(', ') : ''
  },
  {
    id: RevenueMainColumn.QUANTITY,
    label: '수량',
    minWidth: 80,
    align: 'right',
    format: formatDecimal,
  },
  {
    id: RevenueMainColumn.RAW_MAT_AMOUNT,
    label: '재료단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: RevenueMainColumn.TOTAL_RAW_MAT_AMOUNT,
    label: '재료비',
    minWidth: 100,
    align: 'right',
    format: (amount: number) => amount?.toLocaleString(),
  },
  {
    id: RevenueMainColumn.MANUFACTURE_AMOUNT,
    label: '가공단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: RevenueMainColumn.TOTAL_MANUFACTURE_AMOUNT,
    label: '가공비',
    minWidth: 100,
    align: 'right',
    format: (amount: number) => amount?.toLocaleString(),
  }
];

const RevenueMain = (): React.JSX.Element => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogType, setDialogType] = useState<'create' | 'edit'>('create');
  const [salesCompanyList, setSalesCompanyList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [formData, setFormData] = useState({
    startAt: dayjs().format('YYYY-MM-DD'),
    companyName: '',
    sequence: 1,
  });
  const [report, setReport] = useState([]);
  const [prevChoices, setPrevChoices] = useState<Choice[] | []>([]);
  const [endSeq, setEndSeq] = useState<number>(1);
  const [amount, setAmount] = useState({
    totalPayingAmount: "0",
    totalSalesAmount: "0",
    carryoverAmount: "0",
  });
  const [printData, setPrintData] = useState<{
    locationName: string[],
    companyName: string,
    payingAmount: string,
    createdAt: string,
    carryoverAmount: string,
    totalSalesAmount: string,
    sales: any[],
  } | null>();
  const {showAlert} = useAlertStore();

  // handler
  const handleCompanyChange = useCallback((_event, newValue: string | null) => {
    const selectedCompany = salesCompanyList.find((company) => company.companyName === newValue);
    setFormData((prev) => ({
      ...prev,
      companyName: selectedCompany ? newValue : "",
      sequence: 1,
    }));
  }, [salesCompanyList]);

  const handlePageChange = (_event, value: number) => {
    setFormData(prev => ({
      ...prev,
      sequence: value,
    }))
    getReceipt(formData.companyName, formData.startAt, value);
  }
  // api
  const getReceipt = async (companyName: string, startAt: string, sequence: number = 1) => {
    const res: AxiosResponse = await axiosInstance.get(`/receipt/company/daily/sales/report?companyName=${companyName}&orderBy=desc&startAt=${startAt}&sequence=${sequence}`);

    if (res.data.statusCode === 204) {
      setReport([]);
      setAmount({
        totalPayingAmount: "0",
        totalSalesAmount: "0",
        carryoverAmount: "0"
      });
      setPrintData(null);
      setEndSeq(1);
      showAlert('해당 거래 내역이 존재하지 않습니다.', 'warning');
      return;
    }
    const latestReports = res.data.data.reports;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const simplifiedReport = latestReports.map(({receiptId, locationNames, companyName, createdAt, ...rest}) => ({
      ...rest,
      totalRawMatAmount: Number(rest.rawMatAmount) * rest.quantity,
      totalManufactureAmount: Number(rest.manufactureAmount) * rest.quantity,
    }));

    setEndSeq(res.data.data.endSequence);
    setReport(latestReports);
    setPrevChoices(simplifiedReport);
    setAmount({
      totalPayingAmount: res.data.data.totalPayingAmount,
      totalSalesAmount: res.data.data.totalSalesAmount,
      carryoverAmount: res.data.data.carryoverAmount,
    });
    setPrintData({
      locationName: res.data.data.reports[0]?.locationNames || [],
      companyName: formData.companyName,
      payingAmount: res.data.data.totalPayingAmount,
      carryoverAmount: res.data.data.carryoverAmount,
      totalSalesAmount: res.data.data.totalSalesAmount,
      createdAt: formData.startAt,
      sales: res.data.data.reports,
    })
  }

  const deleteReceipt = async () => {
    try {
      await axiosInstance.delete(`/receipt?id=${report[0].receiptId}`);
      showAlert('삭제되었습니다.', 'success');
      await getReceipt(formData.companyName, formData.startAt);
      setFormData((prev) => ({
        ...prev,
        sequence: 1,
      }))
    } catch {
      showAlert('삭제 실패', 'error');
    }
  }

  useEffect(() => {
    const fetchSalesCompanies = async () => {
      try {
        const companies = await axiosInstance.get('/company?orderBy=asc');
        const products = await getAllProducts();
        setSalesCompanyList(companies.data.data);
        setProductList(products);
      } catch {
        showAlert('새로고침 요망', 'info')
      }
    }
    fetchSalesCompanies();
  }, []);

  // debug

  return (
    <Box sx={{position: 'relative'}}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginX: 3,
        marginY: 1,
      }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <InputLabel sx={{fontSize: 'small',}}>매출일</InputLabel>
            <DesktopDatePicker
              views={['day']}
              format="YYYY/MM/DD"
              defaultValue={dayjs()}
              onChange={(value) => setFormData(prev => ({...prev, startAt: value.format('YYYY-MM-DD')}))}
              slotProps={{
                textField: {size: 'small'},
                calendarHeader: {format: 'YYYY/MM'},
              }}
            />
          </Box>
        </LocalizationProvider>
        <Autocomplete
          freeSolo
          options={salesCompanyList.map((option) => option.companyName)}
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
          onClick={() => {
            getReceipt(formData.companyName, formData.startAt, formData.sequence);
            setDialogType('create');
          }}
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
                <TableCell align='right'>금액</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report &&
                report.map((row, rowIndex) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      })}
                      <TableCell align='right'>
                        {((Number(row.manufactureAmount) + Number(row.rawMatAmount)) * row.quantity).toLocaleString('ko-KR')}
                      </TableCell>
                    </TableRow>
                  );
                })
              }
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell align='left'>{`전미수: ${formatCurrency(amount.carryoverAmount) || ''}`}</TableCell>
                <TableCell colSpan={2} align='left'>{`매출액: ${formatCurrency(amount.totalSalesAmount)}`}</TableCell>
                <TableCell colSpan={2} align='left'>{`입금액: ${formatCurrency(amount.totalPayingAmount)}`}</TableCell>
                <TableCell colSpan={2}
                           align='left'>{`미수계: ${(Number(amount.carryoverAmount) + Number(amount.totalSalesAmount) - Number(amount.totalPayingAmount)).toLocaleString()}`}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
        marginX: 3,
      }}>
        <Box sx={{width: '33%'}}/>
        <Box sx={{display: 'flex', justifyContent: 'center', width: '33%'}}>
          <Pagination page={formData.sequence} count={endSeq} shape="rounded" onChange={handlePageChange}/>
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 2, width: '33%'}}>
          <Button variant='outlined'
                  disabled={report.length === 0}
                  onClick={() => {
                    setDialogType('edit');
                    setOpenDialog(true);
                  }}
          >
            수정
          </Button>
          <Button variant="outlined" color="error" onClick={deleteReceipt}>
            삭제
          </Button>
        </Box>
      </Box>
      <Box sx={{position: 'fixed', bottom: 16, right: 16, display: 'flex', gap: 2}}>
        <Button variant='contained'
                onClick={() => {
                  setDialogType('create');
                  setOpenDialog(true);
                }}
                sx={{marginY: 1}}
        >
          등록
        </Button>
        <PrintButton printData={printData} value='인쇄'/>
      </Box>
      <TransactionRegister isOpen={openDialog} onClose={() => setOpenDialog(false)}
                           dialogType={dialogType}
                           salesCompanyList={salesCompanyList}
                           productList={productList}
                           prevFormData={{
                             id: report[0]?.receiptId || '',
                             sequence: formData.sequence,
                             locationName: report[0]?.locationNames || [],
                             companyName: formData.companyName,
                             createdAt: formData.startAt,
                             payingAmount: amount.totalPayingAmount,
                           }}
                           prevChoices={prevChoices}
                           onSuccess={async (companyName: string, startAt: string, sequence: number = 1) => {
                             await getReceipt(companyName, startAt, sequence);
                             setFormData({
                               startAt: startAt,
                               companyName: companyName,
                               sequence: sequence,
                             });
                           }}
      />
    </Box>
  )
}

export default RevenueMain;