import {ClientPurchasesColumn, TableColumns} from '../../types/tableColumns.ts';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';
import {
  Autocomplete,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow, TextField
} from '@mui/material';
import DateRangePicker from '../../components/DateRangePicker.tsx';
import clientPurchasesMock from '../../mock/purchase-manage/clientPurchasesMock.ts';
import {clientList} from '../../mock/revenue-manage/clientList.ts';

const columns: readonly TableColumns<ClientPurchasesColumn>[] = [
  {
    id: ClientPurchasesColumn.DATE,
    label: '날짜',
    minWidth: 100
  },
  {
    id:ClientPurchasesColumn.PRODUCT_NAME,
    label: '품명',
    minWidth: 170,
  },
  {
    id: ClientPurchasesColumn.SCALE,
    label: '규격',
    minWidth: 140,
  },
  {
    id: ClientPurchasesColumn.COUNT,
    label: '수량',
    minWidth: 100,
    align: 'right',
    format: formatDecimal
  },
  {
    id: ClientPurchasesColumn.MATERIAL_UNIT_PRICE,
    label: '재료단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ClientPurchasesColumn.MATERIAL_PRICE,
    label: '재료비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ClientPurchasesColumn.PROCESSING_UNIT_PRICE,
    label: '가공단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ClientPurchasesColumn.PROCESSING_PRICE,
    label: '가공비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ClientPurchasesColumn.TOTAL_AMOUNT,
    label: '합계',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ClientPurchasesColumn.PAYING_AMOUNT,
    label: '입금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: ClientPurchasesColumn.REMAINING_AMOUNT,
    label: '잔액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  }
]

const ClientPurchases = (): React.JSX.Element => {
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
              {clientPurchasesMock
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
  )
}
export default ClientPurchases;