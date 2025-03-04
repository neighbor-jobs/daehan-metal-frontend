import {ItemSalesColumn} from '../../types/tableColumns.ts';
import {useState} from 'react';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TablePagination from '@mui/material/TablePagination';
import itemSalesMock from '../../mock/itemSalesMock.ts';
import {Autocomplete, Box, Button, TextField} from '@mui/material';
import DateRangePicker from '../../components/DateRangePicker.tsx';
import {clientList} from '../../mock/clientList.ts';
import * as React from 'react';

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
    label: 'V컷 가공비',
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const rows = itemSalesMock;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
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
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, rowIdx) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={rowIdx}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  )
}

export default ItemSales;