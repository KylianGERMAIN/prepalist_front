# ADR 0001 — Tokens en cookies httpOnly

## Statut

Accepté.

Source : commit `108f4a4` « feat(front): v2 bootstrap (App Router + shadcn) and auth foundation », livré par la PR [#3](https://github.com/KylianGERMAIN/prepalist_front/pull/3) « feat(front): refonte v2 — socle auth (F0) + CRUD repas (F1) », qui liste « cookies httpOnly » parmi les décisions actées.

## Contexte

La v1 gardait `access_token` et `refresh_token` dans `localStorage` et appelait l'API depuis le navigateur avec un `Authorization: Bearer` (`src/api/authentification/login.tsx:34-35` et `src/api/custom_fetch.ts:30-45`, état avant `108f4a4`). Un token lisible par le JavaScript de la page est exposé à toute injection de script.

## Décision

- Les tokens vivent dans deux cookies `httpOnly`, `sameSite: lax`, `secure` en production : `pl_access` et `pl_refresh` (`src/lib/cookies.ts:3-17`).
- Seul le code serveur du front les pose : Route Handlers `/api/auth/{login,register}` (`src/lib/auth.ts:45-49`) et `src/proxy.ts` lors du refresh (`src/proxy.ts:38-39`).
- Le serveur relaie le token à l'API en `Bearer` (`src/lib/api.ts:27-41`).

## Conséquences

- Le navigateur ne peut pas appeler l'API directement : toutes les lectures et mutations passent par des Server Components et des Server Actions (voir [architecture.md](../architecture.md#pourquoi-aucun-fetch-client-ne-vise-lapi)).
- Le refresh doit avoir lieu dans le proxy, seul endroit où un cookie peut être posé avant le rendu (`src/proxy.ts:16-17`).
- Les durées des cookies doivent rester alignées sur l'expiration des JWT de l'API (`src/lib/cookies.ts:6-9`).
- `getCurrentUser()` décode le JWT sans vérifier sa signature (`src/lib/auth.ts:63-79`). `httpOnly` n'empêche pas un utilisateur de forger son propre cookie : la garantie vient de l'API, qui vérifie la signature à chaque appel. Le rôle décodé ne sert qu'à l'affichage ; ne jamais autoriser une action sur ce rôle.
- Un 401 inattendu est traité hors du proxy par `handle401` (`src/lib/api.ts:11-21`). Détail des séquences : [auth.md](../auth.md).
