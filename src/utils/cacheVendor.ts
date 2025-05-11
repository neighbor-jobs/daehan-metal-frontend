import axiosInstance from '../api/axios.ts';

export const getPurchaseCompanyList = async () => {
  const res = await axiosInstance.get('/vendor/many?orderBy=asc');
  return res.data.data;
}