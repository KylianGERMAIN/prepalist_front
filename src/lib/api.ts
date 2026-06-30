import "server-only";
import { cookies } from "next/headers";
import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./api-types";
import { ACCESS_COOKIE } from "./cookies";

const baseUrl = process.env.API_URL ?? "http://localhost:3000";

/**
 * Client API typé (openapi-fetch) pour Server Components et Server Actions.
 * Injecte le cookie access en `Authorization: Bearer` — le navigateur ne portant
 * jamais le token (httpOnly), c'est le serveur qui le relaie au back.
 *
 * À instancier par requête (le token est lu au moment de l'appel).
 */
export async function serverApi() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const client = createClient<paths>({ baseUrl });
  if (token) {
    const auth: Middleware = {
      onRequest({ request }) {
        request.headers.set("Authorization", `Bearer ${token}`);
        return request;
      },
    };
    client.use(auth);
  }
  return client;
}
