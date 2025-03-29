// UI
import {
  Autocomplete,
  Box,
  Button,
  InputLabel, Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer, TableFooter,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';

// project
import {RevenueMainColumn, TableColumns} from '../../types/tableColumns';
import {formatCurrency, formatDecimal} from '../../utils/format';
import {useCallback, useEffect, useState} from 'react';
import TransactionRegister from './TransactionRegister.tsx';
import dayjs from 'dayjs';
import {cacheManager} from '../../utils/cacheManager.ts';
import {AxiosResponse} from 'axios';
import axiosInstance from '../../api/axios.ts';
import PrintButton from '../../layout/PrintButton.tsx';

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
    format: (value: string[]) => value.join(', ')
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
    id: RevenueMainColumn.MANUFACTURE_AMOUNT,
    label: '가공단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: RevenueMainColumn.PRODUCT_LENGTH,
    label: '길이',
    minWidth: 100,
    align: 'right',
    format: formatDecimal,
  },
];

const RevenueMain = (): React.JSX.Element => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [salesCompanyList, setSalesCompanyList] = useState([]);
  const [productList, setProductList] = useState([]);
  // TODO: 일별 || 일별 & 매출처 별 거래 명세 불러오기
  const [formData, setFormData] = useState({
    startAt: dayjs().format('YYYY-MM-DD'),
    companyName: '',
    sequence: 1,
  });
  const [report, setReport] = useState([]);
  const [endSeq, setEndSeq] = useState<number>(1);
  const [amount, setAmount] = useState({
    totalPayingAmount: "0",
    totalSalesAmount: "0",
  });
  const [printData, setPrintData] = useState<{
    locationName: string[],
    companyName: string,
    payingAmount: string,
    createdAt: string,
    choices: any[],
    amount: any[],
  } | null>();

  const handleCompanyChange = useCallback((_event, newValue: string | null) => {
    const selectedCompany = salesCompanyList.find((company) => company.companyName === newValue);
    setFormData((prev) => ({
      ...prev,
      companyName: selectedCompany ? newValue : "",
    }));
  }, [salesCompanyList]);

  const handlePageChange = (_event, value:number) => {
    setFormData(prev => ({
      ...prev,
      sequence: value,
    }))
    getReceipt(value);
  }

  /*    "data": {
        "reports": [
            {
                "choiceId": "eba765c5-a8cd-44c3-8ba6-1aac656bd5c4",
                "receiptId": "ace4cd23-5323-4beb-a09d-68202fa5a34a",
                "companyName": "하나금속",
                "productName": "하장바",
                "vCutAmount": "0",
                "rawMatAmount": "58000",
                "manufactureAmount": "20800",
                "quantity": 1,
                "productLength": "0.000",
                "scale": "H/L1.2TX4X4000",
                "vCut": "0",
                "createdAt": "2025-03-28T00:00:00.000Z",
                "locationNames": [
                    "dd"
                ]
            }
        ],
        "totalSalesAmount": "78800",
        "totalPayingAmount": "0",
        "carryoverAmount": "NaN",
        "endSequence": 13
    },*/


  // api
  const getReceipt = async (sequence = 1) => {
    const res: AxiosResponse = await axiosInstance.get(`/receipt/company/daily/sales/report?companyName=${formData.companyName}&orderBy=desc&startAt=${formData.startAt}&sequence=${sequence}`);

    if (res.data.statusCode === 204) {
      setReport([]);
      setAmount({
        totalPayingAmount: "0",
        totalSalesAmount: "0",
      });
      setPrintData(null);
      setEndSeq(1);
      alert('해당 거래 내역이 존재하지 않습니다.');
      return;
    }
    setReport(res.data.data.reports);
    setEndSeq(res.data.data.endSequence);
    setAmount({
      totalPayingAmount: res.data.data.totalPayingAmount,
      totalSalesAmount: res.data.data.totalSalesAmount,
    });
    setPrintData({
      locationName: res.data.data.reports[0]?.locationNames || [],
      companyName: formData.companyName,
      payingAmount: res.data.data.totalPayingAmount,
      createdAt: formData.startAt,
      choices: res.data.data.reports,
      amount: res.data.data.reports.map((item) => ({
        newRawMatAmount: item.rawMatAmount,
        newManufactureAmount: item.manufactureAmount,
      }))
    })
  }

  // 캐시 데이터 불러오기
  useEffect(() => {
    const fetchSalesCompanies = async () => {
      const companies = await cacheManager.getCompanies();
      const products = await cacheManager.getProducts();
      setSalesCompanyList(companies);
      setProductList(products);
    }
    fetchSalesCompanies();
  }, []);

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
              onChange={(value) => setFormData(prev=>({...prev, startAt: value.format('YYYY-MM-DD')}))}
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
          onClick={() => getReceipt(formData.sequence)}
        >
          확인
        </Button>
      </Box>
      <Paper sx={{width: '100%', overflow: 'hidden', flexGrow: 1}}>
        <TableContainer sx={{maxHeight: 440}}>
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
                })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell align='left'>전미수:</TableCell>
                <TableCell colSpan={2} align='left'>{`매출액: ${formatCurrency(amount.totalSalesAmount)}`}</TableCell>
                <TableCell colSpan={2} align='left'>{`입금액: ${formatCurrency(amount.totalPayingAmount)}`}</TableCell>
                <TableCell colSpan={2} align='left'>미수계:</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
      }}>
        <Pagination count={endSeq} shape="rounded" onChange={handlePageChange} />
      </Box>
      <Box sx={{position: 'fixed', bottom: 16, right: 16, display: 'flex', gap: 2}}>
        <Button variant='contained'
                onClick={() => setOpenDialog(true)}
                sx={{ marginY: 1 }}
        >
          등록
        </Button>
        <PrintButton printData={printData} value='인쇄' />
      </Box>
      <TransactionRegister isOpen={openDialog} onClose={() => setOpenDialog(false)}
                           salesCompanyList={salesCompanyList}
                           productList={productList}
      />
    </Box>
  )
}

export default RevenueMain;