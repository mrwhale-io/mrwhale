import { Avatar, Box, Grid, Paper, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import { useGetGuildSettingsQuery } from "../guildApi";
import ManageGuildPrefix from "./ManageGuildPrefix";
import ManageGuildLevels from "./ManageGuildLevels";
import { getGuildIcon } from "../../../util/get-guild-icon";
import ManageGuildData from "./ManageGuildData";
import ManageRankCard from "./ManageRankCard";

const ManageGuild = () => {
  const { guildId } = useParams<{ guildId: string }>();
  const {
    data: guildSettingsData,
    isLoading: isLoadingGuildSettings,
  } = useGetGuildSettingsQuery(guildId ?? "");

  return (
    <>
      {isLoadingGuildSettings ? (
        <>Loading...</>
      ) : guildSettingsData ? (
        <>
          <Box sx={{ display: "flex" }}>
            <Avatar
              alt={guildSettingsData.guild.name}
              sx={{ mr: 2 }}
              src={getGuildIcon(guildSettingsData.guild)}
            />
            <Typography
              component="h4"
              variant="h4"
              fontWeight={700}
              color="text.primary"
              gutterBottom
            >
              Manage {guildSettingsData.guild.name}
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
                <ManageGuildPrefix
                  guildId={guildId}
                  guildData={guildSettingsData}
                />
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
                <ManageGuildLevels
                  guildId={guildId}
                  guildData={guildSettingsData}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={12} lg={12}>
              <Paper
                square={false}
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <ManageRankCard
                  guildId={guildId}
                  rankCardTheme={guildSettingsData.settings.rankCard}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} lg={6}>
              <Paper
                square={false}
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <ManageGuildData guildId={guildId} />
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : null}
    </>
  );
};

export default ManageGuild;
