// Ne jamais importer `next/headers` ici : `proxy.ts` en dépend et manipule les
// cookies via `req`/`res`.
export const ACCESS_COOKIE = "pl_access";
export const REFRESH_COOKIE = "pl_refresh";

// Le proxy ne lit jamais l'`exp` du JWT : la présence du cookie tient lieu de
// validité, ce qui n'est vrai que si ces durées suivent celles du back.
export const ACCESS_MAX_AGE = 60 * 15; // 15 min — cf. JWT_ACCESS_EXPIRES_IN
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 j — cf. JWT_REFRESH_EXPIRES_IN

export function cookieBase() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}
