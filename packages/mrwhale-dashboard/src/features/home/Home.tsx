import { Box, Button, Container, Stack, Typography } from "@mui/material";
import "./Home.css";

const Home = () => {
  return (
    <>
      <div className="wave">
        <Box
          sx={{
            bgcolor: "#004080",
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Meet Mr. Whale
            </Typography>
            <Typography
              variant="h5"
              align="center"
              color="text.secondary"
              paragraph
            >
              An all-purpose chat bot loaded with dozens of awesome commands and
              features! Currently works on both Discord and Game Jolt.
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Button variant="contained">Add to Discord</Button>
              <Button variant="outlined">Dashboard</Button>
            </Stack>
          </Container>
          <Container sx={{ pt: 4 }}>
            <img src="/src/assets/mrwhale.svg" className="float" />
          </Container>
        </Box>
        <svg viewBox="0 0 500 150" preserveAspectRatio="xMinYMin meet">
          <path
            fill="#004080"
            d="M0,100 C150,200 350,0 500,100 L500,00 L0,0 Z"
          ></path>
        </svg>

      </div>

      <Box
        sx={{
          pt: 8,
          pb: 6,
        }}
      >
        <Typography variant="h3" color="text.secondary" paragraph>
          Levelling
        </Typography>
        <Typography>
          Compete with friends in your server. 
        </Typography>
      </Box>
    </>
  );
};

export default Home;
