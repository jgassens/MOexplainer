import { useEffect, useMemo, useState } from 'react';
import type { LessonMeta } from '../../content/lessons';
import '../../styles/moexplainer-assessment.css';
import { buildMachineRegistration, getOrCreateMachineIdentity } from './machineIdentity';
import { downloadAssessmentPdf, downloadRegistrationPdfAndJson } from './pdfExport';
import { sealAssessmentPayload } from './submissionSeal';
import type {
  AssessmentItem,
  AssessmentMode,
  AssessmentResponse,
  AssessmentSubmissionPayload,
  SubmittedAssessmentResponse,
} from './types';

interface AssessmentCardProps {
  meta: LessonMeta;
  mode: AssessmentMode;
  sectionId: string;
  sectionTitle: string;
  sectionLead: string;
  items: AssessmentItem[];
  interactionSummary: string;
}

interface StudentProfile {
  studentName: string;
  studentId: string;
}

function profileKey(): string {
  return 'moexplainer.assessment.student-profile.v2';
}

function responseKey(lessonId: string, sectionId: string): string {
  return `moexplainer.assessment.responses.${lessonId}.${sectionId}.v2`;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function mergeResponses(items: AssessmentItem[], stored: AssessmentResponse[]): AssessmentResponse[] {
  const now = new Date().toISOString();
  return items.map((item) => {
    const existing = stored.find((entry) => entry.itemId === item.id);
    return existing ?? { itemId: item.id, type: item.type, freeResponse: '', confidence: 3, checked: false, updatedAt: now };
  });
}

function confidenceLabel(value: number): string {
  if (value <= 1) return '1 very low';
  if (value === 2) return '2 low';
  if (value === 3) return '3 moderate';
  if (value === 4) return '4 high';
  return '5 very high';
}

function objectiveScore(items: AssessmentItem[], responses: AssessmentResponse[]) {
  return items.reduce(
    (score, item) => {
      if (!item.correctChoiceId) return score;
      const response = responses.find((entry) => entry.itemId === item.id);
      return {
        earned: score.earned + (response?.choiceId === item.correctChoiceId ? 1 : 0),
        possible: score.possible + 1,
      };
    },
    { earned: 0, possible: 0 },
  );
}

function deviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'unknown';
}

function isAnswered(response: AssessmentResponse | undefined): boolean {
  if (!response) return false;
  return Boolean(response.choiceId || response.freeResponse.trim());
}

function responseForSubmission(response: AssessmentResponse): SubmittedAssessmentResponse {
  const { itemId, type, choiceId, freeResponse, confidence, updatedAt } = response;
  return { itemId, type, choiceId, freeResponse, confidence, updatedAt };
}

export function AssessmentCard({
  meta,
  mode,
  sectionId,
  sectionTitle,
  sectionLead,
  items,
  interactionSummary,
}: AssessmentCardProps) {
  const [profile, setProfile] = useState<StudentProfile>(() =>
    readJson<StudentProfile>(profileKey(), { studentName: '', studentId: '' }),
  );
  const [responses, setResponses] = useState<AssessmentResponse[]>(() =>
    mergeResponses(items, readJson<AssessmentResponse[]>(responseKey(meta.id, sectionId), [])),
  );
  const [machineId, setMachineId] = useState('not initialized');
  const [exportStatus, setExportStatus] = useState('');

  const isPractice = mode === 'practice';
  const isGraded = mode === 'graded';

  useEffect(() => {
    localStorage.setItem(profileKey(), JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(responseKey(meta.id, sectionId), JSON.stringify(responses));
  }, [meta.id, responses, sectionId]);

  useEffect(() => {
    if (!isGraded) return undefined;
    let active = true;
    getOrCreateMachineIdentity()
      .then((identity) => {
        if (active) setMachineId(identity.machineId);
      })
      .catch(() => {
        if (active) setMachineId('unavailable');
      });
    return () => {
      active = false;
    };
  }, [isGraded]);

  const score = useMemo(() => objectiveScore(items, responses), [items, responses]);
  const checkedAny = responses.some((response) => response.checked);
  const answeredCount = responses.filter((response) => isAnswered(response)).length;

  const updateProfile = (field: keyof StudentProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const updateResponse = (itemId: string, patch: Partial<AssessmentResponse>) => {
    setResponses((current) =>
      current.map((response) =>
        response.itemId === itemId
          ? { ...response, ...patch, checked: false, correct: undefined, updatedAt: new Date().toISOString() }
          : response,
      ),
    );
  };

  const checkResponses = () => {
    if (!isPractice) return;
    setResponses((current) =>
      current.map((response) => {
        const item = items.find((entry) => entry.id === response.itemId);
        const correct = item?.correctChoiceId ? response.choiceId === item.correctChoiceId : undefined;
        return { ...response, checked: true, correct, updatedAt: new Date().toISOString() };
      }),
    );
  };

  const buildPayload = async (): Promise<AssessmentSubmissionPayload> => {
    if (!profile.studentName.trim() || !profile.studentId.trim()) {
      throw new Error('Student name and student ID are required before exporting a submitted assessment.');
    }
    const identity = await getOrCreateMachineIdentity();
    return {
      schema: 'moexplainer-assessment-payload-v2',
      appName: 'MOexplainer',
      assessmentMode: 'graded',
      lessonId: meta.id,
      lessonNumber: meta.number,
      lessonTitle: meta.title,
      sectionId,
      sectionTitle,
      studentName: profile.studentName.trim(),
      studentId: profile.studentId.trim(),
      exportedAt: new Date().toISOString(),
      userAgent: window.navigator.userAgent,
      timezone: deviceTimezone(),
      deviceHintHash: identity.deviceHintHash,
      interactionSummary,
      integrityNote:
        'This submitted export intentionally omits answer keys, model answers, feedback, rubrics, and client-side scores. Verify the paired JSON against the registered machine key.',
      items: items.map(({ id, type, prompt, target, choices }) => ({
        id,
        type,
        prompt,
        target,
        choices,
      })),
      responses: responses.map(responseForSubmission),
      responseCount: {
        answered: answeredCount,
        possible: items.length,
        objectiveItems: items.filter((item) => item.type === 'choice').length,
        writtenItems: items.filter((item) => item.type !== 'choice').length,
      },
    };
  };

  const downloadAssessment = async () => {
    setExportStatus('Preparing signed submitted-assessment PDF and verification JSON…');
    try {
      const payload = await buildPayload();
      const sealed = await sealAssessmentPayload(payload);
      downloadAssessmentPdf(sealed);
      setMachineId(sealed.machineId);
      setExportStatus('Downloaded submitted-assessment PDF and .moe.json. Submit both files.');
    } catch (error) {
      setExportStatus(error instanceof Error ? error.message : 'Could not export submitted assessment.');
    }
  };

  const downloadRegistration = async () => {
    setExportStatus('Preparing machine registration…');
    try {
      if (!profile.studentName.trim() || !profile.studentId.trim()) {
        throw new Error('Student name and student ID are required before exporting a machine registration.');
      }
      const registration = await buildMachineRegistration(profile.studentName.trim(), profile.studentId.trim());
      downloadRegistrationPdfAndJson(registration);
      setMachineId(registration.machineId);
      setExportStatus('Downloaded machine registration PDF and JSON. Register this browser before collecting assessments.');
    } catch (error) {
      setExportStatus(error instanceof Error ? error.message : 'Could not export machine registration.');
    }
  };

  return (
    <section className={`assessment-card assessment-card--${mode}`} aria-labelledby={`${meta.id}-${sectionId}-assessment-title`}>
      <div className="assessment-card__header">
        <span className="assessment-card__eyebrow">{isPractice ? 'Practice checkpoint' : 'Submitted assessment'}</span>
        <h3 id={`${meta.id}-${sectionId}-assessment-title`}>{sectionTitle}</h3>
        <p>{sectionLead}</p>
      </div>

      {isGraded ? (
        <div className="assessment-profile-grid">
          <label>
            Student name
            <input
              value={profile.studentName}
              onChange={(event) => updateProfile('studentName', event.currentTarget.value)}
              autoComplete="name"
            />
          </label>
          <label>
            Student ID
            <input
              value={profile.studentId}
              onChange={(event) => updateProfile('studentId', event.currentTarget.value)}
              autoComplete="off"
            />
          </label>
          <div className="assessment-machine-chip">
            <span>Machine ID</span>
            <strong>{machineId}</strong>
          </div>
        </div>
      ) : null}

      <div className="assessment-items">
        {items.map((item, itemIndex) => {
          const response = responses.find((entry) => entry.itemId === item.id);
          return (
            <article className="assessment-item" key={item.id}>
              <div className="assessment-item__prompt">
                <span>Item {itemIndex + 1}</span>
                <h4>{item.prompt}</h4>
                <p>{item.target}</p>
              </div>

              {item.choices ? (
                <fieldset className="assessment-choice-set">
                  <legend>Select one</legend>
                  {item.choices.map((choice) => (
                    <label key={choice.id}>
                      <input
                        type="radio"
                        name={`${meta.id}-${sectionId}-${item.id}`}
                        checked={response?.choiceId === choice.id}
                        onChange={() => updateResponse(item.id, { choiceId: choice.id })}
                      />
                      <span>{choice.id}. {choice.text}</span>
                    </label>
                  ))}
                </fieldset>
              ) : null}

              <label className="assessment-free-response">
                Written explanation
                <textarea
                  value={response?.freeResponse ?? ''}
                  onChange={(event) => updateResponse(item.id, { freeResponse: event.currentTarget.value })}
                  placeholder="Write the reasoning, not just the answer."
                />
              </label>

              <label className="assessment-confidence">
                Confidence
                <select
                  value={response?.confidence ?? 3}
                  onChange={(event) => updateResponse(item.id, { confidence: Number(event.currentTarget.value) })}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option value={value} key={value}>{confidenceLabel(value)}</option>
                  ))}
                </select>
              </label>

              {isPractice && response?.checked ? (
                <div className="assessment-feedback">
                  {item.correctChoiceId ? (
                    <strong>{response.correct ? 'Correct choice.' : `Check this. Correct choice: ${item.correctChoiceId}.`}</strong>
                  ) : (
                    <strong>Rubric check.</strong>
                  )}
                  <p>{item.feedback}</p>
                  {item.modelAnswer ? <p><em>Model answer:</em> {item.modelAnswer}</p> : null}
                  <ul>
                    {item.rubric.map((rubricLine) => <li key={rubricLine}>{rubricLine}</li>)}
                  </ul>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="assessment-actions">
        {isPractice ? <button type="button" onClick={checkResponses}>Check practice responses</button> : null}
        {isGraded ? <button type="button" onClick={downloadAssessment}>Download signed submitted PDF + JSON</button> : null}
        {isGraded ? <button type="button" onClick={downloadRegistration}>Download machine registration</button> : null}
      </div>
      <p className="assessment-status">
        {exportStatus || (isPractice
          ? checkedAny
            ? `Practice objective items checked by the browser: ${score.earned}/${score.possible}. Written explanations still need human judgment.`
            : 'Practice feedback is available only after Check practice responses. Nothing from this checkpoint is exported as a submitted assessment.'
          : `Responses completed: ${answeredCount}/${items.length}. Submitted exports do not include answer keys, model answers, feedback, rubrics, or browser scores.`)}
      </p>
      {isGraded ? (
        <p className="assessment-caveat">
          Static-site integrity is tamper-evident, not cheat-proof. The signature detects edited JSON exports and ties the export to this browser key. A server-signed LMS submission would be stronger.
        </p>
      ) : null}
    </section>
  );
}
