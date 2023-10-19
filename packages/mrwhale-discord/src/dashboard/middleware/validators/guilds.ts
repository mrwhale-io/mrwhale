import { body } from "express-validator";

import { HEX_COLOUR_REGEX, PREFIX_MAX_LENGTH } from "../../../constants";

export const guildSetPrefixValidators = [
  body("prefix")
    .notEmpty()
    .withMessage("Prefix is required.")
    .isLength({
      max: PREFIX_MAX_LENGTH,
    })
    .withMessage(`Prefix must be less than ${PREFIX_MAX_LENGTH} characters.`),
];

export const guildGetRankCardValidators = [
  body("fillColour")
    .matches(HEX_COLOUR_REGEX)
    .withMessage(`Fill colour must be valid hex colour.`),
  body("primaryTextColour")
    .matches(HEX_COLOUR_REGEX)
    .withMessage(`Primary text colour must be valid hex colour.`),
  body("secondaryTextColour")
    .matches(HEX_COLOUR_REGEX)
    .withMessage(`Secondary text colour must be valid hex colour`),
  body("progressFillColour")
    .matches(HEX_COLOUR_REGEX)
    .withMessage(`Progress fill colour must be valid hex colour`),
  body("progressColour")
    .matches(HEX_COLOUR_REGEX)
    .withMessage(`Progress colour must be valid hex colour`),
];
