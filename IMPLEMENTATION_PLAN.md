# Implementation Plan

## Source Inspection

Inspected:

- `source/Ceci_n_est_pas_une_orbitale_Chapter_1.ipynb`
- `source/MPOC_Chapter_01_Introduction_to_Structure_and_Models_of_Bonding.pdf`

## Notebook Section To Website Lesson Map

| Notebook section | Website lesson |
|---|---|
| 1. The one equation we need | Lessons 2, 5, and 6 define weights and mixing |
| 2. Add two p orbitals | Lesson 2: Adding two orbitals |
| 3. Orbital and density are not the same thing | Lesson 1: This is not an orbital |
| 4. Overlap controls interaction | Lesson 4: Overlap controls interaction |
| 5. Starting orbital energies control mixing and polarization | Lesson 5: Starting energy gap and Lesson 6: Electronegativity and polarization |
| 6. Ethylene pi and pi* | Lesson 7: Ethylene and formaldehyde |
| 7. Formaldehyde polarization | Lesson 7: Ethylene and formaldehyde |
| 8. Display threshold demo | Folded into Lesson 1 as a display-threshold control and optional "Going deeper" content |
| 9. Optional PySCF/RDKit calculation | Optional final lesson linking to the notebook in Colab |
| 10. LLM-assisted extension | Omitted from the student-facing website |
| 11-13. Experiment record, final questions, submission | Reworked as prediction/check prompts and local observation export |

## Mathematical Models Being Ported

- Simple p-like orbital: `phi(x, y) = y exp(-alpha((x - center)^2 + y^2))`
- One-dimensional orbital amplitude and density: `rho = |psi|^2`
- Two-orbital combination: `psi = cA phiA + cB phiB`
- Phase-aware overlap score: numerical sum of `phiA phiB` over a fixed teaching grid
- Teaching energy splitting: separation grows with interaction strength
- Two-orbital mixing model using a 2 by 2 teaching Hamiltonian, hidden from the main student view
- Electronegativity presets mapped to starting orbital energy differences
- Geometry overlap model: pi overlap scales qualitatively with `cos(twist angle)`
- Linear-chain Hückel-style model for 2 to 6 p orbitals using closed-form sine coefficients

## Component Structure

- `AppShell`: navigation, lesson state, observation export
- `LessonShell`: shared lesson layout and previous/next controls
- `EquationCard`: KaTeX rendering plus symbol definitions
- `ControlPanel`: shared slider, toggle, preset, and reset controls
- `OrbitalCanvas`: reusable SVG orbital and coefficient drawings
- `EnergyDiagram`: two-level, splitting, and pi-chain energy diagrams
- `PredictionCard`: prompt and check-understanding card
- `ObservationBox`: localStorage-backed student notes
- `PhaseLegend`: persistent phase legend
- `lessons/*`: lesson-specific state, text, controls, and composition
- `models/*`: pure mathematical functions and test targets

## Proposed File Structure

```text
source/
  Ceci_n_est_pas_une_orbitale_Chapter_1.ipynb
  MPOC_Chapter_01_Introduction_to_Structure_and_Models_of_Bonding.pdf
src/
  components/
    AppShell/
    LessonShell/
    EquationCard/
    ControlPanel/
    OrbitalCanvas/
    EnergyDiagram/
    PredictionCard/
    ObservationBox/
    PhaseLegend/
    ui/
  content/
    lessons.ts
  lessons/
    PhaseLesson/
    CombinationLesson/
    BondingLesson/
    OverlapLesson/
    EnergyGapLesson/
    PolarizationLesson/
    EthyleneFormaldehydeLesson/
    GeometryLesson/
    PiChainLesson/
    CalculationLesson/
  models/
    orbitals.ts
    overlap.ts
    mixing.ts
    piChain.ts
    normalization.ts
  styles/
    global.css
  tests/
.github/workflows/pages.yml
```

## Tests Needed For Mathematical Behavior

- Global phase reversal leaves `|psi|^2` unchanged.
- Equal in-phase combinations give bonding symmetry.
- Equal out-of-phase combinations create a node between equivalent centers.
- Overlap decreases as equivalent orbitals are moved farther apart.
- Energy separation increases as interaction increases.
- Equal-energy starting orbitals produce equal-magnitude contributions.
- Increasing the initial energy gap reduces mixing.
- In unequal-energy mixing, the lower MO has more lower-energy-orbital character.
- An N-atom pi chain produces N molecular orbitals.
- Pi-chain orbitals are normalized and ordered consistently by energy.
- Higher-energy orbitals in the linear-chain model have increasing node counts.
- Allyl radical labels the singly occupied HOMO and the next empty LUMO.
- The middle allyl pi orbital has a node through the central atom.

## Material Omitted Or Simplified

- Python, PySCF, RDKit, py3Dmol, package installation, and notebook execution are omitted from the website.
- LLM-assisted extension instructions are omitted from the main student flow.
- The display threshold/isovalue idea is represented with a simple drawing-threshold control in Lesson 1, without exposing plotting code.
- Numerical integration details are hidden from the main lesson. Students see the meaning of the overlap score, not implementation mechanics.
- Advanced matrix vocabulary is excluded from the main lessons and appears only in collapsed optional panels where useful.
