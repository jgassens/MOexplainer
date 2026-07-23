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

  it('merges energy gap, polarization, and ethylene/formaldehyde into one lesson with per-stage visuals', () => {
    const lesson = guidedLessonContent['energy-gap'];
    expect(lesson.stages).toHaveLength(9);
    const visuals = new Set(lesson.stages.map((stage) => stage.visual ?? lesson.visual));
    expect(visuals).toEqual(new Set(['energy-gap', 'polarization', 'ethylene-formaldehyde']));

    // The one idea unique to the old ethylene/formaldehyde lesson must survive.
    const lonePairs = lesson.stages.find((stage) => stage.id === 'lone-pairs');
    expect(lonePairs?.lead).toContain('lone-pair character on oxygen');

    // Every quiz item from the three source lessons is carried into both cards.
    const checkpointIds = lesson.checkpoints.map((item) => item.id);
    for (const id of ['gap-choice', 'polarization-choice', 'polarization-reactivity-short', 'ef-compare-choice', 'ef-lonepair-short']) {
      expect(checkpointIds).toContain(id);
    }
    expect(lesson.endItems.map((item) => item.id)).toEqual(checkpointIds);

    // The folded-in lessons are no longer standalone guided lessons.
    expect(Object.keys(guidedLessonContent)).not.toContain('polarization');
    expect(Object.keys(guidedLessonContent)).not.toContain('ethylene-formaldehyde');
  });

  it('folds twist geometry and Walsh into the overlap lesson as per-stage visuals', () => {
    const lesson = guidedLessonContent.overlap;
    expect(lesson.stages).toHaveLength(9);
    const visuals = new Set(lesson.stages.map((stage) => stage.visual ?? lesson.visual));
    expect(visuals).toEqual(new Set(['overlap', 'twist-geometry', 'walsh-geometry']));

    // The carbene-transfer item unique to the old Walsh lesson survives.
    expect(lesson.endItems.some((item) => item.id === 'walsh-carbene-short')).toBe(true);

    // geometry and walsh-geometry are no longer standalone guided lessons.
    expect(Object.keys(guidedLessonContent)).not.toContain('geometry');
    expect(Object.keys(guidedLessonContent)).not.toContain('walsh-geometry');
  });

  it('uses a limited number of going deeper panels for conceptual bottlenecks', () => {
    const panels = Object.values(guidedLessonContent).flatMap((lesson) =>
      lesson.stages.flatMap((stage) => stage.goingDeeper ?? []),
    );
    expect(panels).toHaveLength(5);
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

  it('keeps purpose copy out of the shared lesson header so step cards carry the explanation', () => {
    const shell = readFileSync(resolve(process.cwd(), 'src/components/LessonShell/LessonShell.tsx'), 'utf8');
    expect(shell).not.toContain('<p>{purpose}</p>');
    expect(shell).not.toContain('learning-cycle');
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
