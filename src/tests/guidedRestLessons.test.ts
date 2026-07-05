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
