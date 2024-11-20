import { Context, Payload } from "@/types";
import { parseSearch } from "./search";

export const createContext = <Options extends object = object>({
  url,
  search,
  method,
  headers,
  ...rest
}: Payload<Options>): Context<Options> => {
  const input = new URL(url, globalThis.location.origin);

  if (search) {
    input.search = new URLSearchParams(parseSearch(search)).toString();
  }

  return {
    url: input,
    method: (method ?? "GET").toUpperCase(),
    headers: new Headers(headers),
    ...rest,
  };
};
