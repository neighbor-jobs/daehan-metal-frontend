import Header from './header/Header.tsx';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useAlertStore} from '../stores/alertStore.ts';
import {Box} from '@mui/material';
import MyAlert from '../components/MyAlert.tsx';
import React from 'react';
import {ErrorBoundary} from '../pages/ErrorBoundary.tsx';

const MainLayout = (): React.JSX.Element => {
  const { message, openAlert, severity, closeAlert } = useAlertStore();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      <Header />

      {/*<Outlet />*/}
      <ErrorBoundary
        key={location.pathname}       // 라우트 변경 시 초기화
        scope="page"
        onRecover={() => navigate('/', { replace: true })} // 복구 버튼이 누르면 홈으로
      >
        <Outlet />
      </ErrorBoundary>

      <MyAlert
        open={openAlert}
        onClose={closeAlert}
        severity={severity}
        message={message}
      >
      </MyAlert>
    </Box>
  )
}

export default MainLayout;