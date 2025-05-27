import React, {useEffect, useState} from 'react';
import {
  Box,
  Button,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {Employee} from '../../types/employeeRes.ts';
import axiosInstance from '../../api/axios.ts';
import {PostPayment} from '../../types/payrollReq.ts';

const defaultPayment: PostPayment = {
 // 기본값
}

const NewPayrollLedger = (): React.JSX.Element => {
  const [formData, setFormData] = useState();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payments, setPayments] = useState([]);

  // todo 근로자별 post 용 payment 객체 선언. employeeId, employeeName, employeePosition 는 employee 객체 이용해서 기본값 채워두기

  const getEmployees = async () => {
    const employees = await axiosInstance.get(`/employee?includesRetirement=true&orderBy=asc&includesPayment=false`);
    setEmployees(employees.data.data);
  }

  useEffect(() => {
    getEmployees();
  }, []);

  return (
    <Box>
      {/* 검색 */}
      <Box sx={{
        mx: 3,
        my: 1,
      }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <InputLabel sx={{fontSize: 'small',}}>작성월</InputLabel>
            <DesktopDatePicker
              views={['day']}
              format="YYYY/MM"
              defaultValue={dayjs()}
              // value={dayjs(formData.startAt)}
              // onChange={(value) => setFormData(prev => ({...prev, startAt: value.format('YYYY-MM-DD')}))}
              slotProps={{
                textField: {size: 'small'},
                calendarHeader: {format: 'YYYY/MM'},
              }}
            />
          </Box>
        </LocalizationProvider>
      </Box>

      <Paper sx={{paddingBottom: 1, px: 2}}>
        {/* 급여대장 */}
        <Box sx={{mt: 1}}>
          <TableContainer
            component={Box}
            sx={{
              border: '1px solid',
              borderColor: 'lightgray',
              borderRadius: 1,
            }}
          >
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell
                    padding='none'
                    sx={{
                      borderRight: '1px solid lightgray',
                      py: 0.5,
                      px: 1
                    }}/>
                  {employees.map((employee) => (
                    <TableCell padding='none' sx={{
                      borderRight: '1px solid lightgray', minWidth: 100,
                      py: 0.5,
                      px: 1
                    }} align='center'>
                      {employee.info.name}
                      <Typography sx={{m: 0, fontSize: 11}}>{employee.info.position}</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/*
                {labels.map((label, rowIdx) => (
                  <TableRow key={rowIdx}>
                    <TableCell sx={{borderRight: '1px solid lightgray'}}>{label}</TableCell>
                    {employees.map((emp, colIdx) => (
                      <TableCell key={colIdx} align="center"
                                 sx={{ borderRight: '1px solid lightgray'}}
                      >
                         실제 데이터 매핑은 라벨에 따라 조절
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                */}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* 지출 내역 */}
        {/*<Box sx={{mt: 2}}>
          <Typography variant='h6'>지출 내역</Typography>
          <TableContainer
            component={Box}
            sx={{
              border: '1px solid',
              borderColor: 'lightgray',
              borderRadius: 1,
              mt: 1
            }}
          >
            <Table size="small">
              <TableBody>
                {expenseData.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{
                      whiteSpace: 'pre-line',
                      borderRight: '1px solid lightgray',
                      width: 1 / 4
                    }}>
                      {item.leftTitle || ''}
                      <Typography sx={{m: 0, fontSize: 10, whiteSpace: 'pre-line'}}>
                        {item.leftNote && `${item.leftNote}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{
                      borderRight: '1px solid lightgray',
                      width: 1 / 4
                    }}>
                      -
                    </TableCell>
                    <TableCell sx={{
                      whiteSpace: 'pre-line',
                      borderRight: '1px solid lightgray',
                      width: 1 / 4
                    }}>
                      {item.rightTitle || ''}
                      <Typography sx={{m: 0, fontSize: 10, whiteSpace: 'pre-line'}}>
                        {item.rightNote && item.rightNote || ''}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{width: 50}} align="center">-</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>*/}
      </Paper>

      {/* 버튼들 */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'right',
        gap: 2,
        my: 1,
        mx: 2
      }}
      >
        <Button variant='contained'>등록</Button>
        <Button variant='contained'>인쇄</Button>
      </Box>
    </Box>
  )
}

export default NewPayrollLedger;