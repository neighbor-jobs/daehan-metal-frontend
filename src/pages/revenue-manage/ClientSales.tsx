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
   TextField,
  Typography
} from '@mui/material';
import DateRangePicker from '../../components/DateRangePicker.tsx';
import PrintButton from '../../layout/PrintButton.tsx';
import React, {useCallback, useEffect, useState} from 'react';
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
    typoSx: {color: 'blue'},
    format: (value: number) => value.toLocaleString(),
  },
  {
    id: ClientSalesColumn.TOTAL_MANUFACTURE_AMOUNT,
    label: '가공비',
    minWidth: 100,
    align: 'right',
    typoSx: {color: 'darkorange'},
    format: (value: number) => value.toLocaleString(),
  },
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
  const [outstandingBeforeOneDay, setOutstandingBeforeOneDay] = useState(0);
  const [printData, setPrintData] = useState<{
    data: any[];
    companyName: string;
    startAt: string;
    endAt: string;
  } | null>(null);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState<boolean>(false);
  const {showAlert} = useAlertStore();

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
    const {startAt} = date;
    const isFirstDay = startAt.date() === 1;

    const salesStartAt = startAt.startOf('month');
    const salesEndAt = isFirstDay ? startAt : startAt.subtract(1, 'day');

    // carryover 조회
    const carryoverRes = await axiosInstance.get(
      `/company/receivable?orderBy=asc&startAt=${startAt.format('YYYY-MM-DD')}`
    );
    const carryoverAmount =
      Number(
        carryoverRes.data.data?.find((item) => item.companyName === companyName)?.carryoverAmount
      ) || 0;

    // sales amount 조회
    let rawAmount = 0;
    let manuAmount = 0;

    if (!isFirstDay) {
      const salesRes: AxiosResponse = await axiosInstance.get(
        `receipt/company/sales/summary/report?orderBy=asc&startAt=${salesStartAt.format('YYYY-MM-DD')}&endAt=${salesEndAt.format('YYYY-MM-DD')}`
      );
      const salesAmount = salesRes.data.data?.find(
        (item) => item.companyName === companyName
      );
      rawAmount = Number(salesAmount?.totalRawMatAmount || 0);
      manuAmount = Number(salesAmount?.totalManufactureAmount || 0);
    }

    let outstanding = carryoverAmount + rawAmount + manuAmount;
    setOutstandingBeforeOneDay(outstanding);

    const data = (res.data.data.reports?.map((item) => {
      const raw = Number(item.rawMatAmount) || 0;
      const manu = Number(item.manufactureAmount) || 0;
      const quantity = item.quantity;

      const materialPrice = Math.round(raw * quantity);
      const processingPrice = Math.trunc(manu * quantity);
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
        'remainingAmount': outstanding,
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
  // console.log(printData);

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
          sx={{width: 200}}
          options={salesCompanyList.map((option) => option.companyName)}
          value={companyName}
          onChange={handleCompanyChange}
          onOpen={() => setIsAutocompleteOpen(true)}
          onClose={() => setIsAutocompleteOpen(false)}
          renderInput={(params) =>
            <TextField {...params}
                       placeholder='거래처명' size='small'
                       sx={{minWidth: 150}}
                       slotProps={{
                         htmlInput: {
                           onKeyDown: async (e: React.KeyboardEvent<HTMLInputElement>) => {
                             if (e.key === 'Enter') {
                               if (!isAutocompleteOpen) {
                                 setTimeout(() => {
                                   getClientSales();
                                 }, 0);
                               }
                             }
                           },
                           ...params.inputProps
                         }
                       }}
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
                    <Typography variant="body2"
                                sx={column.typoSx || undefined}
                    >
                      {column.label}
                    </Typography>
                  </TableCell>
                ))}
                <TableCell align='right' sx={{minWidth: 80}}>금액</TableCell>
                <TableCell align='right' sx={{minWidth: 80}}>잔액</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell/>
                <TableCell align='left'>전일이월</TableCell>
                <TableCell/>
                <TableCell/>
                <TableCell/>
                <TableCell/>
                <TableCell/>
                <TableCell align='right'>{outstandingBeforeOneDay.toLocaleString()}</TableCell>
              </TableRow>
              {reports && reports.map((row, rowIdx) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={rowIdx}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format ?
                            <Typography variant='body2' sx={column.typoSx || undefined}>
                              {column.format(value)}
                            </Typography>
                            : <Typography variant='body2' sx={column.typoSx || undefined}>
                              {value}
                            </Typography>
                          }
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
      <PrintButton printData={printData}/>
    </Box>
  );
}
export default ClientSales;