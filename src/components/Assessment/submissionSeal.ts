import { arrayBufferToBase64Url, canonicalize, sha256Hex, utf8Bytes } from './cryptoText';
import { getOrCreateMachineIdentity } from './machineIdentity';
import type { AssessmentSubmissionPayload, SealedAssessmentSubmission } from './types';

export async function sealAssessmentPayload(
  payload: AssessmentSubmissionPayload,
): Promise<SealedAssessmentSubmission> {
  const identity = await getOrCreateMachineIdentity();
  const canonicalPayload = canonicalize(payload);
  const signatureBuffer = await window.crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    identity.privateKey,
    utf8Bytes(canonicalPayload),
  );
  return {
    schema: 'moexplainer-assessment-submission-v2',
    payload,
    payloadHash: await sha256Hex(canonicalPayload),
    machineId: identity.machineId,
    machineCreatedAt: identity.machineCreatedAt,
    publicKeyJwk: identity.publicKeyJwk,
    signatureAlgorithm: 'ECDSA-P256-SHA256',
    signature: arrayBufferToBase64Url(signatureBuffer),
    exportedAt: new Date().toISOString(),
  };
}
