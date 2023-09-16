import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useGetCommandsQuery } from "./commandsApi";
import Examples from "./Examples";
import Aliases from "./Aliases";
import GuildOnly from "./GuildOnly";

const Commands = () => {
  const { data, isLoading } = useGetCommandsQuery();

  return (
    <>
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
            Commands
          </Typography>
          <Typography variant="body1" color="text.primary" gutterBottom>
            Find information about each command available for Mr. Whale.
          </Typography>
          {data.commands.map((command) => (
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
      ) : null}
    </>
  );
};

export default Commands;
