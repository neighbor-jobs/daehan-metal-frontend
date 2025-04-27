import {
  Box,
  Button,
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
import {ProductMainColumn} from '../../types/tableColumns.ts';
import {formatCurrency, formatDecimal} from '../../utils/format.ts';
import axiosInstance from '../../api/axios.ts';
import CloseIcon from '@mui/icons-material/Close';
import {ProductDialogType} from '../../types/dialogTypes.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import ProductForm from '../../components/ProductForm.tsx';

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
  const [productList, setProductList] = useState([]); // 데이터 원본
  const [page, setPage] = useState({
    page: 1,
    totalPages: 1,
  });
  const {showAlert} = useAlertStore();

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
  const handleCreate = () => {
    setDialogType(ProductDialogType.CREATE);
    setOpen(true);
  }

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
    const products = await axiosInstance.get(`/product?page=${page}&orderBy=asc`);
    setProductList(products.data.data.products);
    setPage(prev => ({
      ...prev,
      totalPages: products.data.data.totalCount,
    }))
  }

  useEffect(() => {
    getProductList();
  }, []);

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
      <ProductForm dialogType={dialogType} isOpened={open} onClose={() => setOpen(false)}
                   onSuccess={async () => {
                     await getProductList(page.page);
                   }}
      />

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
                        {/*<IconButton size='small'
                                    onClick={() => handleEdit(row)}
                        >
                          <EditIcon fontSize='small'/>
                        </IconButton>*/}
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
        <Box sx={{display: 'flex', justifyContent: 'center', py: 2}}>
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