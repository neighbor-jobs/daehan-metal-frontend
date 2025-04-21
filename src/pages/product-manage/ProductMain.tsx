import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton, Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import InputWithLabel from '../../components/InputWithLabel.tsx';
import {ProductMainColumn} from '../../types/tableColumns.ts';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';
import axiosInstance from '../../api/axios.ts';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import {ProductDialogType} from '../../types/dialogTypes.ts';
import {useAlertStore} from '../../stores/alertStore.ts';

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
]

const ProductMain = (): React.JSX.Element => {
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState<ProductDialogType>(ProductDialogType.CREATE);
  const [formData, setFormData] = useState({
    'name': "",
    'scale': ['', '', ''],
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
  const [page, setPage] = useState({
    page: 1,
    totalPages: 1,
  });
  const { showAlert } = useAlertStore();

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const formatProdList = useMemo(() =>
    productList.flatMap((item) =>
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
    ), [productList]
  );

  // handler
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };
  const handleScaleChange = (index: number, value: string) => {
    const newScales = [...formData.scale];
    newScales[index] = value;
    setFormData((prev) => ({
      ...prev,
      scale: newScales,
    }));
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
      scale: ['', '', ''],
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
    setPage(prevState => ({
      ...prevState,
      page: newPage,
    }));
    getProductList(newPage);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  };

  // api
  const getProductList = async (page: number = 1) => {
    const products = await axiosInstance.get(`/product?page=${page}&orderBy=desc`);
    setProductList(products.data.data.products);
    setPage(prev => ({
      ...prev,
      totalPages: products.data.data.totalCount,
    }))
  }

  useEffect(() => {
    getProductList();
  }, []);

  const handleSubmit = async () => {
    if (dialogType === ProductDialogType.EDIT_ONLY_PRODUCT_NAME) {
      try {
        const targetProducts = productList.filter(product => product.productName === updateAllProdName.name);
        if (targetProducts.length === 0) {
          showAlert('해당 품목명을 가진 제품이 없습니다.', 'error');
          return;
        }
        await axiosInstance.patch('/product', {
          id: targetProducts[0].id,
          infoId: targetProducts[0].info.id,
          productName: updateAllProdName.newName
        });
        setOpen(false);
        return await getProductList();
      } catch {
        showAlert('품목명 수정 실패. 재시도 해주세요', 'error');
      }
    }

    if (!formData.name) {
      showAlert('품목은 필수 입력 값입니다.', 'info');
      return;
    }

    const data = {
      ...formData,
      stocks: Number(formData.stocks) || 0,
    }
    const validScales = formData.scale.filter(s => s && s.trim() !== '');

    try {
      if (dialogType === ProductDialogType.EDIT) {
        await axiosInstance.patch('/product/scale/info', data);
        showAlert("수정 완료", 'success');
      } else if (dialogType === ProductDialogType.CREATE) {
        if (validScales.length === 0) {
          await axiosInstance.post('/product', {
            name: formData.name
          })
          showAlert('등록이 완료되었습니다.', 'success');
          return;
        }
        const failedScales: string[] = [];
        for (const scale of validScales) {
          try {
            await axiosInstance.post('/product', {
              name: formData.name,
              scale,
              unitWeight: formData.unitWeight,
              stocks: Number(formData.stocks) || 0,
              rawMatAmount: formData.rawMatAmount,
              manufactureAmount: formData.manufactureAmount,
              vCutAmount: formData.vCutAmount,
              vCut: formData.vCut,
              productLength: formData.productLength,
            });
          } catch (err) {
            failedScales.push(scale);
          }
        }
        if (failedScales.length === 0) {
          showAlert('등록이 완료되었습니다.', 'success');
          setOpen(false);
        } else if (failedScales.length === validScales.length) {
          showAlert('등록에 실패했습니다. 다시 시도해 주세요.', 'warning');
        } else {
          showAlert(`일부 등록에 실패했습니다: ${failedScales.join(', ')}`, 'error');
        }
      }
      await getProductList();
    } catch {
      showAlert('요청이 실패했습니다. 재시도 해주세요.', 'error');
    }
  }

  const delProduct = async (prodId: string, scale: string, scaleId: string) => {
    try {
      await axiosInstance.patch(`/product/scale/remove`, {
        id: prodId,
        scale: scale,
        scaleId: scaleId,
      })
      showAlert('삭제 완료', 'success');
      await getProductList();
    } catch {
      showAlert('요청이 실패했습니다. 재시도 해주세요.', 'error');
    }
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
            <InputWithLabel name='name' label='품명' labelPosition='left' onChange={handleInputChange} placeholder='필수 입력 값입니다.'
                            value={formData.name}
                            disabled={dialogType === ProductDialogType.EDIT}/>
            <InputWithLabel label='규격1' labelPosition='left'
                            value={formData.scale[0]} placeholder='필수 입력 값입니다.'
                            onChange={(e) => handleScaleChange(0, e.target.value)}/>
            <InputWithLabel name='scale[1]' label='규격2' labelPosition='left'
                            value={formData.scale[1]}
                            onChange={(e) => handleScaleChange(1, e.target.value)}/>
            <InputWithLabel name='scale[2]' label='규격3' labelPosition='left'
                            value={formData.scale[2]}
                            onChange={(e) => handleScaleChange(2, e.target.value)}/>
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
        <TableContainer sx={{maxHeight: 'calc(100vh - 170px)'}} ref={tableContainerRef}>
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
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Pagination
            count={page.totalPages}
            shape="rounded"
            page={page.page}
            onChange={handleChangePage}
          />
        </Box>
      </Paper>
    </Box>
  )
}

export default ProductMain;