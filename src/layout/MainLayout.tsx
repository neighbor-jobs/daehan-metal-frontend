import Header from './header/Header.tsx';
import {Outlet} from 'react-router-dom';
import {Box} from '@mui/material';

const MainLayout = (): React.JSX.Element => {
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
    </Box>
  )
}

export default MainLayout;