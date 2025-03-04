import * as React from 'react';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TablePagination from '@mui/material/TablePagination';
import clientSalesMock from '../../mock/clientSalesMock.ts';
import {ClientSalesColumn} from '../../types/tableColumns.ts';

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
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const rows = clientSalesMock;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
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
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1}>
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
  );
}
export default ClientSales;