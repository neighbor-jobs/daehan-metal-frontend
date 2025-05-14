import {ClientSalesColumn, TableColumns} from '../../types/tableColumns.ts';

// UI
import {
  Autocomplete,
  Box,
  Button,
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
import DateRangePicker from '../../components/DateRangePicker.tsx';
import PrintButton from '../../layout/PrintButton.tsx';
import {useCallback, useEffect, useState} from 'react';
import dayjs from 'dayjs';
import {AxiosResponse} from 'axios';
import axiosInstance from '../../api/axios.ts';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';
import {useAlertStore} from '../../stores/alertStore.ts';

const columns: readonly TableColumns<ClientSalesColumn>[] = [
  {
    id: ClientSalesColumn.DATE,
    label: '날짜',
    minWidth: 100,
  },
  {
    id: ClientSalesColumn.PRODUCT_NAME,
    label: '품명',
    minWidth: 140,
  },
  {
    id: ClientSalesColumn.SCALE,
    label: '규격',
    minWidth: 140,
  },
  {
    id: ClientSalesColumn.QUANTITY,
    label: '수량',
    minWidth: 100,
    align: 'right',
    format: formatDecimal,
  },
  {
    id: ClientSalesColumn.TOTAL_RAW_MAT_AMOUNT,
    label: '재료비',
    minWidth: 100,
    align: 'right',
    format: (value: number) => value.toLocaleString(),
  },
  {
    id: ClientSalesColumn.TOTAL_MANUFACTURE_AMOUNT,
    label: '가공비',
    minWidth: 100,
    align: 'right',
    format: (value: number) => value.toLocaleString(),
  },
  /*{
    id: 'total-amount',
    label: '금액',
    minWidth: 100,
    align: 'right',
  },
  {
    id: 'received-amount',
    label: '수금액',
    minWidth: 100,
    align: 'right',
  },
  {
    id: 'remaining-amount',
    label: '잔액',
    minWidth: 100,
    align: 'right',
  }*/
];


const ClientSales = (): React.JSX.Element => {
  const [salesCompanyList, setSalesCompanyList] = useState([]);
  const [date, setDate] = useState({
    startAt: dayjs(),
    endAt: dayjs(),
  });
  const [companyName, setCompanyName] = useState('');
  const [reports, setReports] = useState([]);
  const [amount, setAmount] = useState({
    totalPayingAmount: '0',
    totalSalesAmount: '0',
  })
  const [printData, setPrintData] = useState<{
    data: any[];
    companyName: string;
    startAt: string;
    endAt: string;
  } | null>(null);

  const { showAlert } = useAlertStore();

  // handler
  const handleCompanyChange = useCallback((_event, newValue: string | null) => {
    const selectedCompany = salesCompanyList.find((company) => company.companyName === newValue);
    setCompanyName(selectedCompany ? newValue : '');
  }, [salesCompanyList]);

  const handleDateChange = (start: dayjs.Dayjs | null, end: dayjs.Dayjs | null) => {
    if (!start || !end) return;
    setDate({startAt: start, endAt: end});
  };

  // api
  const getClientSales = async () => {
    const res: AxiosResponse = await axiosInstance.get(`receipt/company/sales/report?companyName=${companyName}&orderBy=desc&startAt=${date.startAt.format('YYYY-MM-DD')}&endAt=${date.endAt.format('YYYY-MM-DD')}`);
    setAmount({
      totalPayingAmount: res.data.data?.totalPayingAmount,
      totalSalesAmount: res.data.data?.totalSalesAmount,
    })

    const getOutstanding = await axiosInstance.get(`/company/receivable?orderBy=desc&startAt=${date.startAt.format('YYYY-MM-DD')}`)
    let outstanding = Number(getOutstanding.data.data.find((item) => item.companyName === companyName)?.outstandingAmount);

    const data = (res.data.data.reports?.map((item) => {
      const raw = Number(item.rawMatAmount) || 0;
      const manu = Number(item.manufactureAmount) || 0;
      const quantity = item.quantity;

      const materialPrice = raw * quantity;
      const processingPrice = manu * quantity;
      const total = materialPrice + processingPrice;

      outstanding = isNaN(outstanding) ? total : outstanding + total;

      return {
        'createdAt': item.createdAt.split('T')[0],
        'productName': item.productName,
        'scale': item.scale,
        'quantity': item.quantity,
        'rawMatAmount': materialPrice,
        'manufactureAmount': processingPrice,
        'amount': total,
        'remainingAmount' : outstanding,
      }
    }) ?? []).sort((a, b) => {
      return dayjs(a.createdAt).diff(dayjs(b.createdAt))
    });
    setReports(data);
    setPrintData({
      data,
      companyName: companyName,
      startAt: date.startAt.format('YYYY-MM-DD'),
      endAt: date.endAt.format('YYYY-MM-DD'),
    })
    /*
    * {
    "data": [
        {
            "createdAt": "2025-05-13",
            "productName": "0",
            "scale": "1",
            "quantity": 2,
            "rawMatAmount": "2,000",
            "manufactureAmount": "400",
            "amount": 2400,
            "remainingAmount": 86944
        },
        {
            "createdAt": "2025-05-13",
            "productName": "0",
            "scale": "2",
            "quantity": 2.5,
            "rawMatAmount": "7,500",
            "manufactureAmount": "10,000",
            "amount": 17500,
            "remainingAmount": 104444
        },
        {
            "createdAt": "2025-05-13",
            "productName": "0",
            "scale": "1",
            "quantity": 2,
            "rawMatAmount": "20",
            "manufactureAmount": "0",
            "amount": 20,
            "remainingAmount": 104464
        },
        {
            "createdAt": "2025-05-13",
            "productName": "0",
            "scale": "3",
            "quantity": 2,
            "rawMatAmount": "2,224",
            "manufactureAmount": "0",
            "amount": 2224,
            "remainingAmount": 106688
        },
        {
            "createdAt": "2025-05-13",
            "productName": "0000",
            "scale": "11",
            "quantity": 2,
            "rawMatAmount": "400",
            "manufactureAmount": "0",
            "amount": 400,
            "remainingAmount": 107088
        }
    ],
    "companyName": "(가)거래처",
    "startAt": "2025-05-13",
    "endAt": "2025-05-13"
}
    * */
  }

  useEffect(() => {
    const getCompanies = async () => {
      try {
        const res = await axiosInstance.get('/company?orderBy=asc');
        setSalesCompanyList(res.data.data);
      } catch {
        showAlert('새로고침 요망', 'warning');
      }
    }
    getCompanies();
  }, []);

  // debug
  console.log(printData);

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginX: 3,
      }}>
        {/* date picker */}
        <DateRangePicker onChange={handleDateChange} startAt={date.startAt} endAt={date.endAt}/>
        <Autocomplete
          freeSolo
          options={salesCompanyList.map((option) => option.companyName)}
          value={companyName}
          onChange={handleCompanyChange}
          renderInput={(params) =>
            <TextField {...params}
                       placeholder='거래처명' size='small'
                       sx={{minWidth: 150}}
            />
          }
        />
        <Button
          variant="outlined"
          onClick={getClientSales}
        >
          확인
        </Button>
      </Box>

      <Paper sx={{width: '100%', overflow: 'hidden'}}>
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
                <TableCell align='right' sx={{minWidth: 80}}>금액</TableCell>
                <TableCell align='right' sx={{minWidth: 80}}>잔액</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports && reports.map((row, rowIdx) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={rowIdx}>
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
                    <TableCell align='right'>{row.amount?.toLocaleString() ?? '-'}</TableCell>
                    <TableCell align='right'>{row.remainingAmount?.toLocaleString() ?? '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>합계 :</TableCell>
                <TableCell align='right'>매출액계 : </TableCell>
                <TableCell align='right'>{formatCurrency(amount.totalSalesAmount)}</TableCell>
                <TableCell align='right'>수금액계 : </TableCell>
                <TableCell align='right'>{formatCurrency(amount.totalPayingAmount)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
      <PrintButton printData={printData} />
    </Box>
  );
}
export default ClientSales;