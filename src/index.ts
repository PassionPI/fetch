export { createFetch } from "./core";
export { json } from "./middleware/json";
export { jwt } from "./middleware/jwt";
export { wait } from "./middleware/wait";

export type {
  Middleware,
  Payload,
  Prime,
  Result,
  ResultWithAbort,
} from "./types";
