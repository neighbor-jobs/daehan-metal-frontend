import axiosInstance from './axios.ts';
import {AxiosResponse} from 'axios';

const getAllProducts = async () => {
  const allProducts = [];

  try {
    const firstRes: AxiosResponse = await axiosInstance.get(
      `product?page=1&orderBy=asc`
    );
    const { products, totalCount } = firstRes.data.data;
    allProducts.push(...products);

    for (let page = 2; page <= totalCount; page++) {
      try {
        const res: AxiosResponse = await axiosInstance.get(
          `product?page=${page}&orderBy=asc`
        );
        allProducts.push(...res.data.data.products);
      } catch (err) {
        console.error(`❌ ${page}번 페이지 실패`, err);
      }
    }

    return allProducts;
  } catch (error) {
    console.error("❌ 전체 품목 불러오기 실패:", error);
    return [];
  }
}

export default getAllProducts;