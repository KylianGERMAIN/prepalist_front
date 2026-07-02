@AGENTS.md

## Git

- Conventional Commits : `type(scope): subject`
  (`feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `build`, `ci`).
- **Commit subject and body always in English** (repo convention EN standard).
- Issue number as a suffix on the subject, not a prefix: `feat(scope): subject (#12)`
  (survives GitHub's squash merge, which reuses the PR title verbatim).
- Une PR par tâche vers `develop`, squash merge.
- Git Flow allégé comme sur `prepalist_api` : `main` = releases taguées
  uniquement, `develop` = intégration, `feat/*` partent de `develop`.
