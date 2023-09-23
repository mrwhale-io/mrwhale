import { Avatar, Box, Grid, Paper, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import { useGetGuildSettingsQuery } from "../guildApi";
import ManageGuildPrefix from "./ManageGuildPrefix";
import ManageGuildLevels from "./ManageGuildLevels";
import { getGuildIcon } from "../../../util/get-guild-icon";

const ManageGuild = () => {
  const { guildId } = useParams<{ guildId: string }>();
  const { data, isLoading } = useGetGuildSettingsQuery(guildId ?? "");

  return (
    <>
      {isLoading ? (
        <>Loading...</>
      ) : data ? (
        <>
          <Box sx={{ display: "flex" }}>
            <Avatar
              alt={data.guild.name}
              sx={{ mr: 2 }}
              src={getGuildIcon(data.guild)}
            />
            <Typography
              component="h4"
              variant="h4"
              fontWeight={700}
              color="text.primary"
              gutterBottom
            >
              Manage {data.guild.name}
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
              <Paper
                square={false}
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  height: 240,
                }}
              >
                <ManageGuildPrefix guildId={guildId} guildData={data} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} lg={6}>
              <Paper
                square={false}
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  height: 240,
                }}
              >
                <ManageGuildLevels guildId={guildId} guildData={data} />
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : null}
    </>
  );
};

export default ManageGuild;
