import { Middleware } from "../types";

export const error: Middleware = (payload, next) =>
  next().then(
    (result) => result,
    (e) => [Error(e as string), null, { payload, response: null }]
  );
