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
  TableRow
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
    format: formatCurrency
  },
  {
    id: ClientSalesSummaryColumn.TOTAL_MANUFACTURE_AMOUNT,
    label: '가공비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ClientSalesSummaryColumn.TOTAL_PAYING_AMOUNT,
    label: '입금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
];


const ClientSalesSummary = ():React.JSX.Element => {
  const [clientSalesSumList, setClientSalesSumList] = useState([]);
  const [date, setDate] = useState({
    startAt: dayjs(),
    endAt: dayjs(),
  });
  const [printData, setPrintData] = useState<{
    data: any[];
    startAt: string;
    endAt: string;
  } | null>(null);

  const handleDateChange = (start: dayjs.Dayjs | null, end: dayjs.Dayjs | null) => {
    if (!start || !end) return;
    setDate({ startAt: start, endAt: end });
  };

  const getClientSalesSumList = async (startAt: string, endAt: string) => {
    const res: AxiosResponse = await axiosInstance.get(
      `receipt/company/sales/summary/report?orderBy=desc&startAt=${startAt}&endAt=${endAt}`
    );
    console.log('get client sales sum data: ', res.data.data);
    setClientSalesSumList(res.data.data);

    const data = res.data.data?.map((item) => {
      // TODO: NaN 처리 추가
      const raw = Number(item.totalRawMatAmount) || 0;
      const manu = Number(item.totalManufactureAmount) || 0;

      return {
        'company-name': item.companyName,
        'material-price': raw,
        'processing-price': manu,
        'paying-amount': item.totalPayingAmount,
        'total-amount' : raw + manu,
        'remaining-amount' : raw + manu - Number(item.totalPayingAmount),
      }
    }) ?? [];
    setPrintData({
      data,
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
                <TableCell align='right'>총액</TableCell>
                <TableCell align='right'>잔액</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientSalesSumList &&
                clientSalesSumList.map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1}>
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
                        {(Number(row.totalManufactureAmount) + Number(row.totalRawMatAmount)).toLocaleString('ko-KR')}
                      </TableCell>
                      <TableCell align='right'>
                        {(Number(row.totalManufactureAmount) + Number(row.totalRawMatAmount)-Number(row.totalPayingAmount)).toLocaleString('ko-KR')}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>합계</TableCell>
                <TableCell align='right'>재료비</TableCell>
                <TableCell align='right'>가공비</TableCell>
                <TableCell align='right'>금액</TableCell>
                <TableCell align='right'>수금액</TableCell>
                <TableCell align='right'>잔액</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
      <PrintButton printData={printData} ></PrintButton>
    </Box>
  )
}

export default ClientSalesSummary;