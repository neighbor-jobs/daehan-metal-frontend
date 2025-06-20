import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  Input,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, {useCallback, useEffect, useState} from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {PurchaseRegisterColumn, TableColumns} from '../../types/tableColumns.ts';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';
import CloseIcon from '@mui/icons-material/Close';
import axiosInstance from '../../api/axios.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {arrowNavAtRegister, focusByCell} from '../../utils/arrowNavAtRegister.ts';
import PurchaseCompanyForm from '../company-manage/PurchaseCompanyForm.tsx';

const columns: readonly TableColumns<PurchaseRegisterColumn>[] = [
  {
    id: PurchaseRegisterColumn.PRODUCT_NAME,
    label: '품명',
    minWidth: 200,
  },
  {
    id: PurchaseRegisterColumn.QUANTITY,
    label: '수량',
    minWidth: 50,
    align: 'right',
    format: formatDecimal,
  },
  {
    id: PurchaseRegisterColumn.RAW_MAT_AMOUNT,
    label: '단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: PurchaseRegisterColumn.TOTAL_RAW_MAT_AMOUNT,
    label: '매입금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: PurchaseRegisterColumn.VAT_AMOUNT,
    label: '매입세액',
    minWidth: 100,
    align: 'right',
  },
  {
    id: PurchaseRegisterColumn.TOTAL_AMOUNT,
    label: '합계',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: PurchaseRegisterColumn.PRODUCT_PRICE,
    label: '입금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  /*  {
      id: PurchaseRegisterColumn.VAT,
      label: '세금',
      minWidth: 70,
      align: 'center',
    },*/
  /*{
    id: PurchaseRegisterColumn.VAT_RATE,
    label: '세금비율',
    minWidth: 30,
    align: 'right',
  },*/
  /*{
    id: PurchaseRegisterColumn.IS_PAYING,
    label: '입금',
    minWidth: 30,
    align: 'center',
  },*/
];
const defaultReceipt = {
  vendorId: '',
  companyName: '',
  productName: '',
  productPrice: '',
  rawMatAmount: '',
  manufactureAmount: '',
  quantity: 1,
  vatRate: 0.1,
  vat: true,
  isPaying: false,
}

const PurchaseMain = (): React.JSX.Element => {
  const [receipts, setReceipts] = useState(
    Array.from({length: 1}, () => ({...defaultReceipt}))
  );
  const [purchaseCompanyList, setPurchaseCompanyList] = useState([]);
  const [header, setHeader] = useState({
    createdAt: dayjs().format('YYYY-MM-DD'),
    companyName: '',
    vendorId: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const {showAlert} = useAlertStore();

  // handler
  const handleCompanyChange = useCallback((_event, newValue: string | null) => {
    const selectedCompany = purchaseCompanyList.find((company) => company?.name === newValue);

    if (!selectedCompany) {
      setHeader(prev => ({
        ...prev,
        companyName: newValue || '',
        vendorId: '',
      }));
      return;
    }
    setHeader(prev => ({
      ...prev,
      companyName: selectedCompany.name,
      vendorId: selectedCompany.id,
    }))
  }, [purchaseCompanyList]);

  const addRow = () => {
    setReceipts(prev => [...prev, {...defaultReceipt}]);
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, rowIndex: number) => {
    const {name, value} = event.target;
    const numericOnlyFields = [
      'quantity',
      'rawMatAmount',
      'productPrice',
      'manufactureAmount',
      'vatRate'
    ];
    if (numericOnlyFields.includes(name)) {
      const numericValue = value.replace(/[^0-9.]/g, ''); // 소수점 허용
      setReceipts((prev) =>
        prev.map((item, i) =>
          i === rowIndex ? {...item, [name]: numericValue} : item
        )
      );
    } else {
      setReceipts((prev) =>
        prev.map((item, i) => (i === rowIndex ? {
          ...item,
          [name]: value
        } : item))
      )
    }
  };

  const handleDeleteRow = (index: number) => {
    setReceipts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (header.companyName === '') {
      showAlert('매입처명은 필수 입력값입니다.');
      return;
    }

    const transformedReceipts = receipts.map((item) => ({
      ...item,
      isPaying: item.productPrice && item.productPrice.trim() !== ''
    }));

    for (let i = 0; i < receipts.length; i++) {
      const item = transformedReceipts[i];

      // 입금일 때, 입금액 필수
      if (item.isPaying) {
        if (!item.productPrice || item.productPrice.trim() === '') {
          showAlert(`입금 항목의 입금액은 필수입니다. (행 ${i + 1})`, 'info');
          return;
        }
      } else {
        // 매입일 때, 품명, 재료단가 or 가공단가 중 하나는 필수
        if (!item.productName || item.productName.trim() === '') {
          showAlert(`매입 항목의 품명은 필수입니다. (행 ${i + 1})`, 'info');
          return;
        }
        const hasRaw = item.rawMatAmount && item.rawMatAmount.trim() !== '';
        const hasManufacture = item.manufactureAmount && item.manufactureAmount.trim() !== '';
        if (!hasRaw && !hasManufacture) {
          showAlert(`매입 항목에는 재료단가 또는 가공단가가 필요합니다. (행 ${i + 1})`, 'info');
          return;
        }
      }
    }

    const apiReceipts = transformedReceipts.map((item) => {
      if (item.isPaying) {
        return {
          ...item,
          createdAt: header.createdAt,
          vendorId: header.vendorId,
          companyName: header.companyName,
          quantity: 1,
          rawMatAmount: undefined,
          manufactureAmount: undefined,
        };
      } else {
        return {
          ...item,
          vatRate: Number(item.vatRate),
          createdAt: header.createdAt,
          quantity: Number(item.quantity),
          vendorId: header.vendorId,
          companyName: header.companyName,
          productPrice: undefined,
        };
      }
    });

    for (let i = 0; i < receipts.length; i++) {
      try {
        await axiosInstance.post('/vendor/receipt', apiReceipts[i]);
      } catch (error) {
        showAlert('거래를 다시 등록해주세요', 'error');
      }
    }
    setReceipts([{...defaultReceipt}]);
    setHeader({
      createdAt: dayjs().format('YYYY-MM-DD'),
      companyName: '',
      vendorId: '',
    })
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get('/vendor/many?orderBy=asc');
        setPurchaseCompanyList(res.data.data);
      } catch (error) {
        showAlert('새로고침 요망', 'info');
      }
    }
    fetch();
  }, [showAlert])

  return (
    <Box sx={{
      position: 'relative'
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        marginX: 3,
        marginY: 1,
        gap: 10
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
              onChange={(value) => setHeader(prev => ({...prev, createdAt: value.format('YYYY-MM-DD')}))}
              slotProps={{
                textField: {size: 'small'},
                calendarHeader: {format: 'YYYY/MM'},
              }}
            />
          </Box>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <InputLabel sx={{fontSize: 'small',}}>매입처명</InputLabel>
            <Autocomplete
              freeSolo
              sx={{width: 180}}
              options={purchaseCompanyList.map((item) => item.name)}
              onChange={handleCompanyChange}
              value={header?.companyName || ''}
              renderInput={(params) =>
                <TextField {...params}
                           size='small'
                           sx={{minWidth: 150}}
                />
              }
            />
          </Box>
          <Box sx={{ml: 'auto'}}/>
          <Button variant='outlined'
                  onClick={() => setOpenDialog(true)}
          >
            매입처등록
          </Button>
        </LocalizationProvider>
      </Box>

      {/* 매입처 등록 dialog */}
      <PurchaseCompanyForm isOpen={openDialog}
                           isEditing={false}
                           onClose={() => setOpenDialog(false)}
      />

      <Paper sx={{
        width: '100%',
        overflow: 'hidden',
        flexGrow: 1,
      }}>
        <TableContainer>
          <Table size='small'
                 sx={{
                   '& .MuiTableCell-root': {
                     paddingY: '2px',
                   },
                 }}>
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
                <TableCell>삭제</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipts && receipts.map((row, rowIndex) => {
                const price = (parseFloat(row.rawMatAmount || '0') || 0) * (row.quantity || 0);
                const vatAmount = price * row.vatRate;
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                    {/* 품명 */}
                    <TableCell>
                      <Input size='small'
                             fullWidth
                             value={row.productName}
                             name='productName'
                             inputProps={{
                               'data-row-index': rowIndex,
                               'data-col-index': 0,
                               onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 4)
                             }}
                             onChange={(e) => handleInputChange(e, rowIndex)}
                      />
                    </TableCell>
                    {/* 수량 */}
                    <TableCell>
                      <Input size='small'
                             fullWidth
                             inputProps={{
                               sx: {textAlign: 'right'},
                               'data-row-index': rowIndex,
                               'data-col-index': 1,
                               onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 4)
                             }}
                             value={row.quantity}
                             name='quantity'
                             onChange={(e) => handleInputChange(e, rowIndex)}
                      />
                    </TableCell>
                    <TableCell>
                      {/* 단가 */}
                      <Input size='small'
                             disableUnderline={row.isPaying}
                             disabled={row.isPaying}
                             fullWidth
                             inputProps={{
                               sx: {textAlign: 'right'},
                               'data-row-index': rowIndex,
                               'data-col-index': 2,
                               onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                 arrowNavAtRegister(e, 4)
                               }
                             }}
                             name='rawMatAmount'
                             value={row.rawMatAmount}
                             onChange={(event) => handleInputChange(event, rowIndex)}
                             data-table-input/>
                    </TableCell>
                    {/* 매입금액 */}
                    <TableCell>
                      <Input size='small'
                             disableUnderline
                             disabled
                             fullWidth
                             inputProps={{
                               sx: {textAlign: 'right'},
                               'data-input-id': `totalRawMatAmount-${rowIndex}`,
                             }}
                             name='totalRawMatAmount'
                             value={price.toLocaleString()}
                             data-table-input/>
                    </TableCell>
                    {/* 매입세액 */}
                    <TableCell align='right'>
                      <Input size='small'
                             disabled
                             disableUnderline
                             value={vatAmount.toLocaleString()}
                             inputProps={{
                               sx: {textAlign: 'right'}
                             }}
                      />
                    </TableCell>
                    {/* 합계 */}
                    <TableCell align='right'>
                      <Input size='small'
                             disabled
                             disableUnderline
                             value={(vatAmount + price).toLocaleString()}
                             inputProps={{
                               sx: {textAlign: 'right'}
                             }}
                      />
                    </TableCell>
                    {/* 입금액 */}
                    <TableCell align='right'>
                      <Input size='small'
                             inputProps={{
                               'data-row-index': rowIndex,
                               'data-col-index': 3,
                               onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                 if (e.key === 'Enter') {
                                   const nextRowIndex = receipts.length; // 새로 추가될 행 index
                                   addRow();

                                   setTimeout(() => {
                                     focusByCell(nextRowIndex, 0);
                                   }, 0);

                                   e.preventDefault();
                                 } else {
                                   arrowNavAtRegister(e, 4);
                                 }
                               },
                               sx: {textAlign: 'right'},
                             }}
                             name='productPrice'
                             onChange={(e) => handleInputChange(e, rowIndex)}
                             value={row.productPrice}
                      />
                    </TableCell>

                    {/* 행 삭제 */}
                    <TableCell>
                      <IconButton size='small' onClick={() => {
                        handleDeleteRow(rowIndex)
                      }}>
                        <CloseIcon fontSize='small'/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
              <TableRow>
                <TableCell colSpan={10} align="center">
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
        marginTop: 2,
      }}>
        <Button variant='contained'
                sx={{marginY: 1}}
                onClick={handleSubmit}
        >
          등록
        </Button>
      </Box>
    </Box>
  )
}

export default PurchaseMain;