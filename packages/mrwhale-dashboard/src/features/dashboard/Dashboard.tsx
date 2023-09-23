import { Typography } from "@mui/material";

import { useGetUserGuildsQuery } from "../users/usersApi";
import GuildList from "./GuildList";

const Dashboard = () => {
  const { data, isLoading } = useGetUserGuildsQuery();

  return (
    <>
      {" "}
      {isLoading ? (
        <>Loading...</>
      ) : data ? (
        <>
          {data.guilds.length === 0 ? (
            <Typography
              component="h4"
              variant="h4"
              fontWeight={700}
              color="text.primary"
              gutterBottom
            >
              You have no servers
            </Typography>
          ) : (
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
              <GuildList guilds={data.guilds} />
            </>
          )}
        </>
      ) : null}
    </>
  );
};

export default Dashboard;
