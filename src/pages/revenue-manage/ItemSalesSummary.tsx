// UI
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow } from '@mui/material';
import DateRangePicker from '../../components/DateRangePicker';

// project
import { ItemSalesSummaryColumn } from '../../types/tableColumns';
import itemSalesSummaryMock from '../../mock/itemSalesSummayMock';

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
    id: 'amount',
    label: '금액',
    minWidth: 100,
    align: 'right',
  }
];

const ItemSalesSummary = (): React.JSX.Element => {
  const rows = itemSalesSummaryMock;
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
                <TableCell colSpan={2}>합계</TableCell>
                <TableCell align='right'>수량합</TableCell>
                <TableCell align='right'>재료단가평균</TableCell>
                <TableCell align='right'>재료비합</TableCell>
                <TableCell align='right'>가공단가평균</TableCell>
                <TableCell align='right'>가공비합</TableCell>
                <TableCell colSpan={2} align='right'></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default ItemSalesSummary;