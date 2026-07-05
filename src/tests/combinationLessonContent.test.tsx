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

    expect(target.textContent).toContain("Start with the π part of a C=C bond");
    expect(target.textContent).toContain("the C=C double bond has a σ bond plus a π bond");
    expect(target.textContent).toContain("two neighboring p orbitals overlapping side-by-side");
    expect(target.textContent).toContain("Match the center-facing signs to build the bonding π MO");
    expect(target.textContent).toContain("this is not the whole double bond");
    expect(target.textContent).toContain("it is the π-bond part of the double bond");
    expect(target.textContent).toContain("Opposite-phase addition gives π* with a node");
    expect(target.textContent).toContain("would oppose π bonding instead of strengthening it");
    expect(target.textContent).toContain("This is the bonding π MO; with two π electrons in it");
    expect(target.textContent).toContain("The 0.60 is a fixed, scaled teaching value");
    expect(target.textContent).toContain("not experimental data");
  });

  it("connects equal and unequal weights to the ethylene and carbonyl cases", async () => {
    const target = renderLesson();
    const weightsTab = Array.from(target.querySelectorAll("button")).find((item) =>
      item.textContent?.includes("Weights"),
    );
    expect(weightsTab).toBeTruthy();

    await act(async () => {
      weightsTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(target.textContent).toContain("Equal weights are the symmetric reference");
    expect(target.textContent).toContain("not an atom picker");
    expect(target.textContent).toContain("C=C pi system of ethylene");
    expect(target.textContent).toContain("heteroatom case such as C=O");
    expect(target.textContent).toContain("oxygen contributes more to the bonding π MO");

    const mostlyB = Array.from(target.querySelectorAll("button")).find((item) =>
      item.textContent?.includes("Mostly B"),
    );
    expect(mostlyB).toBeTruthy();

    await act(async () => {
      mostlyB?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(target.textContent).toContain("more atom B character");
    expect(target.textContent).toContain("carbonyl bonding pi MO is more oxygen-like");
    expect(target.textContent).toContain("pi* is more carbon-like");
  });

  it("keeps the molecular orbital equation open and teaching-rich", async () => {
    const target = renderLesson();

    expect(target.querySelector("details.going-deeper")).toBeNull();
    expect(target.textContent).toContain("Equation walkthrough");
    expect(target.textContent).toContain("Reference equation");
    expect(target.textContent).toContain("Live substitution");
    expect(target.querySelector('button[aria-label="MO wave amplitude"]')).toBeTruthy();
    expect(target.querySelector('button[aria-label="weight on orbital A"]')).toBeTruthy();
    expect(target.querySelector('button[aria-label="signed weight on orbital B"]')).toBeTruthy();
    expect(target.textContent).toContain(
      "You get it only after adding the two starting-orbital contributions",
    );
    expect(target.textContent).toContain(
      "Here cA is fixed at 1.00 because this step models an ethylene-like C=C bond",
    );
    expect(target.textContent).toContain(
      "The +0.60 is a fixed, scaled sample value chosen to make the arithmetic visible",
    );
    expect(target.textContent).toContain(
      "When the atoms are not the same, as in C=O, the weights become chemically important",
    );
    expect(target.textContent).toContain(
      "For the C=C reference, B has the same size weight as A; flipping B changes the sign only",
    );

    const crossTab = Array.from(target.querySelectorAll("button")).find((item) =>
      item.textContent?.includes("See overlap"),
    );
    expect(crossTab).toBeTruthy();

    await act(async () => {
      crossTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(target.textContent).toContain("It uses both fixed sample amplitudes at once");
    expect(target.textContent).toContain(
      "so it is the piece that knows whether A and B have the same or opposite phase",
    );
    expect(target.textContent).toContain("Positive builds density between atoms; negative cancels it");
  });

  it("teaches the chemical consequence of matching versus flipping signs", async () => {
    const target = renderLesson();

    expect(target.textContent).toContain("Matched center-facing lobes are in phase");
    expect(target.textContent).toContain("ethylene has a π bond");
    expect(target.textContent).toContain("At the circled point, orbital A contributes +0.60");
    expect(target.textContent).toContain("draw the whole π bonding orbital");
    expect(target.textContent).toContain("fixed, scaled teaching value chosen for this sampled point");

    const flipButton = Array.from(target.querySelectorAll("button")).find((item) =>
      item.textContent?.includes("flip B"),
    );
    expect(flipButton).toBeTruthy();

    await act(async () => {
      flipButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(target.textContent).toContain("This is the antibonding π* MO");
    expect(target.textContent).toContain("its node removes electron density from the bond region");
    expect(target.textContent).toContain("A zero in the middle is a node");
    expect(target.textContent).toContain("draws the π* antibonding node");
  });

  it("keeps the every-point step grounded in bonding and antibonding pictures", async () => {
    const target = renderLesson();
    const everyPointTab = Array.from(target.querySelectorAll("button")).find((item) =>
      item.textContent?.includes("Every point"),
    );
    expect(everyPointTab).toBeTruthy();

    await act(async () => {
      everyPointTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(target.textContent).toContain("Add the wavefunctions across the whole bond region");
    expect(target.textContent).toContain(
      "A molecular orbital is not made by adding two orbital colors at one spot",
    );
    expect(target.textContent).toContain("It is a wavefunction spread through space");
    expect(target.textContent).toContain(
      "At any one point, the MO value equals the value from p orbital A plus the value from p orbital B",
    );
    expect(target.textContent).toContain("matching phase between the nuclei makes the wavefunction values reinforce");
    expect(target.textContent).toContain("that cancellation creates the node that marks antibonding");
    expect(target.textContent).toContain("The colors only mark relative phase");
    expect(target.textContent).toContain("They are arbitrary labels, not charge");
    expect(target.textContent).toContain("Use one sampled point to build the whole MO");
    expect(target.textContent).toContain(
      "Lesson focus: every point. The equation still shows one sampled point",
    );
    expect(target.textContent).toContain(
      "repeats that same signed addition across the whole bond region",
    );
  });
});
