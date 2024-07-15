import { OnionLayer } from "@passion_pi/fp";

type Body = Record<string, unknown> | RequestInit["body"];

export type Prime = string | number | boolean | null | undefined;

export type BaseResponse = object | Prime;

export type Payload = Omit<RequestInit, "body"> & {
  /** input */
  url: string;
  search?:
    | ConstructorParameters<typeof URLSearchParams>[0]
    | Record<string, Prime | Array<Prime>>;
  /** request init */
  body?: Body;
};

export type Context = Omit<RequestInit, "body" | "headers"> & {
  /** input */
  url: URL;
  /** request init */
  body?: Body;
  headers: Headers;
};

export type Result<R> = Promise<
  | [
      error: Error,
      value: null,
      meta: {
        context: Context;
        response: Response | null;
      }
    ]
  | [
      error: null,
      value: R,
      meta: {
        context: Context;
        response: Response;
      }
    ]
>;

export type ResultWithAbort<R> = Result<R> & {
  abort: () => void;
};

export type Middleware = OnionLayer<Context, Result<BaseResponse>>;
