// UI
import {
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
  Typography
} from '@mui/material';

// project
import DateRangePicker from '../../components/DateRangePicker';
import {DailySalesColumn, TableColumns} from '../../types/tableColumns';
import {formatCurrency} from '../../utils/format';
import {useEffect, useState} from 'react';
import axiosInstance from '../../api/axios.ts';
import {AxiosResponse} from 'axios';
import dayjs from 'dayjs';
import {DailySalesReceiptItem, DailySalesReportsItem} from '../../types/RevenueRes.ts';
import PrintButton from '../../layout/PrintButton.tsx';
import {RevenueManageMenuType} from '../../types/headerMenu.ts';

const columns: readonly TableColumns<DailySalesColumn>[] = [
  {
    id: DailySalesColumn.DATE,
    label: '날짜',
    minWidth: 80,
    format: (date: string) => date.split('T')[0] || '',
  },
  {
    id: DailySalesColumn.COMPANY_NAME,
    label: '거래처명',
    minWidth: 170
  },
  {
    id: DailySalesColumn.PRODUCT_NAME,
    label: '품명',
    minWidth: 170,
  },
  {
    id: DailySalesColumn.SCALE,
    label: '규격',
    minWidth: 140,
  },
  {
    id: DailySalesColumn.QUANTITY,
    label: '수량',
    minWidth: 70,
    align: 'right',
  },
  {
    id: DailySalesColumn.RAW_MAT_AMOUNT,
    label: '재료단가',
    minWidth: 80,
    align: 'right',
  },
  {
    id: DailySalesColumn.TOTAL_RAW_MAT_AMOUNT,
    label: '재료비',
    minWidth: 90,
    align: 'right',
    typoSx: {color: 'blue'},
  },
  {
    id: DailySalesColumn.MANUFACTURE_AMOUNT,
    label: '가공단가',
    minWidth: 80,
    align: 'right',
  },
  {
    id: DailySalesColumn.TOTAL_MANUFACTURE_AMOUNT,
    label: '가공비',
    minWidth: 90,
    align: 'right',
    typoSx: {color: 'darkorange'},
  },
  {
    id: DailySalesColumn.VAT_AMOUNT,
    label: '세액',
    minWidth: 80,
    align: 'right',
  },
  {
    id: DailySalesColumn.DELIVERY_CHARGE,
    label: '운임비',
    minWidth: 80,
    align: 'right',
  }
];

const DailySales = () => {
  const [dailySalesList, setDailySalesList] = useState([]);
  const [amount, setAmount] = useState({
    totalManufactureAmount: "0",
    totalRawMatAmount: "0",
    totalDeliveryCharge: "0",
    totalVatAmount: "0",
    totalPayingAmount: 0,
  });
  const [date, setDate] = useState({
    startAt: dayjs(),
    endAt: dayjs(),
  });

  const handleDateChange = (start: dayjs.Dayjs | null, end: dayjs.Dayjs | null) => {
    if (!start || !end) return;
    setDate({startAt: start, endAt: end});
  };

  const getDailySalesList = async (startAt: string, endAt: string) => {
    const res: AxiosResponse = await axiosInstance.get(`/receipt/daily/report?orderBy=desc&startAt=${startAt}&endAt=${endAt}`);
    const receipts: DailySalesReceiptItem[] = res.data.data?.receipts;
    const updatedList = receipts.flatMap((item: DailySalesReceiptItem) => {
      const sales = item.reports.map((r: DailySalesReportsItem) => ({
        ...r,
        totalRawMatAmount: Math.round(Number(r.rawMatAmount) * r.quantity),
        totalManufactureAmount: Math.trunc(Number(r.manufactureAmount) * r.quantity),
      }));
      if (!item.payingAmount || item.payingAmount === '0')
        return [...sales];
      const paying = {
        createdAt: item.createdAt,
        companyName: item.companyName,
        productName: '입금액',
        scale: '',
        payingAmount: item.payingAmount,
      }
      return [...sales, paying];
    });
    const totalPayingAmount = receipts.reduce(
      (sum, r) => sum + Number(r.payingAmount ?? 0),
      0
    );

    setDailySalesList(updatedList);
    setAmount({
      totalManufactureAmount: res.data.data.totalManufactureAmount,
      totalRawMatAmount: res.data.data.totalRawMatAmount,
      totalVatAmount: res.data.data.totalVatAmount,
      totalDeliveryCharge: res.data.data.totalDeliveryCharge,
      totalPayingAmount: totalPayingAmount,
    })
  }

  const handleSearch = async () => {
    await getDailySalesList(date.startAt.format('YYYY-MM-DD'), date.endAt.format('YYYY-MM-DD'));
  };

  useEffect(() => {
    getDailySalesList(date.startAt.format('YYYY-MM-DD'), date.endAt.format('YYYY-MM-DD'));
  }, [])

  // debug

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginX: 3,
      }}>
        {/* date picker */}
        <DateRangePicker
          onChange={handleDateChange}
          startAt={date.startAt}
          endAt={date.endAt}
        />
        <Button
          variant="outlined"
          onClick={handleSearch}
        >
          확인
        </Button>
      </Box>
      <Paper sx={{width: '100%', overflow: 'hidden', flexGrow: 1}}>
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
                <TableCell align='right'
                           sx={{minWidth: 100}}
                >
                  금액
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dailySalesList &&
                dailySalesList.map((row, rowIndex) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                      {columns.map((column) => {
                        let value = row[column.id];
                        if (row.productName !== '입금액') {
                          if (column.id === DailySalesColumn.RAW_MAT_AMOUNT
                            || column.id === DailySalesColumn.TOTAL_RAW_MAT_AMOUNT
                            || column.id === DailySalesColumn.MANUFACTURE_AMOUNT
                            || column.id === DailySalesColumn.TOTAL_MANUFACTURE_AMOUNT
                            || column.id === DailySalesColumn.VAT_AMOUNT
                            || column.id === DailySalesColumn.DELIVERY_CHARGE
                          ) {
                            value = formatCurrency(value);
                          }
                        }
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
                      <TableCell align='right'>
                        {row.productName === '입금액' ?
                          ((-Number(row.payingAmount)).toLocaleString())
                          : (
                            Math.round(Number(row.rawMatAmount) * row.quantity)
                            + Math.trunc(Number(row.manufactureAmount) * row.quantity)
                            + Number(row.vatAmount)
                            + Number(row.deliveryCharge)
                          ).toLocaleString('ko-KR')
                        }
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
            <TableFooter sx={{bottom: 0, position: 'sticky', backgroundColor: 'white'}}>
              <TableRow>
                <TableCell colSpan={6}>합계</TableCell>
                {/* 재료비 합계 */}
                <TableCell align='right'>
                  <Typography variant='body2' color='blue'>
                    {`${formatCurrency(amount.totalRawMatAmount)}`}
                  </Typography>
                </TableCell>
                <TableCell/>
                {/* 가공비 합게 */}
                <TableCell align='right'>
                  <Typography variant='body2' color='darkorange'>
                    {`${formatCurrency(amount.totalManufactureAmount)}`}
                  </Typography>
                </TableCell>
                {/* 세액 합계 */}
                <TableCell align='right'>
                  <Typography variant='body2' color='black'>
                    {`${formatCurrency(amount.totalVatAmount)}`}
                  </Typography>
                </TableCell>
                {/* 운임비 합계 */}
                <TableCell align='right'>
                  <Typography variant='body2' color='black'>
                    {`${formatCurrency(amount.totalDeliveryCharge)}`}
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='body2' color='black'>
                    {`${(Number(amount.totalManufactureAmount)
                      + Number(amount.totalRawMatAmount)
                      + Number(amount.totalVatAmount)
                      + Number(amount.totalDeliveryCharge)
                      - amount.totalPayingAmount
                      ).toLocaleString()}`
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>

      {/* 인쇄 */}
      <Box sx={{ mx: 1, my: 1, display: 'flex', gap: 2}}>
        <PrintButton value='인쇄'
                     printData={{
                       startAt: date.startAt.format('YYYY-MM-DD'),
                       endAt: date.endAt.format('YYYY-MM-DD'),
                       dailySalesList,
                       amount
                     }}
                     propType={RevenueManageMenuType.DailySales}
        />
      </Box>
    </Box>
  );
}

export default DailySales;
