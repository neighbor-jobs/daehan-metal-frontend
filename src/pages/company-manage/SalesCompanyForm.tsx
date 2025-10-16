import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import InputWithLabel from '../../components/InputWithLabel.tsx';
import {moveFocusToNextInput, moveFocusToPrevInput} from '../../utils/focus.ts';
import React, {useState} from 'react';
import {useAlertStore} from '../../stores/alertStore.ts';
import axiosInstance from '../../api/axios.ts';
import {formatBusinessNumber, formatPhoneNumber} from '../../utils/format.ts';

interface SalesCompanyFormProps {
  isOpen: boolean;
  isEditing: boolean;
  prevFormData?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const defaultFormData = {
  companyName: '',
  ownerName: '',
  phoneNumber: '',
  fax: undefined,
  address: '',
  businessType: undefined,
  businessCategory: undefined,
  businessNumber: undefined,
}

const SalesCompanyForm = ({
                            isOpen,
                            isEditing,
                            onClose,
                            onSuccess,
                            prevFormData
                          }: SalesCompanyFormProps): React.JSX.Element => {
  const [formData, setFormData] = useState(prevFormData || defaultFormData);
  const {showAlert, openAlert} = useAlertStore();

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
      [event.target.name] : formatPhoneNumber(event.target.value),
    });
  };
  const handleBusinessNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = formatBusinessNumber(event.target.value);
    setFormData({
      ...formData,
      businessNumber: val,
    })
  }

  // api
  const handleSubmit = async () => {
    const requiredFields = [
      { name: '거래처명', value: formData.companyName },
      /*{ name: '대표이름', value: formData.ownerName },
      { name: '전화번호', value: formData.phoneNumber },
      { name: '주소', value: formData.address },*/
    ];

    const missingField = requiredFields.find(field => !field.value || field.value.trim() === '');
    if (missingField) {
      showAlert(`'${missingField.name}'은(는) 필수 입력 값입니다.`, 'info');
      return;
    }

    const data = {
      id: formData?.id || undefined,
      companyName: formData.companyName,
      infoArgs: {
        ownerName: formData.ownerName,
        address: formData.address,
        fax: formData.fax || undefined,
        phoneNumber: formData.phoneNumber,
        businessNumber: formData.businessNumber || undefined,
        businessType: formData.businessType || undefined,
        businessCategory: formData.businessCategory || undefined,
      },
    }
    try {
      if (isEditing) {
        await axiosInstance.patch('/company', data);
        showAlert('거래처가 수정되었습니다.', 'success');
      } else {
        await axiosInstance.post('/company', data);
        showAlert('거래처가 등록되었습니다.', 'success');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      showAlert('요청이 실패했습니다. 재시도 해주세요.', 'error');
    }
  }


  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      disableEscapeKeyDown={openAlert}
    >
      <DialogTitle>{isEditing ? '거래처수정' : '거래처등록'}</DialogTitle>
      <DialogContent
        sx={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 500}}
      >
        <InputWithLabel name='companyName' label='거래처명' labelPosition='left' onChange={handleInputChange}
                        placeholder='필수 입력 값입니다.'
                        inputProps={{
                          'data-input-id': `companyName`,
                          onKeyDown: (e) => {
                            const isComposing = e.nativeEvent.isComposing;
                            if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) {
                              moveFocusToNextInput('companyName');
                            }
                          }
                        }}
                        value={formData.companyName}/>
        <InputWithLabel name='ownerName' label='대표자' labelPosition='left' onChange={handleInputChange}
                        placeholder='필수 입력 값입니다.'
                        inputProps={{
                          'data-input-id': `ownerName`,
                          onKeyDown: (e) => {
                            const isComposing = e.nativeEvent.isComposing;
                            if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) {
                              moveFocusToNextInput(`ownerName`);
                            } else if (!isComposing && e.key === 'ArrowUp') {
                              moveFocusToPrevInput('ownerName');
                            }
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
        <InputWithLabel name='fax' label='팩스번호' labelPosition='left' onChange={handlePhoneNumberChange}
                        inputProps={{
                          'data-input-id': `fax`,
                          onKeyDown: (e) => {
                            if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`fax`);
                            else if (e.key === 'ArrowUp') moveFocusToPrevInput('fax');
                          }
                        }}
                        value={formData.fax}/>
        <InputWithLabel name='address' label='주소' labelPosition='left' onChange={handleInputChange}
                        placeholder='필수 입력 값입니다.'
                        inputProps={{
                          'data-input-id': `address`,
                          onKeyDown: (e) => {
                            const isComposing = e.nativeEvent.isComposing;
                            if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`address`);
                            else if (e.key === 'ArrowUp') moveFocusToPrevInput('address');
                          }
                        }}
                        value={formData.address}/>
        <InputWithLabel name='businessType' label='업태' labelPosition='left' onChange={handleInputChange}
                        inputProps={{
                          'data-input-id': `businessType`,
                          onKeyDown: (e) => {
                            const isComposing = e.nativeEvent.isComposing;
                            if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`businessType`);
                            else if (!isComposing && e.key === 'ArrowUp') moveFocusToPrevInput('businessType');
                          }
                        }}
                        value={formData.businessType}/>
        <InputWithLabel name='businessCategory' label='종목' labelPosition='left' onChange={handleInputChange}
                        inputProps={{
                          'data-input-id': `businessCategory`,
                          onKeyDown: (e) => {
                            const isComposing = e.nativeEvent.isComposing;
                            if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`businessCategory`);
                            else if (!isComposing && e.key === 'ArrowUp') moveFocusToPrevInput('businessCategory');
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
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSubmit}>등록</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SalesCompanyForm;