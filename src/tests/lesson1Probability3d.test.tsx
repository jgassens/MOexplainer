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

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (target.textContent?.includes("What does the integral do?")) return;
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 10));
    });
  }
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
  it("renders the fifth guided step and the volume-integral copy", async () => {
    const target = renderLesson();

    expect(target.textContent).toContain("Probability in 3D");
    await goToProbabilityStep(target);

    expect(target.textContent).toMatch(/Step 5 of 5/i);
    expect(target.textContent).toContain("From one point to a region of space");
    expect(target.textContent).toContain("P(R) = ∭R |ψ|² dτ");
    expect(target.textContent).toContain("Show one p orbital at a time");
    expect(target.textContent).toContain("pₓ");
    expect(target.textContent).toContain("pᵧ");
    expect(target.textContent).toContain("p_z");
  });

  it("defaults to p-y and updates the displayed equation when another p orbital is selected", async () => {
    const target = renderLesson();
    await goToProbabilityStep(target);

    expect(target.textContent).toContain("This view is currently using i = y");

    const pzButton = target.querySelector('button[aria-label="Show p z orbital"]');
    expect(pzButton).toBeTruthy();

    await act(async () => {
      pzButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(target.textContent).toContain("This view is currently using i = z");
    expect(target.textContent).toContain("ψp_z(x,y,z) = N z");
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
    expect(target.textContent).toContain("P(all space) = 1");
  });
});
