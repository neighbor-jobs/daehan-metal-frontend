import React, {useEffect, useState} from 'react';
import {AxiosResponse} from 'axios';
import axiosInstance from '../../api/axios.ts';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import {PurchaseCompanyColumn, TableColumns} from '../../types/tableColumns.ts';
import {Bank, GetVendorResData} from '../../types/vendorRes.ts';
import {PatchVendorBankReqBody, PostVendorBankReqBody, PostVendorReqBody} from '../../types/vendorReq.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import BankForm from '../../components/BankForm.tsx';
import {BankDialogType} from '../../types/dialogTypes.ts';
import PurchaseCompanyForm from './PurchaseCompanyForm.tsx';

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
  const [companyName, setCompanyName] = useState('');
  const {showAlert} = useAlertStore();

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

  const handleBankEdit = (b: Bank, infoId: string, companyName: string) => {
    setIsBankEditing(BankDialogType.EDIT);
    setCompanyName(companyName);
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
    const res: AxiosResponse = await axiosInstance.get('/vendor/many?orderBy=asc');
    setPurchaseCompanyList(res.data.data || []);
  };

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

      {/* 등록 dialog */}
      <PurchaseCompanyForm isOpen={open}
                           isEditing={isEditing}
                           onClose={() => setOpen(false)}
                           prevFormData={formData}
                           onSuccess={async () => await fetchPurchaseCompanies()}

      />

      {/* 은행 관련 dialog */}
      <BankForm isEdit={isBankEditing} isOpened={bankOpen} onClose={() => setBankOpen(false)}
                defaultFormData={bankData}
                companyName={companyName}
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
                           onClick={() => handleBankEdit(b, row.info.id, row.name)}
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