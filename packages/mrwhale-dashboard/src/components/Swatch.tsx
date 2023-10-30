import { Box, Popover, PopoverProps, Typography, styled } from "@mui/material";
import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";

import "./Swatch.css";

interface Props {
  title: string;
  defaultColour: string;
}

const SwatchPopover = styled(Popover)<PopoverProps>(() => ({
  padding: 20,
  marginLeft: 20,
  overflow: "hidden",
}));

const Swatch = ({ title, defaultColour }: Props) => {
  const [color, setColor] = useState(defaultColour);
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
        style={{ backgroundColor: color }}
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
            color={color}
            onChange={setColor}
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
