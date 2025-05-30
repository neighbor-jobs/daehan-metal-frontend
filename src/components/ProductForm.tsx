import React, {useEffect, useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import InputWithLabel from './InputWithLabel.tsx';
import {useAlertStore} from '../stores/alertStore.ts';
import {ProductDialogType} from '../types/dialogTypes.ts';
import axiosInstance from '../api/axios.ts';
import {moveFocusToNextInput, moveFocusToPrevInput} from '../utils/focus.ts';
import {Product} from '../types/productRes.ts';

interface ProductFormProps {
  dialogType: ProductDialogType;
  defaultFormData?: any;
  productList: Product[];
  productName?: string;
  prevScaleName?: string;
  isOpened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProductForm = ({
                       dialogType = ProductDialogType.CREATE,
                       productList = [],
                       productName,
                       prevScaleName,
                       isOpened,
                       onClose,
                       onSuccess,
                     }: ProductFormProps): React.JSX.Element => {
  const [formData, setFormData] = useState({
    name: '',
    scales: ['', '', '', ''],
  });
  const [updateScaleName, setUpdateScaleName] = useState({
    prevName: prevScaleName ?? '',
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
    setUpdateScaleName({
      ...updateScaleName,
      [event.target.name]: event.target.value
    })
  }

  const handleSubmit = async () => {
    if (dialogType === ProductDialogType.CREATE) {
      if (!formData.name) {
        showAlert('품명은 필수 입력 값입니다.', 'info');
        return;
      }
      const validScales = formData.scales.filter(s => s && s.trim() !== '');

      // 중복 규격 검사 및 알림
      const duplicateScales = productList
        .find((product) => product.name === formData.name)
        ?.scales.filter((existingScale) => validScales.includes(existingScale)) || [];

      if (duplicateScales.length > 0) {
        const dupMsg = duplicateScales.join(', ');
        showAlert(`"${formData.name}" 품목에 이미 등록된 규격: ${dupMsg}`, 'warning');
        return;
      }

      try {
        await axiosInstance.post('/product', {
          name: formData.name,
          scales: validScales,
        });
        showAlert('등록이 완료되었습니다.', 'success');
        setFormData({
          name: '',
          scales: ['', '', '', ''],
        })
        if (onSuccess) onSuccess();
        onClose();
      } catch (err) {
        showAlert('등록에 실패했습니다. 다시 시도해 주세요.', 'error');
      }
    } else {
      if (updateScaleName.newName.length === 0) {
        showAlert('새 규격명이 빈칸입니다.', 'info');
        return;
      }
      const prevScales = productList.find((item) => item.name === productName).scales ?? [];
      if (prevScales.includes(updateScaleName.newName)) {
        showAlert('이미 존재하는 규격명입니다. 다른 이름으로 입력해주세요.', 'warning');
        return;
      }

      try {
        const updatedScales = prevScales?.map((scale) =>
          scale === updateScaleName.prevName ? updateScaleName.newName : scale
        );

        await axiosInstance.put('/product/scale', {
          name: productName,
          scales: updatedScales,
        });

        showAlert('수정이 완료되었습니다.', 'success');
        if (onSuccess) onSuccess();
        onClose();
      } catch {
        showAlert('규격명 수정에 실패했습니다. 다시 시도해주세요.', 'error');
      }
    }
  }

  useEffect(() => {
    if (dialogType === ProductDialogType.EDIT && prevScaleName) {
      setUpdateScaleName((prev) => ({
        ...prev,
        prevName: prevScaleName,
      }));
    }
  }, [dialogType, prevScaleName]);

  // debug
  // console.log(formData);

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
                                const isComposing = e.nativeEvent.isComposing;
                                if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`name`);
                              }
                            }}
                            value={formData.name}/>
            <InputWithLabel label='규격1' labelPosition='left'
                            value={formData.scales[0]}
                            inputProps={{
                              'data-input-id': `scale0`,
                              onKeyDown: (e) => {
                                const isComposing = e.nativeEvent.isComposing;
                                if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`scale0`);
                                else if (!isComposing && e.key === 'ArrowUp') moveFocusToPrevInput('scale0');
                              }
                            }}
                            onChange={(e) => handleScaleChange(0, e.target.value)}/>
            <InputWithLabel name='scale[1]' label='규격2' labelPosition='left'
                            value={formData.scales[1]}
                            inputProps={{
                              'data-input-id': `scale1`,
                              onKeyDown: (e) => {
                                const isComposing = e.nativeEvent.isComposing;
                                if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`scale1`);
                                else if (!isComposing && e.key === 'ArrowUp') moveFocusToPrevInput('scale1');
                              }
                            }}
                            onChange={(e) => handleScaleChange(1, e.target.value)}/>
            <InputWithLabel name='scale[2]' label='규격3' labelPosition='left'
                            value={formData.scales[2]}
                            inputProps={{
                              'data-input-id': `scale2`,
                              onKeyDown: (e) => {
                                const isComposing = e.nativeEvent.isComposing;
                                if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`scale2`);
                                else if (!isComposing && e.key === 'ArrowUp') moveFocusToPrevInput('scale2');
                              }
                            }}
                            onChange={(e) => handleScaleChange(2, e.target.value)}/>
            <InputWithLabel name='scale[3]' label='규격4' labelPosition='left'
                            value={formData.scales[3]}
                            inputProps={{
                              'data-input-id': `scale3`,
                              onKeyDown: async (e) => {
                                const isComposing = e.nativeEvent.isComposing;
                                if (!isComposing && e.key === 'Enter') await handleSubmit();
                                else if (!isComposing && e.key === 'ArrowUp') moveFocusToPrevInput('scale3');
                              }
                            }}
                            onChange={(e) => handleScaleChange(3, e.target.value)}/>
          </>
        ) : (
          <>
            <InputWithLabel name='prevName'
                            label='기존 규격명' labelPosition='left'
                            onChange={handleUpdateFormChange}
                            disabled
                            inputProps={{
                              'data-input-id': `prevName`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`prevName`);
                              }
                            }}
                            value={updateScaleName.prevName}/>
            <InputWithLabel name='newName' label='새 규격명' labelPosition='left' onChange={handleUpdateFormChange}
                            inputProps={{
                              'data-input-id': `newName`,
                              onKeyDown: async (e) => {
                                if (e.key === 'Enter') await handleSubmit()
                              }
                            }}
                            value={updateScaleName.newName}/>
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