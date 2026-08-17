import "server-only";

// À garder aligné sur l'`APP_TIME_ZONE` du back (`plan-dates.ts`) : il y calcule
// `startDate`, un écart décale la surbrillance d'un jour autour de minuit.
const APP_TIME_ZONE = "Europe/Paris";

/** Date `YYYY-MM-DD` — `server-only`, sinon le client renverrait son propre fuseau. */
export function todayInAppTimeZone(timeZone = APP_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
