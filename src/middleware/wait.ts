import { Middleware } from "../types";

export const wait =
  ({
    until,
    whiteList,
  }: {
    until: () => Promise<void>;
    whiteList?: string[];
  }): Middleware =>
  async (context, next) => {
    if (!whiteList?.includes?.(context.url.pathname)) {
      await until();
    }

    return next();
  };
