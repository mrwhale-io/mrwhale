import { Box, Button, Container, Stack, Typography } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PhishingIcon from "@mui/icons-material/Phishing";
import { Link as RouterLink } from "react-router-dom";

import "./Home.css";
import { getInviteUrl } from "../../util/get-invite-url";
import { useAuth } from "../../hooks/auth";
import FeatureItem, { FeatureItemProps } from "./FeatureItem";
import { useClient } from "../../hooks/client";

const features: FeatureItemProps[] = [
  {
    title: "🎣 Ultimate Fishing Adventure",
    description:
      "Embark on an exciting fishing journey where you can catch a variety of fish, upgrade your gear, and unlock achievements.",
    imageSrc: "/assets/fishing-game.png",
    imageAlt: "Fishing Adventure",
    list: [
      {
        icon: <PhishingIcon color="secondary" />,
        primaryText: "Fishing Rods",
        secondaryText:
          "Purchase and upgrade your fishing rods to increase your chances of catching rare fish.",
      },
      {
        icon: <PhishingIcon color="secondary" />,
        primaryText: "Bait",
        secondaryText:
          "Use different types of bait to attract specific kinds of fish.",
      },
      {
        icon: <EmojiEventsIcon color="secondary" />,
        primaryText: "Achievements",
        secondaryText:
          "Earn achievements for milestones like catching a certain number of fish or rare fish.",
      },
    ],
  },
  {
    title: "🏆 Level Up Your Game",
    description:
      "Challenge your friends and rise through the ranks by earning EXP and climbing the leaderboards.",
    imageSrc: "/assets/level-advance.png",
    imageAlt: "Level Up",
  },
  {
    title: "💯 Customisable Rank Cards",
    description:
      "Monitor your progress with your own customisable rank card, showcasing your current rank, level, and EXP.",
    imageSrc: "/assets/rank.png",
    imageAlt: "Rank Card",
  },
  {
    title: "📈 Competitive Leaderboards",
    description:
      "Engage in fierce competition on global and server-specific leaderboards. Display your accomplishments and aim for the top.",
    imageSrc: "/assets/leaderboard.png",
    imageAlt: "Leaderboards",
    list: [
      {
        icon: <EmojiEventsIcon color="secondary" />,
        primaryText: "Global Leaderboard",
        secondaryText:
          "Compete with users from all servers and see who has the highest scores globally.",
      },
      {
        icon: <EmojiEventsIcon color="secondary" />,
        primaryText: "Server Leaderboards",
        secondaryText:
          "View leaderboards specific to your server for various metrics like fish caught and EXP gained.",
      },
    ],
  },
  {
    title: "💰 Thriving Economy",
    description:
      "Participate in a dynamic in-game economy. Earn gems by sending messages, feeding Mr. Whale, and catching rare fish. Spend gems in the shop to buy items and upgrades.",
    imageSrc: "/assets/economy.png",
    imageAlt: "Economy",
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
              Your all-in-one chat bot for fun games, dynamic leaderboards, and
              a thriving economy on Discord and Game Jolt!
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
