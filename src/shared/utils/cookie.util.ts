import type { Request } from "express";

/** Cookie 헤더에서 이름에 해당하는 값을 추출한다. */
export const getCookieValue = (
  req: Request,
  name: string,
): string | undefined => {
  const raw = req.headers.cookie;
  if (!raw) return undefined;

  const prefix = `${name}=`;
  const part = raw
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(prefix));
  return part ? decodeURIComponent(part.slice(prefix.length)) : undefined;
};
