import { Snackbar } from "@mui/material";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import React from "react";

interface SnackbarProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: (event?: React.SyntheticEvent | Event, reason?: string) => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SNACK_BAR_AUTO_HIDE_DURATION = 3000;

const FormSnackbar = ({ open, message, severity, onClose }: SnackbarProps) => {
  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={SNACK_BAR_AUTO_HIDE_DURATION}
        onClose={onClose}
      >
        <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FormSnackbar;
