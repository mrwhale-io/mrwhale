import { Chip, Stack, Typography } from "@mui/material";

interface Props {
  examples: string[];
}

const Examples = ({ examples }: Props) => {
  if (examples && examples.length > 0) {
    return (
      <div>
        <Typography
          color="text.primary"
          variant="subtitle1"
          fontWeight={500}
          gutterBottom
        >
          Examples
        </Typography>
        <Stack direction="row" spacing={1} sx={{ my: 1 }}>
          {examples.map((example) => (
            <Chip
              color="default"
              label={example.replace("<prefix>", "/")}
              key={example}
            />
          ))}
        </Stack>
      </div>
    );
  }
};

export default Examples;
