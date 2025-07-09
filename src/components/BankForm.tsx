import React, {useEffect, useState} from 'react';
import {PatchVendorBankReqBody, PostVendorBankReqBody} from '../types/vendorReq.ts';
import {useAlertStore} from '../stores/alertStore.ts';
import axiosInstance from '../api/axios.ts';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton} from '@mui/material';
import InputWithLabel from './InputWithLabel.tsx';
import {moveFocusToNextInput, moveFocusToPrevInput} from '../utils/focus.ts';
import {BankDialogType} from '../types/dialogTypes.ts';
import CloseIcon from '@mui/icons-material/Close';

interface BankFormProps {
  isEdit: BankDialogType;
  defaultFormData?: PostVendorBankReqBody | PatchVendorBankReqBody;
  companyName?: string;
  isOpened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSwitchEditToCreate: () => void;
}

const BankForm = ({
                    isEdit,
                    defaultFormData,
                    companyName,
                    isOpened,
                    onClose,
                    onSuccess,
                    onSwitchEditToCreate
                  }: BankFormProps): React.JSX.Element => {
  const [bankData, setBankData] = useState<PostVendorBankReqBody | PatchVendorBankReqBody>(defaultFormData || {
    infoId: '',
    bankName: '',
    accountNumber: '',
    accountOwner: '',
  });
  const {showAlert, openAlert: alertOpen} = useAlertStore();

  const handleBankInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBankData({
      ...bankData,
      [event.target.name]: event.target.value
    });
  };

  // api
  const handleBankSubmit = async () => {
    if (bankData.bankName.length === 0 || bankData.accountNumber.length === 0) {
      showAlert('필수 입력 값을 확인해주세요.');
      return;
    }

    if (isEdit === BankDialogType.EDIT) {
      await axiosInstance.patch('/vendor/bank', bankData);
    } else {
      await axiosInstance.post('/vendor/bank', {
        infoId: bankData.infoId,
        bankName: bankData.bankName,
        accountNumber: bankData.accountNumber,
        accountOwner: bankData.accountOwner,
      });
    }
    showAlert('은행 정보 반영 성공', 'success');
    if (onSuccess) onSuccess();
  }

  const deleteBank = async () => {
    try {
      if ('bankId' in bankData)
        await axiosInstance.delete(`/vendor/bank?vendorName=${companyName}&bankId=${bankData.bankId}`);
    } catch {
      showAlert('은행정보 삭제 실패. 재시도 바랍니다.');
    }
    if (onSuccess) onSuccess();
  }

  useEffect(() => {
    setBankData(defaultFormData || {
      infoId: '',
      bankName: '',
      accountNumber: '',
      accountOwner: '',
    });
  }, [defaultFormData]);

  // debug
  // console.log('수정:', isEdit);

  return (
    <Dialog open={isOpened}
            disableEscapeKeyDown={alertOpen}
            onClose={onClose}
    >
      <IconButton onClick={onClose} size='small'
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                  }}
      >
        <CloseIcon/>
      </IconButton>
      <DialogTitle>
        {isEdit === BankDialogType.EDIT ? '계좌수정' : '계좌등록'}
      </DialogTitle>
      <DialogContent
        sx={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 500}}
      >
        <InputWithLabel name='accountOwner' label='예금주' labelPosition='left' onChange={handleBankInputChange}
                        placeholder='필수 입력 값입니다.'
                        inputProps={{
                          'data-input-id': `accountOwner`,
                          onKeyDown: (e) => {
                            const isComposing = e.nativeEvent.isComposing;
                            if (!isComposing &&(e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`accountOwner`);
                          }
                        }}
                        value={bankData?.accountOwner}/>
        <InputWithLabel name='bankName' label='은행명' labelPosition='left' onChange={handleBankInputChange}
                        placeholder='필수 입력 값입니다.'
                        inputProps={{
                          'data-input-id': `bankName`,
                          onKeyDown: (e) => {
                            const isComposing = e.nativeEvent.isComposing;
                            if (!isComposing &&(e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`bankName`);
                            else if (e.key === 'ArrowUp') moveFocusToPrevInput('bankName');
                          }
                        }}
                        value={bankData?.bankName}/>
        <InputWithLabel name='accountNumber' label='계좌번호' labelPosition='left' onChange={handleBankInputChange}
                        placeholder='필수 입력 값입니다.'
                        inputProps={{
                          'data-input-id': `accountNumber`,
                          onKeyDown: async (e) => {
                            if (e.key === 'Enter') await handleBankSubmit();
                            else if (e.key === 'ArrowUp') moveFocusToPrevInput('accountNumber');
                          }
                        }}
                        value={bankData?.accountNumber}/>
      </DialogContent>
      <DialogActions>
        {isEdit === BankDialogType.EDIT && (
          <>
            <Button color='error' onClick={deleteBank}>
              삭제
            </Button>
            <Button onClick={() => {
              onSwitchEditToCreate();
              setBankData(prev => ({
                infoId: prev.infoId,
                bankName: '',
                accountOwner: '',
                accountNumber: '',
              }))
            }}>
              은행 정보 추가
            </Button>
          </>
        )}
        <Button onClick={handleBankSubmit}>
          {isEdit === BankDialogType.EDIT ? '수정' : '등록'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BankForm;