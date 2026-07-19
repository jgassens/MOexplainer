import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { lessons } from "../content/lessons";
import { CombinationLesson } from "../lessons/CombinationLesson";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    clear: () => undefined,
    getItem: () => null,
    key: () => null,
    length: 0,
    removeItem: () => undefined,
    setItem: () => undefined,
  },
});

let root: Root | null = null;
let container: HTMLDivElement | null = null;

function renderLesson() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root?.render(
      <CombinationLesson
        meta={lessons[1]}
        nextDisabled={false}
        onNext={() => undefined}
        onPrevious={() => undefined}
        previousDisabled={false}
      />,
    );
  });

  return container;
}

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  root = null;
  container?.remove();
  container = null;
});

describe("Lesson 2 combination coefficient explanation", () => {
  it("anchors the first step in relatable pi-bond chemistry", () => {
    const target = renderLesson();

    expect(target.textContent).toContain("Local sample");
    expect(target.textContent).toContain("Sample one point in the overlap region");
    expect(target.textContent).toContain("At one marked point between two neighboring p atomic orbitals");
    expect(target.textContent).toContain("Two p atomic orbitals are the starting functions, φA and φB");
    expect(target.textContent).toContain("ψ+ = N(φA + φB)");
    expect(target.textContent).toContain("ψ− = N(φA − φB)");
    expect(target.textContent).toContain("absolute choice of color is arbitrary");
    expect(target.textContent).toContain(
      "signed AO amplitude from φA + signed AO amplitude from φB = MO amplitude ψ at this point",
    );
    expect(target.textContent).toContain("this is not the whole double bond");
    expect(target.textContent).toContain("it is the π-bond part of the double bond");
    expect(target.textContent).toContain("Opposite-phase addition gives π* with a node");
    expect(target.textContent).toContain("would oppose π bonding instead of strengthening it");
    expect(target.textContent).toContain("This is the bonding π MO; with two π electrons in it");
    expect(target.textContent).toContain("This is one local sample");
    expect(target.textContent).toContain("φA(r) = +0.60");
    expect(target.textContent).toContain("|ψ+(r)|² = 1.44");
  });

  it("connects equal and unequal weights to the ethylene and carbonyl cases", async () => {
    const target = renderLesson();
    const weightsTab = Array.from(target.querySelectorAll("button")).find((item) =>
      item.textContent?.includes("Unequal weights"),
    );
    expect(weightsTab).toBeTruthy();

    await act(async () => {
      weightsTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(target.textContent).toContain("Use unequal coefficients for C=O");
    expect(target.textContent).toContain("For C=C, equal AO weights are a useful first model");
    expect(target.textContent).toContain("C=O π bonding MO");
    expect(target.textContent).toContain("cC < cO; more oxygen character");
    expect(target.textContent).toContain("C=O π* antibonding MO");
    expect(target.textContent).toContain("cC > cO; more carbon character");
    expect(target.textContent).toContain("O-side coefficient cO");

    const moreC = Array.from(target.querySelectorAll("button")).find((item) =>
      item.textContent?.includes("More C"),
    );
    expect(moreC).toBeTruthy();

    await act(async () => {
      moreC?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(target.textContent).toContain("For a carbonyl π bonding MO");
    expect(target.textContent).toContain("oxygen p orbital contributes more strongly");
  });

  it("keeps the molecular orbital equation open and teaching-rich", async () => {
    const target = renderLesson();

    expect(target.querySelector("details.going-deeper")).toBeNull();
    expect(target.textContent).toContain("Reusable math tool");
    expect(target.textContent).toContain("Build ψ from AO amplitudes");
    expect(target.textContent).toContain("Square ψ to get density");
    expect(target.textContent).toContain("Identify the overlap term");
    expect(target.textContent).not.toContain("1 Add amplitudes");
    expect(target.textContent).not.toContain("2 Square ψ");
    expect(target.textContent).not.toContain("3 See overlap");
    expect(target.textContent).toContain("Reference equation");
    expect(target.textContent).toContain("Live substitution");
    expect(target.querySelector('button[aria-label="MO wave amplitude"]')).toBeTruthy();
    expect(target.querySelector('button[aria-label="weight on orbital A"]')).toBeTruthy();
    expect(target.querySelector('button[aria-label="weight on orbital B"]')).toBeTruthy();
    expect(target.textContent).toContain(
      "only after adding signed amplitudes from the starting atomic orbitals",
    );
    expect(target.textContent).toContain(
      "Here cA is fixed at 1.00 because this step models an ethylene-like C=C bond",
    );
    expect(target.textContent).toContain(
      "The +0.60 is a fixed, scaled sample value chosen to make the arithmetic visible",
    );
    expect(target.textContent).toContain(
      "the coefficient size becomes chemically important for heteroatoms such as oxygen",
    );
    expect(target.textContent).toContain(
      "The relative phase choice decides whether this term is added or subtracted",
    );

    const crossTab = Array.from(target.querySelectorAll("button")).find((item) =>
      item.textContent?.includes("Identify the overlap term"),
    );
    expect(crossTab).toBeTruthy();

    await act(async () => {
      crossTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(target.textContent).toContain("The cross term, 2cAcBφAφB");
    expect(target.textContent).toContain(
      "reports constructive or destructive overlap",
    );
    expect(target.textContent).toContain("Relative phase chooses bonding versus antibonding");
    expect(target.textContent).toContain("Overlap controls how large the bonding/antibonding energy splitting is");
  });

  it("teaches the chemical consequence of matching versus flipping signs", async () => {
    const target = renderLesson();

    expect(target.textContent).toContain("Matched center-facing lobes are in phase");
    expect(target.textContent).toContain("ethylene has a π bond");
    expect(target.textContent).toContain("At the marked point, φA(r) = +0.60");
    expect(target.textContent).toContain("ψ+ = N(φA + φB)");
    expect(target.textContent).toContain("This point is only a sample");

    const flipButton = Array.from(target.querySelectorAll("button")).find((item) =>
      item.textContent?.includes("ψ− out-of-phase"),
    );
    expect(flipButton).toBeTruthy();

    await act(async () => {
      flipButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(target.textContent).toContain("This is the antibonding π* MO");
    expect(target.textContent).toContain("its node removes electron density from the bond region");
    expect(target.textContent).toContain("the teaching arithmetic cancels to 0.00");
    expect(target.textContent).toContain("|ψ−(r)|² = 0.00");
  });

  it("keeps the whole-orbital step grounded in bonding and antibonding pictures", async () => {
    const target = renderLesson();
    const wholeOrbitalTab = Array.from(target.querySelectorAll("button")).find((item) =>
      item.textContent?.includes("Whole orbital"),
    );
    expect(wholeOrbitalTab).toBeTruthy();

    await act(async () => {
      wholeOrbitalTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(target.textContent).toContain("Build the full MO across space");
    expect(target.textContent).toContain(
      "A molecular orbital is not made by adding two orbital colors at one spot",
    );
    expect(target.textContent).toContain("The full MO is made by repeating that signed combination");
    expect(target.textContent).toContain("The sample point shows the local arithmetic");
    expect(target.textContent).toContain("matching phase between the nuclei makes the wavefunction values reinforce");
    expect(target.textContent).toContain("that cancellation creates the node that marks antibonding");
    expect(target.textContent).toContain("The colors only mark relative phase");
    expect(target.textContent).toContain("They are arbitrary labels, not charge");
    expect(target.textContent).toContain("Square ψ to get density");
    expect(target.textContent).toContain(
      "Lesson focus: whole orbital. The equation still shows one sampled point",
    );
    expect(target.textContent).toContain(
      "For ψ+ / π bonding, same-phase amplitude connects across the bond region",
    );
  });
});
