import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./api-types";
import { ACCESS_COOKIE } from "./cookies";
import { API_URL } from "./env";

const baseUrl = API_URL;

/**
 * Si le back rejette le token (401) alors que le cookie access est présent et non expiré
 * (clé JWT tournée, compte supprimé...), le proxy ne peut pas le détecter. On renvoie vers
 * le Route Handler de logout (GET) qui purge les cookies et redirige vers /login — évite
 * que l'utilisateur reste coincé sur un écran d'erreur avec une session morte.
 */
const handle401: Middleware = {
  onResponse({ response }) {
    if (response.status === 401) {
      redirect("/api/auth/logout");
    }
    return response;
  },
};

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
  client.use(handle401);
  return client;
}
