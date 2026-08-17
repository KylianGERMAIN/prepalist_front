import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./api-types";
import { ACCESS_COOKIE } from "./cookies";
import { API_URL } from "./env";

const baseUrl = API_URL;

// Rattrape ce que le proxy ne voit pas : un cookie access non expiré que le back
// rejette quand même (clé JWT tournée, compte supprimé). Sans ça, session morte et
// écran d'erreur.
const handle401: Middleware = {
  onResponse({ response }) {
    if (response.status === 401) {
      redirect("/api/auth/logout");
    }
    return response;
  },
};

/**
 * À instancier par requête : le token est lu à l'appel.
 * Le cookie étant httpOnly, c'est le serveur qui relaie le Bearer au back.
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
