import { OnionLayer } from "@passion_pi/fp";

type Body = Record<string, any> | Array<any> | RequestInit["body"];

type Progress = { total: number; length: number; progress: number };

interface BasePayload<Options extends object = object> {
  options?: Options;
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

export type Payload<Options extends object = object> = BasePayload<Options> &
  Omit<RequestInit, "body"> & {
    /** input */
    url: string;
    search?:
      | ConstructorParameters<typeof URLSearchParams>[0]
      | Record<string, Prime | Array<Prime>>;
    /** request init */
    body?: Body;
  };

export type Context<Options extends object = object> = BasePayload<Options> &
  Omit<RequestInit, "body" | "headers"> & {
    /** input */
    url: URL;
    /** request init */
    body?: Body;
    headers: Headers;
  };

export type Result<R, Options extends object = object> = Promise<
  | [
      error: Error,
      value: null,
      meta: {
        context: Context<Options>;
        response: Response | null;
      }
    ]
  | [
      error: null,
      value: R,
      meta: {
        context: Context<Options>;
        response: Response;
      }
    ]
>;

export type ResultWithAbort<R, Options extends object = object> = Result<
  R,
  Options
> & {
  abort: () => void;
};

export type Middleware<Options extends object = object> = OnionLayer<
  Context<Options>,
  Result<BaseResponse, Options>
>;
