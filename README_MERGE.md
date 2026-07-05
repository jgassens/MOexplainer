# MOexplainer React lesson/assessment overlay v3

This package is meant to be overlaid onto the existing Vite/React MOexplainer repository. It does **not** include `index.html`, `app.js`, `src/main.tsx`, `PhaseLesson`, or `CombinationLesson`, so it does not replace the app entrypoint or Lessons 1–2.

## What changed from the prior package

- Keeps the current Vite entrypoint: `index.html` should continue to load `/src/main.tsx` with `type="module"`.
- Keeps Lesson 8 as the existing twist-angle / pi-overlap lesson.
- Keeps Walsh diagrams as a separate Lesson 9.
- Reduces “Going deeper” panels to six conceptual bottlenecks rather than defining every technical term.
- Keeps explicit `+` / `−` phase labels in all generated orbital visuals.
- Keeps practice feedback separate from submitted assessment export.
- Adds Vitest regression checks for lesson coverage, Lesson 8/9 ordering, the Vite entrypoint, and submitted-assessment payload stripping.

## Files included

```text
src/components/Assessment/*
src/content/lessons.ts
src/lessons/GuidedOrbitalLesson.tsx
src/lessons/guidedLessonContent.ts
src/lessons/index.tsx
src/lessons/{BondingLesson,OverlapLesson,EnergyGapLesson,PolarizationLesson,EthyleneFormaldehydeLesson,GeometryLesson,WalshGeometryLesson,PiChainLesson,CalculationLesson}/index.tsx
src/styles/moexplainer-assessment.css
src/styles/moexplainer-guided-rest.css
src/tests/guidedRestLessons.test.ts
tools/verify-assessment.mjs
```

## Merge instructions

From a clean working tree:

```bash
cp -R moexplainer_react_lesson_assessment_v3/src ./
cp -R moexplainer_react_lesson_assessment_v3/tools ./
```

Then run:

```bash
npm run lint
npm test
npm run build
npm run preview
```

## Assessment export behavior

The embedded practice checkpoint can reveal browser-side feedback and model answers. The submitted assessment card does not reveal answers, and the exported signed payload strips answer-key fields, model answers, feedback, rubrics, practice correctness, and browser score fields.

The exported PDF is paired with a `.moe.json` submission file. The browser creates an ECDSA P-256 keypair in IndexedDB and signs the canonical submitted payload. Students should also submit a machine-registration JSON once. Verify with:

```bash
node tools/verify-assessment.mjs submitted_assessment.moe.json registered_machine.moe.json
```

This remains tamper-evident, not cheat-proof. A static browser app cannot provide the same assurance as a server-signed LMS submission. It can detect edited payloads, mismatched browser keys, and copied submissions whose machine ID does not match the registered machine.

## Pedagogy notes

The lesson style stays in the Lesson 1/2 pattern: predict, manipulate, observe, explain, check. The added “Going deeper” panels are limited to conceptual transitions that usually produce wrong explanations: antibonding destabilization, energy-gap mixing, carbonyl coefficients versus charge, Walsh diagrams, group orbitals, and calculated isosurfaces.
