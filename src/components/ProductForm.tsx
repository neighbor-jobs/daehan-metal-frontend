import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import InputWithLabel from './InputWithLabel.tsx';
import axiosInstance from '../api/axios.ts';
import {useAlertStore} from '../stores/alertStore.ts';

interface ProductFormProps {
  isOpened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProductForm = ({isOpened, onClose, onSuccess}: ProductFormProps): React.JSX.Element => {
  const [formData, setFormData] = useState({
    name: "",
    scale: "",
    unitWeight: "",
    stocks: 0,
    rawMatAmount: '',
    manufactureAmount: '',
    vCutAmount: '',
    vCut: '',
    productLength: '',
  });
  const { showAlert } = useAlertStore();

  // handler
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.scale) {
      showAlert('품목과 규격은 필수 입력 값입니다.', 'info');
      return;
    }

    const data = {
      ...formData,
      stocks: Number(formData.stocks) || 0,
    }
    try {
      await axiosInstance.post('/product', data);
      showAlert("등록 완료", 'success');
      setFormData({
        name: "",
        scale: "",
        unitWeight: "",
        stocks: 0,
        rawMatAmount: '',
        manufactureAmount: '',
        vCutAmount: '',
        vCut: '',
        productLength: '',
      })
    } catch {
      showAlert('등록에 실패했습니다.', 'error');
    }
    if (onSuccess) onSuccess();
  }

  return (
    <Dialog
      open={isOpened}
      onClose={onClose}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            handleSubmit();
            // setOpen(false);
          },
        },
      }}
    >
      <DialogTitle>품목 등록</DialogTitle>
      <DialogContent
        sx={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 500}}
      >
        <InputWithLabel name='name' label='품명' labelPosition='left' onChange={handleInputChange} placeholder='필수 입력란입니다.'
                        value={formData.name}/>
        <InputWithLabel name='scale' label='규격' labelPosition='left' onChange={handleInputChange} placeholder='필수 입력란입니다.'
                        value={formData.scale}/>
        <InputWithLabel name='unitWeight' label='단중' labelPosition='left' onChange={handleInputChange}
                        value={formData.unitWeight}/>
        <InputWithLabel name='vCut' label='V컷' labelPosition='left' onChange={handleInputChange}
                        value={formData.vCut}/>
        <InputWithLabel name='vCutAmount' label='V컷가공비' labelPosition='left' onChange={handleInputChange}
                        value={formData.vCutAmount}/>
        <InputWithLabel name='stocks' label='재고' labelPosition='left' onChange={handleInputChange}
                        value={formData.stocks}/>
        <InputWithLabel name='productLength' label='길이' labelPosition='left' onChange={handleInputChange}
                        value={formData.productLength}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button type='submit'>확인</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductForm;