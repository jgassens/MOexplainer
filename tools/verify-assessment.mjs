#!/usr/bin/env node
/* global process, console, Buffer, TextEncoder */
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';

const [, , submissionPath, registrationPath] = process.argv;

if (!submissionPath || !registrationPath) {
  console.error('Usage: node tools/verify-assessment.mjs <assessment.moe.json> <machine-registration.moe.json>');
  process.exit(2);
}

function canonicalize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalize(entry)).join(',')}]`;
  return `{${Object.keys(value)
    .filter((key) => value[key] !== undefined)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
    .join(',')}}`;
}

function base64UrlToArrayBuffer(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Uint8Array.from(Buffer.from(padded, 'base64')).buffer;
}

async function sha256Hex(value) {
  const digest = await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

const submission = JSON.parse(await readFile(submissionPath, 'utf8'));
const registration = JSON.parse(await readFile(registrationPath, 'utf8'));

const errors = [];
if (submission.schema !== 'moexplainer-assessment-submission-v2') {
  errors.push('Submission schema is not moexplainer-assessment-submission-v2. Use the v2 export package.');
}
if (submission.payload?.schema !== 'moexplainer-assessment-payload-v2') {
  errors.push('Payload schema is not moexplainer-assessment-payload-v2.');
}
if (registration.schema !== 'moexplainer-machine-registration-v1') {
  errors.push('Registration schema is not moexplainer-machine-registration-v1.');
}
if (submission.machineId !== registration.machineId) {
  errors.push(`Machine ID mismatch: submission ${submission.machineId}, registration ${registration.machineId}.`);
}
if (JSON.stringify(submission.publicKeyJwk) !== JSON.stringify(registration.publicKeyJwk)) {
  errors.push('Public key JWK mismatch.');
}
if (registration.studentId && submission.payload?.studentId && registration.studentId !== submission.payload.studentId) {
  errors.push(`Student ID mismatch: submission ${submission.payload.studentId}, registration ${registration.studentId}.`);
}
if (registration.studentName && submission.payload?.studentName && registration.studentName !== submission.payload.studentName) {
  errors.push(`Student name mismatch: submission ${submission.payload.studentName}, registration ${registration.studentName}.`);
}

const leakedAnswerFields = Array.isArray(submission.payload?.items)
  ? submission.payload.items.some((item) =>
      Object.prototype.hasOwnProperty.call(item, 'correctChoiceId')
      || Object.prototype.hasOwnProperty.call(item, 'modelAnswer')
      || Object.prototype.hasOwnProperty.call(item, 'feedback')
      || Object.prototype.hasOwnProperty.call(item, 'rubric'),
    )
  : false;
if (leakedAnswerFields) {
  errors.push('Submitted payload contains answer-key or feedback fields. Re-export with the v2 submitted-assessment flow.');
}

const responseHasCorrectness = Array.isArray(submission.payload?.responses)
  ? submission.payload.responses.some((response) =>
      Object.prototype.hasOwnProperty.call(response, 'checked')
      || Object.prototype.hasOwnProperty.call(response, 'correct'),
    )
  : false;
if (responseHasCorrectness) {
  errors.push('Submitted responses contain practice-check fields. Re-export with the v2 submitted-assessment flow.');
}

const canonicalPayload = canonicalize(submission.payload);
const payloadHash = await sha256Hex(canonicalPayload);
if (payloadHash !== submission.payloadHash) {
  errors.push(`Payload hash mismatch: calculated ${payloadHash}, submission ${submission.payloadHash}.`);
}

let signatureOk = false;
try {
  const publicKey = await webcrypto.subtle.importKey(
    'jwk',
    submission.publicKeyJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify'],
  );
  signatureOk = await webcrypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    publicKey,
    base64UrlToArrayBuffer(submission.signature),
    new TextEncoder().encode(canonicalPayload),
  );
  if (!signatureOk) errors.push('ECDSA signature did not verify.');
} catch (error) {
  errors.push(`Signature verification failed: ${error instanceof Error ? error.message : String(error)}`);
}

if (errors.length) {
  console.error('MOexplainer verification: FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('MOexplainer verification: OK');
console.log(`Student: ${submission.payload.studentName || '(blank)'} (${submission.payload.studentId || 'no id'})`);
console.log(`Lesson: ${submission.payload.lessonNumber}. ${submission.payload.lessonTitle}`);
console.log(`Section: ${submission.payload.sectionTitle}`);
console.log(`Exported: ${submission.payload.exportedAt}`);
console.log(`Machine ID: ${submission.machineId}`);
console.log(`Responses completed: ${submission.payload.responseCount.answered}/${submission.payload.responseCount.possible}`);
console.log('Answer keys/model answers/feedback/rubrics were not present in the submitted payload.');
