import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useGetCommandsQuery } from "./commandsApi";
import Examples from "./Examples";
import Aliases from "./Aliases";
import GuildOnly from "./GuildOnly";
import { COMMAND_TYPES } from "../../constants";

const Commands = () => {
  const { data, isLoading } = useGetCommandsQuery();
  const [itemsSelected, setItemsSelected] = useState<string[]>([]);

  if (isLoading) {
    return (
      <>
        <Box display="flex" justifyContent="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (!data) {
    return null;
  }

  const commands =
    itemsSelected.length > 0
      ? data.commands.filter((command) => itemsSelected.includes(command.type))
      : data.commands;

  const handleInput = (
    _event: React.SyntheticEvent,
    value: {
      title: string;
      value: string;
    }[]
  ) => {
    setItemsSelected(value.map((v) => v.value));
  };

  return (
    <>
      <Typography
        component="h4"
        variant="h4"
        fontWeight={700}
        color="text.primary"
        gutterBottom
      >
        Commands
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Find detailed information about each command such as description, usage
        and examples.
      </Typography>
      <Stack spacing={3} sx={{ pb: 5, pt: 2 }}>
        <Autocomplete
          multiple
          id="command-types"
          options={COMMAND_TYPES}
          getOptionLabel={(option) => option.title}
          onChange={handleInput}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label="Categories"
              placeholder="Search for categories"
            />
          )}
        />
      </Stack>

      {commands.map((command) => (
        <Accordion key={command.name}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Chip label={"/" + command.name} />
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ my: 1 }}>
              <Typography color="text.secondary" variant="body2">
                {command.description}
              </Typography>
            </Box>

            <Divider variant="fullWidth" />
            <Box sx={{ my: 1 }}>
              <Examples examples={command.examples} />
              <Aliases aliases={command.aliases} />
              <Box display="flex" justifyContent="flex-end">
                <Stack direction="row" spacing={1}>
                  <GuildOnly command={command} />
                  <Chip color="primary" label={command.type} />
                </Stack>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

export default Commands;
