export const typeJSON = (headers?: HeadersInit) =>
  String(new Headers(headers).get("Content-Type")).includes("application/json");

export const typeText = (headers?: HeadersInit) =>
  String(new Headers(headers).get("Content-Type")).includes("text/plain");
