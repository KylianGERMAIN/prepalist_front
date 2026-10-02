# ADR 0003 — Tout en shadcn, variante base-ui

## Statut

Accepté.

Source : commit `108f4a4` « feat(front): v2 bootstrap (App Router + shadcn) and auth foundation », qui crée `components.json` en style `base-nova` et ajoute `@base-ui/react`, livré par la PR [#3](https://github.com/KylianGERMAIN/prepalist_front/pull/3). La PR liste « full shadcn » parmi les décisions actées et mentionne la variante base-ui.

## Contexte

La v1 combinait Sass, `react-select` et `react-icons` (`package.json` avant `108f4a4`). La v2 passe à Tailwind v4. shadcn propose deux jeux de primitives : Radix et base-ui.

## Décision

- Les composants d'interface viennent de shadcn, copiés dans `src/components/ui/` (alias `ui`, `components.json:18`).
- Variante base-ui : style `base-nova` (`components.json:3`), primitives `@base-ui/react` (`src/components/ui/button.tsx:1`, `src/components/ui/dialog.tsx:4`).
- Les composants propres au projet composent les composants shadcn ou, à défaut, une primitive base-ui directement (`src/components/confirm-dialog.tsx:13`, `src/components/tag-input.tsx:4`).

## Conséquences

- Composition par la prop `render`, pas par `asChild` : la documentation et les exemples shadcn écrits pour Radix ne s'appliquent pas tels quels (voir [conventions.md](../conventions.md#composition-base-ui--render-pas-aschild)).
- Les composants de `src/components/ui/` sont du code du dépôt, modifiable sur place ; seule la feuille `shadcn/tailwind.css` est importée depuis le paquet (`src/app/globals.css:3`).
- Le thème passe par les variables CSS de `src/app/globals.css` (voir [conventions.md](../conventions.md#tokens-de-thème)).
