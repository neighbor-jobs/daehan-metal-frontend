import Header from './header/Header.tsx';
import {Outlet} from 'react-router-dom';
import {useAlertStore} from '../stores/alertStore.ts';
import {Box} from '@mui/material';
import MyAlert from '../components/MyAlert.tsx';
import React from 'react';

const MainLayout = (): React.JSX.Element => {
  const { message, openAlert, severity, closeAlert } = useAlertStore();

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
      <Outlet />
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