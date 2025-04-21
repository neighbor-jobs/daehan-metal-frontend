import {
  Autocomplete,
  Box, Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton, Input,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {moveFocusToNextInput} from '../../utils/focus.ts';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import React, {useEffect, useState} from 'react';
import {TableColumns, TransactionRegisterColumn} from '../../types/tableColumns.ts';
import {decimalRegex, formatCurrency, formatDecimal} from '../../utils/format.ts';
import {Amount, Choice, defaultAmount, defaultChoice} from '../../types/transactionRegisterTypes.ts';
import axiosInstance from '../../api/axios.ts';
import {useAlertStore} from '../../stores/alertStore.ts';

interface AddChoicesProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productList: any[];
  defaultFormData: {
    id: string,
    companyName: string,
    sequence: number,
    createdAt: string
  },
}

const columns: readonly TableColumns<TransactionRegisterColumn>[] = [
  {
    id: TransactionRegisterColumn.ITEM,
    label: '품명',
    minWidth: 170,
  },
  {
    id: TransactionRegisterColumn.SCALE,
    label: '규격',
    minWidth: 170,
  },
  {
    id: TransactionRegisterColumn.COUNT,
    label: '수량',
    minWidth: 90,
    align: 'right',
    format: formatDecimal,
  },
  {
    id: TransactionRegisterColumn.MATERIAL_PRICE,
    label: '재료단가',
    minWidth: 70,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: TransactionRegisterColumn.MATERIAL_TOTAL_PRICE,
    label: '재료비',
    minWidth: 80,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: TransactionRegisterColumn.PROCESSING_PRICE,
    label: '가공단가',
    minWidth: 70,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: TransactionRegisterColumn.PROCESSING_TOTAL_PRICE,
    label: '가공비',
    minWidth: 80,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: TransactionRegisterColumn.TOTAL_AMOUNT,
    label: '계',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
];

const AddChoices = ({isOpen, onClose, onSuccess, productList, defaultFormData}: AddChoicesProps): React.JSX.Element => {
  const [productListState, setProductListState] = useState([]);
  const [choices, setChoices] = useState<Choice[]>(
    Array.from({length: 1}, () => ({...defaultChoice}))
  );
  const [amount, setAmount] = useState<Amount[]>(
    Array.from({length: 1}, () => ({...defaultAmount}))
  );
  const { showAlert } = useAlertStore();

  // handler
  const handleProductChange = (index: number, newValue: string | null) => {
    const selectedProduct = productListState.find((item) => item.productName === newValue);
    setChoices((prevChoices) =>
      prevChoices.map((choice, i) =>
        i === index
          ? {
            ...choice,
            bridgeId: selectedProduct?.bridgeId || '',
            productName: selectedProduct?.productName || '',
          }
          : choice
      )
    );
  };
  const handleScaleChange = (index: number, newValue: string | null, prodName: string | null) => {
    for (const product of productListState) {
      if (product.productName === prodName) {
        const matchedScale = product.info.scales.find(s => s.scale === newValue);
        if (matchedScale) {
          setChoices((prevChoices) =>
            prevChoices.map((choice, i) => (i === index ? {
              ...choice,
              productScale: newValue || '',
              productScaleSequence: matchedScale.snapshot.sequence,
            } : choice))
          );
          setAmount((prevAmounts) =>
            prevAmounts.map((amount, i) => (i === index ? {
              ...amount,
              cachedRawMatAmount: matchedScale.snapshot.rawMatAmount,
              newRawMatAmount: matchedScale.snapshot.rawMatAmount,
              cachedManufactureAmount: matchedScale.snapshot.manufactureAmount,
              newManufactureAmount: matchedScale.snapshot.manufactureAmount,
            } : amount))
          );
        }
      }
    }
  };
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index) => {
    const input = event.target.value;
    if (input === '' || decimalRegex.test(input)) {
      setChoices((prevChoices) =>
        prevChoices.map((choice, i) => (i === index ? {
          ...choice,
          quantity: input
        } : choice))
      )
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index) => {
    setAmount((prevAmounts) =>
      prevAmounts.map((amount, i) => (i === index ? {
        ...amount,
        [event.target.name]: event.target.value
      } : amount))
    )
  };

  const addRow = () => {
    setChoices((prev) => [...prev, {...defaultChoice}]);
    setAmount((prev) => [...prev, {...defaultAmount}]);
  };

  const deleteRow = (index: number) => {
    setChoices((prev) => prev.filter((_, i) => i !== index));
    setAmount((prev) => prev.filter((_, i) => i !== index));
  }

  // api
  const addChoices = async () => {
    const updatedChoices = choices.map((c) => ({
      ...c,
      quantity: Number(c.quantity),
    }));

    for (let index = 0; index < amount.length; index++) {
      const a = amount[index];
      const choice = updatedChoices[index];
      if (choice.productName.length === 0) {
        continue;
      }

      if (a.cachedRawMatAmount !== a.newRawMatAmount || a.cachedManufactureAmount !== a.newManufactureAmount) {
        const product = productListState.find((item) => item.productName === choice.productName);
        const scale = product.info.scales.find(s => s.scale === choice.productScale);

        if (product && scale) {
          try {
            await axiosInstance.patch(`/product/scale/info`, {
              id: product.id,
              infoId: product.info.id,
              productName: product.productName,
              scaleArgs: {
                scaleId: scale.id,
                rawMatAmount: a.newRawMatAmount,
                manufactureAmount: a.newManufactureAmount,
              }
            });
            // 바로 반영
            updatedChoices[index] = {
              ...updatedChoices[index],
              productScaleSequence: choice.productScaleSequence + 1,
            };
            // console.log('업데이트 후 seq ', index, ' :', updatedChoices[index]);
          } catch (error) {
            showAlert('요청 실패. 재시도 해주세요', 'error');
          }
        }
      }
    }

    const data = {
      ...defaultFormData,
      choices: updatedChoices.filter((c) => c.productName.length > 0),
    };

    try {
      await axiosInstance.patch('/receipt/choice/add', data);
      showAlert('거래 내역 추가 성공', 'success');
      setChoices(Array.from({length: 1}, () => ({...defaultChoice})));
      setAmount(Array.from({length: 1}, () => ({...defaultAmount})));
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      showAlert('요청 실패. 재시도 해주세요.', 'error');
    }
  }

  useEffect(() => {
    if (productList.length > 0) {
      setProductListState(productList);
    }
  }, [productList]);

  // debug
  console.log('choices: ', choices, ", amount: ", amount);
  console.log(defaultFormData);

  return (
    <>
      {/* 거래 등록 Dialog */}
      <Dialog open={isOpen}
              fullWidth maxWidth="lg"
              onClose={onClose}
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
        <DialogTitle>거래 내역 추가</DialogTitle>
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
                    <TableCell>삭제</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {choices.map((choice, rowIndex) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                      {/* 품명 */}
                      <TableCell>
                        <Autocomplete
                          size='small'
                          options={productListState.map((option) => option.productName)}
                          onChange={(_, newValue) => handleProductChange(rowIndex, newValue)}
                          value={choice.productName}
                          renderInput={(params) =>
                            <TextField {...params}
                                       size='small'
                                       data-table-input
                            />
                          }
                        />
                      </TableCell>
                      {/* 규격 */}
                      <TableCell>
                        <Autocomplete
                          options={productListState.find((p) => p.productName === choice.productName)?.info.scales.map((s) => s.scale) || []}
                          value={choice.productScale}
                          onChange={(_, newValue: string | null) => handleScaleChange(rowIndex, newValue, choice.productName)}
                          renderInput={(params) =>
                            <TextField {...params}
                                       size='small'
                                       data-table-input
                            />
                          }
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
                               value={choice.quantity}
                               onChange={(e) => handleQuantityChange(e, rowIndex)}
                               data-table-input/>
                      </TableCell>
                      {/* 재료단가/재료비 */}
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
                               name='newRawMatAmount'
                               value={amount[rowIndex].newRawMatAmount}
                               onChange={(event) => handleAmountChange(event, rowIndex)}
                               data-table-input/>
                      </TableCell>
                      <TableCell>
                        <Input size='small'
                               disabled
                               disableUnderline
                               fullWidth
                               value={`${(Number(amount[rowIndex].newRawMatAmount) * Number(choice.quantity)).toLocaleString()}`}
                               inputProps={{
                                 sx: {textAlign: 'right'},
                               }}
                               data-table-input/>
                      </TableCell>
                      {/* 가공단가/가공비 */}
                      <TableCell>
                        <Input size='small'
                               disableUnderline
                               fullWidth
                               data-table-input
                               inputProps={{
                                 sx: {textAlign: 'right'},
                                 'data-input-id': `newManufactureAmount-${rowIndex}`,
                                 onKeyDown: (e) => {
                                   if (e.key === 'Enter') {
                                     moveFocusToNextInput(`newManufactureAmount-${rowIndex}`);
                                     addRow();
                                   }
                                 }
                               }}
                               value={`${amount[rowIndex].newManufactureAmount}`}
                               onChange={(event) => handleAmountChange(event, rowIndex)}
                               name='newManufactureAmount'/>
                      </TableCell>
                      <TableCell>
                        <Input size='small'
                               disableUnderline
                               disabled
                               fullWidth
                               data-table-input
                               value={`${(Number(amount[rowIndex].newManufactureAmount) * Number(choice.quantity)).toLocaleString()}`}
                               inputProps={{
                                 sx: {textAlign: 'right'},
                               }}/>
                      </TableCell>
                      {/* 계 */}
                      <TableCell>
                        <Input size='small'
                               name='sum'
                               disableUnderline
                               fullWidth
                               data-table-input
                               disabled
                               value={`${(Number(amount[rowIndex].newManufactureAmount) * Number(choice.quantity) + Number(amount[rowIndex].newRawMatAmount) * Number(choice.quantity)).toLocaleString()}`}
                               inputProps={{
                                 sx: {textAlign: 'right'},
                               }}/>
                      </TableCell>
                      <TableCell>
                        <IconButton size='small' onClick={() => {
                          deleteRow(rowIndex)
                        }}>
                          <CloseIcon fontSize='small'/>
                        </IconButton>
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

            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="contained"
                      onClick={addChoices}
              >
                거래 내역 추가
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddChoices;