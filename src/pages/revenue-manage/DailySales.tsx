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

// project
import DateRangePicker from '../../components/DateRangePicker';
import {DailySalesColumn, TableColumns} from '../../types/tableColumns';
import {formatCurrency, formatDecimal} from '../../utils/format';
import {useEffect, useState} from 'react';
import axiosInstance from '../../api/axios.ts';
import {AxiosResponse} from 'axios';
import dayjs from 'dayjs';

const columns: readonly TableColumns<DailySalesColumn>[] = [
  {
    id: DailySalesColumn.DATE,
    label: '날짜',
    minWidth: 100,
    format: (date) => date.split('T')[0],
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
    minWidth: 100,
    align: 'right',
    format: formatDecimal
  },
  {
    id: DailySalesColumn.RAW_MAT_AMOUNT,
    label: '재료단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: DailySalesColumn.MANUFACTURE_AMOUNT,
    label: '가공단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: DailySalesColumn.PRODUCT_LENGTH,
    label: '길이',
    minWidth: 100,
    align: 'right',
    format: formatDecimal
  },

];

const DailySales = () => {
  const [dailySalesList, setDailySalesList] = useState([]);
  const [date, setDate] = useState({
    startAt: dayjs(),
    endAt: dayjs(),
  });

  const handleDateChange = (start: dayjs.Dayjs | null, end: dayjs.Dayjs | null) => {
    if (!start || !end) return;
    setDate({ startAt: start, endAt: end });
  };

  const getDailySalesList = async (startAt: string, endAt: string) => {
    const res: AxiosResponse = await axiosInstance.get(`/receipt/daily/report?orderBy=desc&startAt=${startAt}&endAt=${endAt}`);
    setDailySalesList(res.data.data.reports);
  }

  const handleSearch = () => {
    getDailySalesList(date.startAt.format('YYYY-MM-DD'), date.endAt.format('YYYY-MM-DD'));
  };

  useEffect(() => {
    getDailySalesList(date.startAt.format('YYYY-MM-DD'), date.endAt.format('YYYY-MM-DD'));
  },[])

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
                <TableCell colSpan={2}>합계</TableCell>
                <TableCell align='right'>재료비</TableCell>
                <TableCell align='right'>가공비</TableCell>
                <TableCell colSpan={2} align='right' />
                <TableCell align='right'>총합</TableCell>
                <TableCell colSpan={2} align='right'></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default DailySales;
