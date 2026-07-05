import { compactJson } from './cryptoText';
import type { MachineRegistration, SealedAssessmentSubmission } from './types';

function sanitizePdfText(value: string): string {
  return value
    .replace(/ψ/g, 'psi')
    .replace(/Ψ/g, 'Psi')
    .replace(/φ/g, 'phi')
    .replace(/Φ/g, 'Phi')
    .replace(/π/g, 'pi')
    .replace(/Π/g, 'Pi')
    .replace(/σ/g, 'sigma')
    .replace(/Σ/g, 'Sigma')
    .replace(/ρ/g, 'rho')
    .replace(/Δ/g, 'Delta')
    .replace(/²/g, '^2')
    .replace(/⁺/g, '+')
    .replace(/⁻/g, '-')
    .replace(/−/g, '-')
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E]/g, '?');
}

function escapePdfText(value: string): string {
  return sanitizePdfText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapLine(line: string, maxLength = 92): string[] {
  const sanitized = sanitizePdfText(line).trimEnd();
  if (sanitized.length <= maxLength) return [sanitized];
  const words = sanitized.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (`${current} ${word}`.length <= maxLength) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function makePdfBlob(title: string, rawLines: string[]): Blob {
  const lines = rawLines.flatMap((line) => wrapLine(line));
  const pages: string[][] = [];
  const linesPerPage = 55;
  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }
  if (pages.length === 0) pages.push(['']);

  const objects: string[] = [];
  const addObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const fontObject = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const contentObjectNumbers: number[] = [];
  const pageObjectNumbers: number[] = [];

  for (const [pageIndex, pageLines] of pages.entries()) {
    const streamLines = [
      'BT',
      '/F1 10 Tf',
      '46 770 Td',
      '14 TL',
      `(${escapePdfText(title)} - page ${pageIndex + 1} of ${pages.length}) Tj`,
      'T*',
      'T*',
      ...pageLines.map((line) => `(${escapePdfText(line)}) Tj T*`),
      'ET',
    ];
    const stream = streamLines.join('\n');
    contentObjectNumbers.push(addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`));
    pageObjectNumbers.push(0);
  }

  const pagesObjectNumber = objects.length + 1;
  for (let index = 0; index < pages.length; index += 1) {
    pageObjectNumbers[index] = addObject(
      `<< /Type /Page /Parent ${pagesObjectNumber} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObject} 0 R >> >> /Contents ${contentObjectNumbers[index]} 0 R >>`,
    );
  }
  const actualPagesObject = addObject(
    `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(' ')}] /Count ${pages.length} >>`,
  );

  for (const pageObjectNumber of pageObjectNumbers) {
    objects[pageObjectNumber - 1] = objects[pageObjectNumber - 1].replace(
      `/Parent ${pagesObjectNumber} 0 R`,
      `/Parent ${actualPagesObject} 0 R`,
    );
  }

  const catalogObject = addObject(`<< /Type /Catalog /Pages ${actualPagesObject} 0 R >>`);
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObject} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function timestampForFilename(iso: string): string {
  return iso.replace(/[:.]/g, '-').replace('T', '_').replace('Z', 'Z');
}

export function downloadJsonFile(value: unknown, filename: string): void {
  const blob = new Blob([compactJson(value)], { type: 'application/json' });
  downloadBlob(blob, filename);
}

export function assessmentPdfLines(submission: SealedAssessmentSubmission): string[] {
  const { payload } = submission;
  const lines: string[] = [
    'MOexplainer submitted assessment export',
    `Student: ${payload.studentName || '(blank)'}`,
    `Student ID: ${payload.studentId || '(blank)'}`,
    `Lesson: ${payload.lessonNumber}. ${payload.lessonTitle}`,
    `Section: ${payload.sectionTitle}`,
    `Exported at: ${payload.exportedAt}`,
    `Machine ID: ${submission.machineId}`,
    `Machine key created: ${submission.machineCreatedAt}`,
    `Device hint hash: ${payload.deviceHintHash}`,
    `Payload SHA-256: ${submission.payloadHash}`,
    `Signature algorithm: ${submission.signatureAlgorithm}`,
    `Signature: ${submission.signature}`,
    '',
    'Verification note:',
    'This PDF is paired with the .moe.json file downloaded at the same time. Verify the JSON against the registered machine key before accepting the PDF as unmodified. The submitted JSON is the signed source of truth.',
    '',
    'Assessment note:',
    'This submitted export intentionally omits answer keys, model answers, feedback, rubrics, and client-side scores.',
    '',
    `Interaction summary: ${payload.interactionSummary}`,
    `Responses completed: ${payload.responseCount.answered}/${payload.responseCount.possible}`,
    '',
  ];

  payload.items.forEach((item, index) => {
    const response = payload.responses.find((entry) => entry.itemId === item.id);
    lines.push(`Item ${index + 1}: ${item.prompt}`);
    lines.push(`Target: ${item.target}`);
    if (item.choices?.length) {
      lines.push(`Choices: ${item.choices.map((choice) => `${choice.id}) ${choice.text}`).join(' | ')}`);
    }
    if (response?.choiceId) lines.push(`Selected choice: ${response.choiceId}`);
    lines.push(`Student response: ${response?.freeResponse || '(blank)'}`);
    lines.push(`Confidence: ${response?.confidence ?? '(blank)'}`);
    lines.push('');
  });

  lines.push('End of submitted assessment export.');
  return lines;
}

export function registrationPdfLines(registration: MachineRegistration): string[] {
  return [
    'MOexplainer machine registration',
    `Student: ${registration.studentName || '(blank)'}`,
    `Student ID: ${registration.studentId || '(blank)'}`,
    `Machine ID: ${registration.machineId}`,
    `Machine key created: ${registration.machineCreatedAt}`,
    `Device hint hash: ${registration.deviceHintHash}`,
    `Registration exported at: ${registration.exportedAt}`,
    '',
    'Instructor use:',
    'Collect this registration before the assessment window. Later assessment submissions should show the same student ID, machine ID, and public key.',
    '',
    `Public key JWK: ${JSON.stringify(registration.publicKeyJwk)}`,
  ];
}

export function downloadAssessmentPdf(submission: SealedAssessmentSubmission): void {
  const filenameBase = `MOexplainer_${submission.payload.lessonId}_${submission.payload.sectionId}_${timestampForFilename(submission.payload.exportedAt)}`;
  const blob = makePdfBlob('MOexplainer submitted assessment', assessmentPdfLines(submission));
  downloadBlob(blob, `${filenameBase}.pdf`);
  downloadJsonFile(submission, `${filenameBase}.moe.json`);
}

export function downloadRegistrationPdfAndJson(registration: MachineRegistration): void {
  const filenameBase = `MOexplainer_machine_registration_${registration.studentId || 'student'}_${timestampForFilename(registration.exportedAt)}`;
  const blob = makePdfBlob('MOexplainer machine registration', registrationPdfLines(registration));
  downloadBlob(blob, `${filenameBase}.pdf`);
  downloadJsonFile(registration, `${filenameBase}.moe.json`);
}
