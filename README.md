# MO Explainer

MO Explainer is a static React teaching app that turns a Colab molecular-orbital lesson into a guided browser experience for students taking an Advanced Physical Organic Chemistry course, but it written at the level of sophomore undergraduate chemistry students.

The site uses qualitative teaching models, responsive SVG diagrams, KaTeX equations, and local-only observation notes. All calculated energies are relative energy in arbitrary teaching units, not experimental values.

## What Students Do

- Flip orbital phase and compare `psi` with `|psi|^2`.
- Change weights in `psi = cA phiA + cB phiB`.
- Compare bonding and antibonding combinations.
- Change orbital overlap, starting energy gaps, electronegativity, and geometry.
- Compare ethylene and formaldehyde.
- Build linear pi chains from two to six p orbitals.
- Export prediction and observation notes as Markdown.

## Local Development

```bash
npm install
npm run dev
```

The dev server runs on `127.0.0.1` by default.

## Quality Commands

```bash
npm run lint
npm test
npm run build
```

## Production Build

```bash
npm run build
```

The static output is written to `dist/`.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` installs dependencies, runs linting, runs tests, builds the app, and deploys `dist/` to GitHub Pages.

Vite is configured to use the GitHub repository name as the base path during GitHub Actions builds, so the app works under a repository subpath.

In the repository settings:

1. Enable GitHub Pages.
2. Choose GitHub Actions as the Pages source.
3. Push to `main` or run the workflow manually.

## Optional Colab Link

The final lesson links to:

`source/Ceci_n_est_pas_une_orbitale_Chapter_1.ipynb`

When hosted on `https://OWNER.github.io/REPO/`, the app derives the Colab URL automatically. Local previews fall back to the `jgassens/MOexplainer` notebook URL.

## Adding Another Lesson

1. Add metadata to `src/content/lessons.ts`.
2. Create a lesson module under `src/lessons/`.
3. Add the component to `src/lessons/index.tsx`.
4. Put reusable math in `src/models/` and add Vitest coverage in `src/tests/`.
5. Keep the lesson loop: Predict, Change, Observe, Explain, Check.

## Source Notes
*this should be a proper APA style reference to the textbook*
