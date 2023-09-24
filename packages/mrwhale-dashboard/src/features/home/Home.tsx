import { Box, Button, Container, Stack, Typography } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Link as RouterLink } from "react-router-dom";

import "./Home.css";
import { getInviteUrl } from "../../util/get-invite-url";
import { useAuth } from "../../hooks/auth";
import FeatureItem, { FeatureItemProps } from "./FeatureItem";
import { useClient } from "../../hooks/client";

const features: FeatureItemProps[] = [
  {
    title: "🏆 Level up",
    description:
      "Compete with friends in your server by gaining EXP and levelling up in the leaderboards.",
    imageSrc: "/assets/level-advance.png",
    imageAlt: "Level up",
  },
  {
    title: "💯 Rank Cards",
    description:
      "Discover how you rank up with your very own ranking card. This shows your current progress and includes your rank, level and EXP.",
    imageSrc: "/assets/rank.png",
    imageAlt: "Rank card",
  },
  {
    title: "📈 Leaderboards",
    description: "Mr. Whale supports both global and server leaderboards.",
    imageSrc: "/assets/leaderboard.png",
    imageAlt: "Leaderboard",
    list: [
      {
        icon: <EmojiEventsIcon color="secondary" />,
        primaryText: "Global Leaderboard",
        secondaryText:
          " This is the top 10 players across discord. Every discord server you use Mr. Whale in counts towards this.",
      },
      {
        icon: <EmojiEventsIcon color="secondary" />,
        primaryText: "Server Leaderboards",
        secondaryText: "This is the top 10 players in the server.",
      },
    ],
  },
];

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { clientId, userCount } = useClient();

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
              component="h2"
              variant="h2"
              fontWeight={700}
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
              <Button
                component="a"
                href={getInviteUrl(clientId)}
                variant="contained"
              >
                Add to Discord
              </Button>
              {isAuthenticated && user ? (
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/dashboard"
                >
                  Dashboard
                </Button>
              ) : (
                <Button variant="outlined" href="/authorize/login">
                  Login
                </Button>
              )}
            </Stack>
          </Container>
          <Container sx={{ pt: 4 }}>
            <img src="/assets/mrwhale.svg" className="float" />
          </Container>
        </Box>
        <svg viewBox="0 0 500 150" preserveAspectRatio="xMinYMin meet">
          <path
            fill="#004080"
            d="M0,100 C150,200 350,0 500,100 L500,00 L0,0 Z"
          ></path>
        </svg>
      </div>

      {features.map((feature) => (
        <FeatureItem
          title={feature.title}
          description={feature.description}
          imageSrc={feature.imageSrc}
          imageAlt={feature.imageAlt}
          list={feature.list}
        />
      ))}

      <Typography variant="h5" align="center" color="text.secondary" paragraph>
        So what are you waiting for? Join {userCount} Discord users and invite
        Mr. Whale to your server today.
      </Typography>
      <Box
        sx={{ pt: 4 }}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Button component="a" href={getInviteUrl(clientId)} variant="contained">
          Add to Discord
        </Button>
      </Box>
    </>
  );
};

export default Home;
