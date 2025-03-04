import React from "react";
import {Box, Button, Grid2} from "@mui/material";
import {menuTypeArr} from '../types/headerMenu.ts';

const Home = (): React.JSX.Element => {
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