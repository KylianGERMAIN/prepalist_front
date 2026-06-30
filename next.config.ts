import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autonome pour image Docker légère (sans dommage sur Vercel, qui l'ignore).
  output: "standalone",
};

export default nextConfig;
