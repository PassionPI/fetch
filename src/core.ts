import { onion, OnionLayer } from "@passion_pi/fp";
import { error } from "./middleware/error";
import { Payload, Result, ResultWithAbort } from "./types";
import { typeJSON, typeText } from "./util/content";
import { parseSearch } from "./util/search";

// Power by `fetch` `URL` `URLSearchParams` `Headers` `Request` `Response` `AbortController`
// fetch的通用封装, api与fetch对象传参保持一致
// 新增能力
// 	- 参数支持search, 参数格式与URLSearchParams参数相同
//  - 支持 middleware
//	- 自动 parse json
//  - 自动处理错误
//  - 自动补全 base url
//  - 提供 abort 方法

/** @example
 * const [err, val] = await X({
 * 	 url: '/api/xxx' // 默认当前部署域名, 如果想换域名, 则输入新的完整域名 eg: 'https://google.com/api/xxxx'
 * 	 method: 'post',
 *   body: { a: 1 },
 *   headers: {
 * 		"Content-Type": "application/json" // 如果有这个请求头, body是obj则自动stringify
 *  	}
 * })
 */

const baseFetch = async <R>(payload: Payload): Result<R> => {
  payload ??= {} as Payload;
  payload.method ??= "GET";

  const { url, search, body, ...requestInit } = payload ?? {};

  const input = new URL(url, self.location?.origin);

  if (search) {
    input.search = new URLSearchParams(parseSearch(search)).toString();
  }

  const request = new Request(input, {
    ...requestInit,
    body:
      body != null && typeJSON(requestInit.headers)
        ? typeof body === "string"
          ? body
          : JSON.stringify(body)
        : (body as BodyInit),
  });
  // 这里是网络错误或者请求被阻止(CORS), 才会出现 error
  // 只要后端返回了, 不管 http status 是多少, 都不会报错
  const [err, response] = await fetch(request).then(
    (val) => [null, val] as [null, Response],
    (err) => [err, null] as [Error, null]
  );

  if (err) {
    return [err, null, { payload, response }];
  }

  // response.clone().text() 这里只有当后端返回无法解析为文本的时候, 才会报错, 例如二进制文件, 无效的 UTF-8 字符序列
  const clone = typeJSON(response.headers)
    ? response.clone().json()
    : typeText(response.headers)
    ? response.clone().text()
    : Promise.resolve();

  const [error, value] = await clone.then(
    (val) => [null, val] as [null, R],
    (err) => [err, null] as [Error, null]
  );

  const meta = { payload, response };

  if (error) {
    return [error, null, meta];
  }

  return [null, value, meta];
};

export const createFetch = (
  ...mids: Array<OnionLayer<Payload, Result<object>>>
) => {
  const middlewares = [error, ...mids];

  return <R extends object>(payload: Payload): ResultWithAbort<R> => {
    const controller = new AbortController();
    const responding = onion(middlewares, (payload: Payload) => {
      return baseFetch<R>({
        ...payload,
        signal: controller.signal,
      });
    })(payload) as ResultWithAbort<R>;
    responding.abort = () => controller.abort();
    return responding;
  };
};
