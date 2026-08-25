# Project rules

## Spec-driven development

All feature work and behavior changes go through the OpenSpec workflows in `.agents/skills/`.

- Start with `openspec-propose`. Do not write application code before a change exists under `openspec/changes/<change-name>/` and the user has approved it.
- Correct requirements with `openspec-update-change`, never by editing `proposal.md`, `spec.md`, `design.md`, or `tasks.md` directly — a direct edit leaves the other artifacts contradicting it.
- Implement with `openspec-apply-change`, then `openspec-archive-change` before opening the PR.
- Skip this only for changes with no externally observable behavior: dependency bumps, formatting, and build configuration.

## Build and test

Angular 9 on Node 20 needs the legacy OpenSSL provider:

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run build
NODE_OPTIONS=--openssl-legacy-provider npm test -- --watch=false
```

Dependencies install with `yarn install --frozen-lockfile`; the repo has no `package-lock.json`.
