import React, {useEffect, useState} from 'react';
import {AxiosResponse} from 'axios';
import axiosInstance from '../../api/axios.ts';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import InputWithLabel from '../../components/InputWithLabel.tsx';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import {PurchaseCompanyColumn, TableColumns} from '../../types/tableColumns.ts';
import {formatBusinessNumber, formatPhoneNumber} from '../../utils/format.ts';
import {GetVendorResData} from '../../types/vendorRes.ts';
import {PatchVendorBankReqBody, PostVendorBankReqBody, PostVendorReqBody} from '../../types/vendorReq.ts';

const columns: readonly TableColumns<PurchaseCompanyColumn>[] = [
  {
    id: PurchaseCompanyColumn.NAME,
    label: '거래처명',
    minWidth: 120,
  },
  {
    id: PurchaseCompanyColumn.PHONE_NUMBER,
    label: '핸드폰번호',
    minWidth: 80,
  },
  {
    id: PurchaseCompanyColumn.TEL_NUMBER,
    label: '전화번호',
    minWidth: 80,
  },
  {
    id: PurchaseCompanyColumn.SUB_TEL_NUMBER,
    label: '전화번호(2)',
    minWidth: 80,
  },
  {
    id: PurchaseCompanyColumn.BUSINESS_NUMBER,
    label: '사업자등록번호',
    minWidth: 50,
  }
]

const PurchaseCompany = (): React.JSX.Element => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [isBankEditing, setIsBankEditing] = useState(false);
  const [purchaseCompanyList, setPurchaseCompanyList] = useState<GetVendorResData[]>([]);
  const [formData, setFormData] = useState<PostVendorReqBody>({
    name: '',
    phoneNumber: undefined,
    telNumber: undefined,
    subTelNumber: undefined,
    businessNumber: undefined,
  });
  const [bankData, setBankData] = useState<PostVendorBankReqBody | PatchVendorBankReqBody>({
    infoId: undefined,
    bankName: undefined,
    accountNumber: undefined,
    accountOwner: undefined,
  });

  // handler
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };
  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: formatPhoneNumber(event.target.value),
    });
  };
  const handleBusinessNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = formatBusinessNumber(event.target.value);
    setFormData({
      ...formData,
      businessNumber: val,
    })
  }
  const handleCreate = () => {
    setIsEditing(false)
    setFormData({
      name: '',
      phoneNumber: undefined,
      telNumber: undefined,
      subTelNumber: undefined,
      businessNumber: undefined,
    });
    setOpen(true);
  }

  const handleEdit = (row: GetVendorResData) => {
    setIsEditing(true);
    setFormData({
      name: row.name,
      phoneNumber: row.info.phoneNumber,
      telNumber: row.info.telNumber,
      subTelNumber: row.info.subTelNumber,
      businessNumber: row.info.businessNumber,
    })
    setOpen(true);
  }

  const handleBankCreate = (infoId: string) => {
    setIsBankEditing(false);
    setBankData({
      infoId: infoId,
      accountOwner: '',
      bankName: '',
      accountNumber: '',
    })
    setBankOpen(true);
  }

  const handleBankEdit = (row: GetVendorResData) => {
    setIsBankEditing(true);
    setBankData({
      bankId: row.bank.id,
      bankName: row.bank.bankName,
      accountOwner: row.bank.accountOwner,
      accountNumber: row.bank.accountNumber,
    })
    setBankOpen(true);
  }

  // api
  const fetchPurchaseCompanies = async () => {
    const res: AxiosResponse = await axiosInstance.get('/vendor/many');
    setPurchaseCompanyList(res.data.data || []);
  };

  const handleSubmit = async () => {
    // TODO: 에러 핸들링 추가
    if (isEditing) {
      await axiosInstance.patch('/vendor', {
        vendorName: formData.name,
        telNumber: formData?.telNumber || undefined,
        phoneNumber: formData?.phoneNumber || undefined,
        subTelNumber: formData?.subTelNumber || undefined,
        businessNumber: formData?.businessNumber || undefined,
      });
    } else {
      await axiosInstance.post('/vendor', formData);
    }
    await fetchPurchaseCompanies();
    setOpen(false);
  }

  const handleBankSubmit = async () => {
    if (isBankEditing) {
      await axiosInstance.patch('/vendor/bank', bankData);
    } else {
      await axiosInstance.post('/vendor/bank', bankData);
    }
    await fetchPurchaseCompanies();
    setBankOpen(false);
  }

  const delPurchaseCompany = async (companyName: string) => {
    await axiosInstance.delete(`/vendor?vendorName=${companyName}`);
    await fetchPurchaseCompanies();
    alert('거래처 삭제 완료');
  }

  useEffect(() => {
    fetchPurchaseCompanies();
  }, []);

  // debug
  // console.log(formData);

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'right',
        margin: '0 2rem 1rem 0',
      }}>
        <Button
          variant="outlined"
          onClick={() => handleCreate()}
        >
          등록
        </Button>
      </Box>

      {/* dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              setOpen(false);
            },
          },
        }}
      >
        <DialogTitle>{isEditing ? '매입처수정' : '매입처등록'}</DialogTitle>
        <DialogContent
          sx={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 500}}
        >
          <InputWithLabel name='name' label='거래처명' labelPosition='left' onChange={handleInputChange}
                          value={formData.name}/>
          <InputWithLabel name='phoneNumber' label='핸드폰번호' labelPosition='left' onChange={handlePhoneNumberChange}
                          value={formData?.phoneNumber}/>
          <InputWithLabel name='telNumber' label='전화번호' labelPosition='left' onChange={handlePhoneNumberChange}
                          value={formData?.telNumber}/>
          <InputWithLabel name='subTelNumber' label='전화번호(2)' labelPosition='left' onChange={handlePhoneNumberChange}
                          value={formData?.subTelNumber}/>
          <InputWithLabel name='businessNumber' label='사업자등록번호' labelPosition='left' onChange={handleBusinessNumberChange}
                          value={formData?.businessNumber}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button type="submit" onClick={handleSubmit}>등록</Button>
        </DialogActions>
      </Dialog>

      {/* 은행 관련 dialog */}
      <Dialog open={bankOpen}
              onClose={() => setBankOpen(false)}
      >
        <DialogTitle>{isBankEditing ? '계좌수정' : '계좌등록'}</DialogTitle>
        <DialogContent
          sx={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 500}}
        >
          <InputWithLabel name='accountOwner' label='예금주' labelPosition='left' onChange={handleInputChange}
                          value={bankData?.accountOwner}/>
          <InputWithLabel name='bankName' label='은행명' labelPosition='left' onChange={handleInputChange}
                          value={bankData?.bankName}/>
          <InputWithLabel name='accountNumber' label='계좌번호' labelPosition='left' onChange={handleInputChange}
                          value={bankData?.accountNumber}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBankOpen(false)}>취소</Button>
          <Button type="submit" onClick={handleBankSubmit}>등록</Button>
        </DialogActions>
      </Dialog>
      <Paper sx={{width: '100%', overflow: 'hidden', flexGrow: 1}}>
        <TableContainer sx={{maxHeight: '100%'}}>
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
                <TableCell sx={{minWidth: 80}}>예금주</TableCell>
                <TableCell sx={{minWidth: 200}}>계좌정보</TableCell>
                <TableCell sx={{width: 2}}/>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchaseCompanyList && purchaseCompanyList.map((row, rowIndex) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.info.phoneNumber}</TableCell>
                    <TableCell>{row.info.telNumber}</TableCell>
                    <TableCell>{row.info.subTelNumber}</TableCell>
                    <TableCell>{row.info.businessNumber}</TableCell>
                    {row.bank &&
                      <>
                        <TableCell>
                          {row.bank.accountOwner}
                        </TableCell>
                        <TableCell>
                          {row.bank.bankName + ' : ' + row.bank.accountNumber}
                          <Button variant='text' size='small'
                                  onClick={() => handleBankEdit(row)}
                                  sx={{fontSize: 11}}
                          >
                            계좌수정
                          </Button>
                        </TableCell>
                      </>
                    }
                    {!row.bank &&
                      <TableCell colSpan={2}>
                        <Button size='small'
                                onClick={() => handleBankCreate(row.info.id)}
                                sx={{fontSize: 11}}
                        >
                          은행정보 추가
                        </Button>
                      </TableCell>
                    }
                    <TableCell sx={{padding: 0}}>
                      <IconButton size='small'
                                  onClick={() => handleEdit(row)}
                      >
                        <EditIcon fontSize='small'/>
                      </IconButton>
                      <IconButton color='error' size='small'
                                  onClick={() => delPurchaseCompany(row['name'])}>
                        <CloseIcon fontSize='small'/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/*<PrintButton printData={salesCompanyList}></PrintButton>*/}
    </Box>
  );
}

export default PurchaseCompany;