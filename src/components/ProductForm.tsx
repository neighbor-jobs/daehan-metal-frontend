import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import InputWithLabel from './InputWithLabel.tsx';
import {useAlertStore} from '../stores/alertStore.ts';
import {ProductDialogType} from '../types/dialogTypes.ts';
import axiosInstance from '../api/axios.ts';
import getAllProducts from '../api/getAllProducts.ts';
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
    name: "",
    scale: ['', '', '', ''],
    unitWeight: "",
    stocks: 0,
    rawMatAmount: '',
    manufactureAmount: '',
    vCutAmount: '',
    vCut: '',
    productLength: '',
  });
  const [updateAllProdName, setUpdateAllProdName] = useState({
    prevName: '',
    newName: '',
  });
  const {showAlert} = useAlertStore();

  // handler
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleScaleChange = (index: number, value: string) => {
    const newScales = [...formData.scale];
    newScales[index] = value;
    setFormData((prev) => ({
      ...prev,
      scale: newScales,
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
      const isEmpty = formData.scale[0].length === 0 && formData.scale[1].length === 0 && formData.scale[2].length === 0 && formData.scale[3].length === 0;
      if (!formData.name || isEmpty) {
        showAlert('품목과 규격은 필수 입력 값입니다.', 'info');
        return;
      }
      const validScales = formData.scale.filter(s => s && s.trim() !== '');
      try {
        const failedScales: string[] = [];
        for (const scale of validScales) {
          try {
            await axiosInstance.post('/product', {
              name: formData.name,
              scale,
              unitWeight: formData.unitWeight,
              stocks: Number(formData.stocks) || 0,
              rawMatAmount: formData.rawMatAmount || '0',
              manufactureAmount: formData.manufactureAmount || '0',
              vCutAmount: formData.vCutAmount || '0',
              vCut: formData.vCut,
              productLength: formData.productLength,
            });
          } catch (err) {
            failedScales.push(scale);
          }
        }
        if (failedScales.length === 0) {
          showAlert('등록이 완료되었습니다.', 'success');
          if (onSuccess) onSuccess();
          onClose();
        } else if (failedScales.length === validScales.length) {
          showAlert('등록에 실패했습니다. 다시 시도해 주세요.', 'warning');
        } else {
          showAlert(`일부 등록에 실패했습니다: ${failedScales.join(', ')}`, 'error');
        }
      } catch {
        showAlert('요청이 실패했습니다. 재시도 해주세요.', 'error');
      }
    } else if (dialogType === ProductDialogType.EDIT_ONLY_PRODUCT_NAME) {
      try {
        const productList = await getAllProducts();
        const targetProducts = productList.filter(product => product.productName === updateAllProdName.prevName);
        if (targetProducts.length === 0) {
          showAlert('해당 품목명을 가진 제품이 없습니다.', 'error');
          return;
        }
        await axiosInstance.patch('/product', {
          id: targetProducts[0].id,
          infoId: targetProducts[0].info.id,
          productName: updateAllProdName.newName
        });
        if (onSuccess) onSuccess();
        onClose();
      } catch {
        showAlert('품목명 수정 실패. 재시도 해주세요', 'error');
      }
    }
  }

  return (
    <Dialog
      open={isOpened}
      onClose={onClose}
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
                            value={formData.name} />
            <InputWithLabel label='규격1' labelPosition='left'
                            value={formData.scale[0]} placeholder='필수 입력 값입니다.'
                            inputProps={{
                              'data-input-id': `scale0`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`scale0`);
                              }
                            }}
                            onChange={(e) => handleScaleChange(0, e.target.value)}/>
            <InputWithLabel name='scale[1]' label='규격2' labelPosition='left'
                            value={formData.scale[1]}
                            inputProps={{
                              'data-input-id': `scale1`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`scale1`);
                              }
                            }}
                            onChange={(e) => handleScaleChange(1, e.target.value)}/>
            <InputWithLabel name='scale[2]' label='규격3' labelPosition='left'
                            value={formData.scale[2]}
                            inputProps={{
                              'data-input-id': `scale2`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`scale2`);
                              }
                            }}
                            onChange={(e) => handleScaleChange(2, e.target.value)}/>
            <InputWithLabel name='scale[3]' label='규격4' labelPosition='left'
                            value={formData.scale[3]}
                            inputProps={{
                              'data-input-id': `scale3`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`scale3`);
                              }
                            }}
                            onChange={(e) => handleScaleChange(3, e.target.value)}/>
            <InputWithLabel name='unitWeight' label='단중' labelPosition='left' onChange={handleInputChange}
                            inputProps={{
                              'data-input-id': `unitWeight`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`unitWeight`);
                              }
                            }}
                            value={formData.unitWeight}/>
            <InputWithLabel name='vCut' label='V컷' labelPosition='left' onChange={handleInputChange}
                            inputProps={{
                              'data-input-id': `vCut`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`vCut`);
                              }
                            }}
                            value={formData.vCut}/>
            <InputWithLabel name='vCutAmount' label='V컷가공비' labelPosition='left' onChange={handleInputChange}
                            inputProps={{
                              'data-input-id': `vCutAmount`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`vCutAmount`);
                              }
                            }}
                            value={formData.vCutAmount}/>
            <InputWithLabel name='stocks' label='재고' labelPosition='left' onChange={handleInputChange}
                            inputProps={{
                              'data-input-id': `stocks`,
                              onKeyDown: (e) => {
                                if (e.key === 'Enter') moveFocusToNextInput(`stocks`);
                              }
                            }}
                            value={formData.stocks}/>
            <InputWithLabel name='productLength' label='길이' labelPosition='left' onChange={handleInputChange}
                            inputProps={{
                              'data-input-id': `productLength`,
                              onKeyDown: async (e) => {
                                if (e.key === 'Enter') await handleSubmit();
                              }
                            }}
                            value={formData.productLength}/>
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
        <Button onSubmit={handleSubmit}>확인</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductForm;