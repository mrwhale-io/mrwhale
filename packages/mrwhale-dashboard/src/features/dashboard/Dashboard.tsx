import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
} from "@mui/material";

import { useGetUserGuildsQuery } from "../users/usersApi";
import { Guild } from "../../types/guild";

const Dashboard = () => {
  const { data, isLoading } = useGetUserGuildsQuery();

  const getGuildIcon = (guild: Guild) => {
    return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=512`;
  };

  return (
    <>
      {" "}
      {isLoading ? (
        <>Loading...</>
      ) : data ? (
        <>
          <Typography
            component="h4"
            variant="h4"
            fontWeight={700}
            color="text.primary"
            gutterBottom
          >
            Your servers
          </Typography>
          <Container sx={{ py: 8 }} maxWidth="md">
            <Grid container spacing={4}>
              {data.guilds.map((guild) => (
                <Grid item key={guild.id} xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardMedia
                      component="div"
                      sx={{
                        // 16:9
                        pt: "56.25%",
                      }}
                      image={getGuildIcon(guild)}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {guild.name}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">Invite</Button>
                      <Button size="small">Manage</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </>
      ) : null}
    </>
  );
};

export default Dashboard;
