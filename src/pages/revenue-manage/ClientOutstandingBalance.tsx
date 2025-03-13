// UI
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow } from '@mui/material';
import DateRangePicker from '../../components/DateRangePicker';

// project
import { ClientOutstandingBalanceColumn } from '../../types/tableColumns';
import clientOutstandingBalanceMock from '../../mock/revenue-manage/clientOutstandingBalanceMock.ts';
import Footer from '../../layout/Footer.tsx';

const columns: readonly ClientOutstandingBalanceColumn[] = [
  {
    id: 'client',
    label: '거래처명',
    minWidth: 100,
  },
  {
    id: 'carryover-amount',
    label: '이월액',
    align: 'right',
    minWidth: 100,
  },
  {
    id: 'sales-amount',
    label: '매출액',
    align: 'right',
    minWidth: 100,
  },
  {
    id: 'paying-amount',
    label: '입금액',
    align: 'right',
    minWidth: 100,
  },
  {
    id: 'outstanding-amount',
    label: '미수금',
    align: 'right',
    minWidth: 100,
  },
  {
    id: 'phone-number',
    label: '전화번호',
    minWidth: 100,
  }
];

const ClientOutstandingBalance = ():React.JSX.Element => {
  const rows = clientOutstandingBalanceMock;
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
                <TableCell align='right'>이월액</TableCell>
                <TableCell align='right'>매출액</TableCell>
                <TableCell align='right'>입금액</TableCell>
                <TableCell align='right'>미수금액</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
      <Footer printData={clientOutstandingBalanceMock}></Footer>
    </Box>
  )
}

export default ClientOutstandingBalance;