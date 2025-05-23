// UI
import {
  Box,
  Button,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow
} from '@mui/material';

// project
import {ClientOutstandingBalanceColumn, TableColumns} from '../../types/tableColumns';
import PrintButton from '../../layout/PrintButton.tsx';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {useEffect, useState} from 'react';
import axiosInstance from '../../api/axios.ts';
import {AxiosResponse} from 'axios';
import {formatCurrency} from '../../utils/format.ts';

const columns: readonly TableColumns<ClientOutstandingBalanceColumn>[] = [
  {
    id: ClientOutstandingBalanceColumn.COMPANY_NAME,
    label: '거래처명',
    minWidth: 100,
  },
  {
    id: ClientOutstandingBalanceColumn.CARRYOVER_AMOUNT,
    label: '이월액',
    align: 'right',
    minWidth: 100,
    format: formatCurrency,
  },
  {
    id: ClientOutstandingBalanceColumn.SALES_AMOUNT,
    label: '매출액',
    align: 'right',
    minWidth: 100,
    format: formatCurrency,
  },
  {
    id: ClientOutstandingBalanceColumn.PAYING_AMOUNT,
    label: '입금액',
    align: 'right',
    minWidth: 100,
    format: formatCurrency,
  },
  {
    id: ClientOutstandingBalanceColumn.OUTSTANDING_AMOUNT,
    label: '미수금',
    align: 'right',
    minWidth: 100,
    format: formatCurrency,
  },
  {
    id: ClientOutstandingBalanceColumn.PHONE_NUMBER,
    label: '전화번호',
    minWidth: 100,
  }
];

const ClientOutstandingBalance = ():React.JSX.Element => {
  const [startAt, setStartAt] = useState(dayjs());
  const [data, setData] = useState([]);
  const [tableFooter, setTableFooter] = useState({
    sumSalesAmount: 0,
    sumPayingAmount: 0,
    sumCarryoverAmount: 0,
    sumOutstandingAmount: 0,
  });
  const [printData, setPrintData] = useState<{
    startAt: string,
    data: any[],
    sumSalesAmount: string,
    sumPayingAmount: string,
    sumCarryoverAmount: string,
    sumOutstandingAmount: string,
  } | null>();

  const getClientReceivable = async () => {
    let s: number = 0, p: number =0, c: number =0, o: number = 0;
    const res: AxiosResponse = await axiosInstance.get(`/company/receivable?orderBy=asc&startAt=${startAt.format('YYYY-MM-DD')}`)
    res.data.data.map(item => {
      s += Number(item.salesAmount);
      p += Number(item.payingAmount);
      c += Number(item.carryoverAmount);
      o += Number(item.outstandingAmount);
    })
    setData(res.data.data);
    setTableFooter({
      sumSalesAmount: s,
      sumPayingAmount: p,
      sumCarryoverAmount: c,
      sumOutstandingAmount: o
    })
    setPrintData({
      data: res.data.data,
      startAt: startAt.format('YYYY-MM-DD'),
      sumSalesAmount: s.toLocaleString(),
      sumPayingAmount: p.toLocaleString(),
      sumCarryoverAmount: c.toLocaleString(),
      sumOutstandingAmount: o.toLocaleString()
    })
  }

  useEffect(() => {
    getClientReceivable();
  }, []);

  // debug

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginX: 3,
        marginY: 1,
      }}>
        {/* date picker */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <InputLabel sx={{fontSize: 'small',}}>검색일자</InputLabel>
            <DesktopDatePicker
              views={['month']}
              format="YYYY/MM"
              defaultValue={dayjs()}
              onChange={(value) => setStartAt(value)}
              slotProps={{
                textField: {size: 'small'},
                calendarHeader: {format: 'YYYY/MM'},
              }}
            />
          </Box>
        </LocalizationProvider>
        <Button
          variant="outlined"
          onClick={getClientReceivable}
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
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .map((row, rowIdx) => {
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
                    </TableRow>
                  );
                })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>합계</TableCell>
                <TableCell align='right'>{tableFooter.sumCarryoverAmount.toLocaleString()}</TableCell>
                <TableCell align='right'>{tableFooter.sumSalesAmount.toLocaleString()}</TableCell>
                <TableCell align='right'>{tableFooter.sumPayingAmount.toLocaleString()}</TableCell>
                <TableCell align='right'>{tableFooter.sumOutstandingAmount.toLocaleString()}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
      <PrintButton printData={printData}></PrintButton>
    </Box>
  )
}

export default ClientOutstandingBalance;