# Repository Guidance

## Local Signing Notes

Notary and app signing instructions live outside this repository at:

`/Users/jeremiahgassensmith/Documents/programming/.notary`

Read that directory before any future notarization, app-signing, DMG, or release-packaging work.

## Project Goal

This repository contains a static, browser-based teaching application that converts the original Colab molecular-orbital lesson into a polished React site for sophomore undergraduate chemistry students.

The application must run entirely in the browser and deploy through GitHub Pages. Do not add a server, database, Python runtime, API key, account requirement, or paid service.

## Source Material

Inspect source files in `source/` before changing lesson behavior.

- Treat the Colab notebook as the functional outline and source of the existing teaching models.
- Treat the bonding chapter PDF, when present, as the pedagogical authority.
- Do not reproduce textbook pages, scanned figures, or long passages. Paraphrase chemistry in original language and create new diagrams.

## Pedagogical Rules

- Write for sophomore undergraduates who know general chemistry and introductory organic chemistry.
- Do not assume linear algebra, differential equations, programming, Python, command-line tools, or quantum chemistry software.
- Keep equations, controls, orbital pictures, energy diagrams, and explanations close together.
- Every lesson should follow: Predict, Change a variable, Observe the result, Explain what changed, Check understanding.
- Use short sentences and define technical terms before using them.
- In the main lesson text, avoid phrases like "diagonalize the Hamiltonian", "solve the secular determinant", "eigenvector components", and "basis transformation".
- When using `psi = cA phiA + cB phiB`, call `cA` and `cB` weights. Explain it as multiplying each starting orbital by its weight, then adding values at every point in space.
- When using `S = integral phiA phiB dtau`, state that students will not calculate it. It represents adding the product of the two orbital values over all space.
- Put advanced terminology only in collapsed "Going deeper" panels.

## Chemistry Rules

- Use qualitative teaching models and label calculated energies as "relative energy in arbitrary teaching units".
- Never imply that these simplified values are experimental energies.
- Orbital phase is the sign of `psi`, not charge.
- Positive and negative phase must always be shown with visible `+` and `-` labels. Do not rely only on color.
- A global phase change, `psi -> -psi`, does not change electron density because `|psi|^2 = |-psi|^2`.
- Relative phase matters when two orbitals are combined.
- In-phase overlap produces a bonding combination.
- Out-of-phase overlap produces an antibonding combination with a node between atoms.
- Greater useful overlap produces a stronger orbital interaction and a larger bonding-antibonding energy separation in this teaching model.
- A smaller starting energy gap produces stronger mixing.
- More electronegative atoms contribute lower-energy atomic orbitals.
- With unequal starting energies, the lower-energy bonding MO resembles the lower-energy starting orbital more strongly, and the higher-energy antibonding MO resembles the higher-energy starting orbital more strongly.
- For a carbonyl, the pi bonding MO is more strongly associated with oxygen, and the pi* antibonding MO has a larger coefficient on carbon.
- Geometry matters when it changes orbital overlap.
- The number of molecular orbitals formed must equal the number of starting orbitals used.
- In a linear conjugated pi system, higher-energy pi orbitals generally contain more nodes.

## Design And Accessibility

- Build a guided lesson application, not a long notebook-like document.
- Desktop layout: compact progress navigation on the left, one active lesson in the main area, Previous and Next controls.
- Mobile layout: top progress control, one column, no horizontal scrolling.
- Each lesson should include a title, purpose, equation, definitions, one focused visualization, at most two to four controls, Reset, dynamic feedback, a brief question, and optional "Going deeper".
- Use a restrained, warm, current teaching UI. Avoid notebook styling, raw form controls, dense borders, giant text blocks, and old plot screenshots.
- Use SVG for orbital and energy diagrams; Canvas is acceptable for continuous maps.
- Use KaTeX for equations.
- Use a colorblind-conscious phase palette and always pair phase colors with `+` and `-`.
- Meet normal WCAG AA expectations: keyboard controls, visible focus states, descriptive labels, useful ARIA text, reduced-motion support, and sufficient contrast.

## Code Organization

- Keep lesson content, mathematical models, drawing components, controls, energy diagrams, orbital visualizations, observation state, navigation, and accessibility helpers separated.
- Use pure functions for mathematical behavior wherever possible.
- Keep educational text separate from rendering code.
- Do not show Python code or notebook cells to students.
- Do not embed the notebook in the site.
- Do not use screenshots of Matplotlib plots.

## Verification

Before finishing meaningful work:

- Run linting.
- Run Vitest.
- Run the production build.
- Check the browser console.
- Check responsive layouts around 375 px, 768 px, and 1440 px.
- Confirm there is no horizontal scrolling.
- Confirm GitHub Pages subpath behavior.
- Confirm equations, controls, and visual results remain close together.
- Confirm phase is never described as charge.
- Confirm arbitrary teaching-model values are not presented as experimental data.
