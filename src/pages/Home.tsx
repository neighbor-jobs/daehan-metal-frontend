import React from "react";
import {Box, Button, Grid2} from "@mui/material";
import {MenuType, menuTypeArr} from '../types/headerMenu.ts';
import {useNavigate} from 'react-router-dom';
import {useHeaderStore} from '../stores/headerStore.ts';

const Home = (): React.JSX.Element => {
  const navigate = useNavigate();
  const {setSelectedType, setSelectedSubType} = useHeaderStore();

  const handleMainNav = (menuType: MenuType) => {
    setSelectedType(menuType);
    setSelectedSubType(null);
    switch (menuType) {
      case MenuType.RevenueManage:
        navigate('/revenue');
        break;
      case MenuType.PurchaseManage:
        navigate('/purchase');
        break;
      case MenuType.InventoryManage:
        navigate('/item');
        break;
      case MenuType.ClientManage:
        navigate('/client');
        break;
      default:
        navigate('/');
    }
  };
  return (
    <Box
      component="section"
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Grid2
        container spacing={4} justifyContent="center"
        sx={{width: 300, marginTop: 10}}
      >
        {menuTypeArr.map((label, index) => (
          <Button
            key={index}
            variant='outlined'
            onClick={() => handleMainNav(label.value)}
            sx={{
              width: 130,
              height: 130,
              fontSize: "1rem",
            }}
          >
            {label.value}
          </Button>
        ))}
      </Grid2>
    </Box>
  );
};

export default Home;