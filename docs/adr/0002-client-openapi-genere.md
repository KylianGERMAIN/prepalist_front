# ADR 0002 — Client API typé, généré depuis l'OpenAPI

## Statut

Accepté.

Source : commit `908101a` « feat(front): meal CRUD (filtered list, ingredients dialog, cooked/delete) », qui ajoute `src/lib/api-types.ts` et `src/lib/api.ts`, livré par la PR [#3](https://github.com/KylianGERMAIN/prepalist_front/pull/3). La PR liste « types API générés via openapi-typescript depuis le Swagger » parmi les décisions actées.

## Contexte

La v1 appelait l'API par une classe `customFetch` maison, sans typage des réponses (`src/api/custom_fetch.ts`, supprimé par `108f4a4`). L'API NestJS publie un document OpenAPI (Swagger), servi en local sur `/docs-json`.

## Décision

- `openapi-typescript` génère `src/lib/api-types.ts` via `pnpm gen:api` (`package.json:17`). Le fichier est commité.
- `openapi-fetch` sert de client, typé par `paths` (`src/lib/api.ts:4-5`, `src/lib/api.ts:29`).
- `src/lib/models.ts` donne des noms courts aux schémas utilisés par les composants (`src/lib/models.ts:6-31`).

## Conséquences

- Chemins, paramètres et corps de requête sont vérifiés par `tsc` : un endpoint renommé côté API casse le typecheck du front après régénération.
- Chaque changement de contrat API demande un commit `chore(api-types): …` dédié (`c47db4a`, `0419102`).
- `gen:api` dépend d'une API démarrée en local (`package.json:17`). L'API publie désormais `openapi.json` à la racine de son dépôt ([prepalist_api#73](https://github.com/KylianGERMAIN/prepalist_api/pull/73)), source possible pour supprimer cette dépendance ([#53](https://github.com/KylianGERMAIN/prepalist_front/issues/53)).
