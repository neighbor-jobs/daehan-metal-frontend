import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {TableColumns, TransactionRegisterColumn} from '../../types/tableColumns.ts';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
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
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';
import dayjs from 'dayjs';
import {Choice, defaultChoice} from '../../types/transactionRegisterTypes.ts';
import axiosInstance from '../../api/axios.ts';
import {AxiosResponse} from 'axios';
import {RevenueManageMenuType} from '../../types/headerMenu.ts';
import ProductForm from '../../components/ProductForm.tsx';
import getAllProducts from '../../api/getAllProducts.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {getUniqueScalesByProductName} from '../../utils/autoComplete.ts';
import {ProductDialogType} from '../../types/dialogTypes.ts';
import {arrowNavAtRegister} from '../../utils/arrowNavAtRegister.ts';
import {Product} from '../../types/productRes.ts';
import {moveFocusToNextInput} from '../../utils/focus.ts';

interface TransactionRegisterProps {
  dialogType: 'create' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (companyName: string, startAt: string, sequence: number) => void;
  salesCompanyList: any[];
  productList: Product[];
  prevChoices?: Choice[] | [];
  prevFormData?: any;
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
    minWidth: 210,
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

const TransactionRegister = ({
                               dialogType,
                               isOpen,
                               onClose,
                               onSuccess,
                               salesCompanyList,
                               productList,
                               prevChoices,
                               prevFormData
                             }: TransactionRegisterProps): React.JSX.Element => {
  const [choices, setChoices] = useState<Choice[]>(dialogType === 'create' ?
    Array.from({length: 1}, () => ({...defaultChoice}))
    : prevChoices
  );
  console.log(prevFormData);
  const [formData, setFormData] = useState(dialogType === 'create' ? {
    companyId: '',
    locationName: [] as string[],
    companyName: "",
    payingAmount: "0",
    sequence: 1,
    createdAt: dayjs().format('YYYY-MM-DD'),
  } : prevFormData)
  const [newProductFormOpen, setNewProductFormOpen] = useState(false);
  const [productListState, setProductListState] = useState<Product[] | []>([]);
  const {showAlert, openAlert} = useAlertStore();

  const locationOptions = useMemo(() => {
    const selectedCompany = salesCompanyList.find((company) => company.companyName === formData.companyName);
    return selectedCompany?.locationName || [];
  }, [formData.companyName, salesCompanyList]);

  const totalSales = useMemo(() => {
    return choices.reduce((acc, choice) => {
      const quantity = Number(choice.quantity) || 0;
      const rawMat = Number(choice.rawMatAmount) || 0;
      const manufacture = Number(choice.manufactureAmount) || 0;
      const total = Math.round(rawMat * quantity) + Math.trunc(manufacture * quantity);
      return acc + total;
    }, 0);
  }, [choices]);

  const productScaleMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    productListState.forEach((p) => {
      map[p.name] = getUniqueScalesByProductName(productListState, p.name);
    });
    // console.log(map);
    return map;
  }, [productListState, productList]);

  // handler
  const handleCompanyChange = useCallback((_event, newValue: string | null) => {
    const selectedCompany = salesCompanyList.find((company) => company.companyName === newValue);
    setFormData((prev) => ({
      ...prev,
      companyId: selectedCompany ? selectedCompany.id : "",
      companyName: selectedCompany ? newValue : "",
      locationName: [],
    }));
  }, [salesCompanyList]);

  const handleLocationChange = useCallback((_event, newValues: string[]) => {
    setFormData((prev) => ({
      ...prev,
      locationName: newValues,
    }));
  }, []);

  const handleProductChange = (index: number, newValue: string | null) => {
    const selectedProduct = productListState.find((item: Product) => item.name === newValue);
    setChoices((prevChoices) =>
      prevChoices.map((choice, i) =>
        i === index
          ? {
            ...choice,
            productName: selectedProduct?.name || '',
            scale: '',
          }
          : choice
      )
    );
  };

  const handleScaleChange = (index: number, newValue: string | null, prodName: string | null) => {
    for (const product of productListState) {
      if (product.name === prodName) {
        const matchedScale = product.scales?.find(s => s === newValue);
        if (matchedScale) {
          setChoices((prevChoices) =>
            prevChoices.map((choice, i) => (i === index ? {
              ...choice,
              scale: newValue || '',
            } : choice))
          );
        }
      }
    }
  };

  const handleChoiceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    rowIndex: number
  ) => {
    const {name, value} = e.target;
    // 숫자와 소수점만 허용하고 그 외 입력 무시
    const isValidNumberInput = /^(\d+)?(\.\d*)?$/.test(value);
    if (!isValidNumberInput && value !== '') return;

    setChoices((prevChoices) =>
      prevChoices.map((choice, idx) =>
        idx === rowIndex ? {...choice, [name]: value} : choice
      )
    );
  };

  const addRow = () => {
    setChoices((prev) => [...prev, {...defaultChoice}]);
  };

  const deleteRow = (index: number) => {
    setChoices((prev) => prev.filter((_, i) => i !== index));
  }

  // api
  const getEndSeq = async (companyName: string, startAt: string) => {
    const res: AxiosResponse = await axiosInstance.get(`/receipt/company/daily/sales/report?companyName=${companyName}&orderBy=asc&startAt=${startAt}&sequence=1`);
    return res.data?.data?.endSequence ?? null;
  }

  const register = async () => {
    if (formData.companyName.length === 0) {
      showAlert('거래처명은 필수 입력 값입니다.', 'info');
      return;
    }
    const endSeq = await getEndSeq(formData.companyName, formData.createdAt);

    const updatedFormData = {
      ...formData,
      payingAmount: formData.payingAmount === "" ? "0" : formData.payingAmount,
      sequence: dialogType === 'create'
        ? (endSeq !== null ? endSeq + 1 : 1)
        : prevFormData.sequence,
      };

    // choices 복사본 생성
    const updatedChoices = choices.map((c) => ({
      ...c,
      quantity: Number(c.quantity),
      rawMatAmount: String(Number(c.rawMatAmount || '0')),
      manufactureAmount: String(Number(c.manufactureAmount || '0')),
      unitWeight: "0",
      stocks: 0,
      vCutAmount: "0",
      vCut: "0",
      productLength: "0"
    }));

    const data = {
      ...updatedFormData,
      sales: updatedChoices.filter((c) => c.productName.length > 0),
    };
    let amountInfo = null;
    let res: AxiosResponse;
    try {
      if (dialogType === 'create') {
        res = await axiosInstance.post('/receipt', data);
        amountInfo = {
          carryoverAmount: res.data.data?.outstandingAmount,
          totalSalesAmount: res.data.data?.receipt.totalAmount,
        }
      } else {
        res = await axiosInstance.patch('/receipt', {
          id: prevFormData.id,
          locationNames: formData.locationName,
          payingAmount: formData.payingAmount,
          companyName: formData.companyName,
          createdAt: formData.createdAt,
          sales: updatedChoices.filter((c) => c.productName.length > 0),
        })
      }
      if (res.data.statusCode === 204) {
        showAlert('입력 필드를 재확인 해주세요.', 'info');
        return;
      } else if (res.data.statusCode === 409) {
        showAlert(`${res.data.message}`, 'error');
        return;
      }
      if (onSuccess) onSuccess(updatedFormData.companyName, updatedFormData.createdAt, updatedFormData.sequence);
      setChoices(Array.from({length: 1}, () => ({...defaultChoice})));
      setFormData((prev) => ({
        companyId: '',
        locationName: [] as string[],
        companyName: "",
        payingAmount: "0",
        sequence: 1,
        createdAt: prev.createdAt,
      }))
    } catch (err) {
      showAlert(`${err}`, 'error');
    }
    onClose();
    return {...data, ...amountInfo};
  }

  const handlePrint = async () => {
    const data = await register();
    if (window.ipcRenderer && data) {
      try {
        await window.ipcRenderer.invoke('generate-and-open-pdf', RevenueManageMenuType.SalesDetail, {...data});
      } catch (error) {
        showAlert(`${error}`, 'error');
      }
    }
  }

  useEffect(() => {
    if (productList.length > 0) {
      setProductListState(productList);
    }
  }, [productList]);

  useEffect(() => {
    if (dialogType === 'edit' && prevChoices) {
      setChoices(prevChoices);
    } else if (dialogType === 'create') {
      setChoices(Array.from({length: 1}, () => ({...defaultChoice})));
    }
  }, [dialogType, prevChoices]);

  useEffect(() => {
    if (dialogType === 'edit' && prevFormData) {
      setFormData(prevFormData);
    } else if (dialogType === 'create') {
      setFormData({
        companyId: '',
        locationName: [] as string[],
        companyName: '',
        payingAmount: '0',
        sequence: 1,
        createdAt: dayjs().format('YYYY-MM-DD'),
      });
    }
  }, [dialogType, prevFormData]);

  // debug
  // console.log(dialogType);
  // console.log('formData: ', formData, 'choices: ', choices);
  return (
    <>
      {/* 거래 등록 Dialog */}
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
        <DialogTitle>거래등록</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} p={2} component={Paper}>
            {/* 매출일 & 거래처 & 현장명 & 새 품목, 규격 등록 */}
            <Box>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}>
                  <Box sx={{display: 'flex', gap: 3}}>
                    {/* 매출일 */}
                    <Box>
                      <InputLabel sx={{fontSize: 'small',}}>매출일</InputLabel>
                      <DesktopDatePicker
                        views={['day']}
                        format="YYYY/MM/DD"
                        defaultValue={dayjs()}
                        onChange={(value) => {
                          if (value && dayjs(value).isValid()) {
                            setFormData(prev => ({
                              ...prev,
                              createdAt: dayjs(value).format('YYYY-MM-DD'),
                            }));
                          }
                        }}
                        slotProps={{
                          textField: {size: 'small'},
                          calendarHeader: {format: 'YYYY/MM'},
                        }}
                      />
                    </Box>
                    {/* 거래처명 */}
                    <Box display="flex" flexDirection="column">
                      <InputLabel sx={{fontSize: 'small',}}>거래처명</InputLabel>
                      <Autocomplete
                        size='small'
                        options={salesCompanyList.map((option) => option.companyName)}
                        onChange={handleCompanyChange}
                        value={formData.companyName}
                        renderInput={(params) =>
                          <TextField {...params}
                                     sx={{minWidth: 150}}
                                     slotProps={{
                                       htmlInput: {
                                         ...params.inputProps,
                                         'data-input-id': 'companyName',
                                         onKeyDown: (e) => {
                                           const isComposing = e.nativeEvent.isComposing;
                                           if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowRight')) moveFocusToNextInput(`companyName`);
                                         }
                                       }
                                     }}
                          />
                        }
                      />
                    </Box>
                    {/* 현장명 */}
                    <Box>
                      <InputLabel sx={{fontSize: 'small',}}>현장명</InputLabel>
                      <Autocomplete
                        freeSolo
                        multiple
                        options={locationOptions}
                        value={formData.locationName}
                        onChange={handleLocationChange}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => {
                            const {key, ...chipProps} = getTagProps({index});
                            return (
                              <Chip
                                key={key}
                                {...chipProps}
                                label={option}
                                size="small"
                                sx={{height: 20, fontSize: 12}}
                              />
                            );
                          })
                        }
                        renderInput={(params) =>
                          <TextField {...params}
                                     value={formData.locationName}
                                     size='small'
                                     sx={{minWidth: 300}}
                                     slotProps={{
                                       htmlInput: {
                                         ...params.inputProps,
                                         'data-input-id': 'locationName',
                                       }
                                     }}
                          />
                        }
                      />
                    </Box>
                  </Box>
                  <Button variant='outlined' onClick={() => setNewProductFormOpen(true)}>
                    품목&규격 추가
                  </Button>
                </Box>
              </LocalizationProvider>
            </Box>

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
                          options={productListState.map((option) => option.name)}
                          onChange={(_, newValue) => handleProductChange(rowIndex, newValue)}
                          value={choice.productName}
                          renderInput={(params) =>
                            <TextField {...params}
                                       data-table-input
                                       slotProps={{
                                         htmlInput: {
                                           'data-col-index': 0,
                                           'data-row-index': rowIndex,
                                           onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 4),
                                           ...params.inputProps
                                         }
                                       }}
                            />
                          }
                        />
                      </TableCell>
                      {/* 규격 */}
                      <TableCell>
                        <Autocomplete
                          options={productScaleMap[choice.productName] || []}
                          value={choice.scale || null}
                          onChange={(_, newValue: string | null) => handleScaleChange(rowIndex, newValue, choice.productName)}
                          renderInput={(params) =>
                            <TextField {...params}
                                       size='small'
                                       data-table-input
                                       slotProps={{
                                         htmlInput: {
                                           'data-col-index': 1,
                                           'data-row-index': rowIndex,
                                           onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 4), ...params.inputProps
                                         }
                                       }}
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
                                 'data-col-index': 2,
                                 'data-row-index': rowIndex,
                                 onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 4),
                               }}
                               value={choice.quantity}
                               name='quantity'
                               onChange={(e) => handleChoiceChange(e, rowIndex)}
                               data-table-input/>
                      </TableCell>
                      {/* 재료단가/재료비 */}
                      <TableCell>
                        <Input size='small'
                               disableUnderline
                               fullWidth
                               inputProps={{
                                 sx: {textAlign: 'right'},
                                 'data-col-index': 3,
                                 'data-row-index': rowIndex,
                                 onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 4),
                               }}
                               name='rawMatAmount'
                               value={choice.rawMatAmount || '0'}
                               onChange={(event) => handleChoiceChange(event, rowIndex)}
                               data-table-input/>
                      </TableCell>
                      <TableCell>
                        <Input size='small'
                               disabled
                               disableUnderline
                               fullWidth
                               value={`${Math.round((Number(choice.rawMatAmount) * Number(choice.quantity))).toLocaleString()}`}
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
                                 'data-col-index': 4,
                                 'data-row-index': rowIndex,
                                 onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                   if (e.key === 'Enter') {
                                     addRow();
                                   }
                                   arrowNavAtRegister(e, 4);
                                 }
                               }}
                               value={`${choice.manufactureAmount || '0'}`}
                               onChange={(event) => handleChoiceChange(event, rowIndex)}
                               name='manufactureAmount'/>
                      </TableCell>
                      <TableCell>
                        <Input size='small'
                               disableUnderline
                               disabled
                               fullWidth
                               value={`${Math.trunc((Number(choice.manufactureAmount) * Number(choice.quantity))).toLocaleString()}`}
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
                               disabled
                               value={
                                 (
                                   Math.round(Number(choice.rawMatAmount) * choice.quantity) +
                                   Math.trunc(Number(choice.manufactureAmount) * choice.quantity)
                                 ).toLocaleString('ko-KR')
                               }
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

            <Box display="flex" justifyContent="space-between" mt={2}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <InputLabel sx={{fontSize: 'small',}}>미수금</InputLabel>
                <TextField size='small' variant="outlined" disabled/>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <InputLabel sx={{fontSize: 'small',}}>매출계</InputLabel>
                <TextField size='small'
                           variant="outlined"
                           value={totalSales.toLocaleString()}
                           disabled/>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <InputLabel sx={{fontSize: 'small',}}>입금액</InputLabel>
                <TextField size='small' variant="outlined"
                           value={formData.payingAmount}
                           onChange={(e) => setFormData((prev) => ({...prev, payingAmount: e.target.value}))}
                />
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <InputLabel sx={{fontSize: 'small',}}>미수계</InputLabel>
                <TextField size='small' variant="outlined" disabled/>
              </Box>
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="contained"
                      onClick={register}
              >
                저장
              </Button>
              <Button variant="contained"
                      onClick={handlePrint}
              >
                저장/인쇄
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* 새 품명 & 규격 등록 Dialog */}
      <ProductForm isOpened={newProductFormOpen}
                   dialogType={ProductDialogType.CREATE}
                   productList={productListState}
                   onClose={() => setNewProductFormOpen(false)}
                   onSuccess={async () => {
                     const newProdList = await getAllProducts();
                     setProductListState(newProdList || []);
                   }}
      />
    </>
  )
}

export default TransactionRegister;