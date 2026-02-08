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
  dialogContentText?: string;
}

const DeleteConfirmDialog = ({
                               isOpen,
                               onClose,
                               onClick,
                               dialogContentText,
                               onSuccess
                             }: DeleteConfirmDialogProps) => {
  const click = () => {
    onClick();
    if (onSuccess) onSuccess();
  }
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
        <Button variant='outlined' color='error' onClick={click} autoFocus>
          삭제
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteConfirmDialog;