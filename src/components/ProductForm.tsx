import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import InputWithLabel from './InputWithLabel.tsx';
import {useAlertStore} from '../stores/alertStore.ts';
import {ProductDialogType} from '../types/dialogTypes.ts';
import axiosInstance from '../api/axios.ts';
import {moveFocusToNextInput} from '../utils/focus.ts';

interface ProductFormProps {
  dialogType: ProductDialogType;
  defaultFormData?: any;
  isOpened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProductForm = ({
                       dialogType = ProductDialogType.CREATE,
                       isOpened,
                       onClose,
                       onSuccess,
                     }: ProductFormProps): React.JSX.Element => {
  const [formData, setFormData] = useState({
    name: '',
    scales: ['', '', '', ''],
  });
  const [updateAllProdName, setUpdateAllProdName] = useState({
    prevName: '',
    newName: '',
  });
  const {showAlert, openAlert} = useAlertStore();

  // handler
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleScaleChange = (index: number, value: string) => {
    const newScales = [...formData.scales];
    newScales[index] = value;
    setFormData((prev) => ({
      ...prev,
      scales: newScales
    }));
  };

  const handleUpdateFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateAllProdName({
      ...updateAllProdName,
      [event.target.name]: event.target.value
    })
  }

  const handleSubmit = async () => {
    if (dialogType === ProductDialogType.CREATE) {
      const isEmpty = formData.scales[0].length === 0 && formData.scales[1].length === 0 && formData.scales[2].length === 0 && formData.scales[3].length === 0;
      if (!formData.name || isEmpty) {
        showAlert('품목은 필수 입력 값입니다.', 'info');
        return;
      }
      const validScales = formData.scales.filter(s => s && s.trim() !== '');
      try {
        await axiosInstance.post('/product', {
          name: formData.name,
          scales: validScales,
        });
        showAlert('등록이 완료되었습니다.', 'success');
        if (onSuccess) onSuccess();
        onClose();
      } catch (err) {
        showAlert('등록에 실패했습니다. 다시 시도해 주세요.', 'warning');
      }
    }
  }

  // debug
  console.log(formData);

  return (
    <Dialog
      open={isOpened}
      onClose={onClose}
      disableEscapeKeyDown={openAlert}
      slotProps={{
        paper: {
          component: 'form',
        },
      }}
    >
      <DialogTitle>{dialogType === ProductDialogType.CREATE ? '품목 등록' : '품목명 수정'}</DialogTitle>
      <DialogContent
        sx={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 500}}
      >
        {dialogType === ProductDialogType.CREATE ? (
          <>
            <InputWithLabel name='name' label='품명' labelPosition='left' onChange={handleInputChange}
                            placeholder='필수 입력란입니다.'
                            inputProps={{
                              'data-input-id': `name`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`name`);
                              }
                            }}
                            value={formData.name}/>
            <InputWithLabel label='규격1' labelPosition='left'
                            value={formData.scales[0]} placeholder='필수 입력 값입니다.'
                            inputProps={{
                              'data-input-id': `scale0`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`scale0`);
                              }
                            }}
                            onChange={(e) => handleScaleChange(0, e.target.value)}/>
            <InputWithLabel name='scale[1]' label='규격2' labelPosition='left'
                            value={formData.scales[1]}
                            inputProps={{
                              'data-input-id': `scale1`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`scale1`);
                              }
                            }}
                            onChange={(e) => handleScaleChange(1, e.target.value)}/>
            <InputWithLabel name='scale[2]' label='규격3' labelPosition='left'
                            value={formData.scales[2]}
                            inputProps={{
                              'data-input-id': `scale2`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`scale2`);
                              }
                            }}
                            onChange={(e) => handleScaleChange(2, e.target.value)}/>
            <InputWithLabel name='scale[3]' label='규격4' labelPosition='left'
                            value={formData.scales[3]}
                            inputProps={{
                              'data-input-id': `scale3`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`scale3`);
                              }
                            }}
                            onChange={(e) => handleScaleChange(3, e.target.value)}/>
          </>
        ) : (
          <>
            <InputWithLabel name='prevName' label='기존 품목명' labelPosition='left' onChange={handleUpdateFormChange}
                            inputProps={{
                              'data-input-id': `prevName`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`prevName`);
                              }
                            }}
                            value={updateAllProdName.prevName}/>
            <InputWithLabel name='newName' label='새 품목명' labelPosition='left' onChange={handleUpdateFormChange}
                            inputProps={{
                              'data-input-id': `newName`,
                              onKeyDown: async (e) => {
                                if (e.key === 'Enter') await handleSubmit();
                              }
                            }}
                            value={updateAllProdName.newName}/>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSubmit}>확인</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductForm;