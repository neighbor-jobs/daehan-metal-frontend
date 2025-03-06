import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import React, {useState} from 'react';
import InputWithLabel from '../../components/InputWithLabel.tsx';
import {ProductMainColumn} from '../../types/tableColumns.ts';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';
import itemList from '../../mock/itemList.ts';

const columns: readonly ProductMainColumn[] = [
  {
    id: 'productName',
    label: '품명',
    minWidth: 140,
  },
  {
    id: 'scale',
    label: '규격',
    minWidth: 140,
  },
  {
    id: 'unitWeight',
    label: '단중',
    align: 'right',
    minWidth: 80,
  },
  {
    id: 'stocks',
    label: '재고',
    align: 'right',
    minWidth: 80,
    format: formatDecimal,
  },
  {
    id: 'rawMatAmount',
    label: '구입가',
    align: 'right',
    minWidth: 100,
    format: formatCurrency,
  },
  {
    id: 'manufactureAmount',
    label: '판매가',
    align: 'right',
    minWidth: 100,
    format: formatCurrency,
  },
  {
    id: 'productLength',
    label: '길이',
    align: 'right',
    minWidth: 80,
    format: formatDecimal,
  }
]

const ProductMain = (): React.JSX.Element => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    'productName': "",
    'scale': "",
    'unitWeight': "",
    'stocks': "",
    'rawMatAmount': "",
    'manufactureAmount': "",
    'productLength': "",
  });

  const formatProductData = itemList.flatMap((item) =>
    Object.entries(item.scale).map(([scale, details]) => ({
      productName: item.productName,
      scale,
      unitWeight: details.unitWeight.replace("kg", ""),
      stocks: details.stocks,
      rawMatAmount: details.rawMatAmount,
      manufactureAmount: details.manufactureAmount,
      productLength: details.productLength,
    }))
  );
  // console.log(formData);

  // handler
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  // 새로운 품목 추가
  const handleAddProduct = () => {
    const { productName, scale, unitWeight, stocks, rawMatAmount, manufactureAmount, productLength } = formData;

    if (!productName || !scale) {
      alert("품명과 규격은 필수 입력 사항입니다.");
      return;
    }

    // 기존 품목 찾기
    const existingProduct = itemList.find((item) => item.productName === productName);
    if (existingProduct) {
      // 기존 품목에 같은 규격이 있는지 확인
      if (existingProduct.scale[scale]) {
        alert("해당 품명과 규격이 이미 존재합니다.");
        return;
      }

      // 기존 품목의 scale 추가
      existingProduct.scale[scale] = {
        unitWeight: `${unitWeight}kg`,
        stocks: stocks,
        rawMatAmount: rawMatAmount,
        manufactureAmount: manufactureAmount,
        productLength: productLength,
      }
    } else {
      // 새로운 품목 추가
      itemList.push({
        productName,
        scale: {
          [scale]: {
            unitWeight: `${unitWeight}kg`,
            stocks: stocks,
            rawMatAmount: rawMatAmount,
            manufactureAmount: manufactureAmount,
            productLength: productLength,
          },
        },
      });
    }

    console.log(itemList);
    alert("품목이 등록되었습니다.");
    setOpen(false);
    setFormData({
      productName: "",
      scale: "",
      unitWeight: "",
      stocks: "",
      rawMatAmount: "",
      manufactureAmount: "",
      productLength: "",
    });
  };

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'right',
        margin: '0.5rem 2rem 0.5rem 0',
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
              handleAddProduct();
              setOpen(false);
            },
          },
        }}
      >
        <DialogTitle>품목등록</DialogTitle>
        <DialogContent
          sx={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 500}}
        >
          <InputWithLabel name='productName' label='품명' labelPosition='left' onChange={handleInputChange}/>
          <InputWithLabel name='scale' label='규격' labelPosition='left' onChange={handleInputChange}/>
          <InputWithLabel name='unitWeight' label='단중' labelPosition='left' onChange={handleInputChange}/>
          <InputWithLabel name='rawMatAmount' label='구입가' labelPosition='left' onChange={handleInputChange}/>
          <InputWithLabel name='manufactureAmount' label='판매가' labelPosition='left' onChange={handleInputChange}/>
          <InputWithLabel name='stocks' label='재고' labelPosition='left' onChange={handleInputChange}/>
          <InputWithLabel name='productLength' label='길이' labelPosition='left' onChange={handleInputChange}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button type="submit">등록</Button>
        </DialogActions>
      </Dialog>

      <Paper sx={{width: '100%', overflow: 'hidden', flexGrow: 1}}>
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
              {formatProductData
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
  )
}

export default ProductMain;