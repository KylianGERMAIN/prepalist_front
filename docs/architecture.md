# Architecture du front

Next 16 (App Router), React 19, shadcn variante base-ui, Tailwind v4, openapi-fetch.

Voir aussi : [auth.md](auth.md), [conventions.md](conventions.md), [adr/](adr/).

Le schéma de données et les flux métier sont documentés côté API :
[KylianGERMAIN/prepalist_api — `docs/`](https://github.com/KylianGERMAIN/prepalist_api/tree/develop/docs)
(issue [prepalist_api#56](https://github.com/KylianGERMAIN/prepalist_api/issues/56)).

## Modèle de rendu

| Brique | Rôle | Exemple |
| --- | --- | --- |
| Server Component (par défaut) | Lit l'API pendant le rendu et passe les données en props | `src/app/(app)/shopping-list/page.tsx:10-14` |
| Client Component (`"use client"`) | Interaction, état local, état optimiste | `src/app/(app)/shopping-list/shopping-list-view.tsx:1` |
| Server Action (`"use server"`) | Toute mutation, et les lectures déclenchées depuis le client | `src/app/(app)/shopping-list/shopping-list-actions.ts:1` |
| Route Handler | Auth uniquement : `/api/auth/{login,register,logout}` | `src/app/api/auth/login/route.ts:5` |
| Proxy | Garde des routes et refresh du token | `src/proxy.ts:22` |

- Les pages de `src/app/(app)/` sont des Server Components `async` qui appellent `serverApi()` puis rendent un composant client avec les données : `src/app/(app)/page.tsx:7-26`, `src/app/(app)/meals/page.tsx:14-41`.
- Les Server Actions sont regroupées par écran : `src/app/(app)/meals/actions.ts`, `src/app/(app)/planner-actions.ts`, `src/app/(app)/settings-actions.ts`, `src/app/(app)/shopping-list/shopping-list-actions.ts`. Chaque mutation renvoie un `ActionResult` puis appelle `revalidatePath` en cas de succès (`src/app/(app)/shopping-list/shopping-list-actions.ts:22-24`, `src/app/(app)/planner-actions.ts:15-18`).
- Les lectures à la demande depuis le client passent aussi par des Server Actions : `getMeal` (`src/app/(app)/meals/actions.ts:16`), `searchIngredients` (`src/app/(app)/meals/actions.ts:66`), `searchMeals` (`src/app/(app)/planner-actions.ts:88`).
- Une Server Action est une requête POST sur la route de la page : le matcher du proxy la couvre comme la page (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md:217`).

## Où vit chaque état

| État | Où | Source |
| --- | --- | --- |
| Données métier (plan, repas, liste) | Props passées par le Server Component | `src/app/(app)/page.tsx:25`, `src/app/(app)/shopping-list/page.tsx:50-54` |
| Retour immédiat d'une mutation | `useOptimistic` dans le Client Component, pendant la transition | `src/app/(app)/plan-grid.tsx:48`, `src/app/(app)/meals/meals-table.tsx:35`, `src/app/(app)/shopping-list/shopping-list-view.tsx:47` |
| UI éphémère (sélection, édition en cours) | `useState` | `src/app/(app)/shopping-list/shopping-list-view.tsx:49-50` |
| Filtres et pagination des repas | URL (`searchParams`) | `src/app/(app)/meals/page.tsx:19-20` |
| Préférence d'appareil « aussi le repas suivant » | `localStorage`, clé `prepalist:also-next` | `src/app/(app)/planner-utils.ts:80-98` |
| Mode magasin | `sessionStorage`, clé `prepalist:store-mode`, lu via `useSyncExternalStore` | `src/app/(app)/shopping-list/shopping-list-utils.ts:74-103`, `src/app/(app)/shopping-list/shopping-list-view.tsx:53` |
| Session | Cookies httpOnly `pl_access` / `pl_refresh` | `src/lib/cookies.ts:3-4` |

Après une mutation réussie, `revalidatePath` fait relire la page serveur ; les nouvelles props remplacent l'état optimiste à la fin de la transition. En cas d'échec, l'action ne revalide pas et l'état optimiste retombe sur les props inchangées.

Les accès à `localStorage` et `sessionStorage` sont dans un `try/catch` : le stockage peut lever en navigation privée (`src/app/(app)/planner-utils.ts:82-90`, `src/app/(app)/shopping-list/shopping-list-utils.ts:76-78`).

### Live refresh

La liste de courses se met à jour d'un appareil à l'autre sur le même compte par `router.refresh()` périodique, sans WebSocket :

- `useLiveRefresh(intervalMs, idleMs)` relit la page toutes les `intervalMs` tant que l'onglet est visible et que l'utilisateur a agi depuis moins de `idleMs` (`src/hooks/use-live-refresh.ts:11-62`).
- Réglages : 15 s, arrêt après 10 min d'inactivité (`src/app/(app)/shopping-list/live-refresh.tsx:5-7`). Le but de l'arrêt : laisser la base Neon se mettre en veille (`src/hooks/use-live-refresh.ts:6-10`).
- `LiveRefresh` reste monté même si le chargement a échoué, pour que le tick suivant récupère la liste (`src/app/(app)/shopping-list/page.tsx:16-26`).

## Pourquoi aucun fetch client ne vise l'API

- Le token d'accès est dans un cookie httpOnly (`src/lib/cookies.ts:11-17`) : le JavaScript du navigateur ne peut pas le lire, donc ne peut pas poser l'en-tête `Authorization`.
- `serverApi()` lit le cookie côté serveur et relaie le token en `Bearer` à chaque requête (`src/lib/api.ts:23-41`). Il est instancié par requête, puisque le token est lu à l'appel (`src/lib/api.ts:23-24`).
- `src/lib/api.ts:1` et `src/lib/auth.ts:1` importent `server-only` : un import depuis un Client Component casse le build.
- `API_URL` n'est pas une variable `NEXT_PUBLIC_*` : elle n'existe que côté serveur (`src/lib/env.ts:11-12`).
- Les seuls `fetch` du navigateur visent les Route Handlers du front : `src/app/(auth)/login/login-form.tsx:18`, `src/app/(auth)/register/register-form.tsx:18`, `src/app/(app)/logout-button.tsx:11`.

Les autres `fetch` bruts sont côté serveur : refresh dans le proxy (`src/proxy.ts:50`), login/register (`src/lib/auth.ts:26`) et version de l'API dans le footer, qui évite volontairement le middleware 401 de `serverApi` (`src/app/(app)/footer.tsx:7-12`).
