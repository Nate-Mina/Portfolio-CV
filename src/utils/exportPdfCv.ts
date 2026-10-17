import jsPDF from 'jspdf';
import { profileData } from '../data/profileData';

/**
 * Generates and downloads a clean, executive-formatted PDF Curriculum Vitae / Resume
 * for Nathaniel (Nate) K. Mina using jsPDF.
 */
export const exportCvPdf = (): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter', // 215.9 x 279.4 mm
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Color Palette
  const brandDark = [15, 23, 42]; // Slate 900
  const brandAccent = [16, 185, 129]; // Emerald 500
  const brandBlue = [14, 116, 144]; // Cyan 700
  const textDark = [30, 41, 59]; // Slate 800
  const textMuted = [100, 116, 139]; // Slate 500
  const lightBg = [248, 250, 252]; // Slate 50
  const ruleColor = [226, 232, 240]; // Slate 200

  // Helper to ensure vertical room or create a new page
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 8) {
      doc.addPage();
      y = margin;
      drawPageDecorations();
    }
  };

  const drawPageDecorations = () => {
    // Subtle top accent line
    doc.setFillColor(brandAccent[0], brandAccent[1], brandAccent[2]);
    doc.rect(margin, 6, contentWidth, 0.8, 'F');
  };

  drawPageDecorations();

  // ==========================================
  // HEADER SECTION
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
  doc.text('NATHANIEL (NATE) K. MINA', margin, y + 6);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(brandAccent[0], brandAccent[1], brandAccent[2]);
  doc.text(
    'CEO & MECHANICAL ENGINEER | MARINE IT & FIBER INFRASTRUCTURE | SYSTEMS ARCHITECT',
    margin,
    y + 2
  );
  y += 6;

  // Contact Info Subheader
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const contactLine1 = `Location: ${profileData.location}  |  Phone: ${profileData.phone}  |  Website: https://www.PureComp.Net`;
  doc.text(contactLine1, margin, y + 2);
  y += 4.5;

  const contactLine2 = `Emails: ${profileData.emails.join('  •  ')}`;
  doc.text(contactLine2, margin, y + 2);
  y += 7;

  // Divider Rule
  doc.setDrawColor(ruleColor[0], ruleColor[1], ruleColor[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  // Section Header Helper
  const drawSectionHeading = (title: string) => {
    checkPageBreak(12);
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(margin, y, contentWidth, 6.5, 1, 1, 'F');

    doc.setFillColor(brandAccent[0], brandAccent[1], brandAccent[2]);
    doc.rect(margin, y, 2.5, 6.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
    doc.text(title.toUpperCase(), margin + 5, y + 4.5);
    y += 9;
  };

  // ==========================================
  // EXECUTIVE SUMMARY
  // ==========================================
  drawSectionHeading('Executive Summary & Systems Philosophy');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  const summaryLines = doc.splitTextToSize(
    `${profileData.bioSummary} ${profileData.missionStatement}`,
    contentWidth
  );
  checkPageBreak(summaryLines.length * 4);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 3.8 + 4;

  // ==========================================
  // CORE COMPETENCIES & TECHNICAL TOOLING
  // ==========================================
  drawSectionHeading('Core Competencies & Technical Stack');

  profileData.techStack.forEach((stack) => {
    checkPageBreak(9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    doc.text(`•  ${stack.domain}:`, margin + 2, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const techText = stack.technologies.join(', ');
    const domainWidth = doc.getTextWidth(`•  ${stack.domain}: `);
    const techLines = doc.splitTextToSize(techText, contentWidth - domainWidth - 4);

    if (techLines.length === 1) {
      doc.text(techLines[0], margin + 2 + domainWidth, y);
      y += 4.5;
    } else {
      doc.text(techLines[0], margin + 2 + domainWidth, y);
      y += 4;
      for (let i = 1; i < techLines.length; i++) {
        checkPageBreak(5);
        doc.text(techLines[i], margin + 6, y);
        y += 4;
      }
    }
  });
  y += 3;

  // ==========================================
  // PROFESSIONAL EXPERIENCE
  // ==========================================
  drawSectionHeading('Professional Experience');

  profileData.experience.forEach((job) => {
    checkPageBreak(18);

    // Role & Company Row
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
    doc.text(job.role, margin, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(brandAccent[0], brandAccent[1], brandAccent[2]);
    const periodWidth = doc.getTextWidth(job.period);
    doc.text(job.period, margin + contentWidth - periodWidth, y);
    y += 4.2;

    // Company & Location
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`${job.company}  |  ${job.location}`, margin, y);
    y += 4.2;

    // Bullet points
    job.highlights.forEach((bullet) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);

      const bulletLines = doc.splitTextToSize(bullet, contentWidth - 6);
      checkPageBreak(bulletLines.length * 3.8 + 1);

      doc.setFillColor(brandAccent[0], brandAccent[1], brandAccent[2]);
      doc.circle(margin + 2, y - 0.9, 0.7, 'F');
      doc.text(bulletLines, margin + 5, y);
      y += bulletLines.length * 3.6 + 1.2;
    });

    y += 2.5;
  });

  // ==========================================
  // EDUCATION
  // ==========================================
  drawSectionHeading('Education & Academic Background');

  profileData.education.forEach((edu) => {
    checkPageBreak(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
    doc.text(edu.degree, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    const periodWidth = doc.getTextWidth(edu.period);
    doc.text(edu.period, margin + contentWidth - periodWidth, y);
    y += 4;

    doc.setFont('helvetica', 'italic');
    doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    doc.text(`${edu.institution} — ${edu.location}`, margin, y);
    y += 4;

    if (edu.details && edu.details.length > 0) {
      edu.details.forEach((detail) => {
        const detailLines = doc.splitTextToSize(detail, contentWidth - 6);
        checkPageBreak(detailLines.length * 3.8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(`- ${detailLines[0]}`, margin + 2, y);
        y += 3.6;
        for (let i = 1; i < detailLines.length; i++) {
          doc.text(detailLines[i], margin + 5, y);
          y += 3.6;
        }
      });
    }
    y += 2;
  });

  // ==========================================
  // CERTIFICATIONS & CREDENTIALS
  // ==========================================
  drawSectionHeading('Certifications & Credentials');

  profileData.certifications.forEach((cert) => {
    checkPageBreak(6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
    doc.text(`•  ${cert.name}`, margin + 2, y);

    if (cert.issuer) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      const certNameWidth = doc.getTextWidth(`•  ${cert.name}  `);
      doc.text(`— ${cert.issuer}`, margin + 2 + certNameWidth, y);
    }
    y += 4.5;
  });
  y += 2;

  // ==========================================
  // PROVEN METRICS & CASE STUDIES
  // ==========================================
  drawSectionHeading('Proven Metrics & Systems Case Studies');

  profileData.caseStudies.forEach((cs) => {
    checkPageBreak(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
    doc.text(`${cs.title} (${cs.category})`, margin, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(brandAccent[0], brandAccent[1], brandAccent[2]);
    const metricStr = `${cs.metricValue} [${cs.metricLabel}]`;
    const metricWidth = doc.getTextWidth(metricStr);
    doc.text(metricStr, margin + contentWidth - metricWidth, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const impactLines = doc.splitTextToSize(
      `${cs.description} Impact: ${cs.impactText}`,
      contentWidth - 4
    );
    doc.text(impactLines, margin + 2, y);
    y += impactLines.length * 3.5 + 2.5;
  });

  // ==========================================
  // FOOTER & PAGE NUMBERING
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Bottom divider line
    doc.setDrawColor(ruleColor[0], ruleColor[1], ruleColor[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - margin + 2, margin + contentWidth, pageHeight - margin + 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);

    const footerText = 'Nathaniel (Nate) K. Mina — Curriculum Vitae & Resume | Pure Computers (www.PureComp.Net)';
    doc.text(footerText, margin, pageHeight - margin + 6);

    const pageNumText = `Page ${i} of ${totalPages}`;
    const pageNumWidth = doc.getTextWidth(pageNumText);
    doc.text(pageNumText, margin + contentWidth - pageNumWidth, pageHeight - margin + 6);
  }

  // Trigger download
  doc.save('Nathaniel_Mina_CV_Resume.pdf');
};
