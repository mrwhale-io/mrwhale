import {
  Button,
  FormControl,
  FormGroup,
  FormHelperText,
  Input,
  InputLabel,
  Typography,
} from "@mui/material";
import React from "react";
import { useForm } from "react-hook-form";

import { usePrefixMutation } from "../guildApi";
import { HttpApiValidationError, HttpResponseError } from "../../../shared/api";
import FormSnackbar from "../../../shared/FormSnackbar";
import { GuildManage } from "../../../types/guild-manage";

interface ManageGuildPrefix {
  prefix: string;
}

interface Props {
  guildId?: string;
  guildData: GuildManage;
}

const PREFIX_MAX_LENGTH = 10;

const ManageGuildPrefix = ({ guildId, guildData }: Props) => {
  const [success, setSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [setPrefix] = usePrefixMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<ManageGuildPrefix>({
    mode: "onChange",
    defaultValues: { prefix: guildData.settings.prefix ?? "" },
  });

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

  const onSubmit = async (data: ManageGuildPrefix) => {
    try {
      if (guildId) {
        await setPrefix({ id: guildId, prefix: data.prefix }).unwrap();
        setSuccess(true);
      }
    } catch (error) {
      const httpResponseError = error as HttpResponseError<HttpApiValidationError>;
      if (httpResponseError.data && httpResponseError.data.errors) {
        setErrorMessage(httpResponseError.data.errors["prefix"].msg);
      }
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
        Set Prefix
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <FormControl variant="standard">
            <InputLabel htmlFor="prefix">Prefix</InputLabel>
            <Input
              id="prefix"
              autoComplete="off"
              {...register("prefix", {
                required: true,
                maxLength: {
                  value: PREFIX_MAX_LENGTH,
                  message: `Prefix cannot be longer than ${PREFIX_MAX_LENGTH} characters.`,
                },
              })}
            />
            <FormHelperText error={true} id="prefix-error">
              {errors.prefix && errors.prefix.message}
            </FormHelperText>
          </FormControl>
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty || !isValid}
            variant="contained"
            sx={{ my: 2 }}
          >
            Save
          </Button>
        </FormGroup>
      </form>

      <FormSnackbar
        open={errorMessage !== ""}
        severity="error"
        message={errorMessage}
        onClose={handleClose}
      />
      <FormSnackbar
        open={success}
        severity="success"
        message="Successfully set prefix!"
        onClose={handleClose}
      />
    </>
  );
};

export default ManageGuildPrefix;
