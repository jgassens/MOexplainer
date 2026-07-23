# MO Explainer — Lesson Consolidation Proposal

**Goal:** Reduce the course from **11 lessons to 6** by removing duplicated content, without losing any chemistry.
**Status:** All four review decisions settled (see §8). No code changed yet — this is the agreed plan, ready to implement on your go-ahead.
**Source of truth used:** the Chapter 1 teaching notebook (`Ceci_n_est_pas_une_orbitale_Chapter_1.ipynb`), the lesson registry (`src/content/lessons.ts`), the shared guided-lesson content (`src/lessons/guidedLessonContent.ts`), and the two hand-built lessons (Phase, Combination). *(The 4 MB textbook PDF wasn't read this pass — the device connection dropped. If you want its specific figure/section language folded in, say so and I'll pull it in.)*

---

## 1. Why there's duplication

Two structural facts explain almost all of it:

1. **Chapter 1 has ~9 sections; the site grew to 11 lessons.** In expanding it, one chapter section (§5, *"Starting orbital energies control mixing **and** polarization"*) was split into two separate lessons (Energy gap, Polarization), and a brand-new twist-geometry lesson was added that re-covers the chapter's overlap discussion. (Walsh, the other addition, is a distinct idea — not a duplication — but small enough to live inside the geometry lesson rather than stand alone.)
2. **Lesson 2 (Combination) became a "mega-lesson."** Its six stages preview density, the overlap integral, bonding/antibonding, *and* C=O polarization — i.e. it teaches, in preview form, what Lessons 1, 3, 4, 6, and 7 then teach in full. This is likely the biggest reason the whole sequence *feels* repetitive.

Two implementation facts explain what consolidation will cost:

- **Lessons 3–11 are data-driven.** They share one engine (`GuidedOrbitalLesson.tsx`) and their teaching text lives as data in `guidedLessonContent.ts`. Merging any of them is mostly editing that one data file plus the registry — low effort, low risk.
- **Lessons 1 and 2 are bespoke React components** (~52 KB and ~60 KB). Trimming or merging them is real code work with more testing.

---

## 2. Proposed 6-lesson sequence

| # | New lesson | Built from | Change |
|---|------------|-----------|--------|
| 1 | **What one atomic orbital means** | old 1 (Phase) | Unchanged. Sole owner of ψ vs \|ψ\|² and phase. |
| 2 | **Two orbitals → bonding & antibonding** | old 2 + old 3 | **Merge.** LCAO weighted sum → in-phase/out-of-phase → node → π/π*, energy split, occupancy. May run multi-stage. |
| 3 | **Overlap & geometry** | old 4 + old 8 + old 9 | **Merge (3 lessons), two threads.** *Part A:* distance + alignment/twist + orthogonality → interaction strength → delocalization. *Part B:* geometry + electron count → preferred shape (Walsh). |
| 4 | **Energy gap & polarization** | old 5 + old 6 + old 7 | **Merge.** Mixing strength + electronegativity + carbonyl, with ethylene→formaldehyde as the worked example. |
| 5 | **Pi systems** | old 10 | Unchanged. |
| 6 | **Compare with a calculation** | old 11 | Unchanged. |

**Net:** 11 → 6 (five lessons removed via three merges: 2+3, 4+8+9, 5+6+7).

**Nav chips (short titles), per your preference:** 1 "Read ψ" · 2 "Bond or node" · 3 "Overlap & shape" · 4 "Gap & polarization" · 5 "Pi systems" · 6 "Real calculation".

---

## 3. Old → New mapping (at a glance)

```
Old  1  Phase ────────────────────────────────►  New 1  Phase
Old  2  Combination ──┐
Old  3  Bonding ──────┴──────────────────────►  New 2  Two orbitals → bonding & antibonding
Old  4  Overlap ──────┐
Old  8  Geometry ─────┤
Old  9  Walsh ────────┴──────────────────────►  New 3  Overlap & geometry (two-part)
Old  5  Energy gap ───┐
Old  6  Polarization ─┤
Old  7  Ethylene/CH2O ┴──────────────────────►  New 4  Energy gap & polarization
Old 10  Pi-chain ────────────────────────────►  New 5  Pi systems
Old 11  Calculation ─────────────────────────►  New 6  Calculation
```

---

## 4. Concept-by-lesson matrix

This is the duplication, made visible. "Currently in" lists every lesson where a concept appears today; **bold** marks a lesson whose *main* job it is. The last column is where it lives after consolidation.

| Concept | Currently in | → New home |
|---|---|---|
| ψ as signed wave amplitude; phase sign (ψ → −ψ) | **1**, 2, 3, 4 | 1 |
| \|ψ\|² probability density (squaring removes sign) | **1**, 2 | 1 |
| Probability over a region (integration) | **1** | 1 |
| Isovalue / display threshold ("this is not an orbital") | **1**, 11 | 1 (recap in 6) |
| LCAO equation ψ = c_A φ_A + c_B φ_B; weights & signs | **2**, 3 | 2 |
| In-phase (bonding) vs out-of-phase (antibonding) → node | 2, **3** | 2 |
| π / π* energy split; 2 AOs → 2 MOs (conservation) | **3**, 10 | 2 (diatomic) / 5 (chains) |
| Electron occupancy (2 vs 4 e⁻; filled–filled penalty) | **3** | 2 |
| Overlap integral S = ∫φ_A φ_B dτ; "same region of space" | 2, **4** | 3 |
| Distance / compactness → overlap → splitting | **4** | 3 |
| Twist angle θ → overlap ≈ cos(θ) | 3, **8** | 3 (Part A) |
| Orthogonality / alignment → delocalization | 4, **8** | 3 (Part A) |
| Walsh: geometry + occupancy → preferred shape | **9** | 3 (Part B) |
| Energy gap → mixing strength (close vs far) | **5** | 4 |
| Unequal energies → polarized MOs (coefficients) | 5, **6** | 4 |
| Electronegativity → lower-energy AO | **6** | 4 |
| Carbonyl: π more O, π* more C; nucleophile attacks C | 2, **6**, 7 | 4 |
| Ethylene reference vs formaldehyde perturbation | 2, **7** | 4 |
| Formaldehyde HOMO = O lone pair (not π) | **7** | 4 *(unique — must keep)* |
| N AOs → N MOs; node count ranks energy; allyl coefficients | **10** | 5 |
| Group orbitals (transferable patterns) | 10, **11** | 5 / 6 |
| Qualitative cartoon vs computed orbital; model limits | **11** | 6 |

The rows with three or four "currently in" lessons — phase, the LCAO equation, bonding/antibonding, and especially **carbonyl polarization (taught in 2, 6, and 7)** — are the consolidation targets.

---

## 5. What must be preserved through the merges

Easy things to drop by accident. Each is currently present; here's where it should land:

- [ ] Antibonding node **and** the closed-shell (filled–filled) repulsion point → New 2
- [ ] Conservation of orbital count (N AOs → N MOs) → New 2 and New 5
- [ ] cos(θ) overlap law and the ~90° "overlap → 0" limit → New 3 (Part A)
- [ ] Walsh reasoning: MH₃ planar/pyramidal (BH₃/NH₃), reactive-intermediate occupancy, singlet/triplet carbene angle → New 3 (Part B)
- [ ] Energy-gap rule + the "second-order mixing" *Going deeper* panel → New 4
- [ ] "π more O / π* more C → nucleophile attacks carbon" (the reactivity payoff) → New 4
- [ ] **Formaldehyde's HOMO is an oxygen lone pair, not π** — the one idea unique to old Lesson 7 → New 4
- [ ] Isovalue / "this is not an orbital" point → New 1 (with a callback in New 6)
- [ ] All quiz/checkpoint items from merged lessons → carried into their new homes (nothing deleted silently)

---

## 6. Grounding in Chapter 1

The chapter's own organization supports this shape:

- Chapter §5 is a **single** section covering both mixing strength *and* polarization → supports merging old 5 + 6 (and pulling the ethylene/formaldehyde example of §6–§7 in beside it as New 4).
- Chapter §3 (orbital vs density) and §8 (display threshold) both already fold into the Phase lesson → New 1 keeps that ownership.
- The chapter has **no** standalone "twist geometry" or "Walsh" section — those are your extensions. The twist idea overlaps the chapter's §4 overlap discussion, which is why old 4 + 8 want to be one lesson. Walsh (old 9) is a genuinely *different* idea — geometry changes the preferred **shape** via electron count, not the bonding strength — so inside New 3 it should read as a clearly separate Part B, not get blurred together with the overlap material of Part A.

**Minor bug found while reading:** the student-facing *purpose* text for old Lessons 8 and 9 is actually leftover developer notes — e.g. *"Keep Lesson 8 focused on the existing twist-angle lesson…"* and *"Add the geometry/electron-count lesson as a new Lesson 9…"*. These render to students today and should be rewritten as real purpose statements when those lessons fold into New 3.

---

## 7. Suggested implementation order (when you approve)

Sequenced easy-and-safe first, hard-and-bespoke last, so we can verify and deploy in stages.

**Shared prerequisite.** The guided engine (`GuidedOrbitalLesson.tsx`) currently shows one fixed visual per lesson. New 3 and New 4 each span concepts that use different pictures (e.g. overlap vs. Walsh; energy-gap vs. carbonyl), so first add a small capability to let the active visual follow the current stage. It's one reusable change that both merges depend on. *Low risk.*

1. **New 4 (merge 5 + 6 + 7)** — data edit in `guidedLessonContent.ts`: combine the stage arrays, keep every quiz item, keep the lone-pair/HOMO caveat, and set each stage's visual. Update `lessons.ts`. *Low risk.*
2. **New 3 (merge 4 + 8 + 9)** — the largest guided merge (three lessons), but all three are data-driven, so it's still a data edit on top of the shared prerequisite. Present it as two threads (Part A overlap/alignment, Part B Walsh shape-vs-occupancy). Rewrite the leaked developer "purpose" text for old 8 and 9 here. *Low–moderate risk.*
3. **New 2 (merge 2 + 3)** — the hard one. Both are bespoke React components; this means real code plus deciding which interactive pieces survive. Trim density (stays in New 1), the overlap term (→ New 3), and C=O unequal weights (→ New 4) out of old Combination as we go. *Higher effort; needs browser testing.*
4. **Verify each step** per `AGENTS.md`: `npm run lint`, `npm test`, `npm run build`, check the browser at 375/768/1440 px, confirm phase is never called charge, confirm no lost quiz items.

Because your workflow commits straight to `main` and every push deploys to GitHub Pages, I'd do these as separate verified commits rather than one big change.

---

## 8. Decisions

All four settled from your review:

1. **Ethylene/formaldehyde depth — folded into New 4.** Worked example inside the merged "Energy gap & polarization" lesson (ethylene = symmetric reference, formaldehyde = perturbed case), keeping the lone-pair/HOMO caveat. No separate standalone C=C-vs-C=O lesson.
2. **New 2 scope — no stage cap.** The merged "Two orbitals → bonding & antibonding" lesson may run longer and multi-stage.
3. **Walsh — folded into New 3, not its own lesson.** "Overlap & geometry" becomes a two-part geometry lesson: Part A, geometry changes overlap; Part B, geometry + electron count changes shape (Walsh). This takes the plan to **11 → 6**.
4. **Titles — kept short.** New lessons keep brief nav chips in the existing style (listed in §2).

This plan is settled. Say the word and I'll implement in the order in §7 — the shared engine tweak plus the two guided merges first (low risk), the bespoke 2+3 merge last, each as its own verified commit to `main`.
