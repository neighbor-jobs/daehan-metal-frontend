import React, {useEffect, useState} from 'react';
import {Box, Button, Divider, Paper, Typography} from '@mui/material';
import InputWithLabel from '../../components/InputWithLabel.tsx';
import axiosInstance from '../../api/axios.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {PatchBank, PatchEmployee, PostEmployee} from '../../types/employeeReq.ts';
import dayjs from 'dayjs';
import {moveFocusToNextInput, moveFocusToPrevInput} from '../../utils/focus.ts';

interface EmployeeFormProps {
  type: 'create' | 'edit' | 'read' | null;
  prevEmployeeData?: PatchEmployee | null;
  prevBankData?: PatchBank | null;
  retirementAt?: string;
  onSuccess?: () => void;
}

const defaultFormData: PostEmployee = {
  banks: [
    {
      accountNumber: '',
      accountOwner: '',
      bankName: '',
    },
  ],
  info: {
    name: '',
    age: '',
    countryCode: '',
    position: '',
    address: '',
    email: '',
    birth: '',
    phoneNumber: ''
  },
  startWorkingAt: dayjs().format('YYYY-MM-DD'),
};

const EmployeeForm = ({
                        type = null,
                        prevEmployeeData,
                        prevBankData,
                        onSuccess
                      }: EmployeeFormProps): React.JSX.Element => {
  const [formData, setFormData] = useState<PostEmployee>(defaultFormData);
  const [updateEmployee, setUpdateEmployee] = useState<PatchEmployee | null>(prevEmployeeData);
  const [updateBank, setUpdateBank] = useState<PatchBank | null>(prevBankData);
  const { showAlert } = useAlertStore();

  const isDisabled = type === 'read' || type === null;
  const isCreate = type === 'create';

  // Reflect todo requirements on form data and disabled state
  useEffect(() => {
    if (type === 'create' || type === null) {
      setFormData(defaultFormData);
    } else if ((type === 'edit' || type === 'read') && updateEmployee) {
      setUpdateEmployee(updateEmployee);
    }
  }, [type, prevEmployeeData, prevBankData, updateEmployee]);

  /* create 용 handler */
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      info: {
        ...prev.info,
        [name]: value,
      }
    }));
  }
  const handleBanksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      banks: {
        ...prev.banks,
        [name]: value,
      }
    }));
  }

  /* update 용 handler */
  const handleUpdateInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateEmployee(prev =>
      prev
        ? { ...prev,
          info: { ...prev.info, [name]: value }
        }
        : null
    );
  };
  const handleUpdateBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateBank(prev =>
      prev
        ? { ...prev, [name]: value }
        : { ...prevBankData, [name]: value }
    );
  };

  const createEmployee = async () => {
    const infoPayload = {
      ...formData.info,
      age: Number(formData.info.age)
    };

    if (infoPayload.email === '') {
      infoPayload.email = undefined;
    }
    if (infoPayload.phoneNumber === '') {
      infoPayload.phoneNumber = undefined;
    }
    if (infoPayload.birth === '') {
      infoPayload.birth = undefined;
    }

    const payload: PostEmployee = {
      info: infoPayload,
      banks: formData.banks,
      startWorkingAt: formData.startWorkingAt ? formData.startWorkingAt : undefined,
    };

    try {
      await axiosInstance.post('/employee', payload);
      showAlert('사원 등록이 완료되었습니다.', 'success');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      showAlert('사원 등록에 실패했습니다.', 'error');
    }
  };

  const deleteEmployee = async () => {
    try {
      await axiosInstance.delete(`/employee?id=${updateEmployee.id}`);
    } catch {
      showAlert('사원 삭제에 실패했습니다.', 'error');
    }
  }

  // debug
  // console.log(formData);
  console.log('patch: ', updateEmployee, updateBank);

  return (
    <Paper sx={{
      minHeight: '100vh',
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        py: 1,
        px: 2,
      }}>
        {/* 기본 정보 */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}>
          <Typography variant='h6'>기본 정보</Typography>
          <Divider/>
          <InputWithLabel name='name' label='성명' labelPosition='left'
                          placeholder='필수 입력란입니다.'
                          value={
                            isCreate
                              ? formData.info.name
                              : updateEmployee?.info.name ?? ''
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          disabled={isDisabled}
                          inputProps={{
                            'data-input-id': `name`,
                            onKeyDown: (e) => {
                              const isComposing = e.nativeEvent.isComposing;
                              if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) {
                                moveFocusToNextInput('name');
                              }
                            }
                          }}/>
          <InputWithLabel name='age' label='나이' labelPosition='left'
                          placeholder='필수 입력란입니다.'
                          value={
                            isCreate
                              ? formData.info.age
                              : updateEmployee?.info.age ?? ''
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          disabled={isDisabled}
                          inputProps={{
                            'data-input-id': `age`,
                            onKeyDown: (e) => {
                              const isComposing = e.nativeEvent.isComposing;
                              if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`age`);
                              else if (!isComposing && e.key === 'ArrowUp') moveFocusToPrevInput('age')
                            }
                          }}/>
          <InputWithLabel name='birth' label='생년월일' labelPosition='left'
                          placeholder='0000-00-00'
                          value={
                            isCreate
                              ? formData.info.birth
                              : updateEmployee?.info.birth ?? ''
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          disabled={isDisabled}
                          inputProps={{
                            'data-input-id': `birth`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`birth`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('birth');                            }
                          }}/>

          <InputWithLabel label='핸드폰번호' labelPosition='left'
                          value={
                            isCreate
                              ? formData.info.phoneNumber
                              : updateEmployee?.info.phoneNumber ?? ''
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          disabled={isDisabled}
                          inputProps={{
                            'data-input-id': `phoneNumber`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`phoneNumber`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('phoneNumber');                            }
                          }}
          />
          <InputWithLabel name='hireDate' label='입사일' labelPosition='left'
                          disabled={isDisabled}
                          placeholder='0000-00-00'
                          value={
                            isCreate
                              ? formData.startWorkingAt
                              : updateEmployee?.startWorkingAt ?? ''
                          }
                          onChange={
                            isCreate
                              ? (e) => setFormData((prev) => ({...prev, startWorkingAt: e.target.value}))
                              : (e) => setUpdateEmployee((prev) => ({...prev, startWorkingAt: e.target.value}))
                          }
                          inputProps={{
                            'data-input-id': `hireDate`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`hireDate`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('hireDate');                            }
                          }}
          />
          <InputWithLabel name='position' label='직무' labelPosition='left'
                          placeholder='필수 입력란입니다.'
                          value={
                            isCreate
                              ? formData.info.position
                              : updateEmployee?.info.position ?? ''
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          disabled={isDisabled}
                          inputProps={{
                            'data-input-id': `position`,
                            onKeyDown: (e) => {
                              const isComposing = e.nativeEvent.isComposing;
                              if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`position`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('position');
                            }
                          }}
          />
          <InputWithLabel name='email' label='이메일' labelPosition='left'
                          value={
                            isCreate
                              ? formData.info.email
                              : updateEmployee?.info.email ?? ''
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          disabled={isDisabled}
                          inputProps={{
                            'data-input-id': `email`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`email`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('email');                            }
                          }}
          />
          <InputWithLabel name='countryCode' label='내/외국인' labelPosition='left'
                          value={
                            isCreate
                              ? formData.info.countryCode
                              : updateEmployee?.info.countryCode ?? ''
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          placeholder='필수 입력 란입니다.'
                          disabled={isDisabled}
                          inputProps={{
                            'data-input-id': `countryCode`,
                            onKeyDown: (e) => {
                              const isComposing = e.nativeEvent.isComposing;
                              if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`countryCode`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('countryCode');
                            }
                          }}
          />
          <InputWithLabel name='address' label='주소' labelPosition='left'
                          value={
                            isCreate
                              ? formData.info.address
                              : updateEmployee?.info.address ?? ''
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          disabled={isDisabled}
                          inputProps={{
                            'data-input-id': `address`,
                            onKeyDown: (e) => {
                              const isComposing = e.nativeEvent.isComposing;
                              if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`address`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('address');
                            }
                          }}
          />
          {(type === 'read' || type === 'edit') && (
            <InputWithLabel
              name='retirementAt'
              label='퇴사일'
              labelPosition='left'
              placeholder='0000-00-00'
              value={updateEmployee?.retirementAt || '-'}
              onChange={(e) => setUpdateEmployee((prev) => ({...prev, retirementAt: e.target.value}))}
              disabled={isDisabled}
              inputProps={{
                'data-input-id': `retirementAt`,
                onKeyDown: (e) => {
                  if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput('retirementAt')
                  else if (e.key === 'ArrowUp') moveFocusToPrevInput('retirementAt')
                }
              }}
            />
          )}
        </Box>

        {/* 은행 정보 */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          mt: 2,
        }}>
          <Typography variant='h6'>은행 정보</Typography>
          <Divider/>
          <InputWithLabel name='bankName' label='은행명' labelPosition='left'
                          onChange={handleBanksChange}
                          value={formData.banks[0].bankName}
                          inputProps={{
                            'data-input-id': `bankName`,
                            onKeyDown: (e) => {
                              const isComposing = e.nativeEvent.isComposing;
                              if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`bankName`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('bankName');
                            }
                          }}
          />
          <InputWithLabel name='accountOwner' label='예금주' labelPosition='left'
                          onChange={handleBanksChange}
                          value={formData.banks[0].accountOwner}
                          inputProps={{
                            'data-input-id': `accountOwner`,
                            onKeyDown: (e) => {
                              const isComposing = e.nativeEvent.isComposing;
                              if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`accountOwner`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('accountOwner');
                            }
                          }}
          />
          <InputWithLabel name='accountNumber' label='계좌번호' labelPosition='left'
                          onChange={handleBanksChange}
                          value={formData.banks[0].accountNumber}
                          inputProps={{
                            'data-input-id': `accountNumber`,
                            onKeyDown: (e) => {
                              const isComposing = e.nativeEvent.isComposing;
                              if (!isComposing && (e.key === 'Enter')) { /* todo patch api */}
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('accountNumber');
                            }
                          }}
          />
        </Box>

        {/* 버튼들 */}
        <Box sx={{
          mt: 4,
          placeSelf: 'center'
        }}>
          {(type === 'create' || type === null) && (
            <>
              <Button onClick={createEmployee}>저장</Button>
              <Button color='error'>취소</Button>
            </>
          )}
          {type === 'read' && (
            <>
              <Button>수정</Button>
              <Button color='error' onClick={deleteEmployee}>삭제</Button>
            </>
          )}
          {type === 'edit' && (
            <>
              <Button>수정</Button>
              <Button color='error'>취소</Button>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  )
}

export default EmployeeForm;