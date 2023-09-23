import * as express from "express";
import { ValidationChain } from "express-validator";

type ExpressRequestHandler =
  | ValidationChain
  | ((
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => Promise<any>);

/**
 * Middleware for handling exceptions inside async express routes.
 *
 * @param handler The express handler to execute.
 */
export function asyncRequestHandler(handler: ExpressRequestHandler) {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    return Promise.resolve(handler(req, res, next)).catch((err) => next(err));
  };
}
