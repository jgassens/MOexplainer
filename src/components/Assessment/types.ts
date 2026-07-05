import type { LessonId } from '../../content/lessons';

export type AssessmentItemType = 'choice' | 'short' | 'claim';
export type AssessmentMode = 'practice' | 'graded';

export interface AssessmentChoice {
  id: string;
  text: string;
}

export interface AssessmentItem {
  id: string;
  type: AssessmentItemType;
  prompt: string;
  target: string;
  choices?: AssessmentChoice[];
  correctChoiceId?: string;
  modelAnswer?: string;
  feedback: string;
  rubric: string[];
}

export interface AssessmentResponse {
  itemId: string;
  type: AssessmentItemType;
  choiceId?: string;
  freeResponse: string;
  confidence: number;
  checked: boolean;
  correct?: boolean;
  updatedAt: string;
}

export interface SubmittedAssessmentResponse {
  itemId: string;
  type: AssessmentItemType;
  choiceId?: string;
  freeResponse: string;
  confidence: number;
  updatedAt: string;
}

export interface SubmittedAssessmentItem {
  id: string;
  type: AssessmentItemType;
  prompt: string;
  target: string;
  choices?: AssessmentChoice[];
}

export interface AssessmentSubmissionPayload {
  schema: 'moexplainer-assessment-payload-v2';
  appName: 'MOexplainer';
  assessmentMode: 'graded';
  lessonId: LessonId;
  lessonNumber: number;
  lessonTitle: string;
  sectionId: string;
  sectionTitle: string;
  studentName: string;
  studentId: string;
  exportedAt: string;
  userAgent: string;
  timezone: string;
  deviceHintHash: string;
  interactionSummary: string;
  integrityNote: string;
  items: SubmittedAssessmentItem[];
  responses: SubmittedAssessmentResponse[];
  responseCount: {
    answered: number;
    possible: number;
    objectiveItems: number;
    writtenItems: number;
  };
}

export interface SealedAssessmentSubmission {
  schema: 'moexplainer-assessment-submission-v2';
  payload: AssessmentSubmissionPayload;
  payloadHash: string;
  machineId: string;
  machineCreatedAt: string;
  publicKeyJwk: JsonWebKey;
  signatureAlgorithm: 'ECDSA-P256-SHA256';
  signature: string;
  exportedAt: string;
}

export interface MachineRegistration {
  schema: 'moexplainer-machine-registration-v1';
  appName: 'MOexplainer';
  studentName: string;
  studentId: string;
  machineId: string;
  machineCreatedAt: string;
  publicKeyJwk: JsonWebKey;
  deviceHintHash: string;
  exportedAt: string;
}
