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
import { DailySalesColumn } from '../../types/tableColumns';
import { formatCurrency, formatDecimal } from '../../utils/format';
import dailySalesMock from '../../mock/revenue-manage/dailySalesMock.ts';

const columns: readonly DailySalesColumn[] = [
  {
    id: 'date',
    label: '날짜',
    minWidth: 100
  },
  {
    id: 'client',
    label: '거래처명',
    minWidth: 170
  },
  {
    id: 'item',
    label: '품명',
    minWidth: 170,
  },
  {
    id: 'size',
    label: '규격',
    minWidth: 140,
  },
  {
    id: 'count',
    label: '수량',
    minWidth: 100,
    align: 'right',
    format: formatDecimal
  },
  {
    id: 'material-price',
    label: '재료비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: 'processing-price',
    label: '가공비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: 'vcut-count',
    label: 'V컷수',
    minWidth: 100,
    align: 'right',
    format: formatDecimal
  },
  {
    id: 'length',
    label: '길이',
    minWidth: 100,
    align: 'right',
    format: formatDecimal
  },
  {
    id: 'unit-price',
    label: '단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: 'total-amount',
    label: '금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: 'paying-amount',
    label: '입금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
];

const rows = dailySalesMock;

const DailySales = () => {

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginX: 3,
      }}>
        {/* date picker */}
        <DateRangePicker onChange={() => console.log('render')}/>
        <Button
          variant="outlined"
          onClick={() => console.log('search')}
        >
          확인
        </Button>
      </Box>
      <Paper sx={{width: '100%', overflow: 'hidden', flexGrow: 1}}>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .map((row, rowIndex) => {
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
                    </TableRow>
                  );
                })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}>합계</TableCell>
                <TableCell align='right'>재료비</TableCell>
                <TableCell align='right'>가공비</TableCell>
                <TableCell colSpan={3} align='right' />
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
