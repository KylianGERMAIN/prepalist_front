import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.APP_VERSION,
  dataCollection: { cookies: false, httpBodies: [], userInfo: false },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
