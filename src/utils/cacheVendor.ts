import axiosInstance from '../api/axios.ts';

export const getPurchaseCompanyList = async () => {
  const res = await axiosInstance.get('/vendor/many');
  return res.data.data;
}