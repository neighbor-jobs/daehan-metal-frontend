import {useAlertStore} from '../stores/alertStore.ts';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableRow, Typography
} from '@mui/material';
import {useEffect, useState} from 'react';
import {moveFocusToNextInput, moveFocusToPrevInput} from '../utils/focus.ts';
import cacheManager from '../utils/cacheManager.ts';

interface DeductionListProps {
  isOpened: boolean;
  onClose?: () => void;
  onSuccess?: (updatedDeduction: string[]) => void;
  defaultDeductionList: string[];
}

const DeductionList = ({
                         isOpened,
                         onClose,
                         onSuccess,
                         defaultDeductionList,
                       }: DeductionListProps): React.JSX.Element => {
  const {showAlert} = useAlertStore();
  const [deductionList, setDeductionList] = useState<string[]>([...defaultDeductionList, '', ''])

  const handleDeductionChange = (idx: number, value: string) => {
    const newList = [...deductionList];
    newList[idx] = value;
    setDeductionList(newList);
  }

  const updateDeductions = async () => {
    // 데이터 정제
    const cleaned = deductionList
      .map(d => d.trim())
      .filter(d => d.length > 0);

    // 캐시 데이터 업데이트
    await cacheManager.replaceDeductions(cleaned);

    // 작성중이던 급여대장 공제목록 업데이트
    if (onSuccess) onSuccess(cleaned);
    showAlert('공제 목록이 수정되었습니다.');
    if (onClose) onClose();
  }

  useEffect(() => {
    setDeductionList([...defaultDeductionList, '', '']);
  }, [defaultDeductionList, isOpened]);

  // debug
  // console.log(deductionList);

  return (
    <Dialog open={isOpened} onClose={onClose}>
      <DialogTitle>공제 목록 수정</DialogTitle>
      <DialogContent>
        <Table size='small' sx={{border: '1px solid lightgray'}}>
          <TableBody>
            {deductionList?.map((deduction, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Input
                    fullWidth
                    disableUnderline
                    value={deduction}
                    onChange={e => handleDeductionChange(idx, e.target.value)}
                    inputProps={{
                      'data-input-id': `deduction-${idx}`,
                      onKeyDown: async (e) => {
                        if (e.key === 'Enter' && idx === deductionList.length - 1) await updateDeductions();
                        const isComposing = e.nativeEvent.isComposing;
                        if (!isComposing && (e.key === 'Enter' || e.key === 'ArrowDown')) moveFocusToNextInput(`deduction-${idx}`);
                        else if (e.key === 'ArrowUp') moveFocusToPrevInput(`deduction-${idx}`);
                      }
                    }}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Typography color='error' fontSize='small'>
          (주의) 공제 목록을 수정하시면 작성중이던 내용은 초기화됩니다.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={updateDeductions}>수정</Button>
        <Button color='error' onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeductionList