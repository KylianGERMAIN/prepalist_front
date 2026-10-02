import * as Sentry from "@sentry/nextjs";

// Sans DSN, le SDK est inerte.
export async function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Les cookies portent les tokens, et le corps de `/api/auth/login` le mot de passe.
    dataCollection: { cookies: false, httpBodies: [], userInfo: false },
  });
}

// Erreurs des Server Components, Server Actions et Route Handlers. Le digest, affiché
// par `error.tsx`, devient un tag : c'est la seule clé de recherche que l'utilisateur a.
export const onRequestError: typeof Sentry.captureRequestError = (error, request, context) => {
  Sentry.withScope((scope) => {
    const digest = (error as { digest?: unknown } | null)?.digest;
    if (typeof digest === "string") scope.setTag("digest", digest);
    Sentry.captureRequestError(error, request, context);
  });
};
