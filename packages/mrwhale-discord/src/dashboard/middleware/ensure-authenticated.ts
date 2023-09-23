import * as express from "express";

import { HttpStatusCode } from "@mrwhale-io/core";

/**
 * Express middleware to ensure the user is authenticated.
 */
export function ensureAuthenticated() {
  return function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (!req.session.user) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: "Unauthorized" })
        .end();
    }
    next();
  };
}
