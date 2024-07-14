import { Context, Payload } from "@/types";
import { parseSearch } from "./search";

export const createContext = ({
  url,
  search,
  method,
  headers,
  ...rest
}: Payload): Context => {
  const input = new URL(url, self.location.origin);

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
