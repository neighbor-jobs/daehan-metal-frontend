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
import {formatCurrency} from '../../utils/format.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {DailySalesReceiptItem, DailySalesReportsItem} from '../../types/RevenueRes.ts';

const columns: readonly TableColumns<ClientSalesColumn>[] = [
  {
    id: ClientSalesColumn.DATE,
    label: '날짜',
    minWidth: 100,
    format: (value: string) => value?.split('T')[0]
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
  },
  {
    id: ClientSalesColumn.TOTAL_RAW_MAT_AMOUNT,
    label: '재료비',
    minWidth: 100,
    align: 'right',
    typoSx: {color: 'blue'},
    format: (value: number) => value?.toLocaleString(),
  },
  {
    id: ClientSalesColumn.TOTAL_MANUFACTURE_AMOUNT,
    label: '가공비',
    minWidth: 100,
    align: 'right',
    typoSx: {color: 'darkorange'},
    format: (value: number) => value?.toLocaleString(),
  },
  {
    id: ClientSalesColumn.VAT_AMOUNT,
    label: '세액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ClientSalesColumn.DELIVERY_CHARGE,
    label: '운임비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  }
];

const ClientSales = (): React.JSX.Element => {
  const [salesCompanyList, setSalesCompanyList] = useState([]);
  const [date, setDate] = useState({
    startAt: dayjs().startOf('month'),
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
    outstandingBeforeOneDay: number;
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
    let vatAmount = 0;
    let delAmount = 0;

    if (!isFirstDay) {
      const salesRes: AxiosResponse = await axiosInstance.get(
        `receipt/company/sales/summary/report?orderBy=asc&startAt=${salesStartAt.format('YYYY-MM-DD')}&endAt=${salesEndAt.format('YYYY-MM-DD')}`
      );
      const salesAmount = salesRes.data.data?.find(
        (item) => item.companyName === companyName
      );
      rawAmount = Number(salesAmount?.totalRawMatAmount || 0);
      manuAmount = Number(salesAmount?.totalManufactureAmount || 0);
      vatAmount = Number(salesAmount?.totalVatAmount || 0);
      delAmount = Number(salesAmount?.totalDeliveryCharge || 0);
    }

    const initOutstanding = carryoverAmount + rawAmount + manuAmount + vatAmount + delAmount;
    let outstanding = carryoverAmount + rawAmount + manuAmount + vatAmount + delAmount;
    setOutstandingBeforeOneDay(outstanding);

    const receipts: DailySalesReceiptItem[] = res.data.data?.receipts;
    const data = receipts?.flatMap((item: DailySalesReceiptItem) => {
      const sales = item.reports.map((r: DailySalesReportsItem) => {
        const totalRaw: number = Math.round(Number(r.rawMatAmount) * r.quantity);
        const totalManufacture: number = Math.trunc(Number(r.manufactureAmount) * r.quantity);
        const totalAmount: number = Number(r.vatAmount) + Number(r.deliveryCharge) + totalRaw + totalManufacture
        outstanding = isNaN(outstanding) ? totalAmount : outstanding + totalAmount;
        return {
          ...r,
          rawMatAmount: totalRaw,
          manufactureAmount: totalManufacture,
          amount: totalAmount,
          remainingAmount: outstanding
        };
      });
      // console.log('sales: ', sales);

      if (!item.payingAmount || item.payingAmount === '0')
        return [...sales];

      outstanding -= Number(item.payingAmount);
      const paying = {
        createdAt: item?.createdAt,
        companyName: item?.companyName,
        productName: '입금액',
        scale: '',
        amount: -Number(item.payingAmount),
        remainingAmount: outstanding,
        totalBalance: item.totalBalance
      }
      // console.log([...sales, paying]);
      return [...sales, paying];
    })

    setReports(data);
    setPrintData({
      data,
      companyName: companyName,
      startAt: date.startAt.format('YYYY-MM-DD'),
      endAt: date.endAt.format('YYYY-MM-DD'),
      outstandingBeforeOneDay: initOutstanding
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
        <TableContainer sx={{maxHeight: '80vh', overflow: 'auto'}}>
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
                <TableCell/>
                <TableCell/>
                <TableCell align='right'>{outstandingBeforeOneDay.toLocaleString()}</TableCell>
              </TableRow>
              {reports && reports?.map((row, rowIdx) => {
                const balance = row.productName === '입금액' ? row.totalBalance + outstandingBeforeOneDay : row.balance + outstandingBeforeOneDay;

                // 이전 행의 날짜와 비교
                const prevDate = rowIdx > 0 ? reports[rowIdx - 1]?.createdAt?.split('T')[0] : null;
                const currentDate = row?.createdAt?.split('T')[0];
                const isNewDate = prevDate && currentDate !== prevDate;

                return (
                  <TableRow hover
                            role="checkbox"
                            tabIndex={-1}
                            key={rowIdx}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id}
                                   align={column.align}
                                   sx={{
                                     borderTop: isNewDate ? '1.5px solid lightgray' : undefined,
                                   }}
                        >
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
                    <TableCell align='right'
                               sx={{
                                 borderTop: isNewDate ? '1.5px solid lightgray' : undefined,
                               }}
                    >
                      {row.amount?.toLocaleString() ?? '-'}
                    </TableCell>
                    {/*<TableCell align='right'>{row.remainingAmount?.toLocaleString() ?? '-'}</TableCell>*/}
                    <TableCell align='right'
                               sx={{
                                 borderTop: isNewDate ? '1.5px solid lightgray' : undefined,
                               }}
                    >
                      {balance?.toLocaleString() ?? '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter sx={{bottom: 0, position: 'sticky', backgroundColor: 'white'}}>
              <TableRow>
                <TableCell colSpan={4} sx={{borderTop: '2px solid lightgray'}}>
                  합계
                </TableCell>
                <TableCell align='right' sx={{borderTop: '2px solid lightgray'}}>
                  <Typography color='black' fontSize={13}>매출액계 : </Typography>
                </TableCell>
                <TableCell align='right' sx={{borderTop: '2px solid lightgray'}}>
                  <Typography color='black' fontSize={13}>{formatCurrency(amount.totalSalesAmount)}</Typography>
                </TableCell>
                <TableCell align='right' sx={{borderTop: '2px solid lightgray'}}>
                  <Typography color='black' fontSize={13}>수금액계 : </Typography>
                </TableCell>
                <TableCell align='right' sx={{borderTop: '2px solid lightgray'}}>
                  <Typography color='black' fontSize={13}>{formatCurrency(amount.totalPayingAmount)}</Typography>
                </TableCell>
                <TableCell colSpan={2} sx={{borderTop: '2px solid lightgray'}}/>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{m: 1}}>
        <PrintButton printData={printData}/>
      </Box>
    </Box>
  );
}
export default ClientSales;