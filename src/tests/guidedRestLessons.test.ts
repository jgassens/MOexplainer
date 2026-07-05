import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lessons } from '../content/lessons';
import { guidedLessonContent } from '../lessons/guidedLessonContent';

describe('guided rest lesson integration', () => {
  it('covers every lesson after phase and combination without changing those first two lesson IDs', () => {
    const guidedIds = lessons.slice(2).map((lesson) => lesson.id).sort();
    expect(Object.keys(guidedLessonContent).sort()).toEqual(guidedIds);
    expect(lessons[0]?.id).toBe('phase');
    expect(lessons[1]?.id).toBe('combination');
  });

  it('keeps twist overlap as Lesson 8 and Walsh geometry as Lesson 9', () => {
    expect(guidedLessonContent.geometry.visual).toBe('twist-geometry');
    expect(guidedLessonContent['walsh-geometry'].visual).toBe('walsh-geometry');
  });

  it('uses a limited number of going deeper panels for conceptual bottlenecks', () => {
    const panels = Object.values(guidedLessonContent).flatMap((lesson) =>
      lesson.stages.flatMap((stage) => stage.goingDeeper ?? []),
    );
    expect(panels).toHaveLength(6);
    expect(panels.map((panel) => panel.title)).toContain('Walsh diagrams connect shape to occupancy');
    expect(panels.map((panel) => panel.title)).toContain('Computed orbital surfaces are drawings of a chosen contour');
  });

  it('gives every guided lesson embedded practice and submitted assessment items', () => {
    for (const lesson of Object.values(guidedLessonContent)) {
      expect(lesson.stages.length).toBeGreaterThanOrEqual(3);
      expect(lesson.checkpoints.length).toBeGreaterThanOrEqual(2);
      expect(lesson.endItems.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('keeps Lesson 3 centered on signed addition, density/node formation, and the bonding-antibonding energy pair', () => {
    const lesson = guidedLessonContent.bonding;
    expect(lesson.visual).toBe('bonding');
    expect(lesson.stages.map((stage) => stage.id)).toEqual(['in-phase', 'out-of-phase', 'energy-pair']);
    expect(lesson.stages[0]?.lead).toContain('In the last lesson');
    expect(lesson.stages[0]?.lead).toContain('C=C π bond');
    expect(lesson.stages[0]?.lead).toContain('equivalent neighboring carbon p atomic orbitals');
    expect(lesson.stages[0]?.lead).not.toContain('chapter');
    expect(lesson.stages[0]?.lead).toContain('two molecular orbitals');
    expect(lesson.stages[0]?.lead).toContain('bonding π combination');
    expect(lesson.stages[0]?.lead).toContain('ψ+ = N(φA + φB)');
    expect(lesson.stages[0]?.lead).toContain('ψ− = N(φA − φB)');
    expect(lesson.stages[0]?.equation).toContain('ψ+ = N(φA + φB)');
    expect(lesson.stages[1]?.equation).toContain('|0|²');
    expect(lesson.stages[1]?.lead).toContain('starting functions, φA and φB');
    expect(lesson.stages[2]?.equation).toContain('overlap S ≈ cos(θ)');
    expect(lesson.stages[2]?.lead).toContain('Twisting changes overlap, not the relative-phase rule');
    expect(lesson.stages[2]?.lead).toContain('At 90° twist, π overlap is essentially zero');
    expect(lesson.stages[2]?.correction).toContain('Do not attribute π* to twisting');
    expect(lesson.endItems.some((item) => item.id === 'bond-transfer-short')).toBe(true);
  });

  it('keeps purpose copy out of the shared lesson header so step cards carry the explanation', () => {
    const shell = readFileSync(resolve(process.cwd(), 'src/components/LessonShell/LessonShell.tsx'), 'utf8');
    expect(shell).not.toContain('<p>{purpose}</p>');
    expect(shell).not.toContain('learning-cycle');
  });

  it('makes the Lesson 3 equation and MO pair interactive instead of static captions', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/lessons/GuidedOrbitalLesson.tsx'), 'utf8');
    expect(source).toContain('BondingEquationChooser');
    expect(source).toContain('Review Lesson 2');
    expect(source).toContain('ψ+ = N(φA + φB)');
    expect(source).toContain('ψ− = N(φA − φB)');
    expect(source).toContain('p-orbital twist angle / π overlap');
    expect(source).toContain('relative overlap S ≈ cos');
    expect(source).toContain('Twisting the p orbitals changes overlap, not phase');
    expect(source).not.toContain('add ψ values');
  });
});

describe('deployment entrypoint guard', () => {
  it('continues to use the Vite React module entrypoint rather than a flat app.js script', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
    expect(html).toContain('<script type="module" src="/src/main.tsx"></script>');
    expect(html).not.toMatch(/<script(?![^>]*type=["']module["'])[^>]*src=["'][^"']*app\.js["']/);
  });
});

describe('submitted assessment export guard', () => {
  it('keeps answer-bearing fields out of the submitted payload mapping', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/Assessment/AssessmentCard.tsx'), 'utf8');
    const start = source.indexOf('const buildPayload');
    const end = source.indexOf('const downloadAssessment');
    const payloadBuilder = source.slice(start, end);
    expect(payloadBuilder).toContain('items: items.map(({ id, type, prompt, target, choices }) => ({');
    expect(payloadBuilder).toContain('responses: responses.map(responseForSubmission)');
  });
});
