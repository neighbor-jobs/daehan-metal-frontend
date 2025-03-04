import {ClientSalesColumn} from '../../types/tableColumns.ts';
import clientSalesMock from '../../mock/clientSalesMock.ts';
import {clientList} from '../../mock/clientList.ts';

// UI
import {
  Autocomplete,
  Box,
  TextField,
  Paper,
  Table,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Button, TableFooter
} from '@mui/material';
import DateRangePicker from '../../components/DateRangePicker.tsx';

const columns: readonly ClientSalesColumn[] = [
  {id: 'date', label: '날짜', minWidth: 100},
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
  },
  {
    id: 'material-price',
    label: '재료비',
    minWidth: 100,
    align: 'right',
  },
  {
    id: 'processing-price',
    label: '가공비',
    minWidth: 100,
    align: 'right',
  },
  {
    id: 'vcut-count',
    label: 'V컷수',
    minWidth: 100,
    align: 'right',
  },
  {
    id: 'length',
    label: '길이',
    minWidth: 100,
    align: 'right',
  },
  {
    id: 'unit-price',
    label: '단가',
    minWidth: 100,
    align: 'right',
  },
  {
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
  }
];


const ClientSales = (): React.JSX.Element => {
  const rows = clientSalesMock;

  // handler
  const handleSearch = () => {
    /* 날짜 & 업체명 필터링 */
    console.log('필터링');
  }

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
        <Autocomplete
          freeSolo
          options={clientList.map((option) => option)}
          renderInput={(params) =>
            <TextField {...params}
                       placeholder='거래처명' size='small'
                       sx={{minWidth: 150}}
            />
          }
        />
        <Button
          variant="outlined"
          onClick={() => handleSearch}
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
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
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
                <TableCell colSpan={9}>합계</TableCell>
                <TableCell align='right'>매출액계</TableCell>
                <TableCell align='right'>수금액계</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
export default ClientSales;