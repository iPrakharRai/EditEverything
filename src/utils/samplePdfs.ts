import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generateSamplePdfBytesAsync(type: 'contract' | 'invoice' | 'report' | 'form' | 'dark-mode'): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  if (type === 'contract') {
    // 2-page NDA Agreement
    const page1 = doc.addPage([595.28, 841.89]);
    page1.drawText('NON-DISCLOSURE AGREEMENT (NDA)', {
      x: 50,
      y: 770,
      size: 20,
      font: fontBold,
      color: rgb(0.12, 0.16, 0.22),
    });
    page1.drawLine({
      start: { x: 50, y: 755 },
      end: { x: 545, y: 755 },
      thickness: 1.5,
      color: rgb(0.18, 0.8, 0.44),
    });

    const bodyText1 = [
      'This Non-Disclosure Agreement (the "Agreement") is entered into as of November 22, 2026.',
      'PARTIES: Global Tech Solutions Inc. ("Disclosing Party") and Strategic Partner ("Recipient").',
      '',
      '1. Confidential Information:',
      'All business plans, financial records, algorithms, customer databases, and software',
      'source code shared between parties shall be deemed strictly proprietary and confidential.',
      '',
      '2. Obligations of Recipient:',
      'The Recipient shall maintain confidential information in utmost secrecy and shall not disclose',
      'or disseminate any proprietary data to third parties without prior written consent.',
      '',
      '3. Term and Termination:',
      'This confidentiality obligation shall remain in effect for three (3) years from execution.',
      '',
      'IN WITNESS WHEREOF, the parties hereto have executed this Agreement.',
      'Authorized Signature: _______________________      Date: 2026-11-22',
    ];

    let yOffset = 720;
    for (const line of bodyText1) {
      page1.drawText(line, {
        x: 50,
        y: yOffset,
        size: 11,
        font: line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('PARTIES') ? fontBold : fontRegular,
        color: rgb(0.2, 0.25, 0.3),
      });
      yOffset -= 22;
    }

    page1.drawText('Page 1 of 2 - Confidential NDA', {
      x: 230,
      y: 35,
      size: 9,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Page 2
    const page2 = doc.addPage([595.28, 841.89]);
    page2.drawText('ARBITRATION AND GOVERNING LAW', {
      x: 50,
      y: 770,
      size: 18,
      font: fontBold,
      color: rgb(0.12, 0.16, 0.22),
    });
    page2.drawLine({
      start: { x: 50, y: 755 },
      end: { x: 545, y: 755 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    const bodyText2 = [
      '4. Remedies for Breach:',
      'Any violation of this Agreement may result in irreparable harm for which monetary damages',
      'alone would be insufficient. The Disclosing Party may seek injunctive relief.',
      '',
      '5. Dispute Resolution:',
      'Any controversy arising from or relating to this Agreement shall be resolved via binding',
      'arbitration in accordance with Commercial Arbitration Rules.',
      '',
      '6. Final Acknowledgement:',
      'Both parties have reviewed and agreed to all provisions and clauses outlined herein.',
      '',
      'Acknowledged by Recipient:',
      'Signature: _______________________          Printed Name: John Doe',
    ];

    yOffset = 720;
    for (const line of bodyText2) {
      page2.drawText(line, {
        x: 50,
        y: yOffset,
        size: 11,
        font: fontRegular,
        color: rgb(0.2, 0.25, 0.3),
      });
      yOffset -= 24;
    }

    page2.drawText('Page 2 of 2 - End of Agreement', {
      x: 230,
      y: 35,
      size: 9,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

  } else if (type === 'invoice') {
    // Commercial Invoice
    const page = doc.addPage([595.28, 841.89]);
    page.drawText('COMMERCIAL INVOICE', {
      x: 50,
      y: 770,
      size: 22,
      font: fontBold,
      color: rgb(0.08, 0.4, 0.2),
    });

    page.drawText('Invoice No: #INV-2026-8819\nDate: November 22, 2026\nDue Date: Upon Receipt', {
      x: 370,
      y: 770,
      size: 10,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.4),
      lineHeight: 16,
    });

    page.drawText('Billed To:\nAcme Corporation Global\n100 Enterprise Way, Suite 400\ncontact@acmeglobal.com', {
      x: 50,
      y: 700,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
      lineHeight: 15,
    });

    // Table Header
    page.drawRectangle({
      x: 50,
      y: 610,
      width: 495,
      height: 25,
      color: rgb(0.95, 0.96, 0.98),
    });
    page.drawText('Description                                             Qty       Rate           Amount', {
      x: 60,
      y: 618,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    const items = [
      '1. Cloud Infrastructure Deployment             1         $1,500.00     $1,500.00',
      '2. PDF Workflow Suite Integration              1         $2,200.00     $2,200.00',
      '3. Enterprise Security & Pen-Testing           1         $1,800.00     $1,800.00',
    ];

    let itemY = 580;
    for (const item of items) {
      page.drawText(item, {
        x: 60,
        y: itemY,
        size: 10,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      });
      itemY -= 25;
    }

    page.drawLine({
      start: { x: 50, y: 500 },
      end: { x: 545, y: 500 },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    });

    page.drawText('Total Amount Due:  $5,500.00 USD', {
      x: 340,
      y: 470,
      size: 13,
      font: fontBold,
      color: rgb(0.08, 0.4, 0.2),
    });

    page.drawText('Payment Terms: Remit wire transfer within 30 days of receipt.\nThank you for choosing our services!', {
      x: 50,
      y: 400,
      size: 10,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
      lineHeight: 16,
    });

  } else if (type === 'report') {
    // 3-page Executive Report
    for (let i = 1; i <= 3; i++) {
      const page = doc.addPage([595.28, 841.89]);
      page.drawText(`Q4 EXECUTIVE PERFORMANCE SUMMARY - PART ${i}`, {
        x: 50,
        y: 770,
        size: 18,
        font: fontBold,
        color: rgb(0.1, 0.15, 0.3),
      });
      page.drawLine({
        start: { x: 50, y: 750 },
        end: { x: 545, y: 750 },
        thickness: 1,
        color: rgb(0.3, 0.4, 0.8),
      });

      page.drawText(`Section ${i}.0 - Operational Velocity & Results\n\nQuarterly throughput exceeded targets by 24.5%. Client satisfaction metrics maintained an average rating of 4.9 out of 5 stars across all document conversion endpoints.\n\nAll automated workflows, security controls, and client-side processing benchmarks have satisfied high availability criteria.`, {
        x: 50,
        y: 710,
        size: 11,
        font: fontRegular,
        color: rgb(0.25, 0.25, 0.3),
        lineHeight: 18,
      });

      page.drawText(`Report Page ${i} of 3`, {
        x: 250,
        y: 35,
        size: 9,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
  } else if (type === 'form') {
    // Application Form
    const page = doc.addPage([595.28, 841.89]);
    page.drawText('EMPLOYMENT APPLICATION FORM', {
      x: 50,
      y: 770,
      size: 20,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.2),
    });

    const formFields = [
      'Full Legal Name:   [ John Doe                                            ]',
      'Email Address:     [ john.doe@example.com                                ]',
      'Telephone Number:  [ +1 (555) 019-2834                                   ]',
      'Position Applied:  [ Senior Frontend Engineer - PDF Solutions             ]',
      '',
      'Eligibility Verification:',
      '[ X ] Legally authorized to work in jurisdiction',
      '[   ] Require sponsorship currently or in the future',
      '',
      'Applicant Declaration & Consent:',
      'I hereby declare that all information presented in this record is accurate and valid.',
      '',
      'Applicant Signature: _______________________      Date: 2026-11-22',
    ];

    let fy = 720;
    for (const line of formFields) {
      page.drawText(line, {
        x: 50,
        y: fy,
        size: 11,
        font: line.includes('Verification') || line.includes('Declaration') ? fontBold : fontRegular,
        color: rgb(0.2, 0.2, 0.2),
      });
      fy -= 25;
    }
  } else if (type === 'dark-mode') {
    // Dark mode PDF with black background & white text
    const page1 = doc.addPage([595.28, 841.89]);
    // Draw pure dark background
    page1.drawRectangle({
      x: 0,
      y: 0,
      width: 595.28,
      height: 841.89,
      color: rgb(0.08, 0.1, 0.14),
    });

    page1.drawText('DARK MODE DOCUMENT (BLACK BACKGROUND)', {
      x: 50,
      y: 770,
      size: 18,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page1.drawText('Sample Document to Test Invert & Background Cleaning', {
      x: 50,
      y: 746,
      size: 11,
      font: fontBold,
      color: rgb(0, 0.85, 0.95),
    });

    page1.drawLine({
      start: { x: 50, y: 735 },
      end: { x: 545, y: 735 },
      thickness: 1.5,
      color: rgb(0.2, 0.3, 0.4),
    });

    const bodyText = [
      'Problem with Dark Mode PDFs:',
      'Dark mode presentations and e-books look stylish on screens, but when printed,',
      'they waste massive amounts of black ink, cause smearing, and are unreadable.',
      '',
      'How EditEverything Invert & Clean Works:',
      '1. It accurately analyzes the luminance of every element and background pixel.',
      '2. The dark or black background is cleanly converted into pure white (255, 255, 255).',
      '3. All white, silver, or light-colored text is inverted to crisp, dark black text.',
      '4. Color charts, diagrams, and accents are preserved with high-contrast visibility.',
      '',
      'Summary of Benefits:',
      '• Saves over 90% printer toner and cartridge ink.',
      '• Makes dark mode PDFs comfortable to read on paper and in direct sunlight.',
      '• Works 100% locally in your browser with zero data leakage or upload latency.',
      '',
      'Date Generated: November 24, 2026 | Document ID: DARK-INV-9942',
    ];

    let yOffset = 690;
    for (const line of bodyText) {
      page1.drawText(line, {
        x: 50,
        y: yOffset,
        size: 11,
        font: line.startsWith('Problem') || line.startsWith('How') || line.startsWith('Summary') ? fontBold : fontRegular,
        color: line.startsWith('•') ? rgb(0.4, 0.85, 0.95) : rgb(0.9, 0.92, 0.95),
      });
      yOffset -= 24;
    }

    page1.drawText('Page 1 of 1 — Dark Background Source Document', {
      x: 180,
      y: 40,
      size: 9,
      font: fontRegular,
      color: rgb(0.6, 0.65, 0.7),
    });
  }

  return await doc.save();
}

// Synchronous wrapper cache
let cachedPdfs: Record<string, Uint8Array> = {};

export function generateSamplePdfBytes(type: 'contract' | 'invoice' | 'report' | 'form' | 'dark-mode'): Uint8Array {
  if (cachedPdfs[type]) {
    return cachedPdfs[type];
  }
  // If not yet generated asynchronously, fallback to initial generation
  generateSamplePdfBytesAsync(type).then(bytes => {
    cachedPdfs[type] = bytes;
  });
  // Fallback valid minimal PDF bytes
  return new Uint8Array([
    0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xd0, 0xd4, 0xc5, 0xd8, 0x0a,
    ...new TextEncoder().encode(
      "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
      "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n" +
      "4 0 obj\n<< /Length 55 >>\nstream\nBT /F1 20 Tf 50 750 Td (Sample Document - Ready to Edit) Tj ET\nendstream\nendobj\n" +
      "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n" +
      "xref\n0 6\n0000000000 65535 f \n0000000015 00000 n \n0000000060 00000 n \n0000000111 00000 n \n0000000223 00000 n \n0000000328 00000 n \n" +
      "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n405\n%%EOF\n"
    )
  ]);
}

// Pre-warm cache immediately
if (typeof window !== 'undefined') {
  ['contract', 'invoice', 'report', 'form'].forEach(t => {
    generateSamplePdfBytesAsync(t as any).then(b => {
      cachedPdfs[t] = b;
    });
  });
}
