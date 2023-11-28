import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import React from "react";

import { useDeleteGuildDataMutation } from "../guildApi";
import FormSnackbar from "../../../shared/FormSnackbar";

interface Props {
  guildId?: string;
}

const ManageGuildData = ({ guildId }: Props) => {
  const [confirmationOpen, setConfirmationOpen] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [deleteGuildData] = useDeleteGuildDataMutation();

  const handleConfirmationOpen = () => {
    setConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
  };

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setErrorMessage("");
    setSuccess(false);
  };

  const onSubmit = async () => {
    handleConfirmationClose();
    try {
      if (guildId) {
        await deleteGuildData({ id: guildId }).unwrap();
        setSuccess(true);
      }
    } catch (error) {
      setErrorMessage("An error occured while attempting to delete data.");
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
        Manage Server Data
      </Typography>

      <Button
        type="submit"
        variant="contained"
        color="error"
        sx={{ my: 2 }}
        onClick={handleConfirmationOpen}
      >
        Reset
      </Button>

      <Dialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Reset server data?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action will reset all server settings and leaderboard scores.
            This action is irreversible. Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationClose}>No</Button>
          <Button onClick={onSubmit} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <FormSnackbar
        open={errorMessage !== ""}
        severity="error"
        message={errorMessage}
        onClose={handleClose}
      />
      <FormSnackbar
        open={success}
        severity="success"
        message="Successfully reset server!"
        onClose={handleClose}
      />
    </>
  );
};

export default ManageGuildData;
