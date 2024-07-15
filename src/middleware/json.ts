import { Middleware } from "../types";

export const json = (): Middleware => async (context, next) => {
  context.headers.set("Content-Type", "application/json");

  return next();
};
