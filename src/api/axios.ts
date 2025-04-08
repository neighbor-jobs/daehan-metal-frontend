// 재시도 설정
import axios from 'axios';

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

export default axiosInstance;