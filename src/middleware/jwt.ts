import { Middleware } from "../types";

export const jwt =
  ({ token }: { token: () => string }): Middleware =>
  async (context, next) => {
    const headers = new Headers(context.headers);
    headers.set("Authorization", `Bearer ${token()}`);

    context.headers = headers;

    return next();
  };
