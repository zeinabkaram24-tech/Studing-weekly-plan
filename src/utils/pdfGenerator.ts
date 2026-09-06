import { jsPDF } from 'jspdf';
import { MaterialItem } from '../types';

/**
 * Generate a clean, authentic Nile Egyptian International School PDF worksheet
 * when the user has not uploaded a raw custom PDF file.
 */
export function generateSheetPdfBlob(item: MaterialItem): Blob {
  // If item already has a base64 or blob URL, convert or return directly
  if (item.fileUrl && item.fileUrl.startsWith('data:application/pdf')) {
    const byteCharacters = atob(item.fileUrl.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'application/pdf' });
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totalPages = Math.min(Math.max(item.pageCount || 2, 1), 20);
  const pageRangeText = item.pageRange || (item.pageCount ? `Pages 1 to ${item.pageCount}` : 'Worksheet');

  // Extract start and end page numbers if available (e.g. "4-12" or "13-25")
  let startPageNum = 1;
  const match = item.title.match(/(\d+)\s*[-–—]\s*(\d+)/) || pageRangeText.match(/(\d+)\s*[-–—]\s*(\d+)/);
  if (match) {
    startPageNum = parseInt(match[1], 10);
  }

  for (let p = 0; p < totalPages; p++) {
    if (p > 0) {
      doc.addPage();
    }

    const currentBookPage = startPageNum + p;

    // --- Header Banner ---
    doc.setFillColor(30, 58, 138); // Dark Nile Blue
    doc.rect(10, 10, 190, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('NILE EGYPTIAN INTERNATIONAL SCHOOLS - MINIA BRANCH', 105, 17, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Grade 2 - Primary Stage - Academic Year 2026/2027', 105, 23, { align: 'center' });

    // --- Sheet Sub-Header ---
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(10, 31, 190, 16, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(10, 31, 190, 16, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Subject: ${item.subjectId.toUpperCase()}`, 15, 38);
    doc.text(`Block: ${item.blockNumber}`, 85, 38);
    doc.text(`Sheet: ${item.title}`, 125, 38);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Category: ${item.categoryLabel || item.category}`, 15, 44);
    doc.text(`Official Page: ${currentBookPage} (Sheet Page ${p + 1} of ${totalPages})`, 125, 44);

    // --- Student Info Line ---
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Name: _____________________________________   Class: 2___   Date: ____/____/2026', 15, 54);

    // --- Main Worksheet Grid / Exercise Area ---
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);

    // Exercise Box 1
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 60, 180, 52, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 58, 138);
    doc.text(`Exercise 1 - (Book Page ${currentBookPage})`, 20, 67);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const exerciseText1 = item.contentPreview?.items?.[p * 2] ||
      `Answer the questions according to the class lesson for Page ${currentBookPage}. Read carefully and write neatly.`;
    doc.text(doc.splitTextToSize(exerciseText1, 170), 20, 74);

    // Answer lines for exercise 1
    for (let l = 0; l < 3; l++) {
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 88 + l * 7, 185, 88 + l * 7);
    }

    // Exercise Box 2
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 118, 180, 56, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 58, 138);
    doc.text(`Exercise 2 - Practice & Investigation`, 20, 125);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const exerciseText2 = item.contentPreview?.items?.[p * 2 + 1] ||
      'Complete the following activity and discuss your findings with your teacher.';
    doc.text(doc.splitTextToSize(exerciseText2, 170), 20, 132);

    for (let l = 0; l < 3; l++) {
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 146 + l * 7, 185, 146 + l * 7);
    }

    // Exercise Box 3 (Notes / Student Work)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 180, 180, 85, 2, 2, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Student Notes & Problem Solving Space:', 20, 188);

    // Grid lines for drawing/writing
    for (let l = 0; l < 9; l++) {
      doc.setDrawColor(241, 245, 249);
      doc.line(20, 196 + l * 7, 185, 196 + l * 7);
    }

    // --- Footer ---
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Nile Egyptian International Schools • Official Study Materials', 15, 282);
    doc.text(`Page ${p + 1} of ${totalPages} (Book P. ${currentBookPage})`, 195, 282, { align: 'right' });
  }

  return doc.output('blob');
}

/**
 * Get a direct URL for the PDF (uses fileUrl if provided, or generates genuine PDF Blob URL)
 */
export function getMaterialPdfUrl(item: MaterialItem): string {
  if (item.fileUrl && !item.fileUrl.startsWith('data:text/')) {
    return item.fileUrl;
  }
  const blob = generateSheetPdfBlob(item);
  return URL.createObjectURL(blob);
}

/**
 * Download sheet as real PDF directly
 */
export function downloadMaterialPdf(item: MaterialItem): void {
  const url = getMaterialPdfUrl(item);
  const link = document.createElement('a');
  link.href = url;
  const safeName = (item.fileName || `${item.title}`).replace(/\.[^/.]+$/, '');
  link.download = `${safeName}.pdf`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
}

/**
 * Print sheet directly from PDF
 */
export function printMaterialPdf(item: MaterialItem): void {
  const url = getMaterialPdfUrl(item);

  // If it's a direct URL or blob URL, create a hidden printing iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = url;

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      // Fallback: open in new window and print
      const win = window.open(url, '_blank');
      if (win) {
        win.focus();
        win.print();
      }
    }
  };

  document.body.appendChild(iframe);
  setTimeout(() => {
    try {
      document.body.removeChild(iframe);
    } catch {
      // ignore
    }
  }, 60000);
}
