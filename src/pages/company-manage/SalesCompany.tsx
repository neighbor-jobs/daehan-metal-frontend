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
import {SalesCompanyColumn} from '../../types/tableColumns.ts';
import React, {useEffect, useState} from 'react';
import InputWithLabel from '../../components/InputWithLabel.tsx';
import axiosInstance from '../../api/axios.ts';
import CloseIcon from '@mui/icons-material/Close';
import {AxiosResponse} from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import PrintButton from '../../layout/PrintButton.tsx';
import {formatBusinessNumber, formatPhoneNumber} from '../../utils/format.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {moveFocusToNextInput, moveFocusToPrevInput} from '../../utils/focus.ts';

const columns: readonly SalesCompanyColumn[] = [
  {
    id: 'companyName',
    label: '거래처명',
    minWidth: 100,
  },
  {
    id: 'ownerName',
    label: '대표자',
    minWidth: 80,
  },
  {
    id: 'phoneNumber',
    label: '전화번호',
    minWidth: 80,
  },
  /*{
    id: 'locationNames',
    label: '현장명',
    format: formatStringList,
  },*/
  {
    id: 'fax',
    label: '팩스번호',
    minWidth: 80,
  },
  {
    id: 'businessNumber',
    label: '사업자등록번호',
    minWidth: 60,
  },
  {
    id: 'businessType',
    label: '업태',
    minWidth: 50,

  },
  {
    id: 'businessCategory',
    label: '종목',
    minWidth: 50,
  },
  {
    id: 'address',
    label: '주소',
    minWidth: 200,
  },
];


const SalesCompany = (): React.JSX.Element => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [salesCompanyList, setSalesCompanyList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    phoneNumber: '',
    fax: undefined,
    address: '',
    businessType: undefined,
    businessCategory: undefined,
    businessNumber: undefined,
  })
  const { showAlert, openAlert: openAlert } = useAlertStore();

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
      'phoneNumber': formatPhoneNumber(event.target.value),
    });
  };
  const handleBusinessNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = formatBusinessNumber(event.target.value);
    setFormData({
      ...formData,
      'businessNumber': val,
    })
  }

  const handleCreate = () => {
    setIsEditing(false)
    setFormData({
      companyName: '',
      ownerName: '',
      phoneNumber: '',
      fax: undefined,
      address: '',
      businessType: undefined,
      businessCategory: undefined,
      businessNumber: undefined,
    });
    setOpen(true);
  }
  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      companyName: row.companyName,
      ownerName: row.ownerName,
      phoneNumber: row.phoneNumber,
      fax: row.fax,
      address: row.address,
      businessType: row.businessType,
      businessCategory: row.businessCategory,
      businessNumber: row.businessNumber,
    })
    setOpen(true);
  }

  // api
  const fetchSalesCompanies = async () => {
    const companies = await axiosInstance.get('/company?orderBy=asc');
    setSalesCompanyList(companies.data.data || []);
  };

  const handleSubmit = async () => {
    const requiredFields = [
      { name: '거래처명', value: formData.companyName },
      { name: '대표이름', value: formData.ownerName },
      { name: '전화번호', value: formData.phoneNumber },
      { name: '주소', value: formData.address },
    ];

    const missingField = requiredFields.find(field => !field.value || field.value.trim() === '');
    if (missingField) {
      showAlert(`'${missingField.name}'은(는) 필수 입력 값입니다.`, 'info');
      return;
    }

    const data = {
      companyName: formData.companyName,
      infoArgs: {
        ownerName: formData.ownerName,
        address: formData.address,
        fax: formData.fax,
        phoneNumber: formData.phoneNumber,
        businessNumber: formData.businessNumber,
        businessType: formData.businessType,
        businessCategory: formData.businessCategory,
      },
    }
    try {
      if (isEditing) {
        await axiosInstance.patch('/company', data);
        showAlert('거래처가 수정되었습니다.', 'success');
      } else {
        const res: AxiosResponse = await axiosInstance.post('/company', data);
        setSalesCompanyList((prev) => ([res.data.data, ...prev]));
        showAlert('거래처가 등록되었습니다.', 'success');
      }
      setOpen(false);
    } catch {
      showAlert('요청이 실패했습니다. 재시도 해주세요.', 'error');
    }
  }

  const delSalesCompany = async (companyName: string) => {
    await axiosInstance.delete(`/company?companyName=${companyName}`);
    showAlert('거래처 삭제 완료', 'success');
  }

  useEffect(() => {
    fetchSalesCompanies();
  }, []);

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
        disableEscapeKeyDown={openAlert}
        slotProps={{
          paper: {
            component: 'form',
            /*onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              setOpen(false);
            },*/
          },
        }}
      >
        <DialogTitle>{isEditing ? '거래처수정' : '거래처등록'}</DialogTitle>
        <DialogContent
          sx={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 500}}
        >
          <InputWithLabel name='companyName' label='거래처명' labelPosition='left' onChange={handleInputChange} placeholder='필수 입력 값입니다.'
                          inputProps={{
                            'data-input-id': `companyName`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`companyName`);
                            }
                          }}
                          value={formData.companyName}/>
          <InputWithLabel name='ownerName' label='대표자' labelPosition='left' onChange={handleInputChange} placeholder='필수 입력 값입니다.'
                          inputProps={{
                            'data-input-id': `ownerName`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`ownerName`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('ownerName');
                            }
                          }}
                          value={formData.ownerName}/>
          <InputWithLabel name='phoneNumber' label='전화번호' labelPosition='left' onChange={handlePhoneNumberChange}
                          inputProps={{
                            'data-input-id': `phoneNumber`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`phoneNumber`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('phoneNumber');
                            }
                          }}
                          placeholder='필수 입력 값입니다.' value={formData.phoneNumber}/>
          <InputWithLabel name='fax' label='팩스번호' labelPosition='left' onChange={handleInputChange}
                          inputProps={{
                            'data-input-id': `fax`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`fax`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('fax');
                            }
                          }}
                          value={formData.fax}/>
          <InputWithLabel name='address' label='주소' labelPosition='left' onChange={handleInputChange} placeholder='필수 입력 값입니다.'
                          inputProps={{
                            'data-input-id': `address`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`address`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('address');
                            }
                          }}
                          value={formData.address}/>
          <InputWithLabel name='businessType' label='업태' labelPosition='left' onChange={handleInputChange}
                          inputProps={{
                            'data-input-id': `businessType`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`businessType`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('businessType');
                            }
                          }}
                          value={formData.businessType}/>
          <InputWithLabel name='businessCategory' label='종목' labelPosition='left' onChange={handleInputChange}
                          inputProps={{
                            'data-input-id': `businessCategory`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`businessCategory`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('businessCategory');
                            }
                          }}
                          value={formData.businessCategory}/>
          <InputWithLabel name='businessNumber' label='사업자등록번호' labelPosition='left' onChange={handleBusinessNumberChange}
                          inputProps={{
                            'data-input-id': `businessNumber`,
                            onKeyDown: async (e) => {
                              if (e.key === 'Enter') await handleSubmit();
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('businessNumber');
                            }
                          }}
                          placeholder='000-00-00000' value={formData.businessNumber}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button onClick={handleSubmit}>등록</Button>
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
                <TableCell sx={{width: 2}}/>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesCompanyList
                .map((row, rowIndex) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      })}
                      <TableCell sx={{padding: 0}}>
                        <IconButton size='small'
                                    onClick={() => handleEdit(row)}
                        >
                          <EditIcon fontSize='small'/>
                        </IconButton>
                        <IconButton color='error' size='small'
                                    onClick={() => delSalesCompany(row['companyName'])}>
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
      <PrintButton printData={salesCompanyList}/>
      {/* <PrintButton printData={
        {
          telNumber: '032-588-0497',
          subTelNumber: '032-588-0499',
          phoneNumber: '010-2284-7264',
          bankName: '국민',
          accountNumber: '170037-0400-3452',
          records: [
            {
              createdAt: '02월 06일',
              productName: '현금입금',
              vat: true,
              productPrice: '34944640',
              payableBalance: '0',
            },
            {
              createdAt: '02월 06일',
              productName: 'STS 304 H/L 1.5*5*10=1',
              vat: true,
              quantity: 1,
              unitPrice: '243000',
              totalSalesAmount: '243000',
              totalVatPrice: '24300',
              totalPrice: '267300',
              payableBalance: '267300',
            }
          ]
        }
      }></PrintButton> */}
    </Box>
  );
}

export default SalesCompany;