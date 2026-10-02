import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";
import { version } from "./package.json";

const nextConfig: NextConfig = {
  // Build autonome pour image Docker légère (sans dommage sur Vercel, qui l'ignore).
  output: "standalone",
  // Inline la version du package au build, côté serveur (footer) et client (release Sentry).
  env: {
    APP_VERSION: version,
  },
};

// Sans `SENTRY_AUTH_TOKEN`, aucune source map n'est envoyée ; envoyées, elles sont
// supprimées du build (`deleteSourcemapsAfterUpload`, vrai par défaut) donc jamais publiques.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
});
