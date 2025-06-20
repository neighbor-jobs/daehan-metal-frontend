import React, {useEffect, useState} from 'react';
import {Box, Button, Divider, Paper, Typography} from '@mui/material';
import InputWithLabel from '../../components/InputWithLabel.tsx';
import axiosInstance from '../../api/axios.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import {PatchBank, PatchEmployee, PostEmployee} from '../../types/employeeReq.ts';
import dayjs from 'dayjs';
import {moveFocusToNextInput, moveFocusToPrevInput} from '../../utils/focus.ts';
import {formatAccountNumber, formatPhoneNumber, formatStringDate} from '../../utils/format.ts';
import {Bank} from '../../types/vendorRes.ts';

interface EmployeeFormProps {
  type: 'create' | 'edit' | 'read' | null;
  prevEmployeeData?: PatchEmployee | null;
  prevBankData?: PatchBank | null;
  retirementAt?: string;
  onSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onClickEdit?: () => void;
  onClose?: () => void;
}

const defaultFormData: PostEmployee = {
  banks: {
    accountNumber: '',
    accountOwner: '',
    bankName: '',
  },
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
                        onSuccess,
                        onDeleteSuccess,
                        onClickEdit,
                        onClose
                      }: EmployeeFormProps): React.JSX.Element => {
  const [formData, setFormData] = useState<PostEmployee>(defaultFormData);
  const [updateEmployee, setUpdateEmployee] = useState<PatchEmployee | null>(prevEmployeeData);
  const [updateBank, setUpdateBank] = useState<PatchBank | Bank | null>(prevBankData);
  const {showAlert} = useAlertStore();

  // console.log('prev bank data: ', prevBankData)

  const isDisabled = type === 'read' || type === null;
  const isCreate = type === 'create';

  useEffect(() => {
    if (type === 'create' || type === null) {
      setFormData(defaultFormData);
    } else if ((type === 'edit' || type === 'read') && updateEmployee) {
      setUpdateEmployee(updateEmployee);
    }
  }, [type, prevEmployeeData, prevBankData, updateEmployee]);

  /* create 용 handler */
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    let value = e.target.value;

    if (name === 'phoneNumber') value = formatPhoneNumber(value);
    else if (name === 'birth'
      || name === 'retirementAt'
    ) value = formatStringDate(value);

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
        [name]: name === 'accountNumber' ? formatAccountNumber(value) : value,
      }
    }));
  }

  /* update 용 handler */
  const handleUpdateInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setUpdateEmployee(prev =>
      prev
        ? {
          ...prev,
          info: {...prev.info, [name]: value}
        }
        : null
    );
  };
  const handleUpdateBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setUpdateBank(prev =>
      prev
        ? {...prev, [name]: value}
        : {...prevBankData, [name]: value}
    );
  };

  const createEmployee = async () => {
    // 기본 정보 필드 유효성 검사
    const requiredFields = [
      {name: '성명', value: formData.info.name},
      {name: '나이', value: formData.info.age},
      {name: '직무', value: formData.info.position},
      {name: '내/외국인', value: formData.info.countryCode},
    ];

    const missingField = requiredFields.find(field => !field.value);
    if (missingField) {
      showAlert(`'${missingField.name}'은(는) 필수 입력 값입니다.`, 'info');
      return;
    }

    // 은행 정보 필드 유효성 검사
    const bank = formData.banks;
    const allEmpty = !bank.accountNumber && !bank.accountOwner && !bank.bankName;
    const allFilled = bank.accountNumber && bank.accountOwner && bank.bankName;

    if (!allEmpty && !allFilled) {
      showAlert('은행 정보를 입력할 경우 모든 필드를 채워야 합니다.', 'warning');
      return;
    }

    const banks = allEmpty ? [] : [bank];

    const infoPayload = {
      ...formData.info,
      age: Number(formData.info.age),
      email: formData.info.email || undefined,
      phoneNumber: formData.info.phoneNumber || undefined,
      birth: formData.info.birth || undefined,
    };

    try {
      await axiosInstance.post('/employee', {
        info: infoPayload,
        banks,
        startWorkingAt: formData.startWorkingAt ? formData.startWorkingAt : undefined,
      });
      showAlert('사원 등록이 완료되었습니다.', 'success');
      setFormData(defaultFormData);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      showAlert('사원 등록에 실패했습니다.', 'error');
    }
  };

  const patchEmployee = async () => {
    const requiredFields = [
      {name: '성명', value: updateEmployee.info.name},
      {name: '나이', value: updateEmployee.info.age},
      {name: '직무', value: updateEmployee.info.position},
      {name: '내/외국인', value: updateEmployee.info.countryCode},
    ];

    const missingField = requiredFields.find(field => !field.value);
    if (missingField) {
      showAlert(`'${missingField.name}'은(는) 필수 입력 값입니다.`, 'info');
      return;
    }

    // 은행 정보 필드 유효성 검사
    const allEmpty = !updateBank.accountNumber && !updateBank.accountOwner && !updateBank.bankName;
    const allFilled = updateBank.accountNumber && updateBank.accountOwner && updateBank.bankName;

    if (!allEmpty && !allFilled) {
      showAlert('은행 정보를 입력할 경우 모든 필드를 채워야 합니다.', 'warning');
      return;
    }

    const infoPayload = {
      ...updateEmployee.info,
      age: Number(updateEmployee.info.age),
      email: updateEmployee.info.email || undefined,
      phoneNumber: updateEmployee.info.phoneNumber || undefined,
      birth: updateEmployee.info.birth || undefined,
    };

    try {
      await axiosInstance.patch('/employee', {
        id: updateEmployee.id,
        info: infoPayload,
        startWorkingAt: updateEmployee.startWorkingAt || undefined,
        retirementAt: updateEmployee.retirementAt || undefined,
      });
      if (allFilled) {
        await axiosInstance.patch('/employee/bank', updateBank);
      }
      showAlert('사원 정보 수정이 완료되었습니다.', 'success');
      if (onSuccess) onSuccess();
    } catch (error) {
      showAlert('사원 정보 수정에 실패했습니다.', 'error');
    }
  }

  const deleteEmployee = async () => {
    try {
      await axiosInstance.delete(`/employee?id=${updateEmployee.id}`);
      if (onDeleteSuccess) onDeleteSuccess();
    } catch {
      showAlert('사원 삭제에 실패했습니다. 재시도   해주세요.', 'error');
    }
  }

  // debug
  // console.log(formData);

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
                              : updateEmployee?.info.name ?? '-'
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          inputProps={{
                            disabled: isDisabled,
                            color: 'black',
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
                              : updateEmployee?.info.age ?? '-'
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          type='number'
                          inputProps={{
                            disabled: isDisabled,
                            color: 'black',
                            'data-input-id': `age`,
                            pattern: '[0-9]*',
                            onKeyDown: (e) => {
                              const isComposing = e.nativeEvent.isComposing;
                              if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) {
                                e.preventDefault();
                                moveFocusToNextInput(`age`);
                              } else if (!isComposing && e.key === 'ArrowUp') {
                                e.preventDefault();
                                moveFocusToPrevInput('age')
                              }
                            }
                          }}/>
          <InputWithLabel name='birth' label='생년월일' labelPosition='left'
                          placeholder='0000-00-00'
                          value={
                            isCreate
                              ? formData.info.birth
                              : updateEmployee?.info.birth ?? '-'
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          inputProps={{
                            disabled: isDisabled,
                            color: 'black',
                            'data-input-id': `birth`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`birth`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('birth');
                            }
                          }}/>
          <InputWithLabel name='phoneNumber' label='핸드폰번호' labelPosition='left'
                          value={
                            isCreate
                              ? formData.info.phoneNumber
                              : updateEmployee?.info.phoneNumber ?? '-'
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          placeholder='000-0000-0000'
                          inputProps={{
                            disabled: isDisabled,
                            color: 'black',
                            'data-input-id': `phoneNumber`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`phoneNumber`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('phoneNumber');
                            }
                          }}
          />
          <InputWithLabel name='hireDate' label='입사일' labelPosition='left'
                          placeholder='0000-00-00'
                          value={
                            isCreate
                              ? formData.startWorkingAt
                              : updateEmployee?.startWorkingAt ?? '-'
                          }
                          onChange={
                            isCreate
                              ? (e) => setFormData((prev) => ({...prev, startWorkingAt: formatStringDate(e.target.value)}))
                              : (e) => setUpdateEmployee((prev) => ({...prev, startWorkingAt: e.target.value}))
                          }
                          inputProps={{
                            disabled: isDisabled,
                            color: 'black',
                            'data-input-id': `hireDate`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`hireDate`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('hireDate');
                            }
                          }}
          />
          <InputWithLabel name='position' label='직무' labelPosition='left'
                          placeholder='필수 입력란입니다.'
                          value={
                            isCreate
                              ? formData.info.position
                              : updateEmployee?.info.position ?? '-'
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          inputProps={{
                            disabled: isDisabled,
                            color: 'black',
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
                              : updateEmployee?.info.email ?? '-'
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          inputProps={{
                            disabled: isDisabled,
                            color: 'black',
                            'data-input-id': `email`,
                            onKeyDown: (e) => {
                              if (e.key === 'Enter' || e.key === 'ArrowDown') moveFocusToNextInput(`email`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('email');
                            }
                          }}
          />
          <InputWithLabel name='countryCode' label='내/외국인' labelPosition='left'
                          value={
                            isCreate
                              ? formData.info.countryCode
                              : updateEmployee?.info.countryCode ?? '-'
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          placeholder='필수 입력 란입니다.'
                          inputProps={{
                            disabled: isDisabled,
                            color: 'black',
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
                              : updateEmployee?.info.address ?? '-'
                          }
                          onChange={
                            isCreate
                              ? handleInfoChange
                              : handleUpdateInfoChange
                          }
                          inputProps={{
                            disabled: isDisabled,
                            color: 'black',
                            'data-input-id': `address`,
                            onKeyDown: (e) => {
                              const isComposing = e.nativeEvent.isComposing;
                              if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`address`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('address');
                            }
                          }}
          />
          {(type !== 'create') && (
            <InputWithLabel
              name='retirementAt'
              label='퇴사일'
              labelPosition='left'
              placeholder='0000-00-00'
              value={updateEmployee?.retirementAt || '-'}
              onChange={(e) => setUpdateEmployee((prev) => ({...prev, retirementAt: e.target.value}))}
              inputProps={{
                disabled: isDisabled,
                color: 'black',
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
          <Box sx={{display: 'flex', alignItems: 'end', gap: 1}}>
            <Typography variant='h6'>은행 정보</Typography>
            <Typography variant='caption'>* 은행 정보 입력 시 모든 필드를 입력하세요.</Typography>
          </Box>
          <Divider/>
          <InputWithLabel name='bankName' label='은행명' labelPosition='left'
                          value={
                            isCreate
                              ? formData.banks.bankName
                              : updateBank?.bankName ?? '-'
                          }
                          onChange={
                            isCreate
                              ? handleBanksChange
                              : handleUpdateBankChange
                          }
                          inputProps={{
                            disabled: isDisabled,
                            color: 'black',
                            'data-input-id': `bankName`,
                            onKeyDown: (e) => {
                              const isComposing = e.nativeEvent.isComposing;
                              if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`bankName`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('bankName');
                            }
                          }}
          />
          <InputWithLabel name='accountOwner' label='예금주' labelPosition='left'
                          value={
                            isCreate
                              ? formData.banks.accountOwner
                              : updateBank?.accountOwner ?? '-'
                          }
                          onChange={
                            isCreate
                              ? handleBanksChange
                              : handleUpdateBankChange
                          }
                          inputProps={{
                            disabled: isDisabled,
                            color: 'black',
                            'data-input-id': `accountOwner`,
                            onKeyDown: (e) => {
                              const isComposing = e.nativeEvent.isComposing;
                              if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`accountOwner`);
                              else if (e.key === 'ArrowUp') moveFocusToPrevInput('accountOwner');
                            }
                          }}
          />
          <InputWithLabel name='accountNumber' label='계좌번호' labelPosition='left'
                          value={
                            isCreate
                              ? formData.banks.accountNumber
                              : updateBank?.accountNumber ?? '-'
                          }
                          onChange={
                            isCreate
                              ? handleBanksChange
                              : handleUpdateBankChange
                          }
                          inputProps={{
                            disabled: isDisabled,
                            color: 'black',
                            'data-input-id': `accountNumber`,
                            onKeyDown: async (e) => {
                              const isComposing = e.nativeEvent.isComposing;
                              if (!isComposing && (e.key === 'Enter')) {
                                if (type === 'create') await createEmployee();
                                else if (type === 'edit') await patchEmployee();
                              } else if (e.key === 'ArrowUp') moveFocusToPrevInput('accountNumber');
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
              <Button onClick={onClickEdit}>수정</Button>
              <Button color='error' onClick={deleteEmployee}>삭제</Button>
            </>
          )}
          {type === 'edit' && (
            <>
              <Button onClick={patchEmployee}>수정</Button>
              <Button color='error' onClick={onClose}>취소</Button>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  )
}

export default EmployeeForm;