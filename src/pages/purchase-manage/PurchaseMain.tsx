import {
  Autocomplete,
  Box,
  Button,
  Input,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, {useState} from 'react';
import {moveFocusToNextInput} from '../../utils/focus.ts';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {PurchaseRegisterColumn, TableColumns} from '../../types/tableColumns.ts';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';
import {PostVendorReceiptReqBody} from '../../types/vendorReq.ts';

const columns: readonly TableColumns<PurchaseRegisterColumn>[] = [
  {
    id: PurchaseRegisterColumn.PRODUCT_NAME,
    label: '품명',
    minWidth: 170,
  },
  {
    id: PurchaseRegisterColumn.QUANTITY,
    label: '수량',
    minWidth: 90,
    align: 'right',
    format: formatDecimal,
  },
  {
    id: PurchaseRegisterColumn.PRODUCT_PRICE,
    label: '금액',
    minWidth: 170,
    align: 'right',
  },
  {
    id: PurchaseRegisterColumn.VAT,
    label: '세금',
    minWidth: 70,
    align: 'right',
  },
  {
    id: PurchaseRegisterColumn.VAT_RATE,
    label: '비율',
    minWidth: 80,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: PurchaseRegisterColumn.IS_PAYING,
    label: '지불여부',
    minWidth: 70,
    align: 'right',
  },
];
const defaultReceipt: PostVendorReceiptReqBody = {
  vendorId: '',
  companyName: '',
  productName: '',
  productPrice: '',
  quantity: 0,
  vatRate: 0,
}

const PurchaseMain = (): React.JSX.Element => {
  const [receipts, setReceipts] = useState(
    Array.from({length: 1}, () => ({...defaultReceipt}))
  );

  const addRow = () => {
    setReceipts(prev => [...prev, {...defaultReceipt}]);
  }

  return (
    <Box sx={{
      position: 'relative'
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginX: 3,
        marginY: 1,
      }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <InputLabel sx={{fontSize: 'small',}}>매입일</InputLabel>
            <DesktopDatePicker
              views={['day']}
              format="YYYY/MM/DD"
              defaultValue={dayjs()}
              // onChange={(value) => setFormData(prev=>({...prev, startAt: value.format('YYYY-MM-DD')}))}
              slotProps={{
                textField: {size: 'small'},
                calendarHeader: {format: 'YYYY/MM'},
              }}
            />
          </Box>
        </LocalizationProvider>
      </Box>
      <Paper sx={{
        width: '100%',
        overflow: 'hidden',
        flexGrow: 1,
      }}>
        <TableContainer>
          <Table size='small'>
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
              {receipts && receipts.map((row, rowIndex) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                  {/* 품명 */}
                  <TableCell>
                    <Input size='small'
                           fullWidth
                           disableUnderline
                           value={row.productName}
                    />
                  </TableCell>
                  {/* 수량 */}
                  <TableCell>
                    <Input size='small'
                           disableUnderline
                           fullWidth
                           inputProps={{
                             sx: {textAlign: 'right'},
                             'data-input-id': `quantity-${rowIndex}`,
                             onKeyDown: (e) => {
                               if (e.key === 'Enter') moveFocusToNextInput(`quantity-${rowIndex}`);
                             }
                           }}
                           value={row.quantity}
                           // onChange={(e) => handleQuantityChange(e, rowIndex)}
                           data-table-input/>

                  </TableCell>
                  {/* 금액 */}
                  <TableCell>
                    <Input size='small'
                           disableUnderline
                           fullWidth
                           inputProps={{
                             sx: {textAlign: 'right'},
                             'data-input-id': `newRawMatAmount-${rowIndex}`,
                             onKeyDown: (e) => {
                               if (e.key === 'Enter') moveFocusToNextInput(`newRawMatAmount-${rowIndex}`);
                             }
                           }}
                           name='productPrice'
                           value={row.productPrice}
                           // onChange={(event) => handleAmountChange(event, rowIndex)}
                           data-table-input/>
                  </TableCell>
                  {/* 세금 */}
                  <TableCell align='right'>
                    <Button variant='outlined' size='small'>세금</Button>
                  </TableCell>
                  {/* 세금 비율 */}
                  <TableCell>
                    <Input size='small'
                           disableUnderline
                           fullWidth
                           value={row.vatRate}
                           inputProps={{
                             sx: {textAlign: 'right'},
                           }}
                           data-table-input/>
                  </TableCell>
                  {/* 지불 여부 */}
                  <TableCell align='right'>
                    <Button>ㅇㅇㅇ</Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Button
                    fullWidth
                    size="small"
                    startIcon={<AddCircleOutlineIcon/>}
                    onClick={addRow}
                    sx={{textTransform: 'none'}}
                  >
                    행 추가
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
      }}>
      </Box>
      {/*<Box sx={{position: 'fixed', bottom: 16, right: 16, display: 'flex', gap: 2}}>
        <Button variant='contained'
                onClick={() => setOpenDialog(true)}
                sx={{ marginY: 1 }}
        >
          등록
        </Button>
        <PrintButton printData={printData} value='인쇄' />
      </Box>*/}
    </Box>
  )
}

export default PurchaseMain;