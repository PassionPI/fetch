import { onion } from "@passion_pi/fp";
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

const baseFetch = async <R extends BaseResponse>(
  context: Context
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

export const createFetch = (...middlewares: Array<Middleware>) => {
  return <R extends BaseResponse>(payload: Payload): ResultWithAbort<R> => {
    const controller = new AbortController();
    const responding = onion(middlewares, (context) => {
      return baseFetch<R>({
        ...context,
        signal: controller.signal,
      });
    })(createContext(payload)) as ResultWithAbort<R>;
    responding.abort = () => controller.abort();
    return responding;
  };
};
