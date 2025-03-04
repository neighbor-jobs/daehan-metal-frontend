import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import {RevenueMainColumn} from '../../types/tableColumns.ts';
import {revenueMainMock} from '../../mock/revenueMainMock.ts';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';
import {Box, Button, InputLabel} from '@mui/material';
import {clientList} from '../../mock/clientList.ts';
import AutocompleteWithTopLabel from '../../components/AutocompleteWithTopLabel.tsx';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import InputWithLabel from '../../components/InputWithLabel.tsx';
import {useState} from 'react';

const columns: readonly RevenueMainColumn[] = [
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
    minWidth: 80,
    align: 'right',
    format: formatDecimal,
  },
  {
    id: 'material-price',
    label: '재료비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: 'processing-price',
    label: '가공비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: 'vcut-count',
    label: 'V컷수',
    minWidth: 80,
    align: 'right',
    format: formatDecimal,
  },
  {
    id: 'length',
    label: '길이',
    minWidth: 100,
    align: 'right',
    format: formatDecimal,
  },
  {
    id: 'unit-price',
    label: '단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: 'amount',
    label: '금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: 'total-amount',
    label: '총액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: 'paying-amount',
    label: '입금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  }
];

const RevenueMain = (): React.JSX.Element => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const rows = revenueMainMock;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between'}}>
      <Paper sx={{width: '100%', overflow: 'hidden', marginTop: 5, flexGrow: 1}}>
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
      <Box sx={{
        width: '100%',
        height: '50%',
        background: '#F5F5F5',
        display: 'flex',
        gap: 3,
        alignItems: 'center',
      }}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 4, width: '25%', marginX: 3}}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
              <InputLabel sx={{fontSize: 'small',}}>매출일</InputLabel>
              <DesktopDatePicker
                views={['day']}
                format="YYYY/MM/DD"
                slotProps={{
                  textField: {size: 'small'},
                  calendarHeader: {format: 'YYYY/MM'},
                }}
              />
            </Box>
            <AutocompleteWithTopLabel label='매출처' items={clientList}/>
          </LocalizationProvider>
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, width: '25%'}}>
          <InputWithLabel label='수량 :' labelPosition='left'/>
          <InputWithLabel label='재료단가 :' labelPosition='left'/>
          <InputWithLabel label='가공단가 :' labelPosition='left'/>
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '25%'}}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
            <InputWithLabel label='V컷수 :' labelPosition='left'/>
            <InputWithLabel label='길이 :' labelPosition='left'/>
            <InputWithLabel label='단가 :' labelPosition='left'/>
            <InputWithLabel label='계 :' labelPosition='left'/>
          </Box>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
            <InputWithLabel label='미수금 :' labelPosition='left'/>
            <InputWithLabel label='매출계 :' labelPosition='left'/>
            <InputWithLabel label='입금액 :' labelPosition='left'/>
            <InputWithLabel label='미수계 :' labelPosition='left'/>
          </Box>
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'column', marginX: 3, gap: 1, width: '20%'}}>
          <Button variant='outlined'>거래명세표 출력</Button>
          <Button variant='outlined'>수정</Button>
          <Button variant='outlined'>삭제</Button>
          <Button variant='outlined'>거래처등록</Button>
          <Button variant='outlined'>닫기</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default RevenueMain;