import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { jsPDF } from 'jspdf';
import type { LearnerProfile, ScriptState } from '../types';

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sanitizeFilename(name: string): string {
  return (name || 'Aprendiz_SENA')
    .trim()
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const PART2_SECTIONS: Array<{ key: keyof ScriptState['part2']; title: string }> = [
  { key: 'journey', title: '1. MY ACADEMIC JOURNEY' },
  { key: 'whyProgram', title: '2. WHY I CHOSE MY TRAINING PROGRAM' },
  { key: 'skillsAndKnowledge', title: '3. SKILLS AND KNOWLEDGE' },
  { key: 'futurePlans', title: '4. MY FUTURE PLANS AND PROFESSIONAL GOALS' },
  { key: 'professionalFuture', title: '5. MY PROFESSIONAL FUTURE' },
  { key: 'challengesAndSolutions', title: '6. CHALLENGES AND SOLUTIONS' },
];

export async function exportScriptToDocx(profile: LearnerProfile, script: ScriptState): Promise<void> {
  const metaRows = [
    ['Activity / Evidencia', profile.activityName || 'GA3-240202501-AA2-EV02 – AUDIO'],
    ['Learner / Aprendiz', profile.fullName || 'Not specified'],
    ['Identification (ID)', profile.idNumber || 'Not specified'],
    ['Training Group (Ficha)', profile.trainingGroup || 'Not specified'],
    ['Instructor', profile.instructorName || 'Not specified'],
    ...(profile.trainingProgram ? [['Training Program', profile.trainingProgram]] : []),
  ];

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: metaRows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: 'F1F5F9' },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              },
              children: [
                new Paragraph({
                  spacing: { before: 80, after: 80 },
                  children: [new TextRun({ text: label, bold: true, size: 20, color: '0F172A' })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              },
              children: [
                new Paragraph({
                  spacing: { before: 80, after: 80 },
                  children: [new TextRun({ text: value, size: 20, color: '1E293B' })],
                }),
              ],
            }),
          ],
        })
    ),
  });

  const children: Array<Paragraph | Table> = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: 'SENA — ENGLISH AUDIO PRESENTATION SCRIPT',
          bold: true,
          size: 28,
          color: '0F172A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [
        new TextRun({
          text: profile.activityName || 'GA3-240202501-AA2-EV02 – AUDIO',
          bold: true,
          size: 22,
          color: '0284C7',
        }),
      ],
    }),
    table,
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 320, after: 120 },
      children: [
        new TextRun({
          text: 'PART 1 – PERSONAL INTRODUCTION',
          bold: true,
          size: 24,
          color: '0F172A',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 240, line: 340 },
      children: [new TextRun({ text: script.part1.trim() || 'Not completed yet.', size: 22, color: '1E293B' })],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 140 },
      children: [
        new TextRun({
          text: 'PART 2 – ACADEMIC AND PROFESSIONAL REFLECTION',
          bold: true,
          size: 24,
          color: '0F172A',
        }),
      ],
    }),
  ];

  for (const sec of PART2_SECTIONS) {
    children.push(
      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [
          new TextRun({
            text: sec.title,
            bold: true,
            size: 22,
            color: '0369A1',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 160, line: 340 },
        children: [
          new TextRun({
            text: script.part2[sec.key]?.trim() || 'Not completed yet.',
            size: 22,
            color: '1E293B',
          }),
        ],
      })
    );
  }

  if (script.conclusion?.trim()) {
    children.push(
      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [
          new TextRun({
            text: 'CONCLUSION',
            bold: true,
            size: 22,
            color: '059669',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 160, line: 340 },
        children: [
          new TextRun({
            text: script.conclusion.trim(),
            size: 22,
            color: '1E293B',
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `Guion_GA3-240202501-AA2-EV02_${sanitizeFilename(profile.fullName)}.docx`);
}

export function exportScriptToPdf(profile: LearnerProfile, script: ScriptState): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 52;
  const maxWidth = pageWidth - margin * 2;
  let y = 56;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 54) {
      doc.addPage();
      y = 54;
    }
  };

  // Header band
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y - 24, maxWidth, 56, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SENA — ENGLISH AUDIO PRESENTATION SCRIPT', margin + 16, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(125, 211, 252);
  doc.text(profile.activityName || 'GA3-240202501-AA2-EV02 – AUDIO', margin + 16, y + 18);

  y += 52;

  // Metadata card
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  const metaLines = [
    `Learner: ${profile.fullName || 'N/A'}   |   ID: ${profile.idNumber || 'N/A'}`,
    `Training Group (Ficha): ${profile.trainingGroup || 'N/A'}   |   Instructor: ${profile.instructorName || 'N/A'}`,
    ...(profile.trainingProgram ? [`Program: ${profile.trainingProgram}`] : []),
  ];
  const boxHeight = metaLines.length * 16 + 18;
  doc.rect(margin, y, maxWidth, boxHeight, 'FD');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  metaLines.forEach((line, i) => {
    doc.text(line, margin + 12, y + 18 + i * 16);
  });
  y += boxHeight + 26;

  // Part 1
  ensureSpace(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('PART 1 – PERSONAL INTRODUCTION', margin, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  const part1Lines = doc.splitTextToSize(script.part1.trim() || 'Not completed yet.', maxWidth);
  for (const line of part1Lines) {
    ensureSpace(18);
    doc.text(line, margin, y);
    y += 16;
  }

  y += 18;
  ensureSpace(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('PART 2 – ACADEMIC AND PROFESSIONAL REFLECTION', margin, y);
  y += 22;

  for (const sec of PART2_SECTIONS) {
    ensureSpace(44);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(3, 105, 161);
    doc.text(sec.title, margin, y);
    y += 16;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(script.part2[sec.key]?.trim() || 'Not completed yet.', maxWidth);
    for (const line of lines) {
      ensureSpace(16);
      doc.text(line, margin, y);
      y += 15;
    }
    y += 12;
  }

  if (script.conclusion?.trim()) {
    ensureSpace(44);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(5, 150, 105);
    doc.text('CONCLUSION', margin, y);
    y += 16;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(script.conclusion.trim(), maxWidth);
    for (const line of lines) {
      ensureSpace(16);
      doc.text(line, margin, y);
      y += 15;
    }
  }

  doc.save(`Guion_GA3-240202501-AA2-EV02_${sanitizeFilename(profile.fullName)}.pdf`);
}
