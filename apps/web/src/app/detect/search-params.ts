import { createLoader, parseAsString } from "nuqs/server";

export const detectSearchParams = {
  run: parseAsString,
};

export const loadSearchParams = createLoader(detectSearchParams);
