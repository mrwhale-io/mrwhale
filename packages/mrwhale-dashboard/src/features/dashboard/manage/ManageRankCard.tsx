import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import { RankCardTheme } from "@mrwhale-io/core";
import FormSnackbar from "../../../shared/FormSnackbar";
import { useCardMutation, useResetCardMutation } from "../guildApi";
import Swatch from "../../../components/Swatch";
import "./ManageRankCard.css";

interface Props {
  guildId?: string;
  rankCardTheme: RankCardTheme;
}

const ManageRankCard = ({ guildId, rankCardTheme }: Props) => {
  const [confirmationOpen, setConfirmationOpen] = React.useState(false);
  const [resetConfirmationOpen, setResetConfirmationOpen] = React.useState(
    false
  );
  const [success, setSuccess] = React.useState(false);
  const [fillColour, setFillColour] = useState(rankCardTheme.fillColour);
  const [progressColour, setProgressColour] = useState(
    rankCardTheme.progressColour
  );
  const [primaryTextColour, setPrimaryTextColour] = useState(
    rankCardTheme.primaryTextColour
  );
  const [secondaryTextColour, setSecondaryTextColour] = useState(
    rankCardTheme.secondaryTextColour
  );
  const [progressFillColour, setProgressFillColour] = useState(
    rankCardTheme.progressFillColour
  );

  const [errorMessage, setErrorMessage] = React.useState("");
  const [cardMutation] = useCardMutation();
  const [resetCardMutation] = useResetCardMutation();
  const [image, setImage] = useState<string>();

  const handleConfirmationOpen = () => {
    setConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
  };

  const handleResetConfirmationOpen = () => {
    setResetConfirmationOpen(true);
  };

  const handleResetConfirmationClose = () => {
    setResetConfirmationOpen(false);
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
        await cardMutation({
          id: guildId,
          fillColour,
          progressColour,
          progressFillColour,
          primaryTextColour,
          secondaryTextColour,
        }).unwrap();
        await fetchRankCard();
        setSuccess(true);
      }
    } catch (error) {
      setErrorMessage("An error occured while attempting to update rank card.");
    }
  };

  const onReset = async () => {
    handleResetConfirmationClose();
    try {
      if (guildId) {
        await resetCardMutation({ id: guildId }).unwrap();
        await fetchRankCard();
        setSuccess(true);
      }
    } catch (error) {
      setErrorMessage("An error occured while attempting to reset rank card.");
    }
  };

  const fetchRankCard = async () => {
    const response = await fetch(`/api/guilds/${guildId}/card`);
    const imageBlob = await response.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    setImage(imageObjectURL);
  };

  useEffect(() => {
    fetchRankCard();
  }, []);

  return (
    <>
      <Typography
        component="h5"
        variant="h5"
        color="text.primary"
        gutterBottom
        sx={{ py: 1 }}
      >
        Manage Rank Card
      </Typography>

      <Grid container spacing={2} columns={16}>
        <Grid item xs={12} md={8} lg={8}>
          <img src={image} alt="rank card" className="rank-image" />
        </Grid>
        <Grid item xs={12} md={8} lg={8} display="flex" alignItems="center">
          <Stack spacing={2} direction="row">
            <Button
              type="submit"
              onClick={handleConfirmationOpen}
              variant="contained"
              color="primary"
            >
              Edit Theme
            </Button>
            <Button
              type="submit"
              onClick={handleResetConfirmationOpen}
              variant="contained"
              color="error"
            >
              Reset Theme
            </Button>
          </Stack>
        </Grid>
      </Grid>
      <Dialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Edit Rank Card Theme"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ py: 1 }}>
            Set a server theme for your rank card here.
          </DialogContentText>
          <Divider>Main</Divider>
          <div className="pallete-container">
            <Swatch
              title="Fill Colour"
              colour={fillColour}
              onChange={setFillColour}
            />
          </div>
          <Divider>Progress Bar</Divider>
          <div className="pallete-container">
            <Swatch
              title="Fill Colour"
              colour={progressFillColour}
              onChange={setProgressFillColour}
            />
            <Swatch
              title="Progress Colour"
              colour={progressColour}
              onChange={setProgressColour}
            />
          </div>
          <Divider>Text</Divider>
          <div className="pallete-container">
            <Swatch
              title="Primary Colour"
              colour={primaryTextColour}
              onChange={setPrimaryTextColour}
            />
            <Swatch
              title="Secondary Colour"
              colour={secondaryTextColour}
              onChange={setSecondaryTextColour}
            />
          </div>
          <Divider />
        </DialogContent>
        <DialogActions>
          <Button onClick={onSubmit} autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={resetConfirmationOpen}
        onClose={handleResetConfirmationClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Reset Rank Card?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to reset the rank card theme for this server?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetConfirmationClose}>No</Button>
          <Button onClick={onReset} autoFocus>
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
        message="Successfully updated rank card!"
        onClose={handleClose}
      />
    </>
  );
};

export default ManageRankCard;
