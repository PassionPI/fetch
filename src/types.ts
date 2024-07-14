import { OnionLayer } from "@passion_pi/fp";

export type Prime = string | number | boolean | null | undefined;
export type Payload = {
  /** input */
  url: string;
  search?:
    | ConstructorParameters<typeof URLSearchParams>[0]
    | Record<string, Prime | Array<Prime>>;
  /** request init */
  body?: Record<string, unknown> | RequestInit["body"];
} & Omit<RequestInit, "body">;

export type Result<R> = Promise<
  | [
      error: Error,
      value: null,
      meta: {
        payload: Payload;
        response: Response | null;
      }
    ]
  | [
      error: null,
      value: R,
      meta: {
        payload: Payload;
        response: Response;
      }
    ]
>;

export type ResultWithAbort<R> = Result<R> & {
  abort: () => void;
};

export type Middleware = OnionLayer<Payload, Result<object>>;
