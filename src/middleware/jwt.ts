import { Middleware } from "../types";

export const jwt =
  ({ token }: { token: () => string }): Middleware =>
  async (context, next) => {
    context.headers.set("Authorization", `Bearer ${token()}`);

    return next();
  };
