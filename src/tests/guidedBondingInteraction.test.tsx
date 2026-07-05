import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { lessons } from '../content/lessons';
import { GuidedOrbitalLesson } from '../lessons/GuidedOrbitalLesson';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

Object.defineProperty(globalThis, 'localStorage', {
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

function renderBondingLesson() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root?.render(
      <GuidedOrbitalLesson
        lessonId="bonding"
        meta={lessons[2]}
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

describe('Lesson 3 bonding workbench interactions', () => {
  it('uses the twist slider to reduce overlap and collapse the pi energy split', async () => {
    const target = renderBondingLesson();
    const slider = target.querySelector<HTMLInputElement>('input[aria-label="p-orbital twist angle / pi overlap"]');

    expect(slider).toBeTruthy();
    expect(target.textContent).toContain('relative overlap S ≈ cos(0°) = 1.00');

    await act(async () => {
      const setInputValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setInputValue?.call(slider, '90');
      slider!.dispatchEvent(new Event('input', { bubbles: true }));
      await Promise.resolve();
    });

    expect(target.textContent).toContain('relative overlap S ≈ cos(90°) = 0.00');
    expect(target.textContent).toContain('twist = 90°; S ≈ 0.00');
    expect(target.textContent).toContain('ψ+ and ψ− are nearly degenerate');
    expect(target.textContent).toContain('At 90° twist, there is essentially no shared π-overlap sample to square');
  });
});
