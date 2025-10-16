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
import DateRangePicker from '../../components/DateRangePicker';

// project
import {ItemSalesSummaryColumn, TableColumns} from '../../types/tableColumns';
import PrintButton from '../../layout/PrintButton.tsx';
import {useEffect, useState} from 'react';
import {AxiosResponse} from 'axios';
import axiosInstance from '../../api/axios.ts';
import dayjs from 'dayjs';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';

const columns: readonly TableColumns<ItemSalesSummaryColumn>[] = [
  {
    id: ItemSalesSummaryColumn.PRODUCT_NAME,
    label: '품명',
    minWidth: 170,
  },
  {
    id: ItemSalesSummaryColumn.SCALE,
    label: '규격',
    minWidth: 140,
  },
  {
    id: ItemSalesSummaryColumn.QUANTITY,
    label: '수량',
    minWidth: 100,
    align: 'right',
    format: formatDecimal,
  },
  {
    id: ItemSalesSummaryColumn.RAW_MAT_AMOUNT,
    label: '재료단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  }, {
    id: ItemSalesSummaryColumn.TOTAL_RAW_MAT_AMOUNT,
    label: '재료비',
    minWidth: 100,
    align: 'right',
    typoSx: {color: 'blue'},
    format: formatCurrency
  },
  {
    id: ItemSalesSummaryColumn.MANUFACTURE_AMOUNT,
    label: '가공단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ItemSalesSummaryColumn.TOTAL_MANUFACTURE_AMOUNT,
    label: '가공비',
    minWidth: 100,
    align: 'right',
    typoSx: {color: 'darkorange'},
    format: formatCurrency
  },
  {
    id: ItemSalesSummaryColumn.TOTAL_VAT_AMOUNT,
    label: '세액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ItemSalesSummaryColumn.TOTAL_DELIVERY_CHARGE,
    label: '운임비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ItemSalesSummaryColumn.TOTAL_SALES_AMOUNT,
    label: '금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  }
];

const ItemSalesSummary = (): React.JSX.Element => {
  const [itemSalesSumList, setItemSalesSumList] = useState([]);
  const [date, setDate] = useState({
    startAt: dayjs(),
    endAt: dayjs(),
  });
  const [tableFooter, setTableFooter] = useState({
    countSum: 0,
    rawSum: 0,
    manuSum: 0,
    vatSum: 0,
    delSum: 0,
    sum: 0,
  });
  const [printData, setPrintData] = useState<{
    data: any[];
    startAt: string;
    endAt: string;
    rawSum: number,
    manuSum: number,
    vatSum: number,
    delSum: number,
    sum: number,
  } | null>(null);

  const handleDateChange = (start: dayjs.Dayjs | null, end: dayjs.Dayjs | null) => {
    if (!start || !end) return;
    setDate({startAt: start, endAt: end});
  };

  const getItemSalesSumList = async () => {
    const res: AxiosResponse = await axiosInstance.get(`receipt/product/summary/report?orderBy=desc&startAt=${date.startAt.format('YYYY-MM-DD')}&endAt=${date.endAt.format('YYYY-MM-DD')}`);
    let c: number = 0, r: number = 0, m: number = 0, v: number = 0, d: number = 0, s: number = 0;
    const data = res.data.data.map((item) => {
      c += item.salesReport.quantity;
      r += Number(item.totalRawMatAmount);
      m += Number(item.totalManufactureAmount);
      s += Number(item.totalSalesAmount);
      v += Number(item.totalVatAmount);
      d += Number(item.totalDeliveryCharge)
      return {
        ...item.salesReport,
        totalManufactureAmount: item.totalManufactureAmount,
        totalRawMatAmount: item.totalRawMatAmount,
        totalSalesAmount: item.totalSalesAmount,
        totalDeliveryCharge: item.totalDeliveryCharge,
        totalVatAmount: item.totalVatAmount,
      }
    });
    setItemSalesSumList(data);
    setPrintData({
      data: data,
      startAt: date.startAt.format('YYYY-MM-DD'),
      endAt: date.endAt.format('YYYY-MM-DD'),
      rawSum: r,
      manuSum: m,
      vatSum: v,
      delSum: d,
      sum: s,
    })
    setTableFooter({
      countSum: c,
      rawSum: r,
      manuSum: m,
      vatSum: v,
      delSum: d,
      sum: s,
    })
  }

  useEffect(() => {
    getItemSalesSumList();
  }, []);

  // console.log(itemSalesSumList);

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
        <Button
          variant="outlined"
          onClick={getItemSalesSumList}
        >
          확인
        </Button>
      </Box>
      <Paper sx={{width: '100%', overflow: 'hidden'}}>
        <TableContainer sx={{overflow: 'auto', maxHeight: '80vh'}}>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {itemSalesSumList && itemSalesSumList.map((row, rowIndex) => {
                return (
                  <TableRow hover role="checkbox" key={rowIndex} tabIndex={-1}>
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
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter sx={{position: 'sticky', bottom: 0, backgroundColor: 'white'}}>
              <TableRow>
                <TableCell colSpan={2}><Typography color='black' fontSize={13}>합계</Typography></TableCell>
                {/* 수량 합계 */}
                <TableCell align='right'>
                  <Typography color='black' fontSize={13}>{tableFooter.countSum.toFixed(3)}</Typography></TableCell>
                <TableCell align='right'></TableCell>
                {/* 재료비 합계 */}
                <TableCell align='right'>
                  <Typography color='black' fontSize={13}>{tableFooter.rawSum.toLocaleString()}</Typography></TableCell>
                <TableCell align='right'></TableCell>
                {/* 가공비 합계 */}
                <TableCell align='right'>
                  <Typography color='black' fontSize={13}>{tableFooter.manuSum.toLocaleString()}</Typography>
                </TableCell>
                {/* 세액 합계*/}
                <TableCell align='right'>
                  <Typography color='black' fontSize={13}>{tableFooter.vatSum.toLocaleString()}</Typography>
                </TableCell>
                {/* 운임비 합계*/}
                <TableCell align='right'>
                  <Typography color='black' fontSize={13}>{tableFooter.delSum.toLocaleString()}</Typography>
                </TableCell>
                {/* 금액 합계 */}
                <TableCell align='right'>
                  <Typography color='black' fontSize={13}>{tableFooter.sum.toLocaleString()}</Typography>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{m: 1}}>
        <PrintButton printData={printData}></PrintButton>
      </Box>
    </Box>
  )
}

export default ItemSalesSummary;