import Header from './header/Header.tsx';
import {Outlet} from 'react-router-dom';
import {Box} from '@mui/material';

const MainLayout = (): React.JSX.Element => {
  return (
    <Box
      sx={{
        height: '100vh',
      }}
    >
      <Header />
      <Outlet />
    </Box>
  )
}

export default MainLayout;