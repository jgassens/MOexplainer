import { useState } from 'react';
import { ConceptCard } from '../../components/ConceptCard/ConceptCard';
import { ControlPanel, ResetButton, ToggleGroup } from '../../components/ControlPanel/ControlPanel';
import { EquationCard } from '../../components/EquationCard/EquationCard';
import { LessonShell } from '../../components/LessonShell/LessonShell';
import { PredictionCard } from '../../components/PredictionCard/PredictionCard';
import { ExternalLink } from '../../components/ui/ExternalLink';
import type { LessonComponentProps } from '../types';

function colabUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    const owner = window.location.hostname.split('.')[0];
    const repo = window.location.pathname.split('/').filter(Boolean)[0];
    if (owner && repo) {
      return `https://colab.research.google.com/github/${owner}/${repo}/blob/main/source/Ceci_n_est_pas_une_orbitale_Chapter_1.ipynb`;
    }
  }
  return 'https://colab.research.google.com/github/jgassens/MOexplainer/blob/main/source/Ceci_n_est_pas_une_orbitale_Chapter_1.ipynb';
}

export function CalculationLesson(props: LessonComponentProps) {
  const [focus, setFocus] = useState<'model' | 'calculation'>('model');
  const reset = () => setFocus('model');

  return (
    <LessonShell
      {...props}
      purpose="Leave the website when you are ready to compare the teaching model with a real quantum-chemistry calculation."
      feedback={
        focus === 'model'
          ? 'The website builds insight with simplified qualitative models and relative teaching units.'
          : 'The notebook can run an electronic-structure calculation, but students should compare it against the same qualitative ideas.'
      }
    >
      <div className="lesson-grid">
        <div className="lesson-stack">
          <EquationCard
            equation="\text{model}\neq\text{experiment}"
            definitions={[
              { symbol: 'teaching model', meaning: 'a simplified model designed to make patterns visible.' },
              { symbol: 'calculation', meaning: 'a separate quantum-chemistry workflow in the notebook.' },
              { symbol: 'comparison', meaning: 'a way to test which qualitative ideas carry over.' },
            ]}
            note="The site does not run PySCF or RDKit. It only links to the supplied notebook."
          />
          <ConceptCard title="Why compare with a calculation?">
            <p>
              The app uses clean teaching models so the chemical patterns are visible: phase, nodes, overlap,
              energy gaps, and polarization. A quantum-chemistry calculation uses many more functions and a
              real 3D geometry, so the pictures are less cartoon-like.
            </p>
            <p>
              The useful question is not whether the teaching units match an experiment. They do not. The
              useful question is whether the same patterns survive in a more detailed model.
            </p>
          </ConceptCard>
          <ControlPanel title="Open notebook" description="Choose which side of the comparison to focus on, then open the optional notebook when you are ready.">
            <ToggleGroup
              label="Comparison focus"
              description="Stay with the teaching model for concepts. Switch to calculation when you want to compare against the original notebook workflow."
              value={focus}
              options={[
                { value: 'model', label: 'Teaching model' },
                { value: 'calculation', label: 'Calculation' },
              ]}
              onChange={setFocus}
            />
            <ExternalLink className="primary-link" href={colabUrl()}>
              Open the notebook in Google Colab
            </ExternalLink>
            <ResetButton onReset={reset} />
          </ControlPanel>
          <PredictionCard prompt="Before opening Colab, name one result you expect to match the teaching model and one limitation you expect." />
        </div>
        <div className="visual-card comparison-card">
          {focus === 'model' ? (
            <>
              <h2>Teaching model</h2>
              <p>
                This app uses relative energy in arbitrary teaching units. It is meant to build chemical intuition,
                not replace calculation or experiment.
              </p>
              <ul>
                <li>No server or account is required for the website.</li>
                <li>No Python code is shown in the lessons.</li>
                <li>The notebook is optional and clearly separated.</li>
              </ul>
            </>
          ) : (
            <>
              <h2>Calculation boundary</h2>
              <p>
                The notebook can calculate molecular orbitals for small examples. It can test whether the same
                phase, node, and polarization patterns appear in a less simplified model.
              </p>
              <ul>
                <li>The website itself still runs entirely in the browser.</li>
                <li>The Colab workflow is separate from the guided lessons.</li>
                <li>Calculated orbital pictures still need chemical interpretation.</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </LessonShell>
  );
}
