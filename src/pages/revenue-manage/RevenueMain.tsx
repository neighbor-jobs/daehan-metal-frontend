// UI
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
  TableRow
} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import AutocompleteWithLabel from '../../components/AutocompleteWithLabel.tsx';
import InputWithLabel from '../../components/InputWithLabel';

// project
import {RevenueMainColumn} from '../../types/tableColumns';
import {revenueMainMock} from '../../mock/revenue-manage/revenueMainMock.ts';
import {formatCurrency, formatDecimal} from '../../utils/format';
import {clientList} from '../../mock/revenue-manage/clientList.ts';
import clientSalesSummaryMock from '../../mock/revenue-manage/clientSalesSummaryMock.ts';
import {useState} from 'react';
import itemList from '../../mock/itemList.ts';

const columns: readonly RevenueMainColumn[] = [
  {
    id: 'item',
    label: '품명',
    minWidth: 170,
  },
  {
    id: 'size',
    label: '규격',
    minWidth: 140,
  },
  {
    id: 'count',
    label: '수량',
    minWidth: 80,
    align: 'right',
    format: formatDecimal,
  },
  {
    id: 'material-price',
    label: '재료비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: 'processing-price',
    label: '가공비',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: 'vcut-count',
    label: 'V컷수',
    minWidth: 80,
    align: 'right',
    format: formatDecimal,
  },
  {
    id: 'length',
    label: '길이',
    minWidth: 100,
    align: 'right',
    format: formatDecimal,
  },
  {
    id: 'unit-price',
    label: '단가',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: 'amount',
    label: '금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: 'total-amount',
    label: '총액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  },
  {
    id: 'paying-amount',
    label: '입금액',
    minWidth: 100,
    align: 'right',
    format: formatCurrency,
  }
];

const RevenueMain = (): React.JSX.Element => {
  const [formData, setFormData] = useState({
    client: '',
    item: '',
    size: '',
    count: '',
    materialUnitPrice: '',
    processingUnitPrice: '',
    vcutCount: '',
    length: '',
    unitPrice: '',
    payingAmount: ''
  });

  // handler
  const generateInvoice = async () => {
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke('generate-and-open-pdf', clientSalesSummaryMock);
    } else {
      console.error('pdf 미리보기 실패');
    }
  }
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };
  const handleAutocompleteChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // api
  const productNames = itemList.map((item) => item.productName);
  const scaleByProdName = (items, productName) => {
    const product = items.find(item => item.productName === productName);
    return product ? Object.keys(product.scale) : [];
  }
  // console.log(productNames);


  const createRevenueItem = () => {
    // 계산 필드 추가
    const calculatedAmount = Number(formData.count) * Number(formData.unitPrice);

    const newItem = {
      'item': formData.item,
      'size': formData.size,
      'count': formData.count,
      'material-price': (Number(formData.materialUnitPrice) * Number(formData.count)).toString(),
      'processing-price': (Number(formData.processingUnitPrice) * Number(formData.count)).toString(),
      'vcut-count': formData.vcutCount,
      'length': formData.length,
      'unit-price': formData.unitPrice,
      'amount': calculatedAmount.toString(),
      'total-amount': '0',
      'paying-amount': formData.payingAmount,
    };

    revenueMainMock.push(newItem);
    alert('매출 항목이 추가되었습니다.');

    // 입력 필드 초기화
    setFormData({
      client: '',
      item: '',
      size: '',
      count: '',
      materialUnitPrice: '',
      processingUnitPrice: '',
      vcutCount:'',
      length: '',
      unitPrice: '',
      payingAmount: '',
    });  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', zIndex: 10}}>
      <Paper sx={{width: '100%', overflow: 'hidden', marginTop: 5, flexGrow: 1}}>
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
              {revenueMainMock
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
      <Box sx={{
        width: '100%',
        height: '50%',
        background: '#F5F5F5',
        display: 'flex',
        gap: 5,
        alignItems: 'center',
        boxShadow: '0px -4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 4, width: '25%', marginX: 3}}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
              <InputLabel sx={{fontSize: 'small',}}>매출일</InputLabel>
              <DesktopDatePicker
                views={['day']}
                format="YYYY/MM/DD"
                slotProps={{
                  textField: {size: 'small'},
                  calendarHeader: {format: 'YYYY/MM'},
                }}
              />
            </Box>
            <AutocompleteWithLabel label='매출처' items={clientList} labelPosition='top' onChange={(value) => handleAutocompleteChange('client', value)}/>
          </LocalizationProvider>
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, width: '25%'}}>
          <AutocompleteWithLabel label='품명 :' items={productNames} labelPosition='left' onChange={(value) => handleAutocompleteChange('item', value)}/>
          <AutocompleteWithLabel label='규격 :' items={scaleByProdName(itemList, formData.item)} labelPosition='left' onChange={(value) => handleAutocompleteChange('size', value)} />
          <InputWithLabel label='수량 :' labelPosition='left' type='number' name='count' onChange={handleInputChange}/>
          <InputWithLabel label='재료단가 :' labelPosition='left' name='materialUnitPrice' onChange={handleInputChange}/>
          <InputWithLabel label='가공단가 :' labelPosition='left' name='processingUnitPrice' onChange={handleInputChange}/>
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '25%'}}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
            <InputWithLabel label='V컷수 :' labelPosition='left' name='vcutCount' onChange={handleInputChange}/>
            <InputWithLabel label='길이 :' labelPosition='left' name='length' onChange={handleInputChange}/>
            <InputWithLabel label='단가 :' labelPosition='left' name='unitPrice' onChange={handleInputChange}/>
            <InputWithLabel label='계 :' labelPosition='left' />
          </Box>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
            <InputWithLabel label='미수금 :' labelPosition='left' disabled/>
            <InputWithLabel label='매출계 :' labelPosition='left'/>
            <InputWithLabel label='입금액 :' labelPosition='left' name='payingAmount' onChange={handleInputChange}/>
            <InputWithLabel label='미수계 :' labelPosition='left' disabled/>
          </Box>
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'column', marginX: 3, gap: 2, width: '20%'}}>
          <Button variant='outlined'
                  onClick={generateInvoice}
          >
            거래명세표 출력
          </Button>
          <Button variant='outlined'>수정</Button>
          <Button variant='outlined'>삭제</Button>
          <Button variant='outlined'
                  onClick={createRevenueItem}
          >
            거래처등록
          </Button>
          <Button variant='outlined'>닫기</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default RevenueMain;