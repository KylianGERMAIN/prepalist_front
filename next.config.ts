import type { NextConfig } from "next";
import { version } from "./package.json";

const nextConfig: NextConfig = {
  // Build autonome pour image Docker légère (sans dommage sur Vercel, qui l'ignore).
  output: "standalone",
  // Inline la version du package au build, exploitable côté serveur comme client.
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
};

export default nextConfig;
