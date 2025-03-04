import {ItemSalesSummaryColumn} from '../../types/tableColumns.ts';
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
import itemSalesSummaryMock from '../../mock/itemSalesSummayMock.ts';
import {Box, Button} from '@mui/material';
import DateRangePicker from '../../components/DateRangePicker.tsx';

const columns: readonly ItemSalesSummaryColumn[] = [
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
    id: 'material-unit-price',
    label: '재료단가',
    minWidth: 100,
    align: 'right',
  },{
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
    minWidth: 100,
    align: 'right',
  },
  {
    id: 'amount',
    label: '금액',
    minWidth: 100,
    align: 'right',
  }
];

const ItemSalesSummary = (): React.JSX.Element => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const rows = itemSalesSummaryMock;

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
    </Box>
  )
}

export default ItemSalesSummary;