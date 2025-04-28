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
import {decimalRegex, formatCurrency, formatDecimal} from '../../utils/format.ts';
import dayjs from 'dayjs';
import {Amount, Choice, defaultAmount, defaultChoice} from '../../types/transactionRegisterTypes.ts';
import {moveFocusToNextInput} from '../../utils/focus.ts';
import axiosInstance from '../../api/axios.ts';
import {AxiosResponse} from 'axios';
import {RevenueManageMenuType} from '../../types/headerMenu.ts';
import ProductForm from '../../components/ProductForm.tsx';
import getAllProducts from '../../api/getAllProducts.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {getUniqueScalesByProductName} from '../../utils/autoComplete.ts';
import {ProductDialogType} from '../../types/dialogTypes.ts';

interface TransactionRegisterProps {
  isOpen: boolean;
  onClose: () => void;
  salesCompanyList: any[];
  productList: any[];
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

const TransactionRegister = ({
                               isOpen,
                               onClose,
                               salesCompanyList,
                               productList
                             }: TransactionRegisterProps): React.JSX.Element => {
  const [choices, setChoices] = useState<Choice[]>(
    Array.from({length: 1}, () => ({...defaultChoice}))
  );
  const [formData, setFormData] = useState({
    companyId: '',
    locationName: [] as string[],
    companyName: "",
    payingAmount: "0",
    sequence: 1,
    createdAt: dayjs().format('YYYY-MM-DD'),
  })
  const [amount, setAmount] = useState<Amount[]>(
    Array.from({length: 1}, () => ({...defaultAmount}))
  );
  const [newProductFormOpen, setNewProductFormOpen] = useState(false);
  const [productListState, setProductListState] = useState([]);
  const { showAlert, openAlert } = useAlertStore();

  const locationOptions = useMemo(() => {
    const selectedCompany = salesCompanyList.find((company) => company.companyName === formData.companyName);
    return selectedCompany?.locationName || [];
  }, [formData.companyName, salesCompanyList]);

  const totalSales = useMemo(() => {
    return choices.reduce((acc, choice, index) => {
      const quantity = Number(choice.quantity) || 0;
      const rawMat = Number(amount[index].newRawMatAmount) || 0;
      const manufacture = Number(amount[index].newManufactureAmount) || 0;
      const total = (rawMat + manufacture) * quantity;
      return acc + total;
    }, 0);
  }, [choices, amount]);

  const productScaleMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    productList.forEach((p) => {
      map[p.productName] = getUniqueScalesByProductName(productList, p.productName);
    });
    return map;
  }, [productList]);

  // handler
  const handleCompanyChange = useCallback((_event, newValue: string | null) => {
    const selectedCompany = salesCompanyList.find((company) => company.companyName === newValue);
    setFormData((prev) => ({
      ...prev,
      companyId: selectedCompany ? selectedCompany.id : "",
      companyName: selectedCompany ? newValue : "",
      locationName: [], // 거래처가 바뀌면 locationName 초기화
    }));
  }, [salesCompanyList]);

  const handleLocationChange = useCallback((_event, newValues: string[]) => {
    setFormData((prev) => ({
      ...prev,
      locationName: newValues,
    }));
  }, []);

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

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index) => {
    setAmount((prevAmounts) =>
      prevAmounts.map((amount, i) => (i === index ? {
        ...amount,
        [event.target.name]: event.target.value
      } : amount))
    )
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

  const addRow = () => {
    setChoices((prev) => [...prev, {...defaultChoice}]);
    setAmount((prev) => [...prev, {...defaultAmount}]);
  };

  const deleteRow = (index: number) => {
    setChoices((prev) => prev.filter((_, i) => i !== index));
    setAmount((prev) => prev.filter((_, i) => i !== index));
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
      sequence: endSeq && endSeq + 1 || 1,
    };

    // choices 복사본 생성
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
      ...updatedFormData,
      choices: updatedChoices.filter((c) => c.productName.length > 0),
    };
    let amountInfo = null;
    try {
      const res: AxiosResponse = await axiosInstance.post('/receipt', data);
      /*  "data": {
        "receipt": {
            "id": "a10567ba-a270-4b5b-861f-09310f3e77b3",
            "sequence": 2,
            "choices": [
                {
                    "id": "f692c948-8fb6-4ab8-b393-23ad2761e589",
                    "product": {
                        "id": "9ba25b92-ffd0-4113-add3-74caadf25b99",
                        "bridgeId": "9bb6e54b-8bc1-4b73-8dcf-77b5d7dbb38a",
                        "productName": "하장중ABC",
                        "info": {
                            "id": "00bd7fcb-39bb-4865-809c-0331ca6da5af",
                            "scales": [
                                {
                                    "id": "e95675ac-cf4f-4480-975d-af219b2b7301",
                                    "scale": "EGI1.55TX4X4000",
                                    "snapshot": {
                                        "id": "0da79635-86df-40ee-8f81-483070df165a",
                                        "sequence": 2,
                                        "manufactureAmount": "30300",
                                        "vCutAmount": "0",
                                        "rawMatAmount": "2020",
                                        "productLength": "0.000",
                                        "stocks": 0,
                                        "unitWeight": "0",
                                        "vCut": "0",
                                        "createdAt": "2025-04-21T17:02:14.403Z"
                                    }
                                }
                            ]
                        }
                    },
                    "companyName": "(구,동성)경영산업",
                    "chooseProductName": "하장중ABC",
                    "chooseProductScale": "EGI1.55TX4X4000",
                    "chooseProductScaleSequence": 2,
                    "quantity": 1
                }
            ],
            "companyName": "(구,동성)경영산업",
            "payingAmount": "0",
            "totalAmount": "32320",
            "locationName": [
                "프린트확인"
            ],
            "createdAt": "2025-04-22T00:00:00.000Z"
        },
        "outstandingAmount": "71317"
    },*/

      if (res.data.statusCode === 204) {
        showAlert('입력 필드를 재확인 해주세요.', 'info');
        return;
      } else if (res.data.statusCode === 409) {
        showAlert(`${res.data.message}`, 'error');
        return;
      }
      amountInfo = {
        carryoverAmount: res.data.data?.outstandingAmount,
        totalSalesAmount: res.data.data?.receipt.totalAmount,
      }
      setChoices(Array.from({length: 1}, () => ({...defaultChoice})));
      setFormData((prev) => ({
        companyId: '',
        locationName: [] as string[],
        companyName: "",
        payingAmount: "0",
        sequence: 1,
        createdAt: prev.createdAt,
      }))
      setAmount(Array.from({length: 1}, () => ({...defaultAmount})));
    } catch (err) {
      showAlert(`${err}`, 'error');
    }
    return {...data, ...amountInfo};
  }

  const handlePrint = async () => {
    const data = await register();
    if (window.ipcRenderer && data) {
      try {
        await window.ipcRenderer.invoke('generate-and-open-pdf', RevenueManageMenuType.SalesDetail, {...data, amount});
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

  // debug
  // console.log(productListState);
  // console.log('날짜설정: ', formData.createdAt);
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
                        options={salesCompanyList.map((option) => option.companyName)}
                        onChange={handleCompanyChange}
                        value={formData.companyName}
                        renderInput={(params) =>
                          <TextField {...params}
                                     size='small'
                                     sx={{minWidth: 150}}
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
                          options={productScaleMap[choice.productName] || []}
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