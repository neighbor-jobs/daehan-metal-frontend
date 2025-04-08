import axiosInstance from './axios.ts';
import {AxiosResponse} from 'axios';

const getAllProducts = async () => {
  const allProducts = [];

  try {
    // 1번 페이지 요청
    const firstRes: AxiosResponse = await axiosInstance.get(
      `product?page=1&orderBy=desc`
    );
    const { products, totalCount } = firstRes.data.data;
    allProducts.push(...products);

    const totalPages = Math.ceil(totalCount); // 필요한 경우 페이지 크기에 따라 나누기

    console.log(`✅ 1번 페이지 완료 (총 ${totalPages} 페이지)`);

    // 2페이지부터 반복 요청
    for (let page = 2; page <= totalPages; page++) {
      try {
        const res: AxiosResponse = await axiosInstance.get(
          `product?page=${page}&orderBy=desc`
        );
        allProducts.push(...res.data.data.products);
        console.log(`✅ ${page}번 페이지 완료`);
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