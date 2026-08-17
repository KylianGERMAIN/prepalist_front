const url = process.env.API_URL;

// Fail-fast en prod : le fallback localhost ferait taper l'app dans le vide.
// La phase de build est exclue — `next build` force NODE_ENV=production alors que
// `API_URL` n'est qu'un besoin runtime.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";
if (!url && process.env.NODE_ENV === "production" && !isBuild) {
  throw new Error("API_URL est requis en production (URL du back NestJS).");
}

/** Lue côté serveur seulement — n'est pas `NEXT_PUBLIC_*`, un import client vaudrait localhost. */
export const API_URL = url ?? "http://localhost:3000";
