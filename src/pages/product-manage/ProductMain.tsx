import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer, TableFooter,
  TableHead, TablePagination,
  TableRow
} from '@mui/material';
import React, {useEffect, useState} from 'react';
import InputWithLabel from '../../components/InputWithLabel.tsx';
import {ProductMainColumn} from '../../types/tableColumns.ts';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';
import axiosInstance from '../../api/axios.ts';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import {ProductDialogType} from '../../types/dialogTypes.ts';
import {cacheManager} from '../../utils/cacheManager.ts';

const columns: readonly ProductMainColumn[] = [
  {
    id: 'productName',
    label: '품명',
    minWidth: 120,
  },
  {
    id: 'scale',
    label: '규격',
    minWidth: 100,
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
  },
  {
    id: 'vCut',
    label: 'V컷',
    align: 'right',
    minWidth: 80,
    format: formatDecimal,
  },
  {
    id: 'vCutAmount',
    label: 'V컷가공비',
    align: 'right',
    minWidth: 80,
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
  const [dialogType, setDialogType] = useState<ProductDialogType>(ProductDialogType.CREATE);
  const [formData, setFormData] = useState({
    'name': "",
    'scale': "",
    'unitWeight': "",
    'stocks': 0,
    'rawMatAmount': '',
    'manufactureAmount': '',
    'vCutAmount': "",
    'vCut': "",
    'productLength': "",
  });
  const [updateAllProdName, setUpdateAllProdName] = useState({
    name: '',
    newName: '',
  });
  const [productList, setProductList] = useState([]); // 데이터 원본
  const [page, setPage] = useState(0);
  const formatProdList = productList.flatMap((item) =>
    item.info.scales.map(({id, scale, snapshot}) => ({
      id: item.id,
      infoId: item.info.id,
      scaleId: id,
      productName: item.productName,
      scale,
      unitWeight: snapshot.unitWeight,
      stocks: snapshot.stocks,
      vCut: snapshot.vCut,
      vCutAmount: snapshot.vCutAmount,
      productLength: snapshot.productLength,
    }))
  );

  // handler
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };
  const handleUpdateProdName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateAllProdName({
      ...updateAllProdName,
      [event.target.name]: event.target.value
    })
  }

  const handleCreate = () => {
    setDialogType(ProductDialogType.CREATE);
    setFormData({
      name: "",
      scale: "",
      unitWeight: "",
      stocks: 0,
      productLength: "",
      vCut: "",
      vCutAmount: "",
      rawMatAmount: '0',
      manufactureAmount: '0',
    });
    setOpen(true);
  }

  const handleEdit = (row) => {
    setDialogType(ProductDialogType.EDIT);
    setFormData({
      name: row.productName,
      scale: row.scale,
      unitWeight: row.unitWeight,
      stocks: row.stocks,
      vCut: row.vCut,
      vCutAmount: row.vCutAmount,
      productLength: row.productLength,
      rawMatAmount: row.rawMatAmount,
      manufactureAmount: row.manufactureAmount,
    });
    setOpen(true);
  };

  const handleEditProdName = () => {
    setDialogType(ProductDialogType.EDIT_ONLY_PRODUCT_NAME);
    setOpen(true);
  }

  const handleChangePage = (_event, newPage: number) => {
    setPage(newPage);
  };
  // api
  const getProductList = async () => {
    const products = await cacheManager.getProducts();
    setProductList(products);
  }

  // console.log('get product list: ', productList);
  useEffect(() => {
    getProductList();
  }, []);

  const handleSubmit = async () => {
    if (dialogType === ProductDialogType.EDIT_ONLY_PRODUCT_NAME) {
      const targetProducts = productList.filter(product => product.productName === updateAllProdName.name);
      if (targetProducts.length === 0) {
        alert('해당 품목명을 가진 제품이 없습니다.');
        return;
      }
      await axiosInstance.patch('/product', {
        id: targetProducts[0].id,
        infoId: targetProducts[0].info.id,
        productName: updateAllProdName.newName
      });
      await cacheManager.fetchAndUpdateProducts()
      return await getProductList();
    }

    if (!formData.name || !formData.scale) {
      alert('품목과 규격은 필수 입력 값입니다.');
      return;
    }

    const data = {
      ...formData,
      stocks: Number(formData.stocks) || 0,
    }

    if (dialogType === ProductDialogType.EDIT) {
      await axiosInstance.patch('/product/scale/info', data);
      alert("수정 완료");
    } else if (dialogType === ProductDialogType.CREATE) {
      await axiosInstance.post('/product', data);
      alert("등록 완료");
    }
    await cacheManager.fetchAndUpdateProducts();
    await getProductList();
  }

  const delProduct = async (prodId: string, scale: string, scaleId: string) => {
    await axiosInstance.patch(`/product/scale/remove`, {
      id: prodId,
      scale: scale,
      scaleId: scaleId,
    })
    alert('삭제완료');
    await cacheManager.fetchAndUpdateProducts();
    await getProductList();
  }

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'right',
        margin: '0.5rem 2rem 0.5rem 0',
        gap: 2,
      }}>
        <Button
          variant="outlined"
          onClick={() => handleEditProdName()}
        >
          품목명 수정
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleCreate()}
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
              handleSubmit();
              setOpen(false);
            },
          },
        }}
      >
        <DialogTitle>{dialogType === ProductDialogType.CREATE ? '품목 등록' : '품목 수정'}</DialogTitle>
        {dialogType === ProductDialogType.EDIT_ONLY_PRODUCT_NAME ? (
            <DialogContent
              sx={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 500}}>
              <InputWithLabel name='name' label='기존품명' labelPosition='left' onChange={handleUpdateProdName}/>
              <InputWithLabel name='newName' label='새로운 품명' labelPosition='left' onChange={handleUpdateProdName}/>
            </DialogContent>
          ) :
          <DialogContent
            sx={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 500}}
          >
            <InputWithLabel name='name' label='품명' labelPosition='left' onChange={handleInputChange}
                            value={formData.name}
                            disabled={dialogType === ProductDialogType.EDIT}/>
            <InputWithLabel name='scale' label='규격' labelPosition='left' onChange={handleInputChange}
                            value={formData.scale}/>
            <InputWithLabel name='unitWeight' label='단중' labelPosition='left' onChange={handleInputChange}
                            value={formData.unitWeight}/>
            <InputWithLabel name='vCut' label='V컷' labelPosition='left' onChange={handleInputChange}
                            value={formData.vCut}/>
            <InputWithLabel name='vCutAmount' label='V컷가공비' labelPosition='left' onChange={handleInputChange}
                            value={formData.vCutAmount}/>
            <InputWithLabel name='stocks' label='재고' labelPosition='left' onChange={handleInputChange}
                            value={formData.stocks}/>
            <InputWithLabel name='productLength' label='길이' labelPosition='left' onChange={handleInputChange}
                            value={formData.productLength}/>
          </DialogContent>
        }
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button type='submit'>확인</Button>
        </DialogActions>
      </Dialog>

      <Paper sx={{
        width: '100%',
        overflow: 'auto',
        flexGrow: 1,
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
                <TableCell sx={{width: 2}}/>
              </TableRow>
            </TableHead>
            <TableBody>
              {formatProdList
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
                      <TableCell sx={{padding: '0'}}>
                        <IconButton size='small'
                                    onClick={() => handleEdit(row)}
                        >
                          <EditIcon fontSize='small'/>
                        </IconButton>
                        <IconButton size='small' color='error'
                                    onClick={() => delProduct(row.id, row.scale, row.scaleId)}
                        >
                          <CloseIcon fontSize='small'/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[]}
                  colSpan={8}
                  count={productList.length}
                  rowsPerPage={-1}
                  page={page}
                  onPageChange={handleChangePage}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default ProductMain;