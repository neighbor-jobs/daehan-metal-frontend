import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
  TableContainer, TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';
import dayjs from 'dayjs';
import {Choice, defaultChoice, defaultFormData} from '../../types/transactionRegisterReq.ts';
import axiosInstance from '../../api/axios.ts';
import {AxiosResponse} from 'axios';
import {RevenueManageMenuType} from '../../types/headerMenu.ts';
import ProductForm from '../../components/ProductForm.tsx';
import getAllProducts from '../../api/getAllProducts.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {getUniqueScalesByProductName} from '../../utils/autoComplete.ts';
import {ProductDialogType} from '../../types/dialogTypes.ts';
import {arrowNavAtRegister, focusByCell} from '../../utils/arrowNavAtRegister.ts';
import {Product} from '../../types/productRes.ts';
import {moveFocusToNextInput} from '../../utils/focus.ts';
import cacheManager from '../../utils/cacheManager.ts';
import {CompanyOutstandingAmtRes} from '../../types/companyRes.ts';

interface TransactionRegisterProps {
  dialogType: 'create' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (companyName: string, startAt: string, sequence: number) => void;
  salesCompanyList: any[];
  productList: Product[];
  prevChoices?: Choice[] | [];
  prevFormData?: any;
  prevAmount?: any;
}

const columns: readonly TableColumns<TransactionRegisterColumn>[] = [
  {
    id: TransactionRegisterColumn.ITEM,
    label: '품명',
    minWidth: 160,
  },
  {
    id: TransactionRegisterColumn.SCALE,
    label: '규격',
    minWidth: 200,
  },
  {
    id: TransactionRegisterColumn.COUNT,
    label: '수량',
    minWidth: 50,
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
    typoSx: {color: 'blue'},
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
    typoSx: {color: 'darkorange'},
    format: formatCurrency,
  },
  {
    id: TransactionRegisterColumn.VAT_AMOUNT,
    label: '세액',
    minWidth: 70,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: TransactionRegisterColumn.DELIVERY_CHARGE,
    label: '운임비',
    minWidth: 70,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: TransactionRegisterColumn.TOTAL_AMOUNT,
    label: '계',
    minWidth: 80,
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
                               prevFormData,
                               prevAmount
                             }: TransactionRegisterProps): React.JSX.Element => {
  const [choices, setChoices] = useState<Choice[]>(dialogType === 'create' ?
    Array.from({length: 1}, () => ({...defaultChoice}))
    : prevChoices
  );

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
  const [outstanding, setOutstanding] = useState(0);

  const {showAlert, openAlert} = useAlertStore();
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const companyInputRef = useRef<HTMLInputElement | null>(null);

  const locationOptions = useMemo(() => {
    const selectedCompany = salesCompanyList.find((company) => company.companyName === formData.companyName);
    return selectedCompany?.locationName || [];
  }, [formData.companyName, salesCompanyList]);

  const sumMaterial = useMemo(() => {
    return choices.reduce((acc, c) => {
      const q = Number(c.quantity) || 0;
      const raw = Number(c.rawMatAmount) || 0;
      return acc + Math.round(raw * q);
    }, 0);
  }, [choices]);

  const sumProcessing = useMemo(() => {
    return choices.reduce((acc, c) => {
      const q = Number(c.quantity) || 0;
      const manu = Number(c.manufactureAmount) || 0;
      return acc + Math.trunc(manu * q);
    }, 0);
  }, [choices]);

  const sumVat = useMemo(() => {
    return choices.reduce((acc, c) => acc + (Number(c.vatAmount) || 0), 0);
  }, [choices]);

  const sumDelivery = useMemo(() => {
    return choices.reduce((acc, c) => acc + (Number(c.deliveryCharge) || 0), 0);
  }, [choices]);

  const totalSales = useMemo(() => sumMaterial + sumProcessing + sumVat + sumDelivery,
    [sumMaterial, sumProcessing, sumVat, sumDelivery]);

  const productScaleMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    productListState.forEach((p: Product) => {
      map[p.name] = getUniqueScalesByProductName(productListState, p.name);
    });
    return map;
  }, [productListState]);

  // handler
  const handleCompanyChange = useCallback((_event, newValue: string | null) => {
    const selectedCompany = salesCompanyList.find((company) => company.companyName === newValue);
    setFormData((prev) => ({
      ...prev,
      companyId: selectedCompany ? selectedCompany.id : "",
      companyName: selectedCompany ? newValue : "",
    }));
    if (!selectedCompany) setOutstanding(0);
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

  const handleScaleChange = async (index: number, newValue: string | null, prodName: string | null) => {
    // 기존 amount cache 코드 주석처리
/*
    for (const product of productListState) {
      if (product.name === prodName) {
        const matchedScale = product.scales?.find(s => s === newValue);
        if (matchedScale) {
          cacheManager.getScale(product.id, matchedScale)
            .then((scale) => {
              // console.log('get scale cache: ', scale);
              setChoices((prevChoices) =>
                prevChoices.map((choice, i) => (i === index ? {
                  ...choice,
                  scale: newValue || '',
                  rawMatAmount: scale?.prevRawMatAmount || '0',
                  manufactureAmount: scale?.prevManufactureAmount || '0',
                } : choice))
              )
            })
            .catch((err) => {
              setChoices((prevChoices) =>
                prevChoices.map((choice, i) => (i === index ? {
                  ...choice,
                  scale: newValue || '',
                } : choice))
              )
              console.error(err)
            });
        }
      }
    }
*/
    const found = productListState.find((p: Product) => p.name === prodName);
    const productId = found?.id;
    if (!productId) {
      setChoices((prev) => prev.map((c, i) => i === index ? { ...c, scale: newValue || '' } : c));
      return;
    }

    try {
      const prev = await cacheManager.getPrevAmountByCompany(productId, newValue, formData.companyName); // ✅ 거래처별→디폴트
      setChoices((prevChoices) =>
        prevChoices.map((choice, i) =>
          i === index
            ? {
              ...choice,
              scale: newValue,
              rawMatAmount: prev?.rawMatAmount ?? '0',
              manufactureAmount: prev?.manufactureAmount ?? '0',
            }
            : choice
        )
      );
    } catch {
      setChoices((prev) =>
        prev.map((c, i) => (i === index ? { ...c, scale: newValue, rawMatAmount: c.rawMatAmount, manufactureAmount: c.manufactureAmount } : c))
      );
    }
  };

  const handleChoiceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    rowIndex: number
  ) => {
    const {name, value} = e.target;

    // 숫자와 소숫점만 남김
    let newValue = value.replace(/[^0-9.]/g, '');
    // 앞자리 0 제거 (단, '0', '0.'은 허용)
    if (newValue && newValue !== '0' && !newValue.startsWith('0.')) {
      newValue = newValue.replace(/^0+/, '');
      // 빈 문자열이 되면 '0'으로 대체
      if (newValue === '') newValue = '0';
    }

    setChoices((prevChoices) =>
      prevChoices.map((choice, idx) =>
        idx === rowIndex ? {...choice, [name]: newValue} : choice
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
  const fetchOutstanding = useCallback(async (companyName: string, startAt: string) => {
    if (!companyName || !startAt) {
      setOutstanding(0);
      return;
    }
    let aborted = false;
    try {
      const res: AxiosResponse = await axiosInstance.get('/company/receivable', {
        params: { orderBy: 'asc', startAt }
      });
      if (aborted) return;

      const amt: CompanyOutstandingAmtRes | undefined =
        res.data.data?.find((c: CompanyOutstandingAmtRes) => c.companyName === companyName);

      setOutstanding(Number(amt?.outstandingAmount ?? 0));
    } catch {
      if (!aborted) setOutstanding(0);
    }
    return () => { aborted = true; };
  }, []);

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
      vatAmount: String(Number(c.vatAmount || '0')),
      deliveryCharge: String(Number(c.deliveryCharge || '0')),
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
        setOutstanding(Number(res.data.data?.outstandingAmount));
      } else {
        res = await axiosInstance.patch('/receipt', {
          id: prevFormData.id,
          locationNames: formData.locationName,
          payingAmount: formData.payingAmount,
          companyName: formData.companyName,
          createdAt: formData.createdAt,
          sales: updatedChoices.filter((c) => c.productName.length > 0),
        });
        amountInfo = {
          carryoverAmount: String(outstanding),
          totalSalesAmount: totalSales,
        }
      }
      if (res.data.statusCode === 204) {
        showAlert('입력 필드를 재확인 해주세요.', 'info');
        return;
      } else if (res.data.statusCode === 409) {
        showAlert(`${res.data.message}`, 'error');
        return;
      }
      showAlert('거래등록에 성공했습니다.', 'success')

      if (onSuccess && dialogType === 'edit') {
        onSuccess(updatedFormData.companyName, updatedFormData.createdAt, updatedFormData.sequence);
      }
      // 기존 scale cache data update 주석처리
/*
      updatedChoices.map((c: Choice) => {
        if (c.scale) {
          cacheManager.updateScale(c.productName, c.scale, {
            prevRawMatAmount: c.rawMatAmount,
            prevManufactureAmount: c.manufactureAmount,
          })
        }
      })
*/
      // ===== amountByCompanyStore로 교체: 거래처별 + (선택) 디폴트 업데이트 =====
      for (const c of updatedChoices) {
        if (!c.productName || !c.scale) continue;
        const product = productListState.find((p: Product) => p.name === c.productName);
        if (!product) continue;

        // 거래처별 직전값 저장
        await cacheManager.setPrevAmountByCompany(
          product.id,
          c.scale,
          { rawMatAmount: c.rawMatAmount, manufactureAmount: c.manufactureAmount },
          { companyName: formData.companyName }
        );

        // 필요하면 디폴트도 함께 갱신하고 싶을 때 사용 (원치 않으면 주석)
        await cacheManager.setPrevAmountByCompany(
          product.id,
          c.scale,
          { rawMatAmount: c.rawMatAmount, manufactureAmount: c.manufactureAmount },
          { asDefault: true }
        );
      }

      setChoices(Array.from({length: 1}, () => ({...defaultChoice})));
      setFormData((prev) => ({
        // companyId: '',
        // companyName: "",
        // createdAt: prev.createdAt,
        // sequence: 1,
        ...prev,
        locationName: [] as string[],
        payingAmount: "0",
      }))
      if (dialogType === 'edit') onClose();
    } catch (err) {
      showAlert(`${err}`, 'error');
    }
    return {...data, ...amountInfo};
  }

  const handlePrint = async () => {
    const data = await register();
    // console.log(data);
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
    if (!isOpen) return;

    if (dialogType === 'create') {
      // create 기본 세팅
      setFormData(defaultFormData);
      setChoices(Array.from({ length: 1 }, () => ({ ...defaultChoice })));
      setOutstanding(0);
    } else {
      // edit 기본 세팅
      if (prevFormData) setFormData(prevFormData);
      if (prevChoices)  setChoices(prevChoices);
      setOutstanding(Number(prevAmount?.carryoverAmount ?? 0));
    }
  }, [isOpen, dialogType, prevFormData, prevChoices, prevAmount]);

  useEffect(() => {
    if (dialogType === 'edit') return;
    fetchOutstanding(formData.companyName, formData.createdAt);
  }, [formData.companyName, formData.createdAt, dialogType, fetchOutstanding]);

  /*useEffect(() => {
    if (dialogType === 'edit' && prevChoices) {
      setChoices(prevChoices);
    } else if (dialogType === 'create') {
      setChoices(Array.from({length: 1}, () => ({...defaultChoice})));
    }
  }, [dialogType, prevChoices]);

  useEffect(() => {
    if (dialogType === 'edit' && prevFormData) {
      setFormData(prevFormData);
      setOutstanding(Number(prevAmount.carryoverAmount));
    } else {
      fetchOutstanding(formData.companyName, formData.createdAt);
    }
  }, [dialogType, prevFormData]);

  useEffect(() => {
    if (dialogType === 'edit') return;
    fetchOutstanding(formData.companyName, formData.createdAt);
  }, [formData.companyName, formData.createdAt, dialogType, fetchOutstanding]);*/

  // debug
  console.log('choices: ', choices, 'formData: ',formData);

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
                        disabled={dialogType === 'edit'}
                        onChange={(value) => {
                          if (value && dayjs(value).isValid()) {
                            setFormData(prev => ({
                              ...prev,
                              createdAt: dayjs(value).format('YYYY-MM-DD'),
                            }));
                          }
                        }}
                        onAccept={() => {
                          setTimeout(() => {
                            companyInputRef.current?.focus();
                          }, 20)
                        }}
                        slotProps={{
                          textField: {
                            size: 'small',
                            onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === 'Enter') {
                                companyInputRef.current?.focus();
                              }
                            }
                          },
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
                        sx={{width: 200}}
                        disabled={dialogType === 'edit'}
                        renderInput={(params) =>
                          <TextField {...params}
                                     sx={{minWidth: 150}}
                                     inputRef={companyInputRef}
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
                  <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, ml: 'auto'}}>
                    <Button variant='outlined'
                            onClick={() => setNewProductFormOpen(true)}
                    >
                      품목&규격 추가
                    </Button>
                  </Box>
                </Box>
              </LocalizationProvider>
            </Box>

            <TableContainer
              component={Paper}
              ref={tableContainerRef}
              sx={{maxHeight: 400, overflow: 'auto'}}
            >
              <Table size='small'
                     stickyHeader
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
                        <Typography variant="body2"
                                    sx={column.typoSx || undefined}
                        >
                          {column.label}
                        </Typography>
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
                                           onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 6, true),
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
                                           onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 6, true),
                                           ...params.inputProps
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
                                 onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 6),
                               }}
                               value={choice.quantity}
                               name='quantity'
                               onChange={(e) => handleChoiceChange(e, rowIndex)}
                               data-table-input/>
                      </TableCell>
                      {/* 재료단가 */}
                      <TableCell>
                        <Input size='small'
                               disableUnderline
                               fullWidth
                               inputProps={{
                                 sx: {textAlign: 'right'},
                                 'data-col-index': 3,
                                 'data-row-index': rowIndex,
                                 onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 6),
                               }}
                               name='rawMatAmount'
                               value={formatCurrency(choice.rawMatAmount)}
                               onChange={(event) => handleChoiceChange(event, rowIndex)}
                               data-table-input/>
                      </TableCell>
                      {/* 재료비 */}
                      <TableCell>
                        <Input size='small'
                               disableUnderline
                               fullWidth
                               value={`${Math.round((Number(choice.rawMatAmount) * Number(choice.quantity))).toLocaleString()}`}
                               inputProps={{
                                 sx: {textAlign: 'right', color: 'blue'},
                                 disabled: true,
                               }}
                               data-table-input/>
                      </TableCell>
                      {/* 가공단가 */}
                      <TableCell>
                        <Input size='small'
                               disableUnderline
                               fullWidth
                               data-table-input
                               inputProps={{
                                 sx: {textAlign: 'right'},
                                 'data-col-index': 4,
                                 'data-row-index': rowIndex,
                                 onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 6)
                               }}
                               value={formatCurrency(choice.manufactureAmount)}
                               onChange={(event) => handleChoiceChange(event, rowIndex)}
                               name='manufactureAmount'/>
                      </TableCell>
                      {/* 가공비 */}
                      <TableCell>
                        <Input size='small'
                               disableUnderline
                               fullWidth
                               value={`${Math.trunc((Number(choice.manufactureAmount) * Number(choice.quantity))).toLocaleString()}`}
                               inputProps={{
                                 sx: {textAlign: 'right', color: 'darkorange'},
                                 disabled: true,
                               }}/>
                      </TableCell>
                      {/* 세액 */}
                      <TableCell>
                        <Input size='small'
                               disableUnderline
                               fullWidth
                               data-table-input
                               inputProps={{
                                 sx: {textAlign: 'right'},
                                 'data-col-index': 5,
                                 'data-row-index': rowIndex,
                                 onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => arrowNavAtRegister(e, 6),
                               }}
                               value={formatCurrency(choice.vatAmount)}
                               onChange={(event) => handleChoiceChange(event, rowIndex)}
                               name='vatAmount'
                        />
                      </TableCell>
                      {/* 운임비 */}
                      <TableCell>
                        <Input size='small'
                               disableUnderline
                               fullWidth
                               data-table-input
                               inputProps={{
                                 sx: {textAlign: 'right'},
                                 'data-col-index': 6,
                                 'data-row-index': rowIndex,
                                 onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                   if (e.key === 'Enter') {
                                     const nextRowIndex = choices.length; // 새로 추가될 행 index
                                     addRow();

                                     // 비동기 렌더링 후 focus 적용
                                     setTimeout(() => {
                                       const el = tableContainerRef.current;
                                       if (el) el.scrollTo({ top: el.scrollHeight });
                                       focusByCell(nextRowIndex, 0);
                                     }, 0);

                                     e.preventDefault();
                                   } else {
                                     arrowNavAtRegister(e, 6);
                                   }
                                 }
                               }}
                               value={formatCurrency(choice.deliveryCharge)}
                               onChange={(event) => handleChoiceChange(event, rowIndex)}
                               name='deliveryCharge'
                        />
                      </TableCell>
                      {/* 계 */}
                      <TableCell>
                        <Input size='small'
                               name='sum'
                               disableUnderline
                               fullWidth
                               // disabled
                               value={
                                 (Math.round(Number(choice.rawMatAmount) * choice.quantity)
                                   + Math.trunc(Number(choice.manufactureAmount) * choice.quantity)
                                   + Number(choice.vatAmount)
                                   + Number(choice.deliveryCharge)
                                 ).toLocaleString('ko-KR')
                               }
                               inputProps={{
                                 sx: {textAlign: 'right', color: 'black'},
                                 disabled: true,
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
                    <TableCell colSpan={11} align="center">
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
                <TableFooter sx={{position: 'sticky', bottom: 0, backgroundColor: 'white'}}>
                  <TableRow>
                    {/* 품명, 규격, 수량, 재료단가 묶어서 라벨 */}
                    <TableCell colSpan={3} sx={{borderTop: '0.5px solid lightgray'}}>
                      <Typography variant="body2">합계</Typography>
                    </TableCell>

                    {/* 재료비 합 */}
                    <TableCell align="right" colSpan={2} sx={{borderTop: '0.5px solid lightgray'}}>
                      <Typography variant="body2" sx={{ color: 'blue' }}>
                        {sumMaterial.toLocaleString()}
                      </Typography>
                    </TableCell>

                    {/* 가공비 합 */}
                    <TableCell align="right" colSpan={2} sx={{borderTop: '0.5px solid lightgray'}}>
                      <Typography variant="body2" sx={{ color: 'darkorange' }}>
                        {sumProcessing.toLocaleString()}
                      </Typography>
                    </TableCell>

                    {/* 세액 합 */}
                    <TableCell align="right" sx={{borderTop: '0.5px solid lightgray'}}>
                      <Typography variant="body2" sx={{color: 'black'}}>
                        {sumVat.toLocaleString()}
                      </Typography>
                    </TableCell>

                    {/* 운임비 합 */}
                    <TableCell align="right" sx={{borderTop: '0.5px solid lightgray'}}>
                      <Typography variant="body2" sx={{color: 'black'}}>
                        {sumDelivery.toLocaleString()}
                      </Typography>
                    </TableCell>

                    {/* 삭제 컬럼 자리 */}
                    <TableCell sx={{borderTop: '0.5px solid lightgray'}} />
                    <TableCell sx={{borderTop: '0.5px solid lightgray'}} />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="space-between" mt={0.5}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <InputLabel sx={{fontSize: 'small',}}>미수금</InputLabel>
                <TextField size='small'
                           variant="outlined"
                           value={outstanding.toLocaleString()}
                           slotProps={{
                             htmlInput: {
                               disabled: true,
                             }
                           }}
                />
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <InputLabel sx={{fontSize: 'small',}}>매출계</InputLabel>
                <TextField size='small'
                           variant="outlined"
                           value={totalSales.toLocaleString()}
                           disabled
                           sx={{
                             "& .MuiInputBase-input.Mui-disabled": {
                               WebkitTextFillColor: "black",
                               color: "black"
                             }
                           }}
                />
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <InputLabel sx={{fontSize: 'small',}}>입금액</InputLabel>
                <TextField size='small' variant="outlined"
                           value={formatCurrency(formData.payingAmount)}
                           onChange={(e) => setFormData((prev) => {
                             let newValue = e.target.value.replace(/[^0-9.]/g, '');
                             // 앞자리 0 제거 (단, '0', '0.'은 허용)
                             if (newValue && newValue !== '0' && !newValue.startsWith('0.')) {
                               newValue = newValue.replace(/^0+/, '');
                               // 빈 문자열이 되면 '0'으로 대체
                               if (newValue === '') newValue = '0';
                             }
                             return {...prev, payingAmount: newValue}
                           })}
                />
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <InputLabel sx={{fontSize: 'small',}}>미수계</InputLabel>
                <TextField size='small'
                           variant="outlined"
                           value={(outstanding + totalSales - Number(formData.payingAmount)).toLocaleString()}
                           slotProps={{
                             htmlInput: {disabled: true}
                           }}
                />
              </Box>
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={2} mt={0.5}>
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