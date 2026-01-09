import {
  Box,
  Button,
  IconButton,
  Pagination,
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
import axiosInstance from '../../api/axios.ts';
import CloseIcon from '@mui/icons-material/Close';
import {ProductDialogType} from '../../types/dialogTypes.ts';
import {useAlertStore} from '../../stores/alertStore.ts';
import ProductForm from '../../components/ProductForm.tsx';
import EditIcon from '@mui/icons-material/Edit';
import cacheManager from '../../utils/cacheManager.ts';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog.tsx';

const columns: readonly ProductMainColumn[] = [
  {
    id: 'name',
    label: '품명',
    minWidth: 120,
  },
  {
    id: 'scale',
    label: '규격',
    minWidth: 100,
  },
]

const ProductMain = (): React.JSX.Element => {
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState<ProductDialogType>(ProductDialogType.CREATE);
  const [productList, setProductList] = useState([]);
  const [editScale, setEditScale] = useState({
    prodName: '',
    prevScaleName: '',
  });
  const [page, setPage] = useState({
    page: 1,
    totalPages: 1,
  });
  const [selectedTarget, setSelectedTarget] = useState<{
    id: string;
    scale: string;
    name: string;
  } | null>(null);
  const [isOpenDeleteConfirmDialog, setIsOpenDeleteConfirmDialog] = useState(false);
  const {showAlert} = useAlertStore();

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const formatProdList = useMemo(() =>
    productList.flatMap((item) =>
      item.scales.length > 0
        ? item.scales.map((scale) => ({
          id: item.id,
          name: item.name,
          scale,
        }))
        : {
          id: item.id,
          name: item.name,

        }
    ), [productList]
  );

  // handler
  const handleCreate = () => {
    setDialogType(ProductDialogType.CREATE);
    setOpen(true);
  }

  const handleEditProdName = (prodName: string, prevScaleName: string) => {
    if (!prevScaleName) {
      showAlert('규격이 없는 항목은 규격명을 수정할 수 없습니다.');
      return;
    }
    setEditScale({
      prodName: prodName,
      prevScaleName: prevScaleName,
    })
    setDialogType(ProductDialogType.EDIT);
    setOpen(true);
  }

  const handleConfirmDelete = async () => {
    if (!selectedTarget) return;

    await delProduct(
      selectedTarget.id,
      selectedTarget.scale,
      selectedTarget.name
    );

    setIsOpenDeleteConfirmDialog(false);
    setSelectedTarget(null);
  };

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
      totalPages: products.data.data.totalPages,
    }))
    return products.data.data;
  }

  const delProduct = async (id: string, scale: string, name: string) => {
    // console.log(scale);
    if (scale) {
      // 규격 삭제
      try {
        await axiosInstance.patch(`/product/scale/remove`, {
          name: name,
          scale: scale,
        });
      } catch {
        showAlert('규격 삭제에 실패했습니다. 재시도 해주세요.', 'error');
      }
      // 기존 amountStore 로컬 삭제
      // await cacheManager.removeScale(id, scale); // 🔧 주석 처리

      // ▶ amountByCompany: API 기준으로 로컬 시험 스토어 동기화(스케일 제거 반영)
      await cacheManager.validateProductsByCompany(true, true); // ✅ 교체
    } else {
      // 품목 삭제
      try {
        await axiosInstance.delete(`/product?id=${id}`);
      } catch {
        showAlert('품목 삭제에 실패했습니다. 재시도 해주세요.', 'error')
      }

      // 기존 amountStore 로컬 삭제
      // await cacheManager.removeProduct(id); // 🔧 주석 처리

      // ▶ amountByCompany: 시험 스토어에서 해당 품목 제거
      await cacheManager.removeProductByCompany(id); // ✅ 교체
    }
    showAlert('삭제 완료', 'success');
    const res = await getProductList(page.page);

    // 삭제 후에 (전체 페이지 < 현재 페이지) 면 마지막 페이지 불러오기
    if (res.totalPages < page.page) await getProductList(page.totalPages);
  }

  useEffect(() => {
    getProductList();
  }, []);

  // debug

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
          onClick={() => handleCreate()}
        >
          등록
        </Button>
      </Box>

      {/* dialog */}
      <ProductForm dialogType={dialogType}
                   isOpened={open}
                   productList={productList}
                   productName={editScale.prodName}
                   prevScaleName={editScale.prevScaleName}
                   onClose={() => setOpen(false)}
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
                        <IconButton size='small'
                                    onClick={() => {
                                      handleEditProdName(row.name, row.scale)
                                    }}
                        >
                          <EditIcon fontSize='small'/>
                        </IconButton>
                        <IconButton size='small' color='error'
                                    onClick={() => {
                                      setSelectedTarget({
                                        id: row.id,
                                        scale: row.scale,
                                        name: row.name,
                                      });
                                      setIsOpenDeleteConfirmDialog(true);
                                    }}
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
      <DeleteConfirmDialog
        isOpen={isOpenDeleteConfirmDialog}
        onClose={() => {
          setIsOpenDeleteConfirmDialog(false);
          setSelectedTarget(null);
        }}
        onClick={handleConfirmDelete}
        dialogContentText={
          selectedTarget?.scale
            ? `"${selectedTarget.name}  ${selectedTarget.scale}" 규격을 삭제하시겠습니까?`
            : `"${selectedTarget?.name}" 품목을 삭제하시겠습니까?`
        }
      />
    </Box>
  )
}

export default ProductMain;