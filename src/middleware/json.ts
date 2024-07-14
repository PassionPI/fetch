import { Middleware } from "../types";

export const json = (): Middleware => async (context, next) => {
  const headers = new Headers(context.headers);
  headers.set("Content-Type", "application/json");

  context.headers = headers;

  return next();
};
