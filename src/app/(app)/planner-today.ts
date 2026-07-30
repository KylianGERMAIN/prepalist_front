import "server-only";

/**
 * Doit rester aligné sur `APP_TIME_ZONE` de `prepalist_api/src/modules/plan/plan-dates.ts` :
 * le back calcule `startDate` dans ce fuseau, le front y situe le jour courant.
 * Déplacer l'un sans l'autre décale la surbrillance d'un jour autour de minuit.
 */
const APP_TIME_ZONE = "Europe/Paris";

/**
 * Date calendaire du jour (`YYYY-MM-DD`) dans le fuseau de l'app.
 *
 * `server-only` plutôt qu'un commentaire : lue côté client elle donnerait le
 * fuseau du navigateur, et le rendu serveur puis l'hydratation pourraient
 * désigner deux jours différents entre minuit et 2h.
 */
export function todayInAppTimeZone(timeZone = APP_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
