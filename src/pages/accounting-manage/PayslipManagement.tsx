import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table, TableBody, TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

/**
 * 급여명세서 관리
 * */
interface PayslipProps {
  // TODO: type 재정의
  isOpen: boolean;
  employees: any[];
  payroll: any;
  onClose: () => void;
}

const PayslipManagement = ({isOpen,
                             employees,
                             onClose}
                             : PayslipProps): React.JSX.Element => {
  // TODO: /payment/push api 붙이기
  // TODO: /payment/pop api 붙이기

  return (
    <Dialog open={isOpen}>
      <IconButton onClick={onClose} size='small'
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                  }}
      >
        <CloseIcon/>
      </IconButton>
      <DialogTitle>급여명세 관리</DialogTitle>
      <DialogContent>
        {/* 왼쪽: 사원 목록 */}
        <TableContainer component={Box}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>사원명</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>

            </TableBody>
          </Table>
        </TableContainer>

        {/* 오른쪽: 거래명세서 정보 */}
        <TableContainer component={Box}>
          <Table size='small'></Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
      )
}

export default PayslipManagement;