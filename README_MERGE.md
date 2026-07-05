# MOexplainer guided lesson + assessment export package v2

This package replaces the first export package. It is intended to be copied over the current MOexplainer repo root.

## What changed from v1

1. Lesson 1 and Lesson 2 are still untouched.
2. Lesson 8 is no longer replaced with Walsh/electron-count content. Lesson 8 remains the current twist-angle/pi-overlap lesson, rebuilt in the guided style with embedded practice and end-of-lesson submitted assessment.
3. The Walsh/electron-count material is added as a new Lesson 9 (`walsh-geometry`). Existing pi-chain and calculation lessons shift to Lessons 10 and 11.
4. Every orbital visual rendered by `GuidedOrbitalLesson` now shows explicit `+` and `−` phase labels. Color is no longer the only phase cue.
5. Practice checkpoints and submitted assessments are separated. Practice checkpoints can reveal feedback and model answers. Submitted assessments cannot reveal feedback and their signed PDF/JSON export omits answer keys, model answers, feedback, rubrics, and client-side scores.
6. The unused `defaultResponses` helper was removed from `AssessmentCard.tsx`.
7. “Going deeper” panels define terms that should not be dropped into sophomore-facing main copy without context: nondegenerate, second-order mixing, perturbation, coefficient, canonical MO, isosurface, group orbital, Walsh diagram, virtual orbital, HOMO, LUMO, SOMO, and related terms.

## Files included

- `src/content/lessons.ts`
- `src/lessons/index.tsx`
- `src/lessons/GuidedOrbitalLesson.tsx`
- `src/lessons/guidedLessonContent.ts`
- `src/lessons/BondingLesson/index.tsx`
- `src/lessons/OverlapLesson/index.tsx`
- `src/lessons/EnergyGapLesson/index.tsx`
- `src/lessons/PolarizationLesson/index.tsx`
- `src/lessons/EthyleneFormaldehydeLesson/index.tsx`
- `src/lessons/GeometryLesson/index.tsx`
- `src/lessons/WalshGeometryLesson/index.tsx`
- `src/lessons/PiChainLesson/index.tsx`
- `src/lessons/CalculationLesson/index.tsx`
- `src/components/Assessment/*`
- `src/styles/moexplainer-guided-rest.css`
- `src/styles/moexplainer-assessment.css`
- `tools/verify-assessment.mjs`

## Merge instructions

From the repo root:

```bash
cp -R /path/to/moexplainer_export_package/* .
npm install
npm run lint
npm test
npm run build
```

The package assumes the current app still has the same lesson IDs and shell/component structure as the public repository. It adds the `walsh-geometry` lesson ID, so review any code that assumes there are exactly ten lessons.

## Assessment integrity model

The submitted assessment flow produces:

- a timestamped PDF;
- a paired `.moe.json` verification file;
- a browser-generated ECDSA P-256 machine identity stored in IndexedDB;
- a separate machine-registration PDF/JSON.

Verify a submission with:

```bash
node tools/verify-assessment.mjs submitted_assessment.moe.json registered_machine.moe.json
```

The verifier checks the signature, payload hash, public key, machine ID, student ID, and student name. It also fails if a v2 submitted payload contains answer-key, model-answer, feedback, rubric, checked, or correctness fields.

This is tamper-evident, not cheat-proof. A static GitHub Pages app cannot provide the same assurance as a server-signed LMS submission. For stronger control, collect the registration before the assessment window and accept only verified JSON/PDF pairs from the registered machine ID.

## Notes on Lesson 8 and Lesson 9

The current Lesson 8 teaches twist angle reducing pi overlap. That remains Lesson 8. The Walsh/electron-count material is a different lesson and is now Lesson 9 rather than a replacement for Lesson 8.
