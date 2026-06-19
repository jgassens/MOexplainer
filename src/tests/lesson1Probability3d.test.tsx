import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { lessons } from "../content/lessons";
import { PhaseLesson } from "../lessons/PhaseLesson";

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
      <PhaseLesson
        meta={lessons[0]}
        nextDisabled={false}
        onNext={() => undefined}
        onPrevious={() => undefined}
        previousDisabled
      />,
    );
  });

  return container;
}

async function goToProbabilityStep(target: HTMLElement) {
  const button = Array.from(target.querySelectorAll("button")).find((item) =>
    item.textContent?.includes("Probability in 3D"),
  );
  expect(button).toBeTruthy();

  await act(async () => {
    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (target.textContent?.includes("What does the integral do?")) return;
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 25));
    });
  }

  expect(target.textContent).toContain("What does the integral do?");
}

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  root = null;
  container?.remove();
  container = null;
});

describe("Lesson 1 probability in 3D step", () => {
  it("introduces wavefunction, density, and regional probability in the primer bridge", () => {
    const target = renderLesson();

    expect(target.textContent).toContain("Wavefunction");
    expect(target.textContent).toContain("SQUARE IT →");
    expect(target.textContent).toContain("Probability density");
    expect(target.textContent).toContain("INTEGRATE IT →");
    expect(target.textContent).toContain("Probability in a region");
    expect(target.textContent).toContain("|ψ|² is density at a point");
    expect(target.textContent).toContain("probability in a region");
  });

  it("renders the fifth guided step and the volume-integral copy", async () => {
    const target = renderLesson();

    expect(target.textContent).toContain("Probability in 3D");
    await goToProbabilityStep(target);

    expect(target.textContent).toMatch(/Step 5 of 5/i);
    expect(target.textContent).toContain("From one point to a region of space");
    expect(target.textContent).toContain("P(R) = ∭R |ψ|2 dτ");
    expect(target.querySelector(".psi-stage-equation sup")).toBeTruthy();
    expect(target.textContent).toContain("Start with py, then compare the p shell");
    expect(target.querySelector('button[aria-label="Show p y orbital only"]')).toBeTruthy();
    expect(
      target.querySelector('button[aria-label="Show p x p y and p z shell overview"]'),
    ).toBeTruthy();
    expect(target.textContent).not.toContain("p_z");
    expect(target.textContent).not.toContain("e^");
  });

  it("defaults to p-y and switches to the p-shell density overview", async () => {
    const target = renderLesson();
    await goToProbabilityStep(target);

    expect(target.textContent).toContain("ψpy(x, y, z) = N y");
    expect(target.textContent).toContain("signed wave amplitude at the center");

    const shellButton = target.querySelector(
      'button[aria-label="Show p x p y and p z shell overview"]',
    );
    expect(shellButton).toBeTruthy();

    await act(async () => {
      shellButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(target.textContent).toContain("ψpi(x, y, z) = N i");
    expect(target.textContent).toContain("component amplitudes at the center");
    expect(target.textContent).toContain("average p-shell density at the center");
    expect(target.textContent).toContain("probability inside the selected average p-shell density");
  });

  it("labels center density as density and box probability as volume probability", async () => {
    const target = renderLesson();
    await goToProbabilityStep(target);

    expect(target.textContent).toContain("local probability density at the center");
    expect(target.textContent).not.toContain("|ψ|² at the center is probability");
    expect(target.textContent).toContain(
      "probability of finding the electron somewhere inside this volume",
    );
  });

  it("keeps all box controls keyboard-accessible through labeled inputs", async () => {
    const target = renderLesson();
    await goToProbabilityStep(target);

    ["x center", "y center", "z center"].forEach((label) => {
      expect(target.querySelector(`input[aria-label="${label} numeric input"]`)).toBeTruthy();
    });

    const resizeButton = Array.from(target.querySelectorAll("button")).find((item) =>
      item.textContent?.includes("Resize box"),
    );
    expect(resizeButton).toBeTruthy();

    await act(async () => {
      resizeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    ["width", "height", "depth"].forEach((label) => {
      expect(target.querySelector(`input[aria-label="${label} numeric input"]`)).toBeTruthy();
    });
  });

  it("does not change the rendered probability when global phase flips", async () => {
    const target = renderLesson();
    await goToProbabilityStep(target);

    const probabilityBefore = target.querySelector(".orbital3d-live__probability strong")?.textContent;
    const flipButton = Array.from(target.querySelectorAll("button")).find(
      (item) => item.textContent?.trim() === "−ψ",
    );
    expect(probabilityBefore).toBeTruthy();
    expect(flipButton).toBeTruthy();

    await act(async () => {
      flipButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    const probabilityAfter = target.querySelector(".orbital3d-live__probability strong")?.textContent;
    expect(probabilityAfter).toEqual(probabilityBefore);
  });

  it("retains controls and live values in the WebGL fallback", async () => {
    const target = renderLesson();
    await goToProbabilityStep(target);

    expect(target.textContent).toContain("The 3D WebGL view is unavailable here");
    expect(target.textContent).toContain("Live values");
    expect(target.querySelector("#orbital3d-y-center")).toBeTruthy();
    expect(target.textContent).toContain("signed wave amplitude at the center");
    expect(target.textContent).toContain("local probability density at the center");
    expect(target.textContent).toContain("box volume");
    expect(target.textContent).toContain("probability of finding the electron somewhere inside this volume");
    expect(target.textContent).not.toContain("box center");
    expect(target.textContent).not.toContain("box bounds");
    expect(target.textContent).not.toContain("probability outside box");
    expect(target.textContent).not.toContain("all-space normalization");
  });
});
