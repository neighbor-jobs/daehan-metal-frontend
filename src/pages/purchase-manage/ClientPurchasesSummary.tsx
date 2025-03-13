import {ClientPurchasesSummaryColumn, TableColumns} from '../../types/tableColumns.ts';
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
import DateRangePicker from '../../components/DateRangePicker.tsx';
import Footer from '../../layout/Footer.tsx';
import clientSalesSummaryMock from '../../mock/revenue-manage/clientSalesSummaryMock.ts';
import clientPurchasesSummaryMock from '../../mock/purchase-manage/clientPurchasesSummaryMock.ts';
import {formatCurrency} from '../../utils/format.ts';

const columns: readonly TableColumns<ClientPurchasesSummaryColumn>[] = [
  {
    id: ClientPurchasesSummaryColumn.CLIENT,
    label: '거래처명',
    minWidth: 100,
  },
  {
    id: ClientPurchasesSummaryColumn.MATERIAL_PRICE,
    label: '재료비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ClientPurchasesSummaryColumn.PROCESSING_PRICE,
    label: '가공비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ClientPurchasesSummaryColumn.TOTAL_AMOUNT,
    label: '합계',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ClientPurchasesSummaryColumn.PAYING_AMOUNT,
    label: '입금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ClientPurchasesSummaryColumn.REMAINING_AMOUNT,
    label: '잔액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  }
]

const ClientPurchasesSummary = (): React.JSX.Element => {
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
              {clientPurchasesSummaryMock
                .map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1}>
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
                <TableCell align='right'>재료비</TableCell>
                <TableCell align='right'>가공비</TableCell>
                <TableCell align='right'>금액</TableCell>
                <TableCell align='right'>입금액</TableCell>
                <TableCell align='right'>잔액</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
      <Footer printData={clientSalesSummaryMock} ></Footer>
    </Box>
  )
}

export default ClientPurchasesSummary;