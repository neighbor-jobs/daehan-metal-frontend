import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import {Box} from '@mui/material';

export interface DeleteConfirmDialogProps {
  isOpen: boolean;
  paymentId?: string;
  payrollRegisterId?: string;
  onSuccess?: () => void;
  onClose: () => void;
  onClick: () => void;
  dialogContentText? : string;
}

const DeletePaymentConfirmDialog = ({
                                      /*paymentId,
                                      payrollRegisterId,
                                      onSuccess,*/
                                      isOpen,
                                      onClose,
                                      onClick,
                                      dialogContentText
                                    }: DeleteConfirmDialogProps) => {
  // const {showAlert} = useAlertStore();
  /* PATCH /payroll/payment/pop */
/*
  const deletePayment = async () => {
    try {
      await axiosInstance.patch('/payroll/payment/pop', {
        paymentId: paymentId,
        payrollRegisterId: payrollRegisterId,
      })
    } catch {
      showAlert('해당 사원 급여내역 삭제 실패', 'error')
    }
    showAlert('해당 사원의 급여내역을 삭제했습니다.', 'success');
    if (onSuccess) onSuccess();
  }
*/

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      component={Box}
    >
      <DialogContent>
        <DialogContentText id="alert-dialog-description" fontSize='small' color='black'>
          {dialogContentText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={onClose}>취소</Button>
        <Button variant='outlined' color='error' onClick={onClick} autoFocus>
          삭제
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeletePaymentConfirmDialog;