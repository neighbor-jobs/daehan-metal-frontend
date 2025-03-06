import {
  Box,
  Button, Dialog, DialogContent, DialogTitle, DialogActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {SalesCompanyColumn} from '../../types/tableColumns.ts';
import salesCompanyMock from '../../mock/salesCompanyMock.ts';
import React, {useState} from 'react';
import InputWithLabel from '../../components/InputWithLabel.tsx';

const columns: readonly SalesCompanyColumn[] = [
  {
    id: 'company-name',
    label: '거래처명',
  },
  {
    id: 'owner',
    label: '대표자',
  },
  {
    id: 'phone-number',
    label: '전화번호',
  }, {
    id: 'fax',
    label: '팩스번호',
  },
  {
    id: 'address',
    label: '주소',
  },
  {
    id: 'business-number',
    label: '사업자등록번호',
  }
];

const SalesCompanyPage = (): React.JSX.Element => {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'right',
        margin: '0 2rem 1rem 0',
      }}>
        <Button
          variant="outlined"
          onClick={() => setOpen(true)}
        >
          등록
        </Button>
      </Box>

      {/* dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries((formData as any).entries());
              const email = formJson.email;
              console.log(email);
              setOpen(false)
            },
          },
        }}
      >
        <DialogTitle>거래처등록</DialogTitle>
        <DialogContent
          sx={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 500}}
        >
          <InputWithLabel label='거래처명' labelPosition='left' />
          <InputWithLabel label='대표자' labelPosition='left' />
          <InputWithLabel label='전화번호' labelPosition='left' />
          <InputWithLabel label='팩스번호' labelPosition='left' />
          <InputWithLabel label='주소' labelPosition='left' />
          <InputWithLabel label='사업자등록번호' labelPosition='left' />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button type="submit">등록</Button>
        </DialogActions>
      </Dialog>
      <Paper sx={{width: '100%', overflow: 'hidden', flexGrow: 1}}>
        <TableContainer sx={{maxHeight: 440}}>
          <Table stickyHeader aria-label="sticky table" size='small'>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{minWidth: column.minWidth}}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {salesCompanyMock
                .map((row, rowIndex) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default SalesCompanyPage;