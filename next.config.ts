import type { NextConfig } from "next";
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

export default nextConfig;
