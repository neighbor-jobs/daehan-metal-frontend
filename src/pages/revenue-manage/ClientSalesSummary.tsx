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
import DateRangePicker from '../../components/DateRangePicker';

// projects
import {ClientSalesSummaryColumn, TableColumns} from '../../types/tableColumns';
import PrintButton from '../../layout/PrintButton.tsx';
import {AxiosResponse} from 'axios';
import axiosInstance from '../../api/axios.ts';
import {useEffect, useState} from 'react';
import dayjs from 'dayjs';
import {formatCurrency} from '../../utils/format.ts';

const columns: readonly TableColumns<ClientSalesSummaryColumn>[] = [
  {
    id: ClientSalesSummaryColumn.COMPANY_NAME,
    label: '거래처명',
    minWidth: 100,
  },
  {
    id: ClientSalesSummaryColumn.TOTAL_RAW_MAT_AMOUNT,
    label: '재료비',
    minWidth: 100,
    align: 'right',
    typoSx: {color: 'blue'},
    format: formatCurrency
  },
  {
    id: ClientSalesSummaryColumn.TOTAL_MANUFACTURE_AMOUNT,
    label: '가공비',
    minWidth: 100,
    align: 'right',
    typoSx: {color: 'darkorange'},
    format: formatCurrency
  },
  {
    id: ClientSalesSummaryColumn.TOTAL_VAT_AMOUNT,
    label: '세액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ClientSalesSummaryColumn.TOTAL_DELIVERY_CHARGE,
    label: '운임비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
];


const ClientSalesSummary = (): React.JSX.Element => {
  const [clientSalesSumList, setClientSalesSumList] = useState([]);
  const [footer, setFooter] = useState({
    sumRaw: 0,
    sumManu: 0,
    sumVat: 0,
    sumDelivery: 0,
    sumSales: 0,
    sumPaying: 0,
    sumRemaining: 0,
  });
  const [date, setDate] = useState({
    startAt: dayjs().startOf('month'),
    endAt: dayjs(),
  });
  const [printData, setPrintData] = useState<{
    data: any[];
    footerData: any;
    startAt: string;
    endAt: string;
  } | null>(null);

  const handleDateChange = (start: dayjs.Dayjs | null, end: dayjs.Dayjs | null) => {
    if (!start || !end) return;
    setDate({startAt: start, endAt: end});
  };

  const getClientSalesSumList = async (startAt: string, endAt: string) => {
    const res: AxiosResponse = await axiosInstance.get(
      `receipt/company/sales/summary/report?orderBy=asc&startAt=${startAt}&endAt=${endAt}`
    );
    setClientSalesSumList(res.data.data);

    let sumRaw = 0, sumManu = 0, sumVat = 0, sumDelivery = 0, sumPaying = 0

    const data = res.data.data?.map((item) => {
      const raw   = Number(item.totalRawMatAmount) || 0;
      const manu  = Number(item.totalManufactureAmount) || 0;
      const vat   = Number(item.totalVatAmount) || 0;
      const del   = Number(item.totalDeliveryCharge) || 0;

      sumRaw += raw;
      sumManu += manu;
      sumVat += vat;
      sumDelivery += del;
      sumPaying += Number(item.totalPayingAmount);

      return {
        'company-name': item.companyName,
        'material-price': raw,
        'processing-price': manu,
        'vat-price': item.totalVatAmount,
        'delivery-charge' : item.totalDeliveryCharge,
        'paying-amount': item.totalPayingAmount,
        'total-amount': raw + manu + vat + del,
        'remaining-amount': raw + manu + vat + del - Number(item.totalPayingAmount),
      }
    }) ?? [];
    const footerData = {
      sumRaw: sumRaw,
      sumManu: sumManu,
      sumVat: sumVat,
      sumDelivery: sumDelivery,
      sumSales: sumRaw + sumManu + sumVat + sumDelivery,
      sumPaying: sumPaying,
      sumRemaining: sumRaw + sumManu + sumVat + sumDelivery - sumPaying,
    }
    setFooter(footerData);

    setPrintData({
      data,
      footerData,
      'startAt': date.startAt.format('YYYY-MM-DD'),
      'endAt': date.endAt.format('YYYY-MM-DD'),
    })

  }

  useEffect(() => {
    getClientSalesSumList(date.startAt.format('YYYY-MM-DD'), date.endAt.format('YYYY-MM-DD'));
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
        <DateRangePicker onChange={handleDateChange}
                         startAt={date.startAt}
                         endAt={date.endAt}
        />
        <Button
          variant="outlined"
          onClick={() => getClientSalesSumList(date.startAt.format('YYYY-MM-DD'), date.endAt.format('YYYY-MM-DD'))}
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
                <TableCell align='right'>총액</TableCell>
                <TableCell align='right'>입금액</TableCell>
                <TableCell align='right'>잔액</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientSalesSumList &&
                clientSalesSumList.map((row, idx) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={`${row.id}-${idx}`}>
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
                      {/* 총액 */}
                      <TableCell align='right'>
                        {(Number(row.totalManufactureAmount)
                          + Number(row.totalRawMatAmount)
                          + Number(row.totalVatAmount)
                          + Number(row.totalDeliveryCharge))
                          .toLocaleString('ko-KR')}
                      </TableCell>
                      {/* 입금액 */}
                      <TableCell align='right'>
                        {Number(row.totalPayingAmount).toLocaleString('ko-KR')}
                      </TableCell>
                      {/* 잔액 */}
                      <TableCell align='right'>
                        {(Number(row.totalManufactureAmount)
                          + Number(row.totalRawMatAmount)
                          + Number(row.totalVatAmount)
                          + Number(row.totalDeliveryCharge)
                          - Number(row.totalPayingAmount))
                          .toLocaleString('ko-KR')}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
            <TableFooter sx={{bottom: 0, position: 'sticky', backgroundColor: 'white'}}>
              <TableRow>
                <TableCell sx={{borderTop: '2px solid lightgray'}}>
                  <Typography variant='body2' color='black'>합계</Typography>
                </TableCell>
                <TableCell sx={{borderTop: '2px solid lightgray'}} align='right'>
                  <Typography variant='body2' color='blue'>{footer.sumRaw.toLocaleString()}</Typography>
                </TableCell>
                <TableCell sx={{borderTop: '2px solid lightgray'}} align='right'>
                  <Typography variant='body2' color='darkorange'>{footer.sumManu.toLocaleString()}</Typography>
                </TableCell>
                <TableCell sx={{borderTop: '2px solid lightgray'}} align='right'>
                  <Typography variant='body2' color='black'>{footer.sumVat.toLocaleString()}</Typography>
                </TableCell>
                <TableCell sx={{borderTop: '2px solid lightgray'}} align='right'>
                  <Typography variant='body2' color='black'>{footer.sumDelivery.toLocaleString()}</Typography>
                </TableCell>
                <TableCell sx={{borderTop: '2px solid lightgray'}} align='right'>
                  <Typography variant='body2' color='black'>{footer.sumSales.toLocaleString()}</Typography>
                </TableCell>
                <TableCell sx={{borderTop: '2px solid lightgray'}} align='right'>
                  <Typography variant='body2' color='black'>{footer.sumPaying.toLocaleString()}</Typography>
                </TableCell>
                <TableCell sx={{borderTop: '2px solid lightgray'}} align='right'>
                  <Typography variant='body2' color='black'>{footer.sumRemaining.toLocaleString()}</Typography>
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

export default ClientSalesSummary;