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
import { Link as RouterLink } from "react-router-dom";

import { getGuildIcon } from "../../util/get-guild-icon";
import { getInviteUrlForGuild } from "../../util/get-invite-url";
import { Guild } from "../../types/guild";
import { useClient } from "../../hooks/client";

interface Props {
  guilds: Guild[];
}

const GuildList = ({ guilds }: Props) => {
  const { clientId } = useClient();
  return (
    <Container sx={{ py: 8 }} maxWidth="md">
      <Grid container spacing={4}>
        {guilds.map((guild) => (
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
                {!guild.isInvited ? (
                  <Button
                    href={getInviteUrlForGuild(clientId, guild.id)}
                    size="small"
                  >
                    Invite
                  </Button>
                ) : (
                  <Button
                    component={RouterLink}
                    to={`/dashboard/manage/${guild.id}`}
                    size="small"
                  >
                    Manage
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default GuildList;
