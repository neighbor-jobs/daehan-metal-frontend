// UI
import {
  Autocomplete,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import DateRangePicker from '../../components/DateRangePicker';

// project
import {ItemSalesColumn, TableColumns} from '../../types/tableColumns';
import {useEffect, useState} from 'react';
import {AxiosResponse} from 'axios';
import axiosInstance from '../../api/axios.ts';
import dayjs from 'dayjs';
import {cacheManager} from '../../utils/cacheManager.ts';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';

const columns: readonly TableColumns<ItemSalesColumn>[] = [
  {
    id: ItemSalesColumn.DATE,
    label: '날짜',
    minWidth: 100,
    format: (value: string) => value.split('T')[0]
  },
  {
    id: ItemSalesColumn.COMPANY_NAME,
    label: '거래처명',
    minWidth: 140,
  },
  {
    id: ItemSalesColumn.QUANTITY,
    label: '수량',
    minWidth: 80,
    align: 'right',
    format: formatDecimal,
  },
  {
    id: ItemSalesColumn.RAW_MAT_AMOUNT,
    label: '재료단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: ItemSalesColumn.TOTAL_RAW_MAT_AMOUNT,
    label: '재료비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: ItemSalesColumn.MANUFACTURE_AMOUNT,
    label: '가공단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: ItemSalesColumn.TOTAL_MANUFACTURE_AMOUNT,
    label: '가공비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: ItemSalesColumn.PRODUCT_LENGTH,
    label: '길이',
    minWidth: 100,
    align: 'right',
    format: formatDecimal
  },
  {
    id: ItemSalesColumn.TOTAL_SALES_AMOUNT,
    label: '매출액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  }
];

const ItemSales = (): React.JSX.Element => {
  const [date, setDate] = useState({
    startAt: dayjs(),
    endAt: dayjs(),
  });
  const [productList, setProductList] = useState([]);
  const [formData, setFormData] = useState({
    productName: '',
    scale: '',
  })
  const [productReports, setProductReports] = useState([]);
  const [sum, setSum] = useState({
    manuSum: 0,
    rawSum: 0,
    sum: 0,
  })

  // handler
  const handleDateChange = (start: dayjs.Dayjs | null, end: dayjs.Dayjs | null) => {
    if (!start || !end) return;
    setDate({startAt: start, endAt: end});
  };

  // api
  const getProductReports = async () => {
    const res: AxiosResponse = await axiosInstance.get(
      `receipt/product/report?productName=${formData.productName}&startAt=${date.startAt.format('YYYY-MM-DD')}&endAt=${date.endAt.format('YYYY-MM-DD')}&scale=${formData.scale}`
    );
    let m: number = 0, r: number = 0, s: number = 0;
    setProductReports(res.data.data.map((item) => {
      r += Number(item.totalRawMatAmount);
      m += Number(item.totalManufactureAmount);
      s += Number(item.totalSalesAmount);
      return {
        ...item.salesReport,
        totalManufactureAmount: item.totalManufactureAmount,
        totalRawMatAmount: item.totalRawMatAmount,
        totalSalesAmount: item.totalSalesAmount,
      }
    }));
    setSum({manuSum: m, rawSum: r, sum: s,});
  }

  useEffect(() => {
    const getProducts = async () => {
      const products = await cacheManager.getProducts();
      setProductList(products);
    }
    getProducts();
  }, [])

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginX: 3,
      }}>
        {/* date picker */}
        <DateRangePicker onChange={handleDateChange}
                         startAt={date.startAt}
                         endAt={date.endAt}
        />
        <Autocomplete
          freeSolo
          options={productList.map((option) => option.productName)}
          value={formData.productName}
          onInputChange={(_, newInputValue) => {
            setFormData((prev) => ({...prev, productName: newInputValue}));
          }}
          renderInput={(params) =>
            <TextField {...params}
                       placeholder='품목' size='small'
                       sx={{minWidth: 150}}
            />
          }
        />
        <Autocomplete
          freeSolo
          options={productList.find((p) => p.productName === formData.productName)?.info.scales.map((s) => s.scale) || []}
          value={formData.scale}
          onInputChange={(_, newInputValue) => {
            setFormData((prev) => ({...prev, scale: newInputValue}));
          }}
          renderInput={(params) =>
            <TextField {...params}
                       placeholder='규격' size='small'
                       sx={{minWidth: 180}}
            />
          }
        />
        <Button
          variant="outlined"
          onClick={getProductReports}
        >
          확인
        </Button>
      </Box>
      <Paper sx={{width: '100%', overflow: 'hidden'}}>
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
              {productReports && productReports.map((row, rowIdx) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={rowIdx}>
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
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}></TableCell>
                <TableCell align='right'>재료비합계</TableCell>
                <TableCell align='right'>{sum.rawSum.toLocaleString()}</TableCell>
                <TableCell align='right'>가공비합계</TableCell>
                <TableCell align='right'>{sum.manuSum.toLocaleString()}</TableCell>
                <TableCell align='right'>매출액합계</TableCell>
                <TableCell align='right'>{sum.sum.toLocaleString()}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default ItemSales;