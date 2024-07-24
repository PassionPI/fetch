import { isFn } from "@/util/content";
import { Middleware } from "../types";

export const uploadProgress = (): Middleware => async (context, next) => {
  const [err] = await next();

  if (err) {
    return next();
  }

  const blob = context.body;

  if (blob instanceof Blob) {
    const { upload } = context;
    const { onProgress, onDone, onError } = upload || {};

    if (isFn(onProgress)) {
      const reader = blob.stream().getReader();
      const total = blob.size;

      let length = 0;
      let progress = 0;

      process();

      function process() {
        reader.read().then(({ done, value }) => {
          if (!done) {
            length += value.length;
            progress = length / total;
            onProgress?.({ total, length, progress });
            process();
          } else {
            onDone?.();
          }
        }, onError);
      }
    }
  }

  return next();
};

export const downloadProgress = (): Middleware => async (context, next) => {
  const [err, , meta] = await next();

  if (err) {
    return next();
  }

  const { response } = meta;

  if (response.body) {
    const { download } = context;
    const { onProgress, onDone, onError } = download || {};
    const reader = response.body.getReader();
    const total = Number(response.headers.get("Content-Length"));

    if (total && isFn(onProgress)) {
      let length = 0;
      let progress = 0;

      let body = new Uint8Array();

      process();

      function process() {
        reader.read().then(({ done, value }) => {
          if (!done) {
            length += value.length;
            progress = length / total;
            body = new Uint8Array([...body, ...value]);
            onProgress?.({ total, length, progress });
            process();
          } else {
            onDone?.(body);
          }
        }, onError);
      }
    }
  }

  return next();
};
