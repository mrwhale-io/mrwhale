import { body } from "express-validator";

import { PREFIX_MAX_LENGTH } from "../../../constants";

export const guildSetPrefixValidators = [
  body("prefix")
    .notEmpty()
    .withMessage("Prefix is required.")
    .isLength({
      max: PREFIX_MAX_LENGTH,
    })
    .withMessage(`Prefix must be less than ${PREFIX_MAX_LENGTH} characters.`),
];

export const guildSetMessageChannelValidators = [
  body("channelId").notEmpty().withMessage("Channel Id is required."),
];
