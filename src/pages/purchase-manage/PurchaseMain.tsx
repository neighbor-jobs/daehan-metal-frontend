import {
  Autocomplete,
  Box,
  Button, Checkbox,
  IconButton,
  Input,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {PurchaseRegisterColumn, TableColumns} from '../../types/tableColumns.ts';
import {formatCurrency, formatDecimal, formatInputPrice, formatInputQuality, toNum} from '../../utils/format.ts';
import CloseIcon from '@mui/icons-material/Close';
import axiosInstance from '../../api/axios.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {arrowNavAtRegister, focusByCell} from '../../utils/arrowNavAtRegister.ts';
import PurchaseCompanyForm from '../company-manage/PurchaseCompanyForm.tsx';
import {AxiosResponse} from 'axios';
import {PurchaseManageMenuType} from '../../types/headerMenu.ts';

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
    id: PurchaseRegisterColumn.VAT,
    label: '',
    minWidth: 30,
    align: 'center',
  },
  {
    id: PurchaseRegisterColumn.TOTAL_AMOUNT,
    label: '합계',
    minWidth: 100,
    align: 'right',
    typoSx: {color: 'black'},
    format: formatCurrency,
  },
  {
    id: PurchaseRegisterColumn.PRODUCT_PRICE,
    label: '입금액',
    minWidth: 100,
    align: 'right',
    typoSx: {color: 'red'},
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
  quantity: 0,
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

  // 합계 계산
  const totals = useMemo(() => {
    let purchaseAmountSum = 0; // 매입금액 합계 (단가 * 수량)
    let vatAmountSum = 0;      // 매입세액 합계 (매입금액 * 세율)
    let depositSum = 0;        // 입금액 합계

    receipts.forEach((r) => {
      const qty: number = toNum(r.quantity);
      const unit: number = toNum(r.rawMatAmount);
      const price: number = Math.round(unit * qty);

      // 부가세 적용 여부 (r.vat === false 이면 0)
      const rate: number = r.vat === false ? 0 : toNum(r.vatRate);

      // 매입 합계들
      purchaseAmountSum += price;
      vatAmountSum += Math.round(price * rate);

      // 입금액 합계
      depositSum += toNum(r.productPrice);
    });

    return {
      purchaseAmountSum,
      vatAmountSum,
      totalWithVat: purchaseAmountSum + vatAmountSum,
      depositSum,
    };
  }, [receipts]);

  const addRow = () => {
    setReceipts(prev => [...prev, {...defaultReceipt}]);
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, rowIndex: number) => {
    const {name, value} = event.target;
    const priceFields = [
      'rawMatAmount',
      'productPrice',
      'manufactureAmount',
    ];
    if (priceFields.includes(name)) {
      const numericValue = formatInputPrice(value, 0);
      setReceipts((prev) =>
        prev.map((item, i) =>
          i === rowIndex ? {...item, [name]: numericValue} : item
        )
      );
    } else if (name === 'quantity' || name === 'vatRate') {
      const numericValue = formatInputQuality(value, 0);
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

  // Alt+Enter로 줄바꿈 삽입
  const handleAltEnterNewline = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number
  ) => {
    // Alt + Enter만 처리 (IME 조합 중이면 무시)
    // if (!e.shiftKey || e.key !== 'Enter' || e.nativeEvent.isComposing) return;
    // if (!e.altKey || e.key !== 'Enter' || e.nativeEvent.isComposing) return;

    e.preventDefault();
    const target = e.currentTarget;
    const {selectionStart = 0, selectionEnd = 0, value} = target;

    const next = value.slice(0, selectionStart) + '\n' + value.slice(selectionEnd);

    setReceipts(prev =>
      prev.map((item, i) =>
        i === rowIndex ? {...item, productName: next} : item
      )
    );

    // 커서 위치 복원(선택)
/*
    setTimeout(() => {
      try {
        target.selectionStart = target.selectionEnd = selectionStart + 1;
      } catch (err) {
        console.log(err)
      }
    }, 0);
*/
  };

  // api
  const handleSubmit = async () => {
    if (header.companyName === '') {
      showAlert('매입처명은 필수 입력값입니다.');
      return;
    }

    const transformedReceipts = receipts.map((item) => {
      let paying = false;
      // productPrice 입금액으로 사용중
      if (item.productPrice && item.productPrice !== '0') paying = true;
      return {
        ...item,
        isPaying: paying
      }
    });

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
      }
    }

    const curTime = dayjs(header.createdAt)
      .hour(dayjs().hour())
      .minute(dayjs().minute())
      .second(dayjs().second())
      .add(9, 'hour');

    const apiReceipts = transformedReceipts.map((item, idx: number) => {
      if (item.isPaying) {
        return {
          ...item,
          createdAt: curTime.add(idx, 'second').toDate().toUTCString(),
          vendorId: header.vendorId,
          companyName: header.companyName,
          quantity: 1,
        };
      } else {
        return {
          ...item,
          vatRate: Number(item.vatRate),
          createdAt: curTime.add(idx, 'second').toDate().toUTCString(),
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

  const handlePrint = async () => {
    // 1. 등록
    try {
      await handleSubmit();
    } catch (error) {
      console.error(error);
    }

    // 2. 인쇄 데이터 불러오기
    try {
      const res: AxiosResponse = await axiosInstance.get(`/vendor/receipt?companyName=${header.companyName}&standardDate=${header.createdAt}`);
      const records = res.data.data.map((item) => {
        return ({
          createdAt: item.createdAt.split('T')[0],
          productName: item.productName,
          vat: item.vat,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalSalesAmount: Number(item.totalRawMatAmount) + Number(item.totalManufactureAmount),
          totalVatPrice: item.totalVatPrice,
          totalPrice: item.totalPrice,
          productPrice: item.productPrice,
          payableBalance: item.payableBalance,
        });
      })
      const companyInfo = purchaseCompanyList.find((item) => item.id === header.vendorId);
      if (window.ipcRenderer && records && companyInfo) {
        await window.ipcRenderer.invoke('generate-and-open-pdf', PurchaseManageMenuType.MonthlyPurchase, {
          companyName: header.companyName,
          telNumber: companyInfo.info.telNumber,
          subTelNumber: companyInfo.info.subTelNumber || '',
          phoneNumber: companyInfo.info.phoneNumber || '',
          bankArr: companyInfo.bank || [],
          accountNumber: companyInfo.bank?.accountNumber || '',
          records: records
        });
      }
    } catch {
      showAlert('인쇄 데이터 준비에 실패했습니다.', 'error');
    }
  }

  const getPurchaseCompanyList = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/vendor/many?orderBy=asc');
      setPurchaseCompanyList(res.data.data);
    } catch (error) {
      showAlert('새로고침 요망', 'info');
    }
  }, [showAlert]);

  useEffect(() => {
    getPurchaseCompanyList();
  }, [showAlert, getPurchaseCompanyList])

  // debug
  // console.log(curTime.toDate().toUTCString())

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
              options={purchaseCompanyList?.map((item) => item.name) || []}
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
                           onSuccess={getPurchaseCompanyList}
      />

      <Paper sx={{
        width: '100%',
        overflow: 'hidden',
        flexGrow: 1,
      }}>
        <TableContainer sx={{overflow: 'auto', maxHeight: '80vh'}}>
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
                    <Typography variant='body2'
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
              {receipts && receipts.map((row, rowIndex) => {
                const price = Math.round((parseFloat(row.rawMatAmount || '0') || 0) * (row.quantity || 0));
                const vatAmount = row.vat ? Math.round(price * row.vatRate) : 0;
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                    {/* 품명 */}
                    <TableCell>
                      <Input size='small'
                             fullWidth
                             multiline
                             value={row.productName}
                             name='productName'
                             inputProps={{
                               'data-row-index': rowIndex,
                               'data-col-index': 0,
                               onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                 // Alt+Enter면 줄바꿈만 수행
                                 // if (e.altKey && e.key === 'Enter')
                                 if (e.altKey && e.key === 'Enter') {
                                   handleAltEnterNewline(e, rowIndex);
                                   return;
                                 }

                                 // 그 외 Enter/방향키는 기존 네비게이션 유지
                                 if (!e.nativeEvent.isComposing) arrowNavAtRegister(e, 4)
                               }
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
                             value={formatCurrency(row.rawMatAmount)}
                             onChange={(event) => handleInputChange(event, rowIndex)}
                             data-table-input/>
                    </TableCell>
                    {/* 매입금액 */}
                    <TableCell>
                      <Input size='small'
                             disableUnderline
                             fullWidth
                             inputProps={{
                               sx: {textAlign: 'right', color: 'black'},
                               disabled: true,
                               'data-input-id': `totalRawMatAmount-${rowIndex}`,
                             }}
                             name='totalRawMatAmount'
                             value={price.toLocaleString()}
                             data-table-input/>
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
                        checked={!!row.vat}
                        onChange={(e) => {
                          const { checked } = e.target;
                          setReceipts(prev =>
                            prev.map((item, i) => i === rowIndex ? { ...item, vat: checked } : item)
                          );
                        }}
                        sx={{padding: 0}}
                      />
                    </TableCell>
                    {/* 합계 */}
                    <TableCell align='right'>
                      <Input size='small'
                             disableUnderline
                             value={(vatAmount + price).toLocaleString()}
                             inputProps={{
                               sx: {textAlign: 'right', fontSize: 15},
                               disabled: true,
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
                               sx: {textAlign: 'right', color: 'red'},
                             }}
                             name='productPrice'
                             onChange={(e) => handleInputChange(e, rowIndex)}
                             value={formatCurrency(row.productPrice)}
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
            <TableFooter sx={{position: 'sticky', bottom: 0, backgroundColor: 'white'}}>
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography variant='body2' color='black'>합계</Typography>
                </TableCell>
                {/* 매입금액 합계 */}
                <TableCell>
                  <Typography variant='body2' align='right'
                              color='black'>{totals.purchaseAmountSum?.toLocaleString()}</Typography>
                </TableCell>
                {/* 세액 합계 */}
                <TableCell>
                  <Typography variant='body2' align='right'
                              color='black'>{totals.vatAmountSum?.toLocaleString()}</Typography>
                </TableCell>
                <TableCell />
                {/* 총액 합계 */}
                <TableCell>
                  <Typography variant='body1' align='right'
                              color='black'>{totals.totalWithVat?.toLocaleString()}</Typography>
                </TableCell>
                {/* 입금액 합계 */}
                <TableCell>
                  <Typography variant='body2' align='right'
                              color='red'>{totals.depositSum?.toLocaleString()}</Typography>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
        gap: 3
      }}>
        <Button variant='contained'
                sx={{marginY: 1}}
                onClick={handleSubmit}
        >
          등록
        </Button>
        <Button variant='contained'
                onClick={handlePrint}
        >
          등록/인쇄
        </Button>
      </Box>
    </Box>
  )
}

export default PurchaseMain;