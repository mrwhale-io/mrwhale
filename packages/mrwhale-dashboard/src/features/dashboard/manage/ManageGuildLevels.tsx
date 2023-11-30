import { FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";
import React from "react";

import { useLevelsMutation } from "../guildApi";
import { GuildManage } from "../../../types/guild-manage";
import ManageGuildLevelChannel from "./ManageGuildLevelChannel";

interface Props {
  guildId?: string;
  guildData: GuildManage;
}

const ManageGuildLevels = ({ guildId, guildData }: Props) => {
  const [setLevels] = useLevelsMutation();
  const [checked, setChecked] = React.useState(
    guildData.settings.levels ?? true
  );

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (guildId) {
      setChecked(event.target.checked);
      await setLevels({
        id: guildId,
      }).unwrap();
    }
  };

  return (
    <>
      <Typography
        component="h5"
        variant="h5"
        color="text.primary"
        gutterBottom
        sx={{ py: 1 }}
      >
        Manage Levels
      </Typography>

      <FormGroup>
        <FormControlLabel
          control={<Switch checked={checked} onChange={handleChange} />}
          label={checked ? "Levels Enabled" : "Levels Disabled"}
          sx={{ paddingBottom: 2 }}
        />
        {checked && (
          <ManageGuildLevelChannel guildId={guildId} guildData={guildData} />
        )}
      </FormGroup>
    </>
  );
};

export default ManageGuildLevels;
