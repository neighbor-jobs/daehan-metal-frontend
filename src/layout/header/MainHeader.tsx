import {AppBar, Box, Button, Toolbar, Typography} from '@mui/material';
import {MenuType} from '../../types/headerMenu.ts';
import {useNavigate} from 'react-router-dom';
import {useHeaderStore} from '../../stores/headerStore.ts';

interface MainHeaderProps {
  handleNavigate: (value: MenuType) => void;
}

const MainHeader = ({handleNavigate}: MainHeaderProps): React.JSX.Element => {
  const navigate = useNavigate();
  const { setSelectedType, setSelectedSubType } = useHeaderStore();
  const menu = Object.entries(MenuType).map(([key, value]) => ({
    key, value,
  }));

  return (
    <AppBar color='primary' position="static">
      <Toolbar variant='dense'>
        <Typography variant="h6"
                    sx={{marginRight: 4, fontWeight: 'bold', cursor: 'pointer'}}
                    onClick={() => {
                      navigate('/');
                      setSelectedSubType(null);
                      setSelectedType(null);
                    }}
        >
          대한금속 ERP
        </Typography>
        <Box sx={{display: 'flex', gap: 3}}>
          {menu.map((item, index) => (
            <Button color="inherit"
                    key={index}
                    onClick={() => handleNavigate(item.value)}
            >
              {item.value}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
export default MainHeader;