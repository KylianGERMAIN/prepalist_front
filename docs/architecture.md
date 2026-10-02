# Architecture du front

Next 16 (App Router), React 19, shadcn variante base-ui, Tailwind v4, openapi-fetch.

Voir aussi : [auth.md](auth.md), [conventions.md](conventions.md), [adr/](adr/).

Le schéma de données et les flux métier sont documentés côté API :
[KylianGERMAIN/prepalist_api — `docs/`](https://github.com/KylianGERMAIN/prepalist_api/tree/develop/docs)
(issue [prepalist_api#56](https://github.com/KylianGERMAIN/prepalist_api/issues/56)).

## Modèle de rendu

| Brique | Rôle | Exemple |
| --- | --- | --- |
| Server Component (par défaut) | Lit l'API pendant le rendu et passe les données en props | `src/app/(app)/shopping-list/page.tsx`, `ShoppingListPage` |
| Client Component (`"use client"`) | Interaction, état local, état optimiste | `src/app/(app)/shopping-list/shopping-list-view.tsx`, `ShoppingListView` |
| Server Action (`"use server"`) | Toute mutation, et les lectures déclenchées depuis le client | `src/app/(app)/shopping-list/shopping-list-actions.ts` |
| Route Handler | Auth uniquement : `/api/auth/{login,register,logout}` | `src/app/api/auth/login/route.ts`, `POST` |
| Proxy | Garde des routes et refresh du token | `src/proxy.ts`, `proxy` |

- Les pages de `src/app/(app)/` sont des Server Components `async` qui appellent `serverApi()` puis rendent un composant client avec les données : `PlannerPage` (`src/app/(app)/page.tsx`), `MealsPage` (`src/app/(app)/meals/page.tsx`).
- Les Server Actions sont regroupées par écran : `src/app/(app)/meals/actions.ts`, `src/app/(app)/planner-actions.ts`, `src/app/(app)/settings-actions.ts`, `src/app/(app)/shopping-list/shopping-list-actions.ts`.
- Une mutation renvoie un `ActionResult` et, en cas de succès, appelle `revalidatePath` sur les pages qu'elle modifie (`toggleChecked`, `generatePlan`). Exception : `createIngredient` (`src/app/(app)/meals/actions.ts`) ne revalide rien et renvoie l'ingrédient créé à l'appelant.
- Les lectures à la demande depuis le client passent aussi par des Server Actions : `getMeal` et `searchIngredients` (`src/app/(app)/meals/actions.ts`), `searchMeals` (`src/app/(app)/planner-actions.ts`).
- Une Server Action est une requête POST sur la route de la page : le matcher du proxy la couvre comme la page ([doc Next, Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)).

## Où vit chaque état

| État | Où | Source |
| --- | --- | --- |
| Données métier (plan, repas, liste) | Props passées par le Server Component | `PlannerPage`, `ShoppingListPage` |
| Retour immédiat d'une mutation | `useOptimistic` dans le Client Component, pendant la transition | `PlanGrid` (`plan-grid.tsx`), `MealsTable` (`meals-table.tsx`), `ShoppingListView` (`shopping-list-view.tsx`) |
| UI éphémère (sélection, édition en cours) | `useState` | `ShoppingListView`, états `selecting` et `selected` |
| Filtres et pagination des repas | URL (`searchParams`) | `MealsPage` |
| Préférence d'appareil « aussi le repas suivant » | `localStorage`, clé `prepalist:also-next` | `readAlsoNext` / `writeAlsoNext` (`src/app/(app)/planner-utils.ts`) |
| Mode magasin | `sessionStorage`, clé `prepalist:store-mode`, lu via `useSyncExternalStore` | `readStoreMode` / `writeStoreMode` / `subscribeStoreMode` (`src/app/(app)/shopping-list/shopping-list-utils.ts`) |
| Session | Cookies httpOnly `pl_access` / `pl_refresh` | `ACCESS_COOKIE`, `REFRESH_COOKIE` (`src/lib/cookies.ts`) |

Après une mutation réussie, `revalidatePath` fait relire la page serveur ; les nouvelles props remplacent l'état optimiste à la fin de la transition. En cas d'échec, l'action ne revalide pas et l'état optimiste retombe sur les props inchangées.

Les accès au stockage sont dans un `try/catch`, car le stockage peut lever en navigation privée : `readAlsoNext`, `writeAlsoNext`, `readStoreMode`, `writeStoreMode`.

### Live refresh

La liste de courses se met à jour d'un appareil à l'autre sur le même compte par `router.refresh()` périodique :

- `useLiveRefresh(intervalMs, idleMs)` (`src/hooks/use-live-refresh.ts`) relit la page toutes les `intervalMs` tant que l'onglet est visible et que l'utilisateur a agi depuis moins de `idleMs`. Le but de l'arrêt : laisser la base Neon se mettre en veille.
- Réglages : `INTERVAL_MS` à 15 s, `IDLE_MS` à 10 min (`src/app/(app)/shopping-list/live-refresh.tsx`).
- `ShoppingListPage` garde `LiveRefresh` monté même si le chargement a échoué, pour que le tick suivant récupère la liste.

## Pourquoi aucun fetch client ne vise l'API

- Le token d'accès est dans un cookie httpOnly (`cookieBase`, `src/lib/cookies.ts`) : le JavaScript du navigateur ne peut pas le lire, donc ne peut pas poser l'en-tête `Authorization`.
- `serverApi()` (`src/lib/api.ts`) lit le cookie côté serveur et relaie le token en `Bearer`. Il est instancié par requête, puisque le token est lu à l'appel.
- `src/lib/api.ts` et `src/lib/auth.ts` importent `server-only` : un import depuis un Client Component casse le build.
- `API_URL` (`src/lib/env.ts`) n'est pas une variable `NEXT_PUBLIC_*` : elle n'existe que côté serveur.
- Les seuls `fetch` du navigateur visent les Route Handlers du front : `LoginForm`, `RegisterForm`, `LogoutButton`.

Les autres `fetch` bruts sont côté serveur : `tryRefresh` dans le proxy, `postAuth` (`src/lib/auth.ts`) pour login et register, et `fetchApiVersion` du footer (`src/app/(app)/footer.tsx`), qui évite volontairement le middleware 401 de `serverApi`.
