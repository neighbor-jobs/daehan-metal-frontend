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
import {Bank, GetVendorResData} from '../../types/vendorRes.ts';
import {PatchVendorBankReqBody, PostVendorBankReqBody, PostVendorReqBody} from '../../types/vendorReq.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {moveFocusToNextInput, moveFocusToPrevInput} from '../../utils/focus.ts';
import BankForm from '../../components/BankForm.tsx';
import {BankDialogType} from '../../types/dialogTypes.ts';

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
  },
  {
    id: PurchaseCompanyColumn.ADDRESS,
    label: '주소',
    minWidth: 280,
  }
]

const PurchaseCompany = (): React.JSX.Element => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [isBankEditing, setIsBankEditing] = useState(BankDialogType.CREATE);
  const [purchaseCompanyList, setPurchaseCompanyList] = useState<GetVendorResData[]>([]);
  const [formData, setFormData] = useState<PostVendorReqBody>({
    name: '',
    phoneNumber: '',
    telNumber: '',
    subTelNumber: '',
    businessNumber: '',
    address: '',
  });
  const [bankData, setBankData] = useState<PostVendorBankReqBody | PatchVendorBankReqBody>({
    infoId: '',
    bankName: '',
    accountNumber: '',
    accountOwner: '',
  });
  const {showAlert, openAlert: alertOpen} = useAlertStore();

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
      phoneNumber: '',
      telNumber: '',
      subTelNumber: '',
      businessNumber: '',
      address: '',
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
      address: row.info.address,
    })
    setOpen(true);
  }

  const handleBankCreate = (infoId: string) => {
    setIsBankEditing(BankDialogType.CREATE);
    setBankData({
      infoId: infoId,
      accountOwner: '',
      bankName: '',
      accountNumber: '',
    })
    setBankOpen(true);
  }

  const handleBankEdit = (b: Bank, infoId: string) => {
    setIsBankEditing(BankDialogType.EDIT);
    setBankData({
      infoId: infoId,
      bankId: b.id,
      bankName: b.bankName,
      accountOwner: b.accountOwner,
      accountNumber: b.accountNumber,
    })
    setBankOpen(true);
  }

  // api
  const fetchPurchaseCompanies = async () => {
    const res: AxiosResponse = await axiosInstance.get('/vendor/many');
    setPurchaseCompanyList(res.data.data || []);
  };

  const handleSubmit = async () => {
    if (formData.name.length === 0) {
      showAlert('매입처명은 필수 입력값입니다.', 'info');
      return;
    }

    try {
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
    } catch (err) {
      if (err.status === 400) {
        showAlert('전화번호 또는 사업자 등록번호의 형식이 올바르지 않습니다.', 'error');
        return;
      }
      showAlert('제출 실패. 재시도 해주세요', 'error');
    }
  }

  const delPurchaseCompany = async (companyName: string) => {
    await axiosInstance.delete(`/vendor?vendorName=${companyName}`);
    await fetchPurchaseCompanies();
    showAlert('거래처 삭제 완료', 'success');
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
        disableEscapeKeyDown={alertOpen}
        slotProps={{
          paper: {
            component: 'form',
          },
        }}
      >
        <DialogTitle>{isEditing ? '매입처수정' : '매입처등록'}</DialogTitle>
        <DialogContent
          sx={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 500}}
        >
          <InputWithLabel name='name' label='거래처명' labelPosition='left' onChange={handleInputChange}
                          placeholder='필수 입력 값입니다.'
                          inputProps={{
                            'data-input-id': `name`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`name`);
                            }
                          }}
                          value={formData.name}/>
          <InputWithLabel name='phoneNumber' label='핸드폰번호' labelPosition='left' onChange={handlePhoneNumberChange}
                          inputProps={{
                            'data-input-id': `phoneNumber`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`phoneNumber`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('phoneNumber');
                            }
                          }}
                          value={formData?.phoneNumber}/>
          <InputWithLabel name='telNumber' label='전화번호' labelPosition='left' onChange={handlePhoneNumberChange}
                          inputProps={{
                            'data-input-id': `telNumber`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`telNumber`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('telNumber');
                            }
                          }}
                          value={formData?.telNumber}/>
          <InputWithLabel name='subTelNumber' label='전화번호(2)' labelPosition='left' onChange={handlePhoneNumberChange}
                          inputProps={{
                            'data-input-id': `subTelNumber`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`subTelNumber`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('subTelNumber');
                            }
                          }}
                          value={formData?.subTelNumber}/>
          <InputWithLabel name='businessNumber' label='사업자등록번호' labelPosition='left'
                          onChange={handleBusinessNumberChange}
                          inputProps={{
                            'data-input-id': `businessNumber`,
                            onKeyDown: async (e) => {
                              if (e.key === 'Enter') await handleSubmit();
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('businessNumber');
                            }
                          }}
                          value={formData?.businessNumber}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button onClick={handleSubmit}>등록</Button>
        </DialogActions>
      </Dialog>

      {/* 은행 관련 dialog */}
      <BankForm isEdit={isBankEditing} isOpened={bankOpen} onClose={() => setBankOpen(false)}
                defaultFormData={bankData}
                onSwitchEditToCreate={() => setIsBankEditing(BankDialogType.CREATE)}
                onSuccess={async () => {
                  await fetchPurchaseCompanies();
                  setBankOpen(false);
                }}
      />

      <Paper sx={{width: '100%', overflow: 'hidden', flexGrow: 1, marginBottom: 5}}>
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
                <TableCell sx={{minWidth: 200}}>계좌정보</TableCell>
                <TableCell sx={{width: 2}}/>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchaseCompanyList && purchaseCompanyList.map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.info.phoneNumber || ''}</TableCell>
                    <TableCell>{row.info.telNumber || ''}</TableCell>
                    <TableCell>{row.info.subTelNumber || ''}</TableCell>
                    <TableCell>{row.info.businessNumber || ''}</TableCell>
                    <TableCell>{row.info.address || ''}</TableCell>
                    <TableCell>
                      {row.bank?.length > 0 ? row.bank.map((b) => (
                        <p style={{padding: 0, margin: 0, cursor: 'pointer'}} key={b.id}
                           onClick={() => handleBankEdit(b, row.info.id)}
                        >
                          {b.bankName + ': ' + b.accountNumber + ' (' + b.accountOwner + ')'}
                        </p>
                      )) : (
                        <Button size='small'
                                onClick={() => handleBankCreate(row.info.id)}
                                sx={{fontSize: 11}}
                        >
                          은행정보 추가
                        </Button>
                      )}
                    </TableCell>

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