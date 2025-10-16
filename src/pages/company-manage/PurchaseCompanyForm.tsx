import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import InputWithLabel from '../../components/InputWithLabel.tsx';
import {moveFocusToNextInput, moveFocusToPrevInput} from '../../utils/focus.ts';
import React, {useState} from 'react';
import axiosInstance from '../../api/axios.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {formatBusinessNumber, formatPhoneNumber} from '../../utils/format.ts';

interface PurchaseCompanyFormProps {
  isOpen: boolean;
  isEditing: boolean;
  prevFormData?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const defaultFormData = {
  name: '',
  phoneNumber: '',
  telNumber: '',
  subTelNumber: '',
  businessNumber: '',
  address: '',
}

const PurchaseCompanyForm = ({
                               isOpen,
                               isEditing,
                               prevFormData,
                               onClose,
                               onSuccess
                             }: PurchaseCompanyFormProps): React.JSX.Element => {
  const [formData, setFormData] = useState(prevFormData || defaultFormData);
  const { showAlert, openAlert } = useAlertStore();

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

  const handleSubmit = async () => {
    if (formData.name.length === 0) {
      showAlert('매입처명은 필수 입력값입니다.', 'info');
      return;
    }
    const data = {
      telNumber: formData.telNumber?.length > 0 ? formData.telNumber : undefined,
      phoneNumber: formData.phoneNumber?.length > 0 ? formData.phoneNumber : undefined,
      subTelNumber: formData.subTelNumber?.length > 0 ? formData.subTelNumber : undefined,
      businessNumber: formData.businessNumber?.length > 0 ? formData.businessNumber : undefined,
      address: formData.address?.length > 0 ? formData.address : undefined,
    }
    try {
      if (isEditing) {
        await axiosInstance.patch('/vendor', {
          ...data,
          vendorName: formData.name,
          id: formData?.id
        });
      } else {
        await axiosInstance.post('/vendor', {
          ...data,
          name: formData.name,
        });
      }
      if (onSuccess) onSuccess();
      setFormData(defaultFormData);
      onClose();
    } catch (err) {
      if (err.status === 400) {
        showAlert('전화번호 또는 사업자 등록번호의 형식이 올바르지 않습니다.', 'error');
        return;
      }
      showAlert('제출 실패. 재시도 해주세요', 'error');
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      disableEscapeKeyDown={openAlert}
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
                            const isComposing = e.nativeEvent.isComposing;
                            if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`name`);
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
        <InputWithLabel name='subTelNumber' label='fax' labelPosition='left' onChange={handlePhoneNumberChange}
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
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSubmit}>등록</Button>
      </DialogActions>
    </Dialog>
  )
}

export default PurchaseCompanyForm;