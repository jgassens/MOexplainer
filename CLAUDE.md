# CLAUDE.md

## Git Workflow — read this first

This is a small single-developer website. **All work goes directly on `main`.**

- **Do not create branches. Do not open pull requests. Commit straight to `main`.**
- `main` is the only branch. If a stray branch appears, merge it into `main` and delete it.
- Keep `main` green: `npm run lint`, `npm test`, and `npm run build` must all pass before pushing.
- Pushing `main` deploys to GitHub Pages, so only push work that has been verified in the browser.

## Repository Layout

The repository root is this directory. There is no nested project folder and no worktrees.

Keep this repository outside iCloud-synced locations such as `~/Documents`. iCloud sync corrupts
`node_modules` and creates `" 2"` duplicate files that break the working tree.

## Project Guidance

See [AGENTS.md](AGENTS.md) for the full project rules: project goal, source material, pedagogical
rules, chemistry accuracy rules, design and accessibility requirements, code organization, and the
pre-finish verification checklist. Those rules are authoritative and are not duplicated here.
