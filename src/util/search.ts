import { Payload, Prime } from "../types";

const append = (search: URLSearchParams, key: string, val: Prime) => {
  if (val !== undefined) {
    search.append(key, String(val));
  }
};

export const parseSearch = (
  search?: Payload["search"]
): ConstructorParameters<typeof URLSearchParams>[0] => {
  if (!search) {
    return "";
  }
  if (Array.isArray(search) || search instanceof URLSearchParams) {
    return search;
  }
  if (typeof search === "object") {
    return Object.entries(search).reduce((acc, [key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((v) => append(acc, key, v));
      } else {
        append(acc, key, val);
      }
      return acc;
    }, new URLSearchParams());
  }
  return search;
};
