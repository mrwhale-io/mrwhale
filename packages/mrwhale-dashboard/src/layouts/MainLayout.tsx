import { Box, Container, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";

import Nav from "../components/Nav";

function Copyright(props: any) {
  return (
    <Typography
      variant="body1"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © Mr. Whale "}
      {new Date().getFullYear()}
    </Typography>
  );
}

const MainLayout = () => {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Nav />
      <Container component="main" sx={{ py: 8 }}>
        <Outlet />
      </Container>
      <Container
        maxWidth="md"
        component="footer"
        sx={{
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          mt: 8,
          py: [3, 6],
        }}
      >
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </Box>
  );
};

export default MainLayout;
