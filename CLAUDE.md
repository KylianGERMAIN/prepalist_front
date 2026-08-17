@AGENTS.md

## Commentaires

En français, et seulement quand le code ne suffit pas : contrainte externe
(driver, lib, framework), couplage non local, invariant, effet de bord
inattendu. Jamais de commentaire qui paraphrase un nom, récite la ligne
suivante ou décrit un `className`. Test : qu'est-ce qui casse si je le
supprime ? Rien → il part.

- `/** */` quand l'information sert l'**appelant** — elle remonte dans le
  tooltip de l'IDE : contrat, convention d'unité, effet de bord.
- `//` quand elle sert le **mainteneur**, qui a le corps sous les yeux :
  piège d'implémentation, ordre d'exécution requis.
- Une phrase par contrainte, deux contraintes au maximum — l'enroulement à
  80 colonnes ne compte pas. Trois phrases, c'est du raisonnement : garde le
  danger, jette le raisonnement.

## Git

- Conventional Commits : `type(scope): subject`
  (`feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `build`, `ci`).
- **Commit subject and body always in English** (repo convention EN standard).
- Issue number as a suffix on the subject, not a prefix: `feat(scope): subject (#12)`
  (survives GitHub's squash merge, which reuses the PR title verbatim).
- Une PR par tâche vers `develop`, squash merge.
- Git Flow allégé comme sur `prepalist_api` : `main` = releases taguées
  uniquement, `develop` = intégration, `feat/*` partent de `develop`.
