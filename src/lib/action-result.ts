/**
 * Résultat normalisé d'une Server Action mutative.
 *
 * `ok` porte le sort de l'effet **principal** : `false` veut dire qu'il n'a pas
 * eu lieu. `warning` couvre le cas où il a bien atterri mais qu'un effet
 * secondaire a échoué — sans quoi `ok: false` conflaterait « rien fait » et
 * « fait à moitié », et un appelant qui branche sur `ok` conclurait faux.
 */
export type ActionResult =
  | { ok: true; warning?: string }
  | { ok: false; error: string };

/** Normalise un corps d'erreur NestJS (`message` string ou string[]) en texte affichable. */
export function errorText(error: unknown): string {
  const msg = (error as { message?: unknown } | null)?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string") return msg;
  return "Erreur inattendue.";
}
