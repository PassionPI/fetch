import { Middleware } from "../types";

export const wait =
  ({
    until,
    pathWhiteList,
  }: {
    until: () => Promise<void>;
    pathWhiteList?: string[];
  }): Middleware =>
  async (context, next) => {
    if (!pathWhiteList?.includes?.(context.url.pathname)) {
      await until();
    }

    return next();
  };
