import { Chip } from "@mui/material";

import { Command } from "../../types/command";

interface Props {
  command: Command;
}

const GuildOnly = ({ command }: Props) => {
  if (command.guildOnly) {
    return <Chip color="secondary" label="Guild" />;
  }
};

export default GuildOnly;
