// UI
import { Autocomplete, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, TextField } from '@mui/material';
import DateRangePicker from '../../components/DateRangePicker';

// project
import { ItemSalesColumn } from '../../types/tableColumns';
import itemSalesMock from '../../mock/itemSalesMock';
import { clientList } from '../../mock/revenue-manage/clientList.ts';

const columns: readonly ItemSalesColumn[] = [
  {
    id: 'date',
    label: '날짜',
    minWidth: 100,
  },
  {
    id: 'client',
    label: '거래처명',
    minWidth: 140,
  },
  {
    id: 'count',
    label: '수량',
    minWidth: 80,
    align: 'right',
  },
  {
    id: 'material-unit-price',
    label: '재료단가',
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
    id: 'processing-unit-price',
    label: '가공단가',
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
    minWidth: 80,
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
    id: 'vcut-processing-price',
    label: 'V컷가공비',
    minWidth: 100,
    align: 'right',
  },
  {
    id: 'total-amount',
    label: '매출액',
    minWidth: 100,
    align: 'right',
  },
];


const ItemSales = (): React.JSX.Element => {
  const rows = itemSalesMock;

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
                       placeholder='품목' size='small'
                       sx={{minWidth: 150}}
            />
          }
        />
        <Autocomplete
          freeSolo
          options={clientList.map((option) => option)}
          renderInput={(params) =>
            <TextField {...params}
                       placeholder='규격' size='small'
                       sx={{minWidth: 150}}
            />
          }
        />
        <Button
          variant="outlined"
          onClick={() => console.log('search')}
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
                <TableCell colSpan={4}></TableCell>
                <TableCell align='right'>재료비합계</TableCell>
                <TableCell />
                <TableCell align='right'>가공비합계</TableCell>
                <TableCell colSpan={3} />
                <TableCell align='right'>V컷가공비계</TableCell>
                <TableCell align='right'>매출액합계</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default ItemSales;