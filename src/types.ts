import { OnionLayer } from "@passion_pi/fp";

type Body = Record<string, any> | Array<any> | RequestInit["body"];

type Progress = { total: number; length: number; progress: number };

interface BasePayload {
  config?: object;
  download?: {
    onProgress: (progress: Progress) => void;
    onDone: (value: Uint8Array) => void;
    onError: (error: Error) => void;
  };
  upload?: {
    onProgress: (progress: Progress) => void;
    onDone: () => void;
    onError: (error: Error) => void;
  };
}

export type Prime = string | number | boolean | null | undefined;

export type BaseResponse = object | Prime | void;

export type Payload = BasePayload &
  Omit<RequestInit, "body"> & {
    /** input */
    url: string;
    search?:
      | ConstructorParameters<typeof URLSearchParams>[0]
      | Record<string, Prime | Array<Prime>>;
    /** request init */
    body?: Body;
  };

export type Context = BasePayload &
  Omit<RequestInit, "body" | "headers"> & {
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
