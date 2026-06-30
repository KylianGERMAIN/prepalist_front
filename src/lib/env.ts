const url = process.env.API_URL;

// Fail-fast : en production, une API_URL absente ne doit pas retomber silencieusement
// sur localhost (l'app taperait dans le vide). En dev, fallback pratique.
// On exclut la phase de build (`next build` force NODE_ENV=production mais API_URL
// est un besoin runtime, pas build) — la garde s'applique au démarrage du serveur.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";
if (!url && process.env.NODE_ENV === "production" && !isBuild) {
  throw new Error("API_URL est requis en production (URL du back NestJS).");
}

/** URL du back, lue côté serveur uniquement (Route Handlers, proxy, Server Components). */
export const API_URL = url ?? "http://localhost:3000";
