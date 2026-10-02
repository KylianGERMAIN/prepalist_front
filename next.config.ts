import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";
import { version } from "./package.json";

const nextConfig: NextConfig = {
  // Build autonome pour image Docker légère (sans dommage sur Vercel, qui l'ignore).
  output: "standalone",
  // Inline la version du package au build. Pas de préfixe NEXT_PUBLIC_ : lue
  // uniquement côté serveur (footer = Server Component), inutile de l'exposer au bundle client.
  env: {
    APP_VERSION: version,
  },
};

// `SENTRY_ORG`, `SENTRY_PROJECT` et `SENTRY_AUTH_TOKEN` sont lus dans l'environnement ;
// sans token, rien n'est envoyé. Les source maps sont supprimées du build dans tous les cas.
export default withSentryConfig(nextConfig, {
  // Même release pour les source maps du build et pour les événements, sinon le SHA git.
  release: { name: version },
  silent: !process.env.CI,
  telemetry: false,
});
