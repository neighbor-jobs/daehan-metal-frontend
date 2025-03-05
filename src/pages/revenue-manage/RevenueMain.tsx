// UI
import { Box, Button, InputLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AutocompleteWithTopLabel from '../../components/AutocompleteWithTopLabel';
import InputWithLabel from '../../components/InputWithLabel';

// project
import { RevenueMainColumn } from '../../types/tableColumns';
import { revenueMainMock } from '../../mock/revenueMainMock';
import { formatCurrency, formatDecimal } from '../../utils/format';
import { clientList } from '../../mock/clientList';
import clientSalesSummaryMock from '../../mock/clientSalesSummaryMock.ts';

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
  // handler
  const generateInvoice = async () => {
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke('generate-and-open-pdf', clientSalesSummaryMock);
    } else {
      console.error('pdf 미리보기 실패');
    }
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', zIndex: 10}}>
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
              {revenueMainMock
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
      </Paper>
      <Box sx={{
        width: '100%',
        height: '50%',
        background: '#F5F5F5',
        display: 'flex',
        gap: 3,
        alignItems: 'center',
        boxShadow: '0px -4px 6px rgba(0, 0, 0, 0.1)'
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
        <Box sx={{display: 'flex', flexDirection: 'column', marginX: 3, gap: 2, width: '20%'}}>
          <Button variant='outlined'
                  onClick={generateInvoice}
          >
            거래명세표 출력
          </Button>
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