import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Input,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React, {useEffect, useState} from 'react';
import {useAlertStore} from '../../stores/alertStore.ts';
import {PurchaseRegisterColumn, TableColumns} from '../../types/tableColumns.ts';
import {formatCurrency, formatDecimal, formatInputPrice, formatInputQuality} from '../../utils/format.ts';
import {GetVendorReceiptResData} from '../../types/vendorRes.ts';
import axiosInstance from '../../api/axios.ts';
import {arrowNavAtRegister} from '../../utils/arrowNavAtRegister.ts';

interface UpdateReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  prevFormData: GetVendorReceiptResData;
  companyName: string;
}

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
    label: '세액',
    minWidth: 70,
    align: 'right',
  },
  {
    id: PurchaseRegisterColumn.VAT,
    label: '',
    minWidth: 30,
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
];
const UpdateReceipt = ({
                         companyName,
                         isOpen,
                         onClose,
                         onSuccess,
                         prevFormData
                       }: UpdateReceiptProps): React.JSX.Element => {
  // 세액은 반올림
  const [formData, setFormData] = useState({
    receiptId: prevFormData?.id || '',
    companyName: '',
    productName: prevFormData?.productName || '',
    productPrice: prevFormData?.productPrice || '0',      // 입금액
    manufactureAmount: "0",
    rawMatAmount: prevFormData?.unitPrice || '0', // 단가
    quantity: prevFormData?.quantity || 0,
    vatRate: 0.1,
    vat: prevFormData?.vat ?? true,
    isPaying: prevFormData?.isPaying ?? true,
  });
  const {showAlert, openAlert} = useAlertStore();

  // 금액 계산
  const qtyNum = Number(formData.quantity) || 0;
  const unitNum = Number(formData.rawMatAmount) || 0;
  const price = Math.round(unitNum * qtyNum);
  const vatAmount = formData.vat === true ? Math.round(price * formData.vatRate) : 0;
  const total = price + vatAmount;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = event.target;
    const priceFields = [
      'rawMatAmount',
      'productPrice',
      'manufactureAmount',
    ];
    if (priceFields.includes(name)) {
      const numericValue = formatInputPrice(value, 0);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue
      }));
    } else if (name === 'quantity' || name === 'vatRate') {
      const numericValue = formatInputQuality(value, 0);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [event.target.name]: event.target.value
      }))

    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.checked
      })
    );
  };

  const handleAltEnterNewLine = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    const {selectionStart = 0, selectionEnd = 0, value} = target;
    const next = value.slice(0, selectionStart) + '\n' + value.slice(selectionEnd);
    setFormData((prev) => ({
      ...prev,
      productName: next
    }))
  };

  // api
  const handleSubmit = async () => {
    let isPaying = formData.isPaying;
    if (formData.productPrice && formData.productPrice !== '0') isPaying = true;
    // 입금일 때, 입금액 필수
    if (isPaying) {
      if (!formData.productPrice || formData.productPrice.trim() === '') {
        showAlert(`입금 항목의 입금액은 필수입니다.`, 'info');
        return;
      }
    } else {
      // 매입일 때, 품명, 재료단가 or 가공단가 중 하나는 필수
      if (!formData.productName || formData.productName.trim() === '') {
        showAlert(`매입 항목의 품명은 필수입니다.`, 'info');
        return;
      }
      const hasRaw = formData.rawMatAmount && formData.rawMatAmount.trim() !== '';
      const hasManufacture = formData.manufactureAmount && formData.manufactureAmount.trim() !== '';
      if (!hasRaw && !hasManufacture) {
        showAlert(`매입 항목에는 단가가 필요합니다.`, 'info');
        return;
      }
    }
    try {
      if (isPaying) {
        await axiosInstance.patch('/vendor/receipt', {
          ...formData,
          companyName: companyName,
          quantity: Number(formData.quantity),
          isPaying: isPaying
        });
      } else {
        await axiosInstance.patch('/vendor/receipt',{
          ...formData,
          quantity: Number(formData.quantity),
          companyName: companyName,
          isPaying: isPaying
        });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      showAlert('거래를 다시 등록해주세요', 'error');
    }
  }

  useEffect(() => {
    if (!isOpen || !prevFormData) return;
    setFormData({
      receiptId: prevFormData.id || '',
      companyName: '',
      productName: prevFormData.productName || '',
      productPrice: prevFormData.productPrice || '0',
      manufactureAmount: "0",
      rawMatAmount: prevFormData.unitPrice || '0',
      quantity: prevFormData.quantity || 0,
      vatRate: 0.1,
      vat: prevFormData?.vat ?? true,
      isPaying: prevFormData?.isPaying ?? true,
    });
  }, [isOpen, prevFormData]);

  console.log('formData: ', formData);

  return (
    <Dialog open={isOpen}
            fullWidth maxWidth="lg"
            onClose={onClose}
            disableEscapeKeyDown={openAlert}
      // disableAutoFocus
            disableEnforceFocus
    >
      <IconButton onClick={onClose} size='small'
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                  }}
      >
        <CloseIcon/>
      </IconButton>
      <DialogTitle>거래수정</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} p={2} component={Paper}>
          <TableContainer component={Paper}>
            <Table size='small'
                   sx={{
                     '& .MuiTableCell-root': {
                       paddingY: '2px',
                       paddingX: '4px'
                     },
                   }}
            >
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
                <TableRow hover role="checkbox" tabIndex={-1}>
                  {/* 품명 */}
                  <TableCell>
                    <Input size='small'
                           fullWidth
                           multiline
                           value={formData.productName}
                           name='productName'
                           inputProps={{
                             // 'data-input-id': `productName`,
                             'data-row-index': 0,
                             'data-col-index': 0,
                             onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                               if (e.altKey && e.key === 'Enter') {
                                 handleAltEnterNewLine(e);
                                 return;
                               }

                               const target = e.currentTarget;
                               const {selectionStart = 0, selectionEnd = 0, value = ''} = target;
                               const caretAtEnd = selectionStart === selectionEnd && selectionStart === value.length;

                               if (!e.nativeEvent.isComposing) {
                                 if (e.key === 'Enter') arrowNavAtRegister(e, 4)
                                 if (caretAtEnd) arrowNavAtRegister(e, 4);
                               }
                             }
                           }}
                           onChange={(e) => handleInputChange(e)}
                    />
                  </TableCell>
                  {/* 수량 */}
                  <TableCell>
                    <Input size='small'
                           fullWidth
                           inputProps={{
                             sx: {textAlign: 'right'},
                             // 'data-input-id': `quantity`,
                             'data-row-index': 0,
                             'data-col-index': 1,
                             onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                               if (!e.nativeEvent.isComposing) arrowNavAtRegister(e, 4);                             }
                           }}
                           value={formData.quantity}
                           name='quantity'
                           onChange={(e) => handleInputChange(e)}
                           data-table-input
                    />
                  </TableCell>
                  <TableCell>
                    {/* 단가 */}
                    <Input size='small'
                           fullWidth
                           inputProps={{
                             sx: {textAlign: 'right'},
                             // 'data-input-id': `rawMatAmount`,
                             'data-row-index': 0,
                             'data-col-index': 2,
                             onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                               if (!e.nativeEvent.isComposing) arrowNavAtRegister(e, 4);
                             }
                           }}
                           name='rawMatAmount'
                           value={formatCurrency(formData.rawMatAmount)}
                           onChange={(event) => handleInputChange(event)}
                           data-table-input
                    />
                  </TableCell>
                  <TableCell>
                    {/* 매입금액 */}
                    <Input size='small'
                           disableUnderline
                           fullWidth
                           inputProps={{
                             sx: {textAlign: 'right'},
                             disabled: true,
                             // 'data-input-id': `totalRawMatAmount`,
                           }}
                           name='totalRawMatAmount'
                           value={((parseFloat(formData.rawMatAmount || '0') || 0) * (formData.quantity || 0)).toLocaleString()}
                           data-table-input
                    />
                  </TableCell>
                  {/* 매입세액 */}
                  <TableCell align='right'>
                    <Input size='small'
                           disableUnderline
                           value={vatAmount.toLocaleString()}
                           inputProps={{
                             sx: {textAlign: 'right', color: 'black'},
                             disabled: true,
                           }}
                    />
                  </TableCell>
                  {/* 과세 여부 */}
                  <TableCell align="left" sx={{padding: 0, margin: 0}}>
                    <Checkbox
                      name="vat"
                      size='small'
                      checked={!!formData.vat}
                      onChange={handleCheckboxChange}
                      sx={{padding: 0}}
                    />
                  </TableCell>
                  {/* 합계 */}
                  <TableCell align='right'>
                    <Input size='small'
                           disableUnderline
                           value={total.toLocaleString()}
                           inputProps={{
                             sx: {textAlign: 'right', fontSize: 15},
                             disabled: true,
                             // 'data-input-id': `totalPrice`,
                           }}
                    />
                  </TableCell>
                  {/* 입금액 */}
                  <TableCell align='right'>
                    <Input size='small'
                           disableUnderline={!formData.isPaying}
                           inputProps={{
                             sx: {textAlign: 'right'},
                             'data-row-index': 0,
                             'data-col-index': 3,
                             onKeyDown: async (e: React.KeyboardEvent<HTMLInputElement>) => {
                               if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                 e.preventDefault();
                                 await handleSubmit();
                               }

                               if (!e.nativeEvent.isComposing) arrowNavAtRegister(e, 4)
                             }
                           }}
                           name='productPrice'
                           onChange={(e) => handleInputChange(e)}
                           value={formatCurrency(formData.productPrice)}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
            <Button variant="contained"
              onClick={handleSubmit}
            >
              수정 완료
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateReceipt;