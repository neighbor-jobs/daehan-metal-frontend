import {
  Box,
  Button,
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
          onClick={() => console.log('search')}
        >
          등록
        </Button>
      </Box>
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