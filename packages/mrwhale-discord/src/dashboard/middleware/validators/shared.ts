import * as express from "express";
import { ValidationChain, validationResult } from "express-validator";

import { HttpStatusCode } from "@mrwhale-io/core";

/**
 * Run all validators for a given validation chain.
 * @param validations The validations to run.
 */
export function validate(validations: ValidationChain[]) {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res
      .status(HttpStatusCode.UNPROCESSABLE_ENTITY)
      .json({ errors: errors.mapped() });
  };
}
