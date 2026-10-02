# Conventions

Chaque convention cite le code qui l'applique. Une PR qui en change une met ce document à jour.

## Mutation optimiste : `useOptimistic` + transition + toast « Annuler »

Schéma suivi par les trois écrans éditables (`src/app/(app)/plan-grid.tsx:48-49`, `src/app/(app)/meals/meals-table.tsx:35-36`, `src/app/(app)/shopping-list/shopping-list-view.tsx:47-48`) :

1. `useOptimistic(props, reducer)` dérive l'état affiché des props serveur ; le reducer est une fonction pure (`stateReducer` dans `src/app/(app)/meals/meals-table.tsx:30` ; `slotsReducer` dans `src/app/(app)/planner-utils.ts`, testé dans `src/app/(app)/planner-utils.test.ts:32` ; `shoppingItemsReducer` dans `src/app/(app)/shopping-list/shopping-list-utils.ts`).
2. Dans `startTransition(async () => …)` : `dispatch` de l'action optimiste, puis `await` de la Server Action.
3. Sur `!res.ok` : `toast.error(res.error)`. L'état optimiste est abandonné à la fin de la transition.
4. Sur succès, quand l'action détruit quelque chose : `toast.success(…, { action: { label: "Annuler", onClick } })`, où `onClick` rejoue l'opération inverse.

Exemple réel, vider un créneau du planner (`src/app/(app)/plan-grid.tsx:51-75`) :

```tsx
function handleClear(slot: PlanSlot) {
  if (!slot.meal && !slot.away) return;
  const meal = slot.meal;
  const servings = slot.servings;
  startTransition(async () => {
    dispatch({ type: "clear", slotId: slot.id });
    const res = await assignSlot(slot.id, null);
    if (!res.ok) toast.error(res.error);
    else if (meal) {
      toast.success("Créneau vidé", {
        action: { label: "Annuler", onClick: () => handleUndo(slot.id, meal, servings) },
      });
    } else {
      toast.success("Créneau vidé");
    }
  });
}
```

Les valeurs nécessaires à l'annulation (`meal`, `servings`) sont capturées avant la transition. `handleUndo` repasse par le même schéma (`src/app/(app)/plan-grid.tsx:51-57`).

Autres « Annuler » : déplacement de repas, rejoué en sens inverse (`src/app/(app)/plan-grid.tsx:131-150`) ; article manuel retiré, recréé par `addManualItem` (`src/app/(app)/shopping-list/shopping-list-view.tsx:86-109`) ; coche en mode magasin (`src/app/(app)/shopping-list/shopping-list-view.tsx:132-142`).

## `ActionResult` et `errorText`

`src/lib/action-result.ts:1-9` :

- `ActionResult = { ok: true } | { ok: false; error: string }` : type de retour des Server Actions de mutation. L'erreur arrive au client comme une valeur, pas comme une exception.
- `errorText(error, fallback)` normalise le `message` de NestJS, qui est une `string` ou un `string[]` selon l'erreur.

Forme type d'une action (`src/app/(app)/shopping-list/shopping-list-actions.ts:13-25`) :

```ts
export async function toggleChecked(itemId: string, checked: boolean): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.PATCH("/plan/shopping-list/items/{itemId}", {
    params: { path: { itemId } },
    body: { checked },
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}
```

`errorText` sert aussi aux Route Handlers d'auth (`src/lib/auth.ts:34`). Une action de création qui doit rendre la ressource étend la même union en ligne (`src/app/(app)/planner-actions.ts:55`, `src/app/(app)/meals/actions.ts:77`). Les actions de lecture renvoient la donnée ou une valeur vide, pas un `ActionResult` (`src/app/(app)/meals/actions.ts:16-20`).

## Composition base-ui : `render=`, pas `asChild`

Les composants de `src/components/ui/` enveloppent `@base-ui/react`, pas Radix (`src/components/ui/button.tsx:1`, `src/components/ui/dialog.tsx:4`, style `base-nova` dans `components.json:3`). Pour rendre un primitif avec un autre élément, on passe l'élément en prop `render` ; `asChild` n'existe pas et n'apparaît nulle part dans `src/`.

```tsx
<DialogTrigger render={trigger} />
```

`src/components/confirm-dialog.tsx:41`. Autres cas : un `Badge` rendu en `Link` (`src/app/(app)/meals/meals-table.tsx:136-142`), un bouton de fermeture rendu en `Button` (`src/components/ui/dialog.tsx:112`). `Badge` s'appuie sur `useRender` de base-ui (`src/components/ui/badge.tsx:2`, `src/components/ui/badge.tsx:37`).

Attention, `render={({ field }) => …}` dans `src/app/(app)/meals/meal-dialog.tsx:190` est la prop de `Controller` (react-hook-form), pas de base-ui.

## Structure des dossiers

```text
src/
  proxy.ts                garde des routes + refresh (ex-middleware)
  app/
    (auth)/               /login, /register : pages publiques
    (app)/                zone connectée : planner (/), meals/, shopping-list/, settings/
      *-actions.ts        Server Actions de l'écran ("use server")
      *-utils.ts          logique pure (reducers, formatage), testée
    api/auth/*/route.ts   Route Handlers login, register, logout
    globals.css           tokens de thème, variantes Tailwind
  components/
    ui/                   composants shadcn (base-ui)
    *.tsx                 composants partagés du projet (confirm-dialog, tag-input…)
  hooks/                  hooks partagés (use-live-refresh, use-wake-lock)
  lib/                    client API, auth, cookies, types, utilitaires
```

- Les fichiers d'un écran sont colocalisés dans son segment de route (`src/app/(app)/shopping-list/`).
- Les tests sont à côté du fichier testé, en `*.test.ts(x)` (`src/app/(app)/planner-utils.test.ts`, `src/hooks/use-live-refresh.test.tsx`).
- `src/lib/models.ts` réexporte sous des noms courts les types générés ; il est purement typé, donc importable côté serveur comme côté client (`src/lib/models.ts:1-3`).

## Tokens de thème

`src/app/globals.css` :

- Les valeurs sont des variables CSS en `oklch`, définies dans `:root` (`src/app/globals.css:54-89`) et redéfinies sous `.dark` (`src/app/globals.css:91-125`).
- `@theme inline` les expose à Tailwind sous forme de classes (`bg-primary`, `text-muted-foreground`…) (`src/app/globals.css:8-52`).
- Le mode sombre suit la classe `.dark` (`src/app/globals.css:5`), posée par `next-themes` avec `attribute="class"` (`src/app/layout.tsx:34`).
- Ajouts au jeu shadcn : `--warning` / `--warning-foreground` (`src/app/globals.css:31-32`, `src/app/globals.css:70-71`), utilisé par le bandeau des repas incomplets (`src/app/(app)/shopping-list/page.tsx:40`) ; la classe `.tnum` pour les chiffres tabulaires (`src/app/globals.css:137-139`).
- Palette « Graphite » : encre en `primary` pour l'action, bleu en `accent` pour l'état (commit `bdbdc56`).

À ce jour, aucune couleur en dur (hex, `oklch`, palette Tailwind `bg-red-500`…) n'apparaît dans `src/` hors de `globals.css`.

## Variante Tailwind `store:`

Déclarée par `@custom-variant store (&:where([data-store-mode] *));` (`src/app/globals.css:6`). Elle s'applique quand un ancêtre porte `data-store-mode`.

- `ShoppingListView` pose l'attribut sur `body` tant que le mode magasin est actif et le retire au démontage (`src/app/(app)/shopping-list/shopping-list-view.tsx:56-60`).
- Les éléments à masquer en magasin portent `store:hidden` : navigation basse (`src/app/(app)/nav-links.tsx:47`), footer (`src/app/(app)/footer.tsx:25`), bouton Restaurer et bandeau d'alerte (`src/app/(app)/shopping-list/page.tsx:35`, `src/app/(app)/shopping-list/page.tsx:40`).

Intérêt : des Server Components comme le footer réagissent à un état client sans devenir Client Components.

## Types générés depuis l'OpenAPI

- `pnpm gen:api` lance `openapi-typescript http://localhost:3000/docs-json -o src/lib/api-types.ts` (`package.json:17`) : il faut l'API locale démarrée.
- `src/lib/api-types.ts` est généré, ne pas l'éditer (`src/lib/api-types.ts:1-4`). Il est commité, et régénéré par un commit dédié `chore(api-types): …` (`c47db4a`, `0419102`).
- `serverApi()` est typé par `paths` (`src/lib/api.ts:5`, `src/lib/api.ts:29`) ; les composants importent les alias de `src/lib/models.ts`, pas `components["schemas"]` directement.
- L'API versionne désormais son contrat dans `openapi.json` à la racine de son dépôt, vérifié par sa CI ([prepalist_api#73](https://github.com/KylianGERMAIN/prepalist_api/pull/73)). C'est une source possible pour `gen:api`, sans API démarrée ; la bascule est suivie par [#53](https://github.com/KylianGERMAIN/prepalist_front/issues/53).

Décision : [ADR 0002](adr/0002-client-openapi-genere.md).
