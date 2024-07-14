# @passion_pi/fetch

Power by these stander API `fetch` `URL` `URLSearchParams` `Headers` `Request` `Response` `AbortController`.

Based on `fetch` API, support `middleware`, `URLSearchParams` and `AbortController` by default.

When you use `fetch`, it's maybe like this in every request:

```typescript
const promise = fetch("/api/xxx?name=Ash&name=Bob", {
  method: "post",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer Your token",
  },
  body: JSON.stringify({ a: 1 }),
}).then((res) => res.json());

try {
  const val = await promise;
  console.log(val);
} catch (err) {
  console.error(err);
}
// Want to abort the request? You need to write more code!
```

This package will help you to simplify the code above.

```typescript
import { createFetch, jwt, json } from "@passion_pi/fetch";

// Will add `Content-Type: application/json` header
// Will add `Authorization: Bearer Your token` header
const myFetch = createFetch(json(), jwt({ token: () => "Your token" }));

const promise = myFetch<{ message: string }>({
  url: "/api/xxx",
  search: { name: ["Ash", "Bob"] },
  method: "post",
  body: { a: 1 },
});

// Want to abort the request? Just like this:
// promise.abort();
const [err, val] = await promise;
if (err) {
  console.error(err);
} else {
  console.log(val); // { message: 'some message from backend' }
}
```

There are only 2 main different in with `fetch` API:

1. `fetch(input: URL, options: RequestInit)` -> `myFetch({ url, search, ...options }: Payload)` will auto parse `url` + `search` to `URL` and `options` to `RequestInit`.

2. `myFetch` will return `Promise<[Error, null, Meta]>` or `Promise<[null, T, Meta]>` instead of `Promise<Response>`.

There are some features in this package:

- Middleware support like `koa` middleware
- `search`, same param with `URLSearchParams` and support `Record<string, string[]>` type.
- `body` will be stringified to json if `Content-Type` is `application/json` and `body` is object.
- `response` will be parsed to `json` or `text` if `Content-Type` is `application/json` or `text/plain`
- `abort` method integrate by default

Want to write `middleware`? Just like this:

```typescript
import { createFetch, json, Middleware } from "@passion_pi/fetch";

const logUrl: Middleware = async (context, next) => {
  const { url } = context;
  console.log("Your request url is:", url.toString());
  return next();
};
const getData: Middleware = async (context, next) => {
  const [err, val, meta] = await next();
  if (err) {
    return [err, null, meta];
  }
  // if you want to get `data` field in response value
  return [null, Reflect.get(val, "data"), meta];
};
const getBlob: Middleware = async (context, next) => {
  const { headers } = context;

  const [err, val, meta] = await next();
  if (err) {
    return [err, null, meta];
  }
  if (headers.get("responseType") === "blob") {
    // don't care about `blob()` error, just return it, error is auto handled.
    return [null, await meta.response.clone().blob(), meta];
  }
  return [null, val, meta];
};

const myFetch = createFetch(json(), logUrl, getData, getBlob);
```
