import {
  Box,
  Button,
  IconButton,
  Paper, Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow, Typography
} from '@mui/material';
import {SalesCompanyColumn} from '../../types/tableColumns.ts';
import React, {useEffect, useState} from 'react';
import axiosInstance from '../../api/axios.ts';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import PrintButton from '../../layout/PrintButton.tsx';
import {useAlertStore} from '../../stores/alertStore.ts';
import SalesCompanyForm from './SalesCompanyForm.tsx';

const columns: readonly SalesCompanyColumn[] = [
  {
    id: 'companyName',
    label: '거래처명',
    minWidth: 100,
  },
  {
    id: 'ownerName',
    label: '대표자',
    minWidth: 80,
  },
  {
    id: 'phoneNumber',
    label: '전화번호',
    minWidth: 80,
  },
  {
    id: 'fax',
    label: '팩스번호',
    minWidth: 80,
  },
  {
    id: 'businessNumber',
    label: '사업자등록번호',
    minWidth: 60,
  },
  {
    id: 'businessType',
    label: '업태',
    minWidth: 50,
  },
  {
    id: 'businessCategory',
    label: '종목',
    minWidth: 50,
  },
/*  {
    id: 'address',
    label: '주소',
    minWidth: 200,
  }*/
];

const SalesCompany = (): React.JSX.Element => {
  // TODO: pop over 안돌아가는거 고쳐놓기
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [salesCompanyList, setSalesCompanyList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    phoneNumber: '',
    fax: undefined,
    address: '',
    businessType: undefined,
    businessCategory: undefined,
    businessNumber: undefined,
  })
  const { showAlert } = useAlertStore();

  const handleCreate = () => {
    setIsEditing(false)
    setFormData({
      companyName: '',
      ownerName: '',
      phoneNumber: '',
      fax: undefined,
      address: '',
      businessType: undefined,
      businessCategory: undefined,
      businessNumber: undefined,
    });
    setOpen(true);
  }
  const handleEdit = (row) => {
    setIsEditing(true);
    setFormData({
      companyName: row.companyName,
      ownerName: row.ownerName,
      phoneNumber: row.phoneNumber,
      fax: row.fax,
      address: row.address,
      businessType: row.businessType,
      businessCategory: row.businessCategory,
      businessNumber: row.businessNumber,
    })
    setOpen(true);
  }

  // api
  const fetchSalesCompanies = async () => {
    const companies = await axiosInstance.get('/company?orderBy=asc');
    setSalesCompanyList(companies.data.data || []);
  };

  const delSalesCompany = async (companyName: string) => {
    await axiosInstance.delete(`/company?companyName=${companyName}`);
    showAlert('거래처 삭제 완료', 'success');
    await fetchSalesCompanies();
  }

  useEffect(() => {
    fetchSalesCompanies();
  }, []);

  return (
    <Box>
      {/* Dialog */}
      <SalesCompanyForm isOpen={open}
                        isEditing={isEditing}
                        prevFormData={formData}
                        onClose={() => setOpen(false)}
                        onSuccess={async () => {
                          await fetchSalesCompanies();
                        }}
      />
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'right',
        margin: '0 2rem 1rem 0',
      }}>
        <Button
          variant="outlined"
          onClick={() => handleCreate()}
        >
          등록
        </Button>
      </Box>
      <Paper sx={{width: '100%', overflow: 'hidden', flexGrow: 1}}>
        <TableContainer sx={{maxHeight: '100%'}}>
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
                <TableCell sx={{width: 2}}/>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesCompanyList
                .map((row, rowIndex) => {
                  const isPopoverOpen = anchorEl === rowIndex;

                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format ? column.format(value) : value}
                          </TableCell>
                        );
                      })}
                      {/* 주소 */}
                      <TableCell>
                        <Typography variant='body2'
                                    aria-owns={isPopoverOpen ? `popover-${row.address}` : undefined}
                                    aria-haspopup="true"
                                    onMouseEnter={() => setAnchorEl(rowIndex)}
                                    onMouseLeave={() => setAnchorEl(null)}
                        >
                          {row.address}
                        </Typography>
                        <Popover
                          id={`popover-${row.address}`}
                          sx={{ pointerEvents: 'none' }}
                          open={isPopoverOpen}
                          anchorEl={anchorEl}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                          onClose={() => setAnchorEl(null)}
                          disableRestoreFocus
                        >
                          <Typography sx={{ p: 1 }}>{row.address}</Typography>
                        </Popover>
                      </TableCell>

                      {/* 수정 & 삭제 버튼 */}
                      <TableCell sx={{padding: 0}}>
                        <IconButton size='small'
                                    onClick={() => handleEdit(row)}
                        >
                          <EditIcon fontSize='small'/>
                        </IconButton>
                        <IconButton color='error' size='small'
                                    onClick={() => delSalesCompany(row['companyName'])}>
                          <CloseIcon fontSize='small'/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <PrintButton printData={salesCompanyList}/>
    </Box>
  );
}

export default SalesCompany;