import { Chip, Stack, Typography } from "@mui/material";

interface Props {
  aliases: string[];
}

const Aliases = ({ aliases }: Props) => {
  if (aliases && aliases.length > 0) {
    return (
      <div>
        <Typography
          color="text.primary"
          variant="subtitle1"
          fontWeight={500}
          gutterBottom
        >
          Aliases
        </Typography>
        <Stack direction="row" spacing={1} sx={{ my: 1 }}>
          {aliases.map((alias) => (
            <Chip color="secondary" label={alias} key={alias} />
          ))}
        </Stack>
      </div>
    );
  }
};

export default Aliases;
