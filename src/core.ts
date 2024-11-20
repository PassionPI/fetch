import { onion } from "@passion_pi/fp";
import { error } from "./middleware/error";
import { downloadProgress, uploadProgress } from "./middleware/progress";
import {
  BaseResponse,
  Context,
  Middleware,
  Payload,
  Result,
  ResultWithAbort,
} from "./types";
import { parseBody, parseContent } from "./util/content";
import { createContext } from "./util/context";

const baseFetch = async <
  R extends BaseResponse,
  Options extends object = object
>(
  context: Context<Options>
): Result<R> => {
  const { url, body, ...init } = context ?? {};

  const request = new Request(url, {
    ...init,
    body: parseBody(context),
  });

  // 这里是网络错误或者请求被阻止(CORS), 才会出现 error
  // 只要后端返回了, 不管 http status 是多少, 都不会报错
  const [err, response] = await fetch(request).then(
    (val) => [null, val] as [null, Response],
    (err) => [err, null] as [Error, null]
  );

  if (err) {
    return [err, null, { context, response }];
  }

  const content = parseContent(response);

  const [error, value] = await content.then(
    (val) => [null, val] as [null, R],
    (err) => [err, null] as [Error, null]
  );

  const meta = { context, response };

  if (error) {
    return [error, null, meta];
  }

  return [null, value, meta];
};

export const createFetch = <Options extends object = object>(
  ...middlewares: Array<Middleware<Options>>
) => {
  const middleware = [
    error,
    downloadProgress(),
    uploadProgress(),
    ...middlewares,
  ] as Array<Middleware<Options>>;
  return <R extends BaseResponse>(
    payload: Payload<Options>
  ): ResultWithAbort<R, Options> => {
    const controller = new AbortController();
    const responding = onion(...middleware, ((context) => {
      return baseFetch<R>({
        ...context,
        signal: controller.signal,
      });
    }) as Middleware<Options>)(createContext(payload)) as ResultWithAbort<
      R,
      Options
    >;
    responding.abort = () => controller.abort();
    return responding;
  };
};
