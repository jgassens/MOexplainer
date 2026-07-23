import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { lessons } from '../content/lessons';
import { CombinationLesson } from '../lessons/CombinationLesson';

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

function renderBondOrNode() {
  container = document.createElement('div');
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

describe('Bond or node merged lesson (Combination + Bonding)', () => {
  it('is registered as the bonding/antibonding lesson', () => {
    expect(lessons[1]?.id).toBe('combination');
    expect(lessons[1]?.shortTitle).toBe('Bond or node');
  });

  it('folds the energy ordering, occupancy, and closed-shell payoff into the lesson', () => {
    const target = renderBondOrNode();

    // Energy ordering + occupancy carried over from the retired Bonding lesson.
    expect(target.textContent).toContain('Bonding sits lower; antibonding sits higher');
    expect(target.textContent).toContain('this is the π bond of ethylene');
    expect(target.textContent).toContain('there is no net π bond');

    // Closed-shell repulsion "going deeper" survives (without a going-deeper class).
    expect(target.textContent).toContain('closed-shell repulsion');
    expect(target.querySelector('details.going-deeper')).toBeNull();
  });
});
