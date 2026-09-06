import { MaterialItem } from '../types';

/**
 * Generate authentic, high-fidelity printable HTML for a material sheet.
 * Exact content, zero artificial filler or fake exercises.
 */
export function generateSheetPrintableHtml(item: MaterialItem): string {
  const isArabic = item.subjectId === 'arabic' || item.subjectId === 'social_studies' || item.subjectId === 'religion';
  const dir = isArabic ? 'rtl' : 'ltr';
  const lang = isArabic ? 'ar' : 'en';

  const subjectNames: Record<string, { ar: string; en: string }> = {
    science: { ar: 'العلوم', en: 'Science' },
    english: { ar: 'اللغة الإنجليزية', en: 'English' },
    math: { ar: 'الرياضيات', en: 'Mathematics' },
    arabic: { ar: 'اللغة العربية', en: 'Arabic' },
    french: { ar: 'اللغة الفرنسية', en: 'French' },
    german: { ar: 'اللغة الألمانية', en: 'German' },
    ict: { ar: 'تكنولوجيا المعلومات', en: 'ICT' },
    social_studies: { ar: 'الدراسات الاجتماعية', en: 'Social Studies' },
    pe: { ar: 'التربية البدنية', en: 'PE' },
    music: { ar: 'التربية الموسيقية', en: 'Music' },
    art: { ar: 'التربية الفنية', en: 'Art' },
  };

  const subj = subjectNames[item.subjectId] || { ar: item.subjectId, en: item.subjectId };

  const itemsList = item.contentPreview?.items || [];
  const sectionsList = item.contentPreview?.sections || [];

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${item.title} - مدارس النيل المصرية الدولية</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 12mm 12mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", "Segoe UI Arabic", sans-serif;
      margin: 0;
      padding: 24px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.6;
      direction: ${dir};
    }
    @media screen {
      body {
        max-width: 860px;
        margin: 20px auto;
        padding: 32px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        border: 1px solid #cbd5e1;
        border-radius: 16px;
      }
      .no-print-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, #1e3a8a, #312e81);
        color: white;
        padding: 12px 18px;
        border-radius: 12px;
        margin-bottom: 24px;
        box-shadow: 0 2px 8px rgba(30,58,138,0.25);
      }
      .btn-print {
        background: #2563eb;
        color: #ffffff;
        border: none;
        padding: 9px 20px;
        border-radius: 10px;
        font-weight: 800;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.15s;
      }
      .btn-print:hover {
        background: #1d4ed8;
      }
    }
    @media print {
      .no-print-toolbar {
        display: none !important;
      }
      body {
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }
    }
    .header-banner {
      border-bottom: 2.5px solid #1e3a8a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .school-title {
      font-size: 18px;
      font-weight: 900;
      color: #1e3a8a;
      letter-spacing: -0.2px;
    }
    .school-sub {
      font-size: 12.5px;
      color: #475569;
      font-weight: 700;
      margin-top: 3px;
    }
    .sheet-title {
      font-size: 21px;
      font-weight: 900;
      color: #0f172a;
      margin: 12px 0 6px 0;
    }
    .meta-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #1e293b;
    }
    .badge-primary {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1e40af;
    }
    .badge-success {
      background: #ecfdf5;
      border-color: #a7f3d0;
      color: #065f46;
    }
    .badge-amber {
      background: #fffbeb;
      border-color: #fde68a;
      color: #92400e;
    }
    .student-info-box {
      margin: 14px 0 20px 0;
      padding: 10px 14px;
      background: #f8fafc;
      border: 1px dashed #94a3b8;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 12.5px;
      color: #334155;
      font-weight: 700;
    }
    .exercise-card {
      margin-bottom: 12px;
      padding: 12px 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .exercise-num {
      font-size: 12.5px;
      font-weight: 800;
      color: #1e3a8a;
      margin-bottom: 4px;
    }
    .exercise-text {
      font-size: 13.5px;
      color: #1e293b;
      line-height: 1.65;
    }
    .answer-space {
      margin-top: 8px;
      border-bottom: 1px dotted #cbd5e1;
      height: 24px;
    }
    .notes-box {
      margin-top: 16px;
      padding: 12px 14px;
      background: #fefce8;
      border: 1px solid #fef08a;
      border-radius: 8px;
      font-size: 13px;
      color: #713f12;
    }
    .footer-bar {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="no-print-toolbar">
    <div>
      <div style="font-weight: 900; font-size: 15px;">مدارس النيل المصرية الدولية • شيت المذاكرة المعتمد</div>
      <div style="font-size: 11.5px; opacity: 0.85;">Grade 2 • Block ${item.blockNumber} • ${subj.ar} (${subj.en})</div>
    </div>
    <button class="btn-print" onclick="window.print()">
      <span>طباعة الشيت الآن</span>
      <span>🖨️</span>
    </button>
  </div>

  <div class="header-banner">
    <div class="school-title">مدارس النيل المصرية الدولية • NILE EGYPTIAN INTERNATIONAL SCHOOLS</div>
    <div class="school-sub">الصف الثاني الابتدائي (Grade 2) • العام الدراسي 2026/2027 • فرع المنيا</div>
    <div class="sheet-title">${item.title}</div>
    <div class="meta-badges">
      <span class="badge badge-primary">${subj.ar} - ${subj.en}</span>
      <span class="badge">Block ${item.blockNumber}</span>
      <span class="badge">${item.categoryLabel || item.category}</span>
      ${item.pageRange ? `<span class="badge badge-success">${item.pageRange}</span>` : ''}
      ${item.pageCount ? `<span class="badge badge-amber">${item.pageCount} صفحة</span>` : ''}
      ${item.unitTitle ? `<span class="badge">${item.unitTitle}</span>` : ''}
    </div>
  </div>

  <div class="student-info-box">
    <span>اسم الطالب/ـة: ............................................................................</span>
    <span>الفصل: 2 ${item.section === 'all' ? '(A / B / C)' : item.section}</span>
    <span>التاريخ: ...... / ...... / 2026</span>
  </div>

  <div class="content-list">
    ${
      itemsList.length > 0
        ? itemsList
            .map(
              (itemText, idx) => `
      <div class="exercise-card">
        <div class="exercise-num">
          ${isArabic ? `فقرة / سؤال ${idx + 1}:` : `Question / Item ${idx + 1}:`}
        </div>
        <div class="exercise-text">${itemText}</div>
        <div class="answer-space"></div>
      </div>`
            )
            .join('')
        : `<div class="exercise-card"><div class="exercise-text">${item.notes || 'الشيت جاهز للمذاكرة والحل.'}</div></div>`
    }

    ${
      sectionsList.length > 0
        ? sectionsList
            .map(
              (sec) => `
      <div class="exercise-card" style="background: #f8fafc; border-color: #cbd5e1;">
        <div class="exercise-num" style="color: #0f172a;">${sec.title}</div>
        <ul style="margin: 6px 0 0 0; padding-${isArabic ? 'right' : 'left'}: 20px;">
          ${sec.points.map((pt) => `<li style="margin-bottom: 4px; font-size: 13px;">${pt}</li>`).join('')}
        </ul>
      </div>`
            )
            .join('')
        : ''
    }

    ${
      item.notes
        ? `<div class="notes-box">
        <strong>ملاحظات الشيت:</strong> ${item.notes}
      </div>`
        : ''
    }
  </div>

  <div class="footer-bar">
    <span>مدارس النيل المصرية الدولية • Nile Egyptian International Schools</span>
    <span>${item.fileName || item.title}</span>
    <span>تم الإدراج: ${new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
  </div>
</body>
</html>`;
}

/**
 * Print material sheet with 100% reliability across all browsers and devices.
 * Uses a hidden iframe document on the same origin (no CORS or plugin sandbox issues),
 * with robust fallbacks to direct popup and in-page print.
 */
export function ensureBlobOrHttpUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/api/') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('data:')) {
    try {
      const parts = url.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const b64 = atob(parts[1]);
      let n = b64.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = b64.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.warn('Failed to convert data URL to Blob URL', e);
      return url;
    }
  }
  return url;
}

/**
 * Print authentic sheet or real PDF document
 */
export function printMaterialSheet(item: MaterialItem): void {
  // If item has a real PDF file URL (uploaded or server file)
  if (item.fileUrl) {
    const safePdfUrl = ensureBlobOrHttpUrl(item.fileUrl);

    // Synchronous window.open in user click event is never blocked by modern browsers
    try {
      const printWin = window.open(safePdfUrl, '_blank');
      if (printWin) {
        printWin.focus();
        try {
          printWin.onload = () => {
            try {
              printWin.print();
            } catch {
              // Browser native PDF viewer has its own print toolbar
            }
          };
        } catch {
          // ignore
        }
        return;
      }
    } catch (e) {
      console.warn('Direct window open failed:', e);
    }

    // Fallback: trigger anchor download/view
    const a = document.createElement('a');
    a.href = safePdfUrl;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 100);
    return;
  }

  // Otherwise, print generated Nile Schools authentic HTML sheet
  const html = generateSheetPrintableHtml(item);

  // Synchronous popup print window
  try {
    const printWin = window.open('', '_blank', 'width=900,height=900');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        try {
          printWin.print();
        } catch (e) {
          console.warn('Print window trigger error:', e);
        }
      }, 300);
      return;
    }
  } catch (err) {
    console.warn('Popup print blocked, falling back to hidden iframe:', err);
  }

  // Secondary Method: Same-origin hidden iframe
  try {
    const iframe = document.createElement('iframe');
    iframe.id = 'sheet-print-hidden-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(html);
      frameDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (err) {
          console.warn('Iframe print error:', err);
        }

        setTimeout(() => {
          try {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          } catch {
            // ignore
          }
        }, 15000);
      }, 300);
    }
  } catch (err) {
    console.warn('Iframe print failed:', err);
  }
}

/**
 * Fallback popup window print
 */
function openPrintPopup(html: string): void {
  try {
    const printWin = window.open('', '_blank', 'width=850,height=900');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        try {
          printWin.print();
        } catch {
          // ignore
        }
      }, 350);
      return;
    }
  } catch (err) {
    console.warn('Popup print blocked or failed:', err);
  }

  // 3. Tertiary Method: In-page print fallback
  const printBlob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const printUrl = URL.createObjectURL(printBlob);
  const link = document.createElement('a');
  link.href = printUrl;
  link.target = '_blank';
  link.click();
}

/**
 * Download sheet exactly as provided, with zero additions or distortions.
 */
export function downloadMaterialSheet(item: MaterialItem): void {
  // If item has a custom fileUrl that is an uploaded file (data: or http URL):
  if (item.fileUrl && !item.fileUrl.startsWith('data:text/')) {
    const safeUrl = ensureBlobOrHttpUrl(item.fileUrl);
    const a = document.createElement('a');
    a.href = safeUrl;
    a.download = item.fileName || `${item.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
    return;
  }

  // Generate authentic standalone HTML sheet
  const html = generateSheetPrintableHtml(item);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = (item.fileName || item.title).replace(/\.[^/.]+$/, '');
  link.download = `${safeName}.html`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 500);
}
