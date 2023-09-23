import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

import { useLevelChannelMutation } from "../guildApi";
import { GuildManage } from "../../../types/guild-manage";

interface Props {
  guildId?: string;
  guildData: GuildManage;
}

const ManageGuildLevelChannel = ({ guildId, guildData }: Props) => {
  const [levelChannel] = useLevelChannelMutation();

  const handleChange = async (event: SelectChangeEvent) => {
    if (guildId) {
      await levelChannel({
        id: guildId,
        channelId: event.target.value,
      }).unwrap();
    }
  };

  return (
    <>
      <FormControl fullWidth variant="standard">
        <InputLabel id="level-up-channel-label" shrink>
          Level up channel
        </InputLabel>
        <Select
          labelId="level-up-channel-label"
          id="level-up-channel-select"
          displayEmpty
          defaultValue={guildData.settings.levelChannel ?? ""}
          label="Level up channel"
          onChange={handleChange}
        >
          <MenuItem value="">None</MenuItem>
          {guildData.guild.channels.map((guild) => (
            <MenuItem key={guild.id} value={guild.id}>
              {guild.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default ManageGuildLevelChannel;
