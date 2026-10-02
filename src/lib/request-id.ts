import * as Sentry from "@sentry/nextjs";
import type { Middleware } from "openapi-fetch";

/** Même identifiant dans l'événement Sentry et dans la ligne de log de l'API. */
export const requestId: Middleware = {
  onRequest({ request }) {
    const id = crypto.randomUUID();
    request.headers.set("x-request-id", id);
    Sentry.getIsolationScope().setTag("requestId", id);
    return request;
  },
};
