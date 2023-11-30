import { Box, Popover, PopoverProps, Typography, styled } from "@mui/material";
import React from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";

import "./Swatch.css";

interface Props {
  title: string;
  colour: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
}

const SwatchPopover = styled(Popover)<PopoverProps>(() => ({
  padding: 20,
  marginLeft: 20,
  overflow: "hidden",
}));

const Swatch = ({ title, colour, onChange }: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "swatch-popover" : undefined;
  return (
    <div className="colourPicker">
      <div
        className="swatch"
        onClick={handleClick}
        style={{ backgroundColor: colour }}
      />
      <SwatchPopover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
      >
        <Box
          sx={{
            padding: "16px",
          }}
        >
          <HexColorPicker
            style={{ width: "220px", height: "150px" }}
            color={colour}
            onChange={onChange}
          />
          <HexColorInput
            className="colourPickerInput"
            color={colour}
            onChange={onChange}
          />
        </Box>
      </SwatchPopover>
      <Typography
        variant="caption"
        sx={{ marginTop: 1 }}
        display="block"
        gutterBottom
      >
        {title}
      </Typography>
    </div>
  );
};

export default Swatch;
