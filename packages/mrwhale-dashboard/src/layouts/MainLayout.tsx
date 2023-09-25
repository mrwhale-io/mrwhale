import { Box, Container, Grid, Link, Typography } from "@mui/material";
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

const footers = [
  {
    title: "Community",
    description: [
      { title: "Discord", href: "https://discord.com/invite/wjBnkR4AUZ" },
      { title: "Game Jolt", href: "https://gamejolt.com/c/mrwhale-tifrgr" },
    ],
  },
  {
    title: "Information",
    description: [
      { title: "Commands", href: "/commands" },
      { title: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Developers",
    description: [
      { title: "GitHub", href: "https://github.com/mrwhale-io/mrwhale" },
    ],
  },
  {
    title: "Legal",
    description: [{ title: "Privacy Policy", href: "/privacy" }],
  },
];

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
        <Grid container spacing={4} justifyContent="space-evenly">
          {footers.map((footer) => (
            <Grid item xs={6} sm={3} key={footer.title}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                {footer.title}
              </Typography>
              <ul>
                {footer.description.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.href}
                      variant="subtitle1"
                      color="text.secondary"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Grid>
          ))}
        </Grid>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </Box>
  );
};

export default MainLayout;
