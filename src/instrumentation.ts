import * as Sentry from "@sentry/nextjs";

// Sans DSN, le SDK est inerte.
export async function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    release: process.env.APP_VERSION,
    // Les cookies portent les tokens, et le corps de `/api/auth/login` le mot de passe.
    dataCollection: { cookies: false, httpBodies: [], userInfo: false },
  });
}

// Erreurs des Server Components, Server Actions et Route Handlers.
export const onRequestError = Sentry.captureRequestError;
