import React, {useEffect, useState} from 'react';
import {
  Box,
  Button,
  Grid2,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {EmployeeTableColumn, TableColumns} from '../../types/tableColumns.ts';
import EmployeeForm from './EmployeeForm.tsx';
import axiosInstance from '../../api/axios.ts';
import {Employee} from '../../types/employeeRes.ts';
import {PatchEmployee} from '../../types/employeeReq.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import calcAge from '../../utils/calcAge.ts';
import cacheManager from '../../utils/cacheManager.ts';

const columns: readonly TableColumns<EmployeeTableColumn>[] = [
  {
    id: EmployeeTableColumn.HireDate,
    label: '입사일',
    align: 'center'
  },
  {
    id: EmployeeTableColumn.EMPLOYEE_NAME,
    label: '성명',
    align: 'center'
  },
  {
    id: EmployeeTableColumn.POSITION,
    label: '직무',
    align: 'center'
  },
  {
    id: EmployeeTableColumn.PHONE_NUMBER,
    label: '전화번호',
    align: 'center'
  }
];

const EmployeeManagement = (): React.JSX.Element => {
  const [formType, setFormType] = useState(null);
  const [employees, setEmployees] = useState<Employee[] | []>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<PatchEmployee | null>(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const {showAlert} = useAlertStore();

  const handleCreateClick = () => {
    setSelectedEmployee(null);
    setFormType('create');
  };

  const handleRowClick = () => {
    setFormType('read');
  };

  const handleEditClick = () => {
    setFormType('edit');
  };

  const handleCloseClick = () => {
    setFormType(null);
  }

  const formatSelectedBank = async (row: Employee) => {
    if (row.bankIds.length === 0) {
      setSelectedBank(null);
      return [];
    }
    try {
      const response = await axiosInstance.get(`/employee/bank?id=${row.bankIds[0]}`)
      const { createdAt, ...bankDataWithoutCreatedAt } = response.data.data;
      setSelectedBank(bankDataWithoutCreatedAt);
    } catch {
      showAlert('사원 정보 조회 실패');
    }
    return;
  }

  const formatSelectedEmployee = (row: Employee) => {
    if (!row) return;
    const { id, ...infoWithoutId } = row.info;
    setSelectedEmployee({
      id: row.id,
      info: {
        ...infoWithoutId,
        birth: infoWithoutId.birth?.split('T')[0] || '',
        age: calcAge(infoWithoutId.birth),
      },
      startWorkingAt: row.startWorkingAt.split('T')[0] || null,
      retirementAt: row.retirementAt?.split('T')[0] || null,
    });
  };

  const getEmployees = async () => {
    let employeeCache: string;
    try {
      employeeCache = await cacheManager.getEmployees();
    } catch {
      employeeCache = '';
    }
    const employees = await axiosInstance.get(`/employee?includesRetirement=true&orderIds=${employeeCache}&includesPayment=false`);
    // const employees = await axiosInstance.get(`/employee?includesRetirement=true&orderBy=asc&includesPayment=false`);
    setEmployees(employees.data.data);
    // console.log(employees.data.data?.map(e => e.id));
    return employees.data.data || [];
  }

  useEffect(() => {
    getEmployees();
  }, []);

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'right',
        marginX: 2,
        marginBottom: 0.5,
      }}>
        <Button
          variant="outlined"
          onClick={handleCreateClick}
          disabled={formType === 'create'}
        >
          등록
        </Button>
      </Box>
      <Grid2 container spacing={0.5}>
        {/* 사원 목록 */}
        <Grid2 size={6}>
          <Paper sx={{
            minHeight: '100vh',
          }}>
            <TableContainer>
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
                  {employees && employees.map((row: Employee, idx: number) => (
                    <TableRow
                      key={idx}
                      hover
                      onClick={async () => {
                        handleRowClick();
                        await formatSelectedBank(row);
                        formatSelectedEmployee(row);
                      }}
                      sx={{cursor: 'pointer'}}
                    >
                      <TableCell align='center'>
                        {row.startWorkingAt.split('T')[0]}
                      </TableCell>
                      <TableCell align='center'>{row.info.name}</TableCell>
                      <TableCell align='center'>
                        {row.info.position}
                      </TableCell>
                      <TableCell align='center'>
                        {row.info.phoneNumber || ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid2>

        {/* 사원 정보 */}
        <Grid2 size={6}>
          <EmployeeForm type={formType}
                        key={`${formType}-${selectedEmployee?.id ?? 'new'}`}
                        onSuccess={async () => {
                          const employees = await getEmployees();
                          const zzzz: Employee = employees?.find(e => e.id === selectedEmployee?.id);
                          formatSelectedEmployee(zzzz);
                          const bankId = zzzz.bankIds[0];
                          if (bankId) {
                            const response = await axiosInstance.get(`/employee/bank?id=${bankId}`);
                            setSelectedBank(response.data.data || null);
                          }
                          setFormType('read');
                        }}
                        onDeleteSuccess={async () => {
                          await getEmployees();
                          setFormType('read');
                          setSelectedEmployee(null);
                          setSelectedBank(null);
                        }}
                        prevBankData={selectedBank}
                        prevEmployeeData={selectedEmployee}
                        onClickEdit={handleEditClick}
                        onClose={handleCloseClick}
          />
        </Grid2>
      </Grid2>
    </Box>
  )
}
export default EmployeeManagement;