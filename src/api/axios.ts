// 재시도 설정
import axios from 'axios';
import {useAlertStore} from '../stores/alertStore.ts';

const VITE_API_URL_NGROK = import.meta.env.VITE_API_URL_NGROK;

if (!VITE_API_URL_NGROK) {
  console.warn('Warning: VITE_API_URL_NGROK is not defined in environment variables');
}

// 기본 설정으로 axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: VITE_API_URL_NGROK || 'http://localhost:3000',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420',
  }
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 400) {
      const { showAlert } = useAlertStore.getState();
      showAlert('잘못된 요청입니다', 'error');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;