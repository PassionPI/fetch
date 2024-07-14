import { Middleware } from "../types";

export const jwt =
  ({ token }: { token: string }): Middleware =>
  async (payload, next) => {
    const headers = new Headers(payload.headers);
    headers.set("Authorization", `Bearer ${token}`);

    payload.headers = headers;

    return next();
  };
