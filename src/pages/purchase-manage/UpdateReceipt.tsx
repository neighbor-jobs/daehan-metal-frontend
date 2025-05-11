import {
  Box, Button, Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton, Input,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React, {useEffect, useState} from 'react';
import {useAlertStore} from '../../stores/alertStore.ts';
import {PurchaseRegisterColumn, TableColumns} from '../../types/tableColumns.ts';
import {formatCurrency, formatDecimal, formatVatRate} from '../../utils/format.ts';
import {moveFocusToNextInput} from '../../utils/focus.ts';
import {GetVendorReceiptResData} from '../../types/vendorRes.ts';
import axiosInstance from '../../api/axios.ts';

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
    id: PurchaseRegisterColumn.PRODUCT_PRICE,
    label: '입금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: PurchaseRegisterColumn.VAT,
    label: '세금',
    minWidth: 70,
    align: 'center',
  },
  {
    id: PurchaseRegisterColumn.VAT_RATE,
    label: '세금비율',
    minWidth: 30,
    align: 'right',
    format: formatVatRate,
  },
  {
    id: PurchaseRegisterColumn.IS_PAYING,
    label: '입금',
    minWidth: 30,
    align: 'center',
  },
];
const UpdateReceipt = ({
                         companyName,
                         isOpen,
                         onClose,
                         onSuccess,
                         prevFormData
                       }: UpdateReceiptProps): React.JSX.Element => {
  const [formData, setFormData] = useState({
    receiptId: prevFormData?.id || '',
    companyName: '',
    productName: prevFormData?.productName || '',
    productPrice: prevFormData?.productPrice || '0',      // 입금액
    manufactureAmount: "0",
    rawMatAmount: prevFormData?.totalRawMatAmount || '0', // 단가
    quantity: prevFormData?.quantity || 0,
    vatRate: 0.1,
    vat: prevFormData?.vat ?? true,
    isPaying: prevFormData?.isPaying ?? true,
  });
  const {showAlert, openAlert} = useAlertStore();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [event.target.name]: event.target.value
    }))
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.checked
      })
    );
  };

  const handleSubmit = async () => {
    // 입금일 때, 입금액 필수
    if (formData.isPaying) {
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
      if (formData.isPaying) {
        await axiosInstance.patch('/vendor/receipt', {
          ...formData,
          companyName: companyName,
          quantity: Number(formData.quantity),
          rawMatAmount: undefined,
          manufactureAmount: undefined,
        });
      } else {
        await axiosInstance.patch('/vendor/receipt',{
          ...formData,
          quantity: Number(formData.quantity),
          companyName: companyName,
          productPrice: undefined,
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
      rawMatAmount: prevFormData.totalRawMatAmount || '0',
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
                           value={formData.productName}
                           name='productName'
                           inputProps={{
                             'data-input-id': `productName`,
                             onKeyDown: (e) => {
                               if (e.key === 'Enter') moveFocusToNextInput(`productName`);
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
                             'data-input-id': `quantity`,
                             onKeyDown: (e) => {
                               if (e.key === 'Enter') moveFocusToNextInput(`quantity`);
                             }
                           }}
                           value={formData.quantity}
                           name='quantity'
                           onChange={(e) => handleInputChange(e)}
                           data-table-input/>
                  </TableCell>
                  <TableCell>
                    {/* 단가 */}
                    <Input size='small'
                           disableUnderline={formData.isPaying}
                           disabled={formData.isPaying}
                           fullWidth
                           inputProps={{
                             sx: {textAlign: 'right'},
                             'data-input-id': `rawMatAmount`,
                             onKeyDown: (e) => {
                               if (e.key === 'Enter') moveFocusToNextInput(`rawMatAmount`);
                             }
                           }}
                           name='rawMatAmount'
                           value={formData.rawMatAmount}
                           onChange={(event) => handleInputChange(event)}
                           data-table-input/>
                  </TableCell>
                  <TableCell>
                    {/* 재료비 */}
                    <Input size='small'
                           disableUnderline
                           disabled
                           fullWidth
                           inputProps={{
                             sx: {textAlign: 'right'},
                             'data-input-id': `totalRawMatAmount`,
                           }}
                           name='totalRawMatAmount'
                           value={((parseFloat(formData.rawMatAmount || '0') || 0) * (formData.quantity || 0)).toLocaleString()}
                           data-table-input/>
                  </TableCell>
                  {/* 입금액 */}
                  <TableCell align='right'>
                    <Input size='small'
                           disabled={!formData.isPaying}
                           disableUnderline={!formData.isPaying}
                           inputProps={{
                             sx: {textAlign: 'right'},
                           }}
                           name='productPrice'
                           onChange={(e) => handleInputChange(e)}
                           value={formData.productPrice}
                           data-table-input/>
                  </TableCell>
                  {/* 세금 */}
                  <TableCell align='center'>
                    <Checkbox size='small'
                              onChange={(e) => handleCheckboxChange(e)}
                              name='vat'
                              disabled={formData.isPaying}
                              checked={formData.vat}
                    />
                  </TableCell>
                  {/* 세금 비율 */}
                  <TableCell>
                    <Input size='small'
                           disableUnderline
                           disabled={!formData.vat || formData.isPaying}
                           fullWidth
                           value={formData.vatRate}
                           inputProps={{
                             sx: {textAlign: 'right'},
                           }}
                           name='vatRate'
                           onChange={(e) => {
                             handleInputChange(e);
                           }}
                           data-table-input/>
                  </TableCell>
                  {/* 입금 여부 */}
                  <TableCell align='center'>
                    <Checkbox size='small'
                              onChange={(e) => handleCheckboxChange(e)}
                              name='isPaying'
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