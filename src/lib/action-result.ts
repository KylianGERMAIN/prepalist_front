/** Résultat normalisé d'une Server Action mutative (succès, ou échec avec message affichable). */
export type ActionResult = { ok: true } | { ok: false; error: string };

/** Normalise un corps d'erreur NestJS (`message` string ou string[]) en texte affichable. */
export function errorText(error: unknown): string {
  const msg = (error as { message?: unknown } | null)?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string") return msg;
  return "Erreur inattendue.";
}
