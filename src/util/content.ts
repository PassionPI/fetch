import { Context } from "@/types";

const typeJSON = (headers: Headers) =>
  String(headers.get("Content-Type")).includes("application/json");

const typeText = (headers: Headers) =>
  String(headers.get("Content-Type")).includes("text/plain");

export const parseBody = ({ body, headers }: Context) => {
  if (body == null) {
    return;
  }

  if (typeJSON(headers) && typeof body == "object") {
    return JSON.stringify(body);
  }

  return body as BodyInit;
};

export const parseContent = (response: Response) => {
  const clone = response.clone();
  const headers = new Headers(response.headers);

  if (typeJSON(headers)) {
    return clone.json();
  }

  if (typeText(headers)) {
    // response.clone().text() 这里只有当后端返回无法解析为文本的时候, 才会报错
    // 例如二进制文件, 无效的 UTF-8 字符序列
    return clone.text();
  }

  return Promise.resolve();
};
