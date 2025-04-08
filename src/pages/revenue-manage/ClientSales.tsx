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

const columns: readonly TableColumns<ClientSalesColumn>[] = [
  {
    id: ClientSalesColumn.DATE,
    label: '날짜',
    minWidth: 100,
    format: (date: string) => date.split('T')[0],
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
    format: formatDecimal
  },
  {
    id: ClientSalesColumn.TOTAL_RAW_MAT_AMOUNT,
    label: '재료비',
    minWidth: 100,
    align: 'right',
    // format: (rawMatAmount: string, quantity: number) => (Number(rawMatAmount) * quantity).toLocaleString('ko-KR')
  },
  {
    id: ClientSalesColumn.TOTAL_MANUFACTURE_AMOUNT,
    label: '가공비',
    minWidth: 100,
    align: 'right',
    // format: (manufactureAmount: string, quantity: number) => (Number(manufactureAmount) * quantity).toLocaleString('ko-KR')
  },
  {
    id: ClientSalesColumn.PRODUCT_LENGTH,
    label: '길이',
    minWidth: 100,
    align: 'right',
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
  // TODO: 미수금 현황 api로 받아온 후 잔액 부분 업데이트

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
    setReports(res.data.data?.reports);
    setAmount({
      totalPayingAmount: res.data.data?.totalPayingAmount,
      totalSalesAmount: res.data.data?.totalSalesAmount,
    })

    const getOutstanding = await axiosInstance.get(`/company/receivable?orderBy=desc&startAt=${date.startAt.format('YYYY-MM-DD')}`)
    let outstanding = Number(getOutstanding.data.data.find((item) => item.companyName === companyName)?.outstandingAmount);

    const data = res.data.data.reports?.map((item) => {
      const raw = Number(item.rawMatAmount) || 0;
      const manu = Number(item.manufactureAmount) || 0;
      const quantity = item.quantity;

      const materialPrice = raw * quantity;
      const processingPrice = manu * quantity;
      const total = materialPrice + processingPrice;

      outstanding = isNaN(outstanding) ? total : outstanding + total;

      return {
        'date': item.createdAt.split('T')[0],
        'item': item.productName,
        'size': item.scale,
        'count': item.quantity,
        'material-price': materialPrice,
        'processing-price': processingPrice,
        'amount': total,
        'remaining-amount' : outstanding,
      }
    }) ?? [];
    setPrintData({
      data,
      'companyName': companyName,
      'startAt': date.startAt.format('YYYY-MM-DD'),
      'endAt': date.endAt.format('YYYY-MM-DD'),
    })
  }

  useEffect(() => {
    const getCompanies = async () => {
      try {
        const res = await axiosInstance.get('/company?orderBy=desc');
        setSalesCompanyList(res.data.data);
      } catch {
        alert('새로고침 요망');
      }
    }
    getCompanies();
  }, []);

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
                    <TableCell align='right'>{printData?.data[rowIdx]?.amount.toLocaleString() || '-'}</TableCell>
                    <TableCell align='right'>{printData?.data[rowIdx]['remaining-amount']?.toLocaleString() || '-'}</TableCell>
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