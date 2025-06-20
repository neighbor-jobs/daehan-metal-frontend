import {MonthlyPurchaseColumn, TableColumns} from '../../types/tableColumns.ts';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';
import {
  Autocomplete,
  Box,
  Button, IconButton, InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow, TextField
} from '@mui/material';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import dayjs from 'dayjs';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';
import axiosInstance from '../../api/axios.ts';
import {AxiosResponse} from 'axios';
import PrintButton from '../../layout/PrintButton.tsx';
import {useAlertStore} from '../../stores/alertStore.ts';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import UpdateReceipt from './UpdateReceipt.tsx';

const columns: readonly TableColumns<MonthlyPurchaseColumn>[] = [
  {
    id: MonthlyPurchaseColumn.CREATED_AT,
    label: '날짜',
    minWidth: 100,
    format: (date: string) => date.split('T')[0],
  },
  {
    id: MonthlyPurchaseColumn.PRODUCT_NAME,
    label: '품명',
    minWidth: 170
  },
  {
    id: MonthlyPurchaseColumn.QUANTITY,
    label: '수량',
    minWidth: 100,
    align: 'right',
    format: formatDecimal
  },
  {
    id: MonthlyPurchaseColumn.UNIT_PRICE,
    label: '단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: MonthlyPurchaseColumn.TOTAL_SALES_AMOUNT,
    label: '매입금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency
  },
  {
    id: MonthlyPurchaseColumn.TOTAL_VAT_AMOUNT,
    label: '매입세액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: MonthlyPurchaseColumn.TOTAL_PRICE,
    label: '합계',
    minWidth: 110,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: MonthlyPurchaseColumn.PRODUCT_PRICE,
    label: '입금',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: MonthlyPurchaseColumn.PAYABLE_BALANCE,
    label: '잔액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  }
];


const MonthlyPurchase = (): React.JSX.Element => {
  const [formData, setFormData] = useState({
    standardDate: dayjs(),
    companyName: '',
  })
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState();
  const [purchaseCompanyList, setPurchaseCompanyList] = useState([]);
  const [monthlyPurchase, setMonthlyPurchase] = useState([]);
  const [selectedCompanyData, setSelectedCompanyData] = useState({});
  const [records, setRecords] = useState([]);
  const { showAlert } = useAlertStore();

  const totals = useMemo(() => {
    return records.reduce(
      (acc, r) => {
        acc.purchase += Number(r.totalSalesAmount ?? 0);
        acc.vat      += Number(r.totalVatPrice  ?? 0);
        acc.total    += Number(r.totalPrice     ?? 0);
        acc.paying   += Number(r.productPrice   ?? 0);
        return acc;
      },
      { purchase: 0, vat: 0, total: 0, paying: 0 }
    );
  }, [records]);

  const handleCompanyChange = useCallback((_event, newValue: string | null) => {
    const selectedCompany = purchaseCompanyList.find((company) => company?.name === newValue);
    if (!selectedCompany) {
      setFormData(prev => ({
        ...prev,
        companyName: newValue || '',
      }));
      setSelectedCompanyData({});
      return;
    }
    setFormData(prev => ({
      ...prev,
      companyName: selectedCompany.name,
    }));
    setSelectedCompanyData({
      companyName: selectedCompany.name,
      telNumber: selectedCompany.info?.telNumber || '',
      subTelNumber: selectedCompany.info?.subTelNumber || '',
      phoneNumber: selectedCompany.info?.phoneNumber || '',
      bankName: selectedCompany.bank?.bankName || '',
      accountNumber: selectedCompany.bank?.accountNumber || ''
    });
  }, [purchaseCompanyList]);

  // api
  const handleSearch = async () => {
    try {
      const res: AxiosResponse = await axiosInstance.get(`/vendor/receipt?companyName=${formData.companyName}&standardDate=${formData.standardDate.format('YYYY-MM')}`);
      setMonthlyPurchase(res.data.data);
      setRecords(res.data.data.map((item) => {
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
      }))
    } catch (error) {
      showAlert('검색에 실패했습니다.', 'error');
    }
  }

  const deletePurchase = async (receiptId: string) => {
    try {
      await axiosInstance.delete(`/vendor/receipt?receiptId=${receiptId}`);
      await handleSearch();
    } catch (error) {
      showAlert('삭제에 실패했습니다', 'error');
    }
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
  }, []);

  // debug
  // console.log('formData: ', formData);
  // console.log('selected: ', {...selectedCompanyData, records: records});
  return (
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginX: 3,
        marginY: 1,
      }}>
        {/* date picker */}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <InputLabel sx={{fontSize: 'small',}}>매입월</InputLabel>
            <DesktopDatePicker
              views={['year', 'month']}
              format="YYYY/MM"
              defaultValue={dayjs()}
              onChange={(value) => setFormData(prev => ({...prev, standardDate: value}))}
              slotProps={{
                textField: {size: 'small'},
              }}
            />
          </Box>
        </LocalizationProvider>
        <Autocomplete
          freeSolo
          options={purchaseCompanyList.map((option) => option.name)}
          onChange={handleCompanyChange}
          value={formData.companyName}
          sx={{width: 200}}
          renderInput={(params) =>
            <TextField {...params}
                       placeholder='거래처명' size='small'
                       sx={{minWidth: 150}}
            />
          }
        />
        <Button
          variant="outlined"
          onClick={handleSearch}
        >
          확인
        </Button>
      </Box>
      <Paper sx={{width: '100%', overflow: 'hidden', flexGrow: 1}}>
        <TableContainer>
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
                <TableCell sx={{width: 2}}/>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlyPurchase &&
                monthlyPurchase.map((row, rowIndex) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                      <TableCell>{(row.createdAt).split('T')[0]}</TableCell>
                      <TableCell>{row.productName}</TableCell>
                      <TableCell align='right'>{row.quantity.toFixed(3)}</TableCell>
                      <TableCell align='right'>{formatCurrency(row.unitPrice)}</TableCell>
                      <TableCell
                        align='right'>{(Number(row.totalRawMatAmount) + Number(row.totalManufactureAmount)).toLocaleString()}</TableCell>
                      <TableCell align='right'>{formatCurrency(row.totalVatPrice)}</TableCell>
                      <TableCell align='right'>{formatCurrency(row.totalPrice)}</TableCell>
                      <TableCell align='right'>{formatCurrency(row.productPrice)}</TableCell>
                      <TableCell align='right'>{formatCurrency(row.payableBalance)}</TableCell>
                      <TableCell sx={{padding: 0}}>
                        <IconButton size='small'
                          onClick={() => {
                            setUpdateFormData(row);
                            setDialogOpen(true);
                          }}
                        >
                          <EditIcon fontSize='small'/>
                        </IconButton>
                        <IconButton color='error' size='small'
                                    onClick={() => deletePurchase(row.id)}
                        >
                          <CloseIcon fontSize='small'/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>합계</TableCell>
                <TableCell align='right'>{totals.purchase.toLocaleString()}</TableCell>
                <TableCell align='right'>{totals.vat.toLocaleString()}</TableCell>
                <TableCell align='right'>{totals.total.toLocaleString()}</TableCell>
                <TableCell align='right'>{totals.paying.toLocaleString()}</TableCell>
                <TableCell align='right'></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
      <UpdateReceipt isOpen={dialogOpen}
                     onClose={() => setDialogOpen(false)}
                     prevFormData={updateFormData}
                     companyName={formData.companyName}
                     onSuccess={async () => {
                       await handleSearch();
                     }}
      />
      <Box sx={{position: 'fixed', bottom: 16, right: 16, display: 'flex', gap: 2}}>
        <PrintButton printData={{...selectedCompanyData, records: records}} value='인쇄'/>
      </Box>
    </Box>
  )
}

export default MonthlyPurchase;