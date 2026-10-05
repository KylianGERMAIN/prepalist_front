import * as Sentry from "@sentry/nextjs";
import type { Middleware } from "openapi-fetch";

const HEADER = "x-request-id";

/**
 * Même identifiant dans l'événement Sentry et dans la ligne de log de l'API. Seul
 * l'appel en échec marque le scope : une page en fait plusieurs, souvent en parallèle.
 */
export const requestId: Middleware = {
  onRequest({ request }) {
    request.headers.set(HEADER, crypto.randomUUID());
    return request;
  },
  onResponse({ request, response }) {
    if (!response.ok) Sentry.getIsolationScope().setTag("requestId", request.headers.get(HEADER));
    return response;
  },
  onError({ request }) {
    Sentry.getIsolationScope().setTag("requestId", request.headers.get(HEADER));
  },
};
