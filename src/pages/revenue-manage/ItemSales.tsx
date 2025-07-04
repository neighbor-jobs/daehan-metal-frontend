// UI
import {
  Autocomplete,
  Box,
  Button, createFilterOptions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField, Typography
} from '@mui/material';
import DateRangePicker from '../../components/DateRangePicker';

// project
import {ItemSalesColumn, TableColumns} from '../../types/tableColumns';
import {useEffect, useMemo, useState} from 'react';
import {AxiosResponse} from 'axios';
import axiosInstance from '../../api/axios.ts';
import dayjs from 'dayjs';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';
import getAllProducts from '../../api/getAllProducts.ts';
import {getUniqueScalesByProductName} from '../../utils/autoComplete.ts';

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
    typoSx: {color: 'blue'},
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
    typoSx: {color: 'darkorange'},
    format: formatCurrency,
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
  const uniqueScaleOptions = useMemo(() => {
    return getUniqueScalesByProductName(productList, formData.productName);
  }, [productList, formData.productName]);

  const filter = createFilterOptions<string>();

  // handler
  const handleDateChange = (start: dayjs.Dayjs | null, end: dayjs.Dayjs | null) => {
    if (!start || !end) return;
    setDate({startAt: start, endAt: end});
  };

  // api
  const getProductReports = async () => {
    const url = formData.scale.length > 0 ?
      `receipt/product/report?productName=${formData.productName}&startAt=${date.startAt.format('YYYY-MM-DD')}&endAt=${date.endAt.format('YYYY-MM-DD')}&scale=${formData.scale}`
      : `receipt/product/report?productName=${formData.productName}&startAt=${date.startAt.format('YYYY-MM-DD')}&endAt=${date.endAt.format('YYYY-MM-DD')}`

    const res: AxiosResponse = await axiosInstance.get(url);
    const sortedList = res.data.data?.sort((a, b) => {
      return dayjs(a.salesReport.createdAt).diff(dayjs(b.salesReport.createdAt))
    });

    let m: number = 0, r: number = 0, s: number = 0;
    setProductReports(sortedList.map((item) => {
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
      const products = await getAllProducts();
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
          options={productList.map((option) => option.name)}
          sx={{width: 180}}
          value={formData.productName}
          onInputChange={(_, newInputValue) => {
            setFormData(() => ({
              productName: newInputValue,
              scale: '',
            }));
          }}
          renderInput={(params) =>
            <TextField {...params}
                       placeholder='품목' size='small'
                       sx={{minWidth: 150}}
            />
          }
        />
        <Autocomplete
          // freeSolo
          options={uniqueScaleOptions}
          sx={{width: 200}}
          filterOptions={(options, state) => filter(options, state)}
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
                    <Typography variant="body2"
                                sx={column.typoSx || undefined}
                    >
                      {column.label}
                    </Typography>
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
                          {column.format ?
                            <Typography variant='body2' sx={column.typoSx || undefined}>
                              {column.format(value)}
                            </Typography>
                            : <Typography variant='body2' sx={column.typoSx || undefined}>
                              {value}
                            </Typography>
                          }
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}></TableCell>
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