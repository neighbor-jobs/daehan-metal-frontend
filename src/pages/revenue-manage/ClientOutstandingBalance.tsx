import {ClientOutstandingBalanceColumn} from '../../types/tableColumns.ts';
import * as React from 'react';
import {useState} from 'react';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TablePagination from '@mui/material/TablePagination';
import clientOutstandingBalanceMock from '../../mock/clientOutstandingBalanceMock.ts';
import {Box, Button} from '@mui/material';
import DateRangePicker from '../../components/DateRangePicker.tsx';

const columns: readonly ClientOutstandingBalanceColumn[] = [
  {
    id: 'client',
    label: '거래처명',
    minWidth: 100,
  },
  {
    id: 'carryover-amount',
    label: '이월액',
    minWidth: 100,
  },
  {
    id: 'sales-amount',
    label: '매출액',
    minWidth: 100,
  },
  {
    id: 'paying-amount',
    label: '입금액',
    minWidth: 100,
  },
  {
    id: 'outstanding-amount',
    label: '미수금',
    minWidth: 100,
  },
  {
    id: 'phone-number',
    label: '전화번호',
    minWidth: 100,
  }
];

const ClientOutstandingBalance = ():React.JSX.Element => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const rows = clientOutstandingBalanceMock;

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

export default ClientOutstandingBalance;