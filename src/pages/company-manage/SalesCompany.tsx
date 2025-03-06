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
    id: 'companyName',
    label: '거래처명',
  },
  {
    id: 'owner',
    label: '대표자',
  },
  {
    id: 'phoneNumber',
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
    id: 'businessNumber',
    label: '사업자등록번호',
  }
];

const SalesCompanyPage = (): React.JSX.Element => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    'companyName': '',
    'owner': '',
    'phoneNumber': '',
    'fax': '',
    'address': '',
    'businessNumber': '',
  })

  // handler
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };
  console.log(formData);

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
              salesCompanyMock.push(formData);
              setOpen(false);
            },
          },
        }}
      >
        <DialogTitle>거래처등록</DialogTitle>
        <DialogContent
          sx={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 500}}
        >
          <InputWithLabel name='companyName' label='거래처명' labelPosition='left' onChange={handleInputChange}/>
          <InputWithLabel name='owner' label='대표자' labelPosition='left' onChange={handleInputChange}/>
          <InputWithLabel  name='phoneNumber' label='전화번호' labelPosition='left' onChange={handleInputChange} type='tel' />
          <InputWithLabel name='fax' label='팩스번호' labelPosition='left' onChange={handleInputChange}/>
          <InputWithLabel name='address' label='주소' labelPosition='left' onChange={handleInputChange}/>
          <InputWithLabel name='businessNumber' label='사업자등록번호' labelPosition='left' onChange={handleInputChange}/>
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