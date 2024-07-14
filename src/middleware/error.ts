import { Middleware } from "../types";

export const error: Middleware = (context, next) =>
  next().then(
    (result) => result,
    (e) => [Error(e as string), null, { context, response: null }]
  );
